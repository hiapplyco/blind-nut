# CLAUDE.md - Blind Nut Platform Development Guidelines

## 📋 Recent Updates

### Nymeria API Integration (June 2025)
- ✅ **Contact Enrichment for LinkedIn Profiles**
- Integrated Nymeria API for retrieving contact information
- Added "Get Contact Info" button to search results
- Created sophisticated modal with tabbed interface:
  - Contact tab: Emails, phone numbers, location
  - Professional tab: Job title, company, skills, summary
  - Social tab: LinkedIn, Twitter, GitHub profiles
- One-click copy functionality for all contact fields
- Graceful handling of profiles not in Nymeria database

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

## 🎯 Platform Vision & Philosophy

**Mission**: "Even a blind nut can find a Purple Squirrel" - Democratize AI-powered recruitment for enterprises while maintaining the human touch in hiring.

**Core Principles**:
1. **AI-First, Human-Centered**: AI enhances recruiter capabilities, not replaces them
2. **End-to-End Intelligence**: From sourcing to onboarding, every step is AI-enhanced
3. **Skills-Based Matching**: Move beyond keywords to true capability assessment
4. **Real-Time Collaboration**: Live, interactive features for modern distributed teams
5. **Responsible AI**: Transparent, fair, and compliant AI implementations

## 🔌 External API Integrations

### Nymeria API (Contact Enrichment)
- **Purpose**: Enrich LinkedIn profiles with contact information (emails, phone numbers)
- **Endpoint**: `https://www.nymeria.io/api/v4/`
- **Edge Function**: `/supabase/functions/enrich-profile`
- **Features**:
  - Profile enrichment using LinkedIn URLs
  - Person search by name, company, location
  - Returns emails, phone numbers, social profiles, skills

