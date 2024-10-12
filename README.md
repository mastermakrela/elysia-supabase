# Elysia Supabase Plugin

The easiest way to integrate [Supabase](https://supabase.com/docs/reference/javascript/introduction) with [Elysia](https://elysiajs.com/).

## Features

- **Authentication Check**: Verify user authentication using bearer tokens (default for `supabse-js` `invoke`)
- **User Data Access**: Easily retrieve data for the authenticated user
- **Client Creation**: Get Supabase client instance for the authenticated user
- **Flexible Configuration**: Use environment variables or custom settings
- **Edge Function Compatible**: Seamless integration with Supabase Edge Functions

## Quick Start

```ts
import { Elysia } from "elysia";
import { supabase } from "@mastermakrela/elysia-supabase";

const app = new Elysia()
	.use(supabase())
	.get("/", ({ supabase, user }) => `Hi ${user.email}`)
	.get("/data", async ({ supabase, error }) => {
		const resp = await supabase.from("table").select("*");

		if (resp.error) {
			return error(500, resp.error.message);
		}

		return resp.data;
	})
	.listen(3000);
```

## Installation

### Using JSR (recommended)

```bash
bunx jsr add @mastermakrela/elysia-supabase
```

### In Deno

```ts
import { supabase } from "jsr:@mastermakrela/elysia-supabase";
```

## Configuration

The `supabase` function accepts the same arguments as the `createClient` function from `@supabase/supabase-js`.

### Custom Configuration Example

```ts
import { Elysia } from "elysia";
import { supabase } from "@mastermakrela/elysia-supabase";

const app = new Elysia()
	.use(
		supabase("https://my-supabase-url.supabase.co", "anon-key", {
			global: {
				fetch: fetch,
			},
		})
	)
	.get("/", ({ supabase, user }) => `Hi ${user.email}`)
	.listen(3000);
```

### Environment Variables

If the URL and/or anon key are not provided, the plugin will use the environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Usage in Supabase Edge Functions

In the Edge Function environment, `SUPABASE_URL` and `SUPABASE_ANON_KEY` are pre-set. Use a Deno server and [mount](https://elysiajs.com/patterns/mount.html) Elysia for compatibility:

```ts
import { Elysia } from "npm:elysia";
import { cors } from "npm:@elysiajs/cors";
import { supabase } from "jsr:@mastermakrela/elysia-supabase";

const app = new Elysia()
	.use(cors())
	.use(supabase())
	.get("/", ({ supabase, user }) => `Hi ${user.email}`);

Deno.serve(app.fetch);
```

Note: The `cors` plugin is added to allow browser invocation of the Edge Function.

## API Reference

### `supabase(url?: string, key?: string, options?: SupabaseClientOptions)`

- `url`: Supabase project URL (optional if `SUPABASE_URL` is set)
- `key`: Supabase project API key (optional if `SUPABASE_ANON_KEY` is set)
- `options`: Additional Supabase client options

Returns an Elysia plugin that adds `supabase` and `user` to the Elysia context.
