// to make this package work with other bundlers, we use Nodes process.env, instead of Deno's env
// deno-lint-ignore-file no-process-globals

// we declare the global process.env here, to get rid of the typescript errors
declare global {
	const process: {
		env: {
			SUPABASE_URL: string | undefined;
			SUPABASE_ANON_KEY: string | undefined;
		};
	};
}

import type { GenericSchema } from "https://jsr.io/@supabase/supabase-js/2.45.4/src/lib/types.ts";
import {
	createClient,
	type SupabaseClientOptions,
} from "jsr:@supabase/supabase-js@2";
import { Elysia } from "npm:elysia";

/**
 * Creates a Supabase client instance with authentication guard and injects it into the request context.
 *
 * Takes the same arguments as createClient from the supabase-js package,
 * but replaces teh auth header with the one from the request.
 *
 * If the request does not have an Authorization header or the token is invalid, the request will be rejected as unauthorized.
 *
 * @param {string} [supabase_url=process.env.SUPABASE_URL] - The URL of the Supabase instance.
 * @param {string} [supabase_anon_key=process.env.SUPABASE_ANON_KEY] - The anonymous key for the Supabase instance.
 * @param {SupabaseClientOptions<SchemaName>} [options] - Optional configuration for the Supabase client.
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
) => new Elysia({ name: "supabase_auth_guard" }).resolve(
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