#### Setup Instructions:
1. **Get Nymeria API Key**:
   - Sign up at [nymeria.io](https://www.nymeria.io/)
   - Navigate to API settings
   - Copy your API key

2. **Configure in Supabase**:
   ```bash
   # Go to Supabase Dashboard > Settings > Edge Functions
   # Add environment variable:
   NYMERIA_API_KEY=your_api_key_here
   ```

3. **Usage**:
   - Search for LinkedIn profiles
   - Click "Get Contact Info" on any result
   - View enriched data in modal

#### API Response Format:
```typescript
{
  data: {
    name: string;
    work_email?: string;
    emails?: string[];
    mobile_phone?: string;
    phone_numbers?: string[];
    location?: string;
    company?: string;
    job_title?: string;
    skills?: string[];
    linkedin_url?: string;
    twitter_url?: string;
    github_url?: string;
  }
}
```

### Google Custom Search API
- **Purpose**: Search LinkedIn profiles via Google
- **CSE ID**: `b28705633bcb44cf0`
- **Edge Function**: `/supabase/functions/get-google-cse-key`
- **Configuration**: Set in environment variables

## 🏗️ Architecture & Technology Standards

### Project Structure
```
src/
├── components/         # UI components organized by feature
├── types/             
│   └── domains/       # Domain-specific type exports
│       ├── recruitment.ts
│       ├── interview.ts
│       ├── meeting.ts
│       ├── chat.ts
│       └── user.ts
├── test/              # Test utilities and setup
│   ├── setup.ts       # Test environment setup
│   ├── utils.tsx      # Custom render with providers
│   └── mocks/         # Shared mocks
└── integrations/      
    └── supabase/
        └── types.ts   # Auto-generated - DO NOT EDIT
```

### Frontend Standards
- **Framework**: React 18+ with TypeScript (strict mode)
- **State Management**: 
  - Zustand for global state
  - TanStack Query for server state
  - Context API for theme/auth only
- **Styling**: Tailwind CSS with consistent design tokens
- **Components**: shadcn/ui components as base, custom components follow same patterns
- **Animations**: Framer Motion for complex animations, CSS for simple transitions

### Backend Standards
- **Platform**: Supabase with PostgreSQL
- **Edge Functions**: Deno runtime with TypeScript
- **Real-time**: WebSockets for chat, interviews, and collaborative features
- **Storage**: Supabase Storage with proper access policies
- **Security**: Row Level Security (RLS) on all tables

### AI Integration Standards
- **Multi-Model Approach**: 
  - Gemini 2.0 Flash for all content generation (standardized December 2024)
  - Claude for complex reasoning tasks (when needed)
  - Whisper for transcription
  - ElevenLabs for voice synthesis
- **Model Configuration**: All Gemini instances use `gemini-2.0-flash` for consistency
- **Prompt Management**: Centralized prompt templates in `/src/utils/prompts/`
- **Error Handling**: Graceful fallbacks for AI failures
- **Cost Optimization**: Cache AI responses when appropriate

## 🎨 UX/UI Design Guidelines

### Design Principles
1. **Clarity Over Cleverness**: Simple, intuitive interfaces
2. **Progressive Disclosure**: Show advanced features only when needed
3. **Mobile-First Responsive**: All features work on mobile devices
4. **Accessibility**: WCAG 2.1 AA compliance minimum
5. **Performance**: Sub-3 second page loads, instant interactions

### Component Patterns
```typescript
// All components follow this structure
interface ComponentProps {
  className?: string; // For composition
  children?: React.ReactNode;
  // Specific props with clear types
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Color System
- **Primary**: Blue (recruitment/professional)
- **Secondary**: Purple (AI/innovation - "Purple Squirrel")
- **Success**: Green (positive actions)
- **Warning**: Amber (caution)
- **Error**: Red (errors/stops)
- **Neutral**: Slate grays

### Typography
- **Headings**: Inter or similar clean sans-serif
- **Body**: System font stack for performance
- **Code**: JetBrains Mono or similar monospace

## 🚀 Feature Development Guidelines

### AI Feature Checklist
- [ ] Define clear user value proposition
- [ ] Design fallback for AI failures
- [ ] Implement proper loading states
- [ ] Add cost tracking/monitoring
- [ ] Create user controls (on/off, preferences)
- [ ] Test with edge cases
- [ ] Document prompts and expected outputs

### New Feature Template
```typescript
// 1. Feature flag (if applicable)
const FEATURE_FLAG_NAME = process.env.NEXT_PUBLIC_FEATURE_NAME === 'true';

// 2. Dedicated hook for feature logic
export function useFeatureName() {
  // Feature-specific state and logic
}

// 3. Main component with error boundaries
export function FeatureName() {
  if (!FEATURE_FLAG_NAME) return null;
  
  return (
    <ErrorBoundary fallback={<FeatureFallback />}>
      {/* Feature implementation */}
    </ErrorBoundary>
  );
}
```

### Database Design Standards
- **Naming**: snake_case for tables and columns
- **IDs**: UUID v4 for all primary keys
- **Timestamps**: created_at, updated_at on all tables
- **Soft Deletes**: deleted_at for recoverable data
- **Relationships**: Explicit foreign keys with CASCADE rules
- **Indexes**: On all foreign keys and commonly queried fields

### Type Import Guidelines
```typescript
// ❌ Don't import from auto-generated file directly
import { Database } from '@/integrations/supabase/types';
type Job = Database['public']['Tables']['jobs']['Row'];

// ✅ Use domain-specific imports
import { Job, JobInsert, Application } from '@/types/recruitment';
import { InterviewSession, InterviewPlan } from '@/types/interview';
import { User, Profile } from '@/types/user';

// ✅ Or import everything from a domain
import * as RecruitmentTypes from '@/types/recruitment';

// ✅ Or from central export
import { Job, Meeting, ChatMessage } from '@/types';
```

## 📊 Performance Optimization

### Frontend Performance
1. **Code Splitting**: Route-based splitting minimum
2. **Image Optimization**: Next/Image or lazy loading
3. **Bundle Size**: Monitor and alert on size increases
4. **Caching**: Aggressive caching with proper invalidation
5. **Prefetching**: Predictive prefetch for likely next actions

### Backend Performance
1. **Query Optimization**: EXPLAIN ANALYZE on all new queries
2. **Connection Pooling**: Proper pool configuration
3. **Edge Function Size**: Keep under 1MB
4. **Caching Strategy**: Redis for frequently accessed data
5. **Rate Limiting**: Implement on all public endpoints

### AI Performance
1. **Response Streaming**: Stream long AI responses
2. **Parallel Processing**: Batch AI calls when possible
3. **Caching**: Cache identical prompts for 24 hours
4. **Model Selection**: Use appropriate model for task complexity
5. **Timeout Handling**: 30-second timeout with user notification

## 🔒 Security & Compliance

### Security Checklist
- [ ] All user inputs sanitized
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React default escaping)
- [ ] CSRF tokens on state-changing operations
- [ ] Rate limiting on all endpoints
- [ ] Proper CORS configuration
- [ ] Secrets in environment variables only

### Data Privacy
1. **PII Handling**: Encrypt at rest and in transit
2. **Data Retention**: Clear policies and automated cleanup
3. **Access Logs**: Audit trail for all data access
4. **GDPR Compliance**: Right to deletion, data portability
5. **Resume Data**: Special handling for sensitive information

### AI Ethics
1. **Bias Prevention**: Regular audits of AI decisions
2. **Transparency**: Explainable AI decisions
3. **Human Override**: Always allow human intervention
4. **Consent**: Clear opt-in for AI processing
5. **Fair Use**: Prevent discriminatory outcomes

## 🧪 Testing Standards

### Testing Pyramid
1. **Unit Tests**: 80% coverage minimum
2. **Integration Tests**: Critical paths covered
3. **E2E Tests**: Happy paths + critical edge cases
4. **Performance Tests**: Load testing for scaling
5. **Security Tests**: Penetration testing quarterly

### Test Structure
```typescript
describe('FeatureName', () => {
  describe('Component', () => {
    it('should render correctly', () => {});
    it('should handle user interaction', () => {});
    it('should handle errors gracefully', () => {});
  });
  
  describe('API', () => {
    it('should return expected data', () => {});
    it('should handle invalid input', () => {});
    it('should respect rate limits', () => {});
  });
});
```

### Test Utilities & Mocking
```typescript
// Use custom render with providers
import { render, screen, userEvent } from '@/test/utils';

// Mock Supabase in tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
    functions: { invoke: vi.fn() }
  }
}));

