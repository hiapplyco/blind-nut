# Fix for Projects Table Not Working

## Issue
The projects table exists in the database (created by migration) but is missing from the generated TypeScript types. This causes the "Failed to create project" error.

## Immediate Fix (Applied)
We've added manual type definitions to work around this issue temporarily.

## Permanent Fix
You need to regenerate the Supabase types to include the projects table:

```bash
# Replace <your-project-id> with your actual Supabase project ID
npx supabase gen types typescript --project-id kxghaajojntkqrmvsngn > src/integrations/supabase/types.ts
```

Or if you have the Supabase CLI linked:

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

## Alternative: Manual Type Addition
If regeneration isn't possible immediately, you can manually add the projects types to the generated file, but this will be overwritten on the next generation.

## Verification
After regenerating types, verify that:
1. The `projects` table appears in `src/integrations/supabase/types.ts`
2. The `search_history` table appears
3. The `project_candidates` table appears

## Related Tables
Make sure these tables exist in your Supabase dashboard:
- `projects`
- `search_history`
- `project_candidates`
- `project_scraped_data` (from newer migration)