/**
 * This module contains functions to add supabase authentication to Elysia.
 * @module
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia'
 * import { supabase } from "@mastermakrela/elysia-supabase";
 *
 * const app = new Elysia()
 * 	.use(supabase())
 * 	.get('/', ({ supabase, user }) => `Hi ${user.email}`)
 * 	.listen(3000)
 * ```
 *
 * @example
 * ```ts
 * import { Elysia } from "npm:elysia";
 * import { supabase } from "jsr:@mastermakrela/elysia-supabase";
 *
 * const app = new Elysia()
 * 	.use(supabase())
 * 	.get("/", ({ supabase, user }) => `Hi ${user.email}`)
 * 	.get("/data", async ({ supabase, error }) => {
 * 		const resp = await supabase.from("table").select("*");
 *
 * 		if (resp.error) {
 * 			return error(500, resp.error.message);
 * 		}
 *
 * 		return resp.data;
 * 	})
 *
 * Deno.serve(app.fetch);
 * ```
 */

import {
	createClient,
	type SupabaseClientOptions,
} from "jsr:@supabase/supabase-js@2.48.1";
import process from "node:process";
import { Elysia } from "npm:elysia@1.2.10";
import type { GenericSchema } from "./types.ts";

/**
 * Supabase authentication guard, which injects the Supabase client for the authenticated user.
 *
 * Takes the same arguments as createClient from the supabase-js package,
 * but replaces the auth header with the one from the request.
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
>({
	supabase_url = process.env.SUPABASE_URL,
	supabase_anon_key = process.env.SUPABASE_ANON_KEY,
	options,
}: {
	supabase_url?: string;
	supabase_anon_key?: string;
	options?: SupabaseClientOptions<SchemaName>;
} = {}) =>
	new Elysia({ name: "supabase_auth_guard" }).resolve(
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

/**
 * Supabase authentication guard, which injects the Supabase client for the authenticated user.
 *
 * Takes the same arguments as createClient from the supabase-js package,
 * but replaces the auth header with the one from the request.
 *
 * Returns user only if the token has one - so it should work with the anon key.
 * If the request does not have an Authorization header or the token is invalid, the request will be rejected as unauthorized.
 */
export const anon_supabase = <
	Database = any,
	SchemaName extends string & keyof Database = "public" extends keyof Database
		? "public"
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any,
>({
	supabase_url = process.env.SUPABASE_URL,
	supabase_anon_key = process.env.SUPABASE_ANON_KEY,
	options,
}: {
	supabase_url?: string;
	supabase_anon_key?: string;
	options?: SupabaseClientOptions<SchemaName>;
} = {}) =>
	new Elysia({ name: "supabase_auth_guard" }).resolve(
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

			return { supabase, user: resp.data.user };
		},
	);