// Mock navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});
```

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `hookName.test.ts`
- Utility tests: `utilityName.test.ts`
- Integration tests: `__tests__/feature.integration.test.ts`

## 📝 Documentation Standards

### Code Documentation
```typescript
/**
 * Brief description of what the function does
 * @param {Type} param - What the parameter represents
 * @returns {Type} What the function returns
 * @example
 * // Example usage
 * const result = functionName(param);
 */
```

### Feature Documentation
1. **User Guide**: How to use the feature
2. **Technical Spec**: Implementation details
3. **API Reference**: Endpoints and parameters
4. **Troubleshooting**: Common issues and solutions
5. **Performance Notes**: Expected load and limits

## 🔄 Continuous Improvement

### Monitoring & Analytics
1. **User Analytics**: Mixpanel/Amplitude for behavior
2. **Performance Monitoring**: Sentry for errors
3. **AI Monitoring**: Track accuracy and costs
4. **Business Metrics**: Conversion rates, time-to-hire
5. **System Health**: Uptime, response times

### Feedback Loops
1. **User Feedback**: In-app feedback widgets
2. **A/B Testing**: Feature variations testing
3. **AI Feedback**: Thumbs up/down on AI outputs
4. **Performance Feedback**: User-reported slowness
5. **Bug Reports**: Integrated bug reporting

### Regular Reviews
- **Weekly**: Team sync on current sprint
- **Bi-weekly**: Performance and security review
- **Monthly**: AI accuracy and cost review
- **Quarterly**: Architecture and tech debt review
- **Annually**: Full platform audit

## 🚦 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Emergency fixes

### PR Requirements
1. **Tests**: All tests passing
2. **Linting**: No linting errors
3. **Type Check**: TypeScript compilation successful
4. **Documentation**: Updated if needed
5. **Review**: At least one approval

### Deployment Pipeline
1. **Local**: Development with hot reload
2. **Preview**: Automatic deploys for PRs
3. **Staging**: Pre-production testing
4. **Production**: Blue-green deployment

## 📋 Common Tasks & Commands

### Development
```bash
# Start development
npm run dev

# Run tests
npm test
npm run test:ui        # With UI
npm run test:coverage  # With coverage report

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```


### Database
```bash
# Generate types
npm run db:types

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

### Supabase Edge Functions
```bash
# Link project (required before deploying)
npx supabase link --project-ref kxghaajojntkqrmvsngn

# Deploy a specific function
npx supabase functions deploy <function-name>

# Deploy all functions
npx supabase functions deploy

# Serve functions locally
npx supabase functions serve

# View function logs (via dashboard - CLI doesn't support logs directly)
# Visit: https://supabase.com/dashboard/project/kxghaajojntkqrmvsngn/functions
```

#### Edge Function Optimization Tips

##### 1. **Boolean Search Generation Performance**
- **Issue**: Slow response times when generating boolean search strings
- **Solutions**:
  - Added 15-second timeout to prevent hanging requests
  - Enhanced prompt with specific examples and structure
  - Consider implementing response streaming for real-time feedback
  - Add caching for similar job descriptions

##### 2. **Improving Search Quality**
- **Issue**: Generated boolean searches too basic/generic
- **Solutions**:
  - Updated prompt to require 3-7 job title variations
  - Added requirements for synonyms and abbreviations
  - Included location and experience level terms
  - Added industry-specific context
  - Provided concrete examples in the prompt

##### 3. **Debugging Edge Functions**
- **Logging**: Add console.log statements - visible in Supabase dashboard
- **Error Handling**: Always wrap AI calls in try-catch blocks
- **Timeouts**: Implement request timeouts (15-30 seconds recommended)
- **Testing**: Use `supabase functions serve` for local testing

