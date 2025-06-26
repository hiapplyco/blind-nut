# Blind Nut - AI Assistant Guide

## Quick Start for Claude

You are assisting with Blind Nut, an AI-driven recruitment search platform that helps recruiters find qualified candidates through intelligent search capabilities. This document provides essential instructions for effective development assistance.

**Primary Directive**: Provide clear, concise development assistance focusing on AI-powered recruitment features, boolean search optimization, and candidate data enrichment while maintaining high code quality and security standards.

## AI Model Selection Guidelines

### When to Use Opus (claude-3-opus)
- **Complex Architecture**: Multi-agent orchestration system design, workflow engine architecture
- **Algorithm Development**: Boolean search optimization algorithms, candidate matching logic
- **Code Generation**: Complete feature implementations (e.g., new agent types, workflow systems)
- **Performance Optimization**: Database query optimization, search algorithm efficiency
- **Security Analysis**: Authentication flows, API key management, data privacy implementations

### When to Use Sonnet (claude-3-sonnet)
- **Bug Fixes**: UI glitches, simple API errors, tooltip styling issues
- **Code Reviews**: Component prop validation, TypeScript type checking
- **Documentation**: README updates, inline code comments, API documentation
- **UI Components**: Simple React components, Tailwind styling adjustments
- **Testing**: Unit test creation, test coverage improvements
- **Refactoring**: Variable naming, code organization, import cleanup

### Task Delegation Patterns

```bash
# For complex features, use subagents
Task: "Design candidate enrichment architecture" prompt="Create system for Nymeria API integration..."
Task: "Implement boolean search optimization" prompt="TDD implementation with complexity levels..."

# For parallel tasks, batch operations
Task: "Update profile parser" | "Fix tooltip styles" | "Add contact copy functionality"

# For research tasks
Task: "Find all boolean search implementations" prompt="List and analyze search string generation patterns..."
```

## Table of Contents

