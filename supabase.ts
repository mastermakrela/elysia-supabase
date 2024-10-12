// we also need to redefine some types from @supabase/supabase-js/2.45.4/src/lib/types.ts
// because we cannot import it from the npm package
export type GenericTable = {
	Row: Record<string, unknown>;
	Insert: Record<string, unknown>;
	Update: Record<string, unknown>;
};

export type GenericUpdatableView = GenericTable;

export type GenericNonUpdatableView = {
	Row: Record<string, unknown>;
};

export type GenericView = GenericUpdatableView | GenericNonUpdatableView;

export type GenericFunction = {
	Args: Record<string, unknown>;
	Returns: unknown;
};

export type GenericSchema = {
	Tables: Record<string, GenericTable>;
	Views: Record<string, GenericView>;
	Functions: Record<string, GenericFunction>;
};

import {
	createClient,
	SupabaseClient,
	type SupabaseClientOptions,
	type User,
} from "jsr:@supabase/supabase-js@2";
import process from "node:process";
import { Elysia } from "npm:elysia@^1.1.20";

/**
 * Creates a Supabase client instance with authentication guard and injects it into the request context.
 *
 * Takes the same arguments as createClient from the supabase-js package,
 * but replaces teh auth header with the one from the request.
 *
 * If the request does not have an Authorization header or the token is invalid, the request will be rejected as unauthorized.
 */
export const supabase = <
	Database = any,
	SchemaName extends string & keyof Database = "public" extends keyof Database
		? "public"
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any,
>(
	supabase_url = process.env.SUPABASE_URL,
	supabase_anon_key = process.env.SUPABASE_ANON_KEY,
	options?: SupabaseClientOptions<SchemaName>,
): Elysia<
	"",
	false,
	{
		decorator: {};
		store: {};
		derive: {};
		resolve: {};
	},
	{
		type: {};
		error: {};
	},
	{
		schema: {};
		macro: {};
		macroFn: {};
	},
	{},
	{
		derive: {};
		resolve: {
			supabase: SupabaseClient<Database, SchemaName, Schema>;
			user: User;
		};
		schema: {};
	},
	{
		derive: {};
		resolve: {};
		schema: {};
	}
> => new Elysia({ name: "supabase_auth_guard" }).resolve(
	{
		as: "scoped",
	},
	async ({ request, error }) => {
		if (!supabase_url) {
			return error(500, "SUPABASE_URL is not set");
		}

		if (!supabase_anon_key) {
			return error(500, "SUPABASE_ANON_KEY is not set");
		}

		const Authorization = request.headers.get("Authorization");

		if (!Authorization) {
			return error(401, "Authorization header is missing");
		}

		const supabase = createClient<Database, SchemaName, Schema>(
			supabase_url,
			supabase_anon_key,
			{
				...options,
				global: {
					...options?.global,
					headers: { Authorization },
				},
			},
		);

		const resp = await supabase.auth.getUser();

		if (resp.error) {
			return error(401);
		}

		return { supabase, user: resp.data.user };
	},
);