##### 4. **Common Edge Function Issues**
- **JWT Verification**: Set `verify_jwt = false` in config.toml for public endpoints
- **CORS**: Always handle OPTIONS requests and include CORS headers
- **Environment Variables**: Use `Deno.env.get()` for API keys
- **Dependencies**: Use npm: prefix for npm packages in Deno

##### 5. **Nymeria API Troubleshooting**
- **500 Error**: Usually missing NYMERIA_API_KEY in environment variables
- **401 Error**: Invalid API key - check your Nymeria dashboard
- **404 Error**: Profile not found in Nymeria's database
- **429 Error**: Rate limit exceeded - wait before retrying
- **Empty Results**: Some profiles may not have contact information available

**Common Issues & Solutions**:
```bash
# Check if API key is set in Supabase
# Dashboard > Settings > Edge Functions > Environment Variables

# Test the edge function locally
npx supabase functions serve enrich-profile

# View function logs
# Dashboard > Functions > enrich-profile > Logs
```

### AI Development
```bash
# Test prompts
npm run prompt:test

# Analyze costs
npm run ai:costs

# Generate embeddings
npm run embeddings:generate
```

## 🎯 Platform Differentiators

### vs Eightfold
- **Faster Implementation**: Days vs months
- **Better UX**: Modern, intuitive interface
- **Cost-Effective**: 10x lower TCO
- **Flexible Integration**: API-first approach
- **Real-time Features**: Live collaboration built-in

### vs Paradox
- **Deeper Intelligence**: Beyond chat to true AI assistance
- **Enterprise Features**: Advanced security and compliance
- **Customization**: Fully customizable workflows
- **Multi-modal AI**: Video, voice, and text combined
- **Global Ready**: Multi-language from day one

## 🌟 Best Practices Summary

1. **Always consider mobile users** - Every feature must work on mobile
2. **AI should enhance, not replace** - Keep humans in the loop
3. **Performance is a feature** - Fast responses are expected
4. **Security by default** - Never compromise on security
5. **Data drives decisions** - Measure everything important
6. **Iterate based on feedback** - User feedback shapes the product
7. **Document as you go** - Future you will thank present you
8. **Test early and often** - Bugs caught early are cheaper
9. **Keep it simple** - Complexity is the enemy of reliability
10. **Have fun** - We're building the future of recruitment!

## 🔧 Refactoring Guidelines

### When Refactoring
1. **Enable Strict TypeScript First**: Fix type errors before functionality
2. **Create Tests Before Changes**: Use TDD approach with SPARC
3. **Organize by Domain**: Group related functionality together
4. **Extract Reusable Logic**: Custom hooks for business logic
5. **Maintain Backwards Compatibility**: Deprecate before removing

### Component Refactoring Checklist
- [ ] Split components > 300 lines
- [ ] Extract business logic to hooks
- [ ] Add proper TypeScript types
- [ ] Create comprehensive tests
- [ ] Add loading and error states
- [ ] Implement proper error boundaries
- [ ] Document complex logic
- [ ] Optimize re-renders with memo/useMemo

### Next Refactoring Priorities
1. **Large Components**: Break down components exceeding 500 lines
2. **API Service Layer**: Create abstraction for database calls
3. **Error Handling**: Implement consistent error boundaries
4. **Loading States**: Add skeleton screens and suspense
5. **Performance**: Profile and optimize bundle size

## 🔍 Boolean Search Examples

### Enhanced Boolean Search String Format
After optimization, the system now generates comprehensive boolean searches like:

**Input**: "AWS Architect in Los Angeles with Python and SQL skills"

**Output**:
```
("AWS Architect" OR "Cloud Architect" OR "Solutions Architect" OR "Infrastructure Architect" OR "DevOps Architect" OR "Senior Cloud Engineer" OR "Principal Engineer AWS") AND (AWS OR "Amazon Web Services" OR EC2 OR Lambda OR S3 OR CloudFormation) AND (Python OR "Python programming" OR Django OR Flask OR boto3) AND (SQL OR MySQL OR PostgreSQL OR "database design" OR Redshift OR RDS) AND ("Los Angeles" OR LA OR "Greater Los Angeles" OR "Southern California" OR remote) AND (architect OR "architectural design" OR "system design" OR "technical leadership" OR "solution architecture") NOT (junior OR intern OR student OR "entry level")
```

### Key Components of Effective Boolean Searches:
1. **Job Title Variations**: Include current, previous, and alternative titles
2. **Skill Synonyms**: Use official names and common abbreviations
3. **Location Flexibility**: Include city, region, and remote options
4. **Experience Indicators**: Senior, lead, principal, years of experience
5. **Exclusions**: Filter out junior/intern positions when appropriate
6. **Industry Context**: Add domain-specific terms for better matches

---

*Last Updated: June 2025*
*Version: 1.4.0*