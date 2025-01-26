## 0.6.1

- import type as type only to silence `type must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.`

## 0.6.0

- BREAKING: `supabase` and `anon_supabase` now expect only one argument, that can contain `supabase_url` and `supabase_anon_key` keys, and `options` which is given as is to the supabase `createClient` function
- switch to slow types to fix/avoid typing issues
- upgrade supabase types (by copying them from https://jsr.io/@supabase/supabase-js/2.48.1/src/lib/types.ts#L95)
- pin dependencies versions to avoid breaking changes

## 0.4.0

- added `supabase_anon` that does not require user - just the anon key