1. [Project Overview](#project-overview)
2. [Recent Updates](#recent-updates)
3. [Development Environment](#development-environment)
4. [Architecture & Core Features](#architecture--core-features)
5. [Authentication System](#authentication-system)
6. [AI Agent System & Migration](#ai-agent-system--migration)
7. [External Integrations](#external-integrations)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Deployment & Operations](#deployment--operations)
10. [Development Workflows](#development-workflows)
11. [Strategic Update Points](#strategic-update-points)

---

## 📋 Project Overview

Blind Nut is an AI-driven recruitment search tool that helps recruiters and hiring managers find qualified candidates through intelligent search capabilities, advanced boolean query generation, and comprehensive candidate profiling.

### Key Features
- 🤖 **AI-Powered Search**: Generate complex boolean searches from natural language
- 🎤 **Audio Input Support**: Voice-to-text search capabilities
- 📄 **PDF Resume Analysis**: Extract and analyze candidate information
- 🔍 **Contact Enrichment**: Integrate with APIs for comprehensive candidate data
- 💼 **Compensation Analysis**: AI-driven salary benchmarking and analysis
- 🎯 **Multi-Platform Search**: LinkedIn, Indeed, and other job platforms
- 📊 **Analysis Report**: Comprehensive job requirement analysis with AI-generated insights
- 💾 **Save Candidates**: Store and organize candidates with enriched contact data

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **AI/ML**: Google Gemini 2.0 Flash, Custom Agents
- **Testing**: Vitest, Deno (for edge functions)
- **Deployment**: Vercel (Frontend), Supabase (Backend)

### Architecture Overview
```
blind-nut/
├── src/                    # Frontend React application
├── supabase/              # Backend functions and migrations
├── docs/                  # Project documentation
├── public/                # Static assets
└── CLAUDE.md             # This file - AI instructions
```

---

## 📋 Recent Updates

### Boolean Search Enhancement & UX Improvements (June 2025)
- ✅ **AI-Powered Boolean Explanation System**
  - New `explain-boolean` edge function using Gemini 2.0 Flash
  - Breaks down complex boolean searches into understandable components
  - Shows what will be included/excluded in search results
  - Provides optimization tips for better results
  - Boolean explainer remains visible in collapsible section after search

- ✅ **Sophisticated Search UI/UX**
  - Beautiful loading animations with 3 stages (generating, explaining, searching)
  - "Simpler" and "More Complex" buttons to adjust boolean complexity
  - Collapsible UI after search - requirements and boolean sections minimize
  - ChatGPT/Claude-style single-line expanding input with scroll
  - Icon-based file upload with paperclip icon
  - Enhanced "Generate AI Search String" button with gradient and animations

- ✅ **Profile Card Improvements**
  - Google-style visual hierarchy with clean borders and spacing
  - Smart data parsing from LinkedIn snippets
  - Better location extraction with multiple pattern matching
  - Profile completeness indicators
  - Icons for job title, company, and location
  - Inline contact information display when available
  - One-click copy functionality for emails and phone numbers

- ✅ **Tooltip Fixes**
  - Fixed transparent tooltip backgrounds
  - Dark tooltips (gray-900) with white text for excellent contrast
  - Consistent styling across all tooltips

### Nymeria API Integration & Inline Contact Enrichment (June 2025)
- ✅ **Streamlined Contact Enrichment for LinkedIn Profiles**
- Integrated Nymeria API for retrieving contact information
- Inline contact display directly in candidate cards:
  - Shows email addresses and phone numbers when available
  - Green highlight box for profiles with contact info
  - One-click copy functionality for all contact fields
- "Get Contact Info" button on each profile card
- Smart handling of not-found profiles:
  - Toast notification when profile not in Nymeria database
  - Option to search manually via contact search modal
- Contact search modal for manual searches:
  - Search by name, company, location, job title
  - Display multiple matching profiles
  - View detailed contact information
- Removed redundant "Search Contact Info" button for cleaner UI

### Candidate Saving & Repository (June 2025)
- ✅ **Save Candidates with Enriched Data**
- "Save Candidate" button on each search result card
- Comprehensive candidate data storage:
  - Basic info: Name, LinkedIn URL, job title, company, location
  - Contact info: Work email, personal emails, phone numbers
  - Profile data: Summary, skills, completeness score
  - Search context: Boolean query that found them, source platform
- Dedicated `saved_candidates` table with:
  - User-specific candidate lists
  - Unique constraint to prevent duplicates
  - Status tracking (new, contacted, interviewing, etc.)
  - Custom tags and notes
  - Full-text search capability
- Row-level security ensures privacy
- Automatic timestamp tracking for created/updated dates

### Profile Parsing Improvements (June 2025)
- ✅ **Enhanced LinkedIn Data Extraction**
- Fixed parsing issues with job titles containing skills/technologies
- Improved company name extraction from complex snippets
- Better location detection with validation against common patterns
- Handles multiple LinkedIn snippet formats:
  - "Job Title at Company · Location"
  - "Job Title | Skills | Location · Experience"
  - Name dash Company patterns
- Cleans up data by removing:
  - Programming languages from job titles
  - Duplicate information in company names
  - Skills misidentified as locations

### Boolean Search Optimization (June 2025)
- ✅ **Enhanced Boolean Search String Generation**
- Improved prompt template with comprehensive examples and requirements
- Added 15-second timeout to prevent edge function hanging
- Updated prompt version from 3.1.0 to 3.2.0 for better results
- Now generates more comprehensive boolean searches with:
  - 3-7 job title variations
  - Industry-standard abbreviations
  - Location variations
  - Experience level indicators
  - Certification keywords
  - Competitor company names (when applicable)

### AI-Powered Analysis Report (June 2025)
- ✅ **Comprehensive Job Analysis System**
- Generate detailed analysis reports after boolean search creation
- Four key analysis sections:
  - **Job Summary**: Concise overview of the position requirements
  - **Enhanced Description**: Improved and structured job description
  - **Compensation Analysis**: Market-based salary insights and benchmarking
  - **Key Terms**: Extracted skills, job titles, and keywords
- Uses multiple AI agents via Supabase Edge Functions:
  - `extract-nlp-terms`: Extracts skills and keywords using NLP
  - `analyze-compensation`: Generates compensation insights
  - `enhance-job-description`: Creates enhanced descriptions
  - `summarize-job`: Produces concise job summaries
- Beautiful animated UI with Framer Motion
- "Generate Analysis Report" button appears after boolean search generation
- Analysis data stored in `agent_outputs` table for persistence

### AI Model Standardization (December 2024)
- ✅ **All Gemini models updated to `gemini-2.0-flash`**
- Migrated from various models (gemini-1.5-flash, gemini-1.5-pro, gemini-2.5-flash, gemini-pro) 
- 22 files updated across Supabase functions, prompts, and React components
- Consistent AI model usage for better performance and reliability

### TypeScript Configuration (Strict Mode Enabled)
- ✅ `noImplicitAny: true` - All variables must have explicit types
- ✅ `strictNullChecks: true` - Null/undefined checking enforced
- ✅ `noUnusedParameters: true` - No unused function parameters
- ✅ `noUnusedLocals: true` - No unused local variables
- All TypeScript errors resolved with strict configuration

### Domain-Driven Type Organization
- Created `/src/types/domains/` for organized type exports
- Domain modules: `recruitment`, `interview`, `meeting`, `chat`, `user`
- Auto-generated Supabase types remain untouched
- Import types using: `import { Job, Application } from '@/types/recruitment'`

### Test Infrastructure
- Vitest configured with jsdom environment
- Test utilities in `/src/test/utils.tsx`
- Supabase mocks in `/src/test/mocks/`
- Critical path tests for ProtectedRoute and JobPostingForm
- Coverage reporting with @vitest/coverage-v8

---

## 🚀 Development Environment

### Prerequisites
- Node.js v20.15.1+
- npm 10.7.0+
- Deno (for edge function testing)
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone [repository-url]
cd blind-nut
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local` with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_NYMERIA_API_KEY=your_nymeria_api_key
```

4. **Start development server**
```bash
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler
- `deno test` - Test edge functions

### Immediate Actions
```bash
# Check project health
git status
npm run typecheck
npm run lint
npm test
```

---

## 🏗️ Architecture & Core Features

### Project Structure
```
blind-nut/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── lib/             # Utilities and helpers
│   └── test/            # Test utilities and mocks
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── docs/               # Documentation
└── public/             # Static assets
```

### Component Architecture
- **Atomic Design Pattern**: Atoms → Molecules → Organisms → Templates → Pages
- **Composition over Inheritance**: Use React composition patterns
- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: All components have typed props interfaces

### State Management
- **Local State**: useState for component-specific state
- **Context API**: For cross-component state (auth, theme)
- **Tanstack Query**: For server state and caching
- **URL State**: Search params for shareable UI state

---

## 🔐 Authentication System

### Overview
The authentication system uses Supabase Auth with protected routes and session management.

### Key Components

#### 1. AuthContext (`/src/components/auth/AuthContext.tsx`)
- Provides authentication state throughout the app
- Manages user sessions and auth operations
- Handles loading states and error boundaries

#### 2. ProtectedRoute (`/src/components/auth/ProtectedRoute.tsx`)
- Wraps routes requiring authentication
- Redirects unauthenticated users to login
- Shows loading state during auth checks

#### 3. User Flow
```mermaid
graph TD
    A[User Access] --> B{Authenticated?}
    B -->|Yes| C[Access Granted]
    B -->|No| D[Redirect to Login]
    D --> E[Login/Signup]
    E --> F[Create Session]
    F --> C
```

### Database Schema
```sql
-- Users table (managed by Supabase Auth)
auth.users

-- User profiles
public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Implementation Guidelines
1. Always use `useAuth()` hook for auth state
2. Wrap protected pages with `<ProtectedRoute>`
3. Handle auth errors gracefully with user feedback
4. Use Row Level Security (RLS) policies in Supabase

---

## 🤖 AI Agent System & Migration

### Current Architecture (Phase 8 - Completed)

The platform now uses an advanced multi-agent orchestration system with specialized agents for different tasks.

### Agent Types

#### 1. **Base Agent Framework**
- Abstract `Agent` class with tool execution capabilities
- Prompt management system with template registration
- Tool registry for dynamic tool loading
- Built-in retry and error handling

#### 2. **Specialized Agents**

**TaskAgent**
- General-purpose task execution
- Supports multiple tools (HTTP, Calculator, Search, FileSystem)
- Context-aware processing

**RecruitmentAgent**
- Candidate search and evaluation
- Boolean search string generation
- Skills extraction and matching
- Resume parsing capabilities

**BooleanSearchAgent**
- Generates optimized boolean search strings
- Platform-specific syntax (LinkedIn, Indeed, etc.)
- Complexity adjustment (simple to advanced)

**CompensationAgent**
- Salary benchmarking and analysis
- Market rate calculations
- Negotiation guidance
- Location-based adjustments

**ProfileEnrichmentAgent**
- Contact information retrieval
- Social profile aggregation
- Professional background enrichment
- Data validation and quality scoring

### Orchestration System

#### Enhanced Orchestrator Features
- **Workflow Execution**: Sequential and parallel agent coordination
- **Error Recovery**: Automatic retry with exponential backoff
- **Resource Management**: Concurrency limits and timeout handling
- **State Management**: Workflow state persistence and recovery
- **Debugging**: Comprehensive logging and tracing

#### Workflow Definition Structure
```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  onError: 'stop' | 'continue' | 'retry';
  maxRetries?: number;
  timeout?: number;
}
```

### Migration Timeline (Completed)

| Phase | Description | Status | Duration |
|-------|-------------|--------|----------|
| 1 | Project Setup & Base Agent | ✅ Complete | Week 1 |
| 2 | Recruitment Agent & Tools | ✅ Complete | Week 1-2 |
| 3 | Compensation Analysis | ✅ Complete | Week 2-3 |
| 4 | Profile Enrichment | ✅ Complete | Week 3-4 |
| 5 | Workflow Engine | ✅ Complete | Week 4-5 |
| 6 | Integration & Migration | ✅ Complete | Week 5-6 |
| 7 | Testing & Optimization | ✅ Complete | Week 6-7 |
| 8 | Production Deployment | ✅ Complete | Week 7-8 |

### Key Improvements Achieved
1. **Modularity**: Clean separation of concerns between agents
2. **Scalability**: Parallel execution and resource management
3. **Reliability**: Comprehensive error handling and recovery
4. **Flexibility**: Easy to add new agents and workflows
5. **Observability**: Built-in logging and monitoring

### Usage Examples

```typescript
// Single agent execution
const result = await orchestrator.runSingleAgent('RecruitmentAgent', {
  task: 'search',
  requirements: 'Senior React Developer in San Francisco'
});

// Workflow execution
const workflow = await orchestrator.runWorkflow({
  id: 'candidate-sourcing',
  steps: [
    { agentName: 'BooleanSearchAgent', params: { requirements } },
    { agentName: 'RecruitmentAgent', params: { task: 'search' } },
    { agentName: 'ProfileEnrichmentAgent', params: { profiles } }
  ]
});
```

---

## 🔌 External Integrations

### Current Integrations

#### 1. **Google Gemini API**
- Model: `gemini-2.0-flash`
- Used for all AI operations
- Structured output generation
- Context-aware responses

#### 2. **Nymeria API**
- Contact information enrichment
- Email and phone number retrieval
- Professional profile data
- Social media links

### Potential Future Integrations

#### Recruiting Platforms
1. **LinkedIn Recruiter API** ($$$)
   - Full profile access
   - InMail capabilities
   - Advanced search filters

2. **Indeed Resume API** ($$)
   - Resume database access
   - Candidate matching
   - Application tracking

3. **Glassdoor API** ($)
   - Company reviews
   - Salary information
   - Interview insights

#### Data Enrichment Services
1. **Hunter.io** ($)
   - Email finder
   - Email verifier
   - Domain search

2. **Clearbit** ($$)
   - Company enrichment
   - Person enrichment
   - Risk scoring

3. **PredictLeads** ($$$)
   - Technographic data
   - Buying signals
   - Company insights

#### Communication Tools
1. **Twilio** ($)
   - SMS capabilities
   - Voice calling
   - WhatsApp integration

2. **SendGrid** ($)
   - Email campaigns
   - Template management
   - Analytics

### Integration Guidelines
1. Always use environment variables for API keys
2. Implement rate limiting and retry logic
3. Cache responses when appropriate
4. Handle API errors gracefully
5. Monitor usage and costs

---

## 🧪 Testing & Quality Assurance

### Testing Strategy

#### Unit Tests
- Components: Test with React Testing Library
- Functions: Pure function testing with Vitest
- Coverage target: 80%+

#### Integration Tests
- API endpoints testing
- Database operations
- Authentication flows

#### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile responsiveness

### Edge Function Testing

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Run tests
deno test supabase/functions/_shared/tests/orchestration.test.ts --allow-env --allow-net
```

### Test Organization
```
src/
├── components/
│   └── __tests__/      # Component tests
├── hooks/
│   └── __tests__/      # Hook tests
└── test/
    ├── mocks/          # Mock data
    └── utils.tsx       # Test utilities
```

### Quality Checks
- **ESLint**: Code style and quality
- **TypeScript**: Type safety
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

---

## 🚀 Deployment & Operations

### Environment Management

#### Development
- Local Supabase instance
- Mock data for testing
- Debug logging enabled

#### Staging
- Supabase staging project
- Production-like data
- Performance monitoring

#### Production
- Supabase production project
- SSL/TLS encryption
- Error tracking (Sentry)
- Analytics (Vercel Analytics)

### Deployment Process

1. **Frontend (Vercel)**
```bash
# Automatic deployment on push to main
git push origin main

# Manual deployment
vercel --prod
```

2. **Edge Functions (Supabase)**
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name
```

3. **Database Migrations**
```bash
# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push
```

### Monitoring & Logging

#### Application Monitoring
- Vercel Analytics for frontend metrics
- Supabase Dashboard for API metrics
- Custom logging for agent operations

#### Error Tracking
- Sentry integration for error capture
- Structured logging for debugging
- Alert notifications for critical errors

#### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance

### Rollback Procedures

1. **Frontend Rollback**
   - Use Vercel's instant rollback feature
   - Revert git commit and redeploy

2. **Edge Function Rollback**
   - Keep previous function versions
   - Quick switch via Supabase CLI

3. **Database Rollback**
   - Maintain migration rollback scripts
   - Point-in-time recovery available

---

---

## 📝 Development Guidelines

### Core Design Principles
1. **Clarity First**: Write self-documenting code with descriptive names
2. **Type Safety**: Leverage TypeScript's strict mode for reliability
3. **Component Modularity**: Small, focused, reusable components
4. **Performance Aware**: Optimize for search speed and UI responsiveness
5. **Security by Design**: Never expose API keys or sensitive candidate data

### Code Style
- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Files**: One component per file
- **Imports**: Absolute imports using @ alias

### Git Workflow
1. **Branch Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch
   - `feature/*`: New features
   - `fix/*`: Bug fixes
   - `refactor/*`: Code improvements

2. **Commit Messages**
   - Use conventional commits
   - Include ticket numbers
   - Keep messages concise

3. **Pull Requests**
   - Require code review
   - Pass all CI checks
   - Update documentation

### Security Best Practices
1. **Never commit secrets**: Use environment variables
2. **Validate inputs**: Both client and server-side
3. **Sanitize outputs**: Prevent XSS attacks
4. **Use HTTPS**: Always encrypt data in transit
5. **Implement CSP**: Content Security Policy headers

### Performance Guidelines
1. **Lazy Loading**: Split code and load on demand
2. **Image Optimization**: Use WebP and proper sizing
3. **Caching**: Implement appropriate cache strategies
4. **Bundle Size**: Monitor and optimize
5. **Database Queries**: Use indexes and optimize

---

## 📚 Additional Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Internal Docs
- [Authentication Flow](./AUTH_FLOW.md)
- [X-Ray Sourcing Tools](./docs/X-RAY_SOURCING_TOOLS.md)
- [Migration Guide](./docs/agentic-orchestration/MIGRATION_GUIDE.md)

### Support
- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for detailed guides

---

## 🎯 Future Roadmap

### Short Term (Q3 2025)
- [ ] Advanced analytics dashboard
- [ ] Bulk candidate operations
- [ ] Email campaign integration
- [ ] Mobile app development

### Medium Term (Q4 2025)
- [ ] AI interview scheduling
- [ ] Candidate scoring ML model
- [ ] ATS integrations
- [ ] Team collaboration features

### Long Term (2026)
- [ ] Predictive hiring analytics
- [ ] Natural language querying
- [ ] Global talent marketplace
- [ ] AI-powered negotiations

---

## 🔄 Development Workflows

### New Feature Implementation
```bash
# 1. Understand requirements
Task: "Analyze feature requirements" prompt="Document acceptance criteria for [feature]"

# 2. Design architecture
Task: "Design feature architecture" prompt="Create component/agent diagram for [feature]"

# 3. Implement with tests
npm test -- --watch
# Write failing tests first
# Implement minimal code to pass
# Refactor for quality

# 4. Verify quality
npm run lint
npm run typecheck
npm test

# 5. Update CLAUDE.md if patterns change
echo "UPDATE_CLAUDE_MD: Document new [feature] patterns"
```

### Bug Fixing Workflow
```bash
# 1. Reproduce issue
Task: "Debug [issue]" prompt="Find root cause in [component/function]"

# 2. Write failing test
# 3. Fix the bug
# 4. Verify fix
npm test
npm run lint
```

### Boolean Search Enhancement
```bash
# 1. Test current boolean generation
Task: "Test boolean search" prompt="Generate searches for various job types"

# 2. Identify improvements
Task: "Analyze boolean patterns" prompt="Find missing keywords or operators"

# 3. Update prompts
# Edit supabase/functions/generate-boolean-search/prompts.ts

# 4. Test edge function
deno test supabase/functions/generate-boolean-search/index.test.ts
```

### Code Quality Checks
```bash
# Always run before completing tasks
npm run lint          # Code style
npm run typecheck     # TypeScript checks
npm test              # Test suite
npm run build         # Build verification
```

---

## 📍 Strategic Update Points

When making significant changes, update this document:

1. **New AI Agents**: Add to AI Agent System section
2. **API Integrations**: Add to External Integrations section
3. **Architecture Changes**: Update Architecture & Core Features
4. **Search Improvements**: Document in Recent Updates
5. **Performance Optimizations**: Add to Development Guidelines

### Update Command
```bash
# After significant changes
UPDATE_CLAUDE_MD: "Document [what changed] in [section]"
# This reminds you to keep instructions current
```

---

## 🤖 Subagent Task Examples

### Research Tasks
```typescript
Task: "Find all boolean search patterns" 
  prompt="List all files using boolean generation and document patterns"

Task: "Analyze Nymeria API usage"
  prompt="Review contact enrichment flows for optimization opportunities"

Task: "Audit candidate data flow"
  prompt="Trace data from search to saved_candidates table"
```

### Parallel Development
```typescript
Task: "Update UI tooltips" | "Fix profile parsing" | "Add loading states"
  prompt="Complete these UI improvements in parallel"

Task: "Test all agents" | "Update types" | "Fix linting"
  prompt="Run quality checks across the codebase"
```

### Complex Features
```typescript
// Break down into specialized agents
Task: "Design bulk candidate operations"
Task: "Implement batch enrichment API"  
Task: "Create bulk action UI"
Task: "Add progress tracking"
Task: "Write comprehensive tests"
```

### Recruitment-Specific Tasks
```typescript
// Boolean search optimization
Task: "Analyze job description" prompt="Extract key requirements and skills"
Task: "Generate boolean variants" prompt="Create 5 complexity levels"
Task: "Test on LinkedIn" prompt="Validate search string effectiveness"

// Candidate enrichment
Task: "Design enrichment pipeline" prompt="Multi-source data aggregation"
Task: "Implement caching strategy" prompt="Reduce API calls"
Task: "Add quality scoring" prompt="Rate profile completeness"
```

---

**Remember**: 
- Always validate boolean searches before deployment
- Test contact enrichment with rate limits in mind
- Keep candidate data secure and private
- Update this document when patterns evolve
- Run quality checks before completing any task

**Last Updated**: June 2025
**Version**: 2.0

**Quick Model Reference**:
- 🧠 Complex/Creative = Opus
- ⚡ Simple/Routine = Sonnet
- 🔍 Research = Task agent
- 🚀 Parallel work = Multiple agents