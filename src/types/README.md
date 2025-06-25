# Type Organization

## Overview

This directory contains domain-specific type exports that provide a cleaner, more organized interface to the auto-generated Supabase types.

## Structure

```
src/types/
├── domains/
│   ├── index.ts      # Central export for all domains
│   ├── recruitment.ts # Job posting and application types
│   ├── interview.ts   # Interview session and framework types
│   ├── meeting.ts     # Meeting and video call types
│   ├── chat.ts        # Chat and messaging types
│   └── user.ts        # User, profile, and lead types
└── README.md          # This file
```

## Usage

Instead of importing from the large auto-generated file:

```typescript
// ❌ Avoid this
import { Database } from '@/integrations/supabase/types';
type Job = Database['public']['Tables']['jobs']['Row'];
```

Use the domain-specific imports:

```typescript
// ✅ Preferred
import { Job, JobInsert, JobUpdate } from '@/types/recruitment';

// Or import everything from a domain
import * as RecruitmentTypes from '@/types/recruitment';

// Or import from the central export
import { Job, InterviewSession, User } from '@/types';
```

## Important Notes

1. **DO NOT modify** `/src/integrations/supabase/types.ts` - it's auto-generated
2. These domain files are type-only exports (no runtime code)
3. When the database schema changes, regenerate types with:
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
   ```
4. Add new domain files as needed when new features are added

## Benefits

- **Better organization**: Types are grouped by business domain
- **Cleaner imports**: No need for deep type extraction
- **Type aliases**: Friendlier names for common types
- **Centralized enums**: Business logic enums defined in one place
- **Maintainable**: Changes to domain organization don't affect generated file