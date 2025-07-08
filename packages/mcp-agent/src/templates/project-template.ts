/**
 * The complete PROJECT-TEMPLATE.md content
 */

export const PROJECT_TEMPLATE_CONTENT = `# PROJECT-TEMPLATE.md
A comprehensive, research-backed template for modern software projects with AI-assisted development. Based on 2025 research showing 53% better test coverage and 30% fewer prompt tokens with proper context management.

## 🚀 Quick Start
\`\`\`bash
# 1. Clone repository
git clone [REPO_URL]
cd [PROJECT_NAME]

# 2. Setup environment
cp .env.example .env.local
[PACKAGE_MANAGER] install

# 3. Start development
[PACKAGE_MANAGER] run dev
\`\`\`

---

## 📋 Project Context
\`\`\`yaml
project:
  name: [PROJECT_NAME]
  version: [SEMANTIC_VERSION]
  description: [ONE_LINE_DESCRIPTION]
  stage: [prototype|mvp|production]

organization:
  company: [COMPANY_NAME]
  team: [TEAM_NAME]
  domain: [BUSINESS_DOMAIN]

tech_stack:
  language: [typescript|javascript|python|go|rust|java]
  framework: [next|react|vue|django|spring|fastapi]
  ui_library: [shadcn|mui|antd|tailwind-ui|custom]
  database: [postgres|mysql|mongodb|sqlite]
  deployment: [vercel|aws|gcp|railway|heroku]

architecture:
  style: [monolith|microservices|serverless]
  api: [rest|graphql|grpc]
  auth: [jwt|oauth|session]

ai_assistance:
  primary_tool: [copilot|cursor|claude|chatgpt]
  context_files: true
  security_scanning: true
\`\`\`

---

## 🏗️ Architecture

### System Overview
\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   API/BFF   │────▶│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                    │
        └───────────────────┴────────────────────┘
                    Monitoring/Logging
\`\`\`

### Directory Structure
\`\`\`
project-root/
├── src/                    # Source code
│   ├── components/        # UI components (with README.md)
│   ├── services/          # Business logic (with README.md)
│   ├── utils/            # Helpers
│   └── types/            # TypeScript types
├── tests/                 # Test suites
├── docs/
│   ├── adr/              # Architecture Decision Records
│   └── context/          # Additional context files
├── scripts/              # Build/deploy scripts
├── .github/
│   └── workflows/        # CI/CD + Security scanning
├── CODEBASE-CONTEXT.md   # AI assistant context
└── .context7.yaml        # Context7 config for real-time docs
\`\`\`

### Key Patterns
- **Component Pattern**: [Describe your component architecture]
- **State Management**: [Describe your state approach]
- **Error Handling**: [Describe error patterns]
- **API Communication**: [Describe API patterns]
- **Naming Conventions**: Components: PascalCase, Hooks: useVerbNoun, API: /plural-nouns

---

## 💻 Development

### Setup Requirements
\`\`\`bash
# Required tools
- Node.js [VERSION] or higher
- [DATABASE] [VERSION]
- [OTHER_TOOLS]

# Environment variables (see .env.example)
DATABASE_URL=
API_KEY=
[OTHER_VARS]=
\`\`\`

### Common Commands
\`\`\`bash
# Development
[PACKAGE_MANAGER] run dev       # Start dev server
[PACKAGE_MANAGER] run build     # Build for production
[PACKAGE_MANAGER] run test      # Run tests
[PACKAGE_MANAGER] run lint      # Lint code
[PACKAGE_MANAGER] run format    # Format code
[PACKAGE_MANAGER] run security  # Security scan

# Database (if applicable)
[PACKAGE_MANAGER] run db:migrate  # Run migrations
[PACKAGE_MANAGER] run db:seed     # Seed data
\`\`\`

### Git Workflow
\`\`\`bash
# Branch naming
feature/[JIRA-123]-description
bugfix/[JIRA-456]-description
hotfix/critical-issue

# Commit format (tag AI-assisted commits)
feat: add new feature
fix: resolve bug [ai]
docs: update documentation
refactor: improve code structure [ai]
test: add tests
chore: update dependencies
\`\`\`

---

## 🤖 AI-Assisted Development

### Context Management System

Create \`CODEBASE-CONTEXT.md\` in project root (research shows 30% reduction in prompt tokens):

\`\`\`markdown
# CODEBASE-CONTEXT.md

## Project Vision
[One paragraph about what we're building and why]

## Tech Stack & Versions
- [Framework] v[VERSION]
- [Database] v[VERSION]
- [Key libraries with versions]

## Naming Conventions
- Components: PascalCase (UserProfile, LoginForm)
- Hooks: useVerbNoun (useFetchData, useAuthState)
- API routes: /plural-nouns (/users, /products)
- Files: kebab-case (user-profile.tsx, api-client.ts)

## Code Patterns
- Error handling: Always use try-catch with specific error messages
- State management: [Your approach]
- API calls: Always through service layer, never direct
- Component structure: [Your pattern]

## Implementation Constraints for AI
- NEVER use localStorage for sensitive data
- NEVER expose API keys in frontend code
- ALWAYS validate inputs with [validation library]
- ALWAYS handle loading/error/empty states

## Directory Purpose
/components - Reusable UI components
/services - Business logic and API calls
/utils - Pure utility functions
/types - TypeScript type definitions
\`\`\`

### Directory-Level Context Files

Add README.md in each major directory:

\`\`\`markdown
# components/[feature]/README.md

## Purpose
[What this directory contains]

## Public API
- ComponentName: Main component
- useHookName: Related hook
- Types: Exported types

## AI Generation Notes
- Always use our patterns
- Never use [antipatterns]
- All components must [requirements]
\`\`\`

### Architecture Decision Records (ADRs)

Create ADR templates with AI constraints:

\`\`\`markdown
# docs/adr/001-api-patterns.md

## Status
Accepted

## Context
We need consistent API patterns for AI code generation

## Decision
Use REST API with consistent naming and response format

## Implementation Constraints for Code Generation
- Always use plural nouns for resources (/users, not /user)
- Always return { data: T, error?: Error } format
- Always use proper HTTP status codes
- Never expose database IDs directly
- Always include pagination for list endpoints

## Consequences
- Consistent API surface for AI tools
- Predictable error handling
- Better AI code generation accuracy
\`\`\`

### Context7 Integration (For Real-time Docs)

When working with frequently updated libraries, use [Context7](https://context7.com) to prevent outdated code generation:

\`\`\`yaml
# .context7.yaml (if using Context7)
libraries:
  - id: /[framework]/docs
    version: [VERSION]
    topics: ["routing", "api", "components"]
\`\`\`

### Best Practices for AI Code Generation
1. **Always verify imports** exist in package.json
2. **Specify versions** when asking for help: "Using React 19"
3. **Reference project patterns**: "Follow our API structure in CODEBASE-CONTEXT.md"
4. **Test generated code** before committing
5. **Never share** secrets, keys, or customer data with AI

### Prompt-Centric Workflow

#### Task Decomposition Strategy
\`\`\`markdown
## Breaking Down Features

1. Create data model/types
   "Define TypeScript interfaces for [feature] following our type patterns"

2. Build API layer
   "Create service functions for [feature] using our API patterns in /services/README.md"

3. Implement UI components
   "Build [component] following our component structure, use our design system"

4. Add tests
   "Write unit tests for [feature] targeting 80% coverage"

5. Update documentation
   "Update CODEBASE-CONTEXT.md with new patterns from [feature]"
\`\`\`

### AI Agent DOS and DON'TS

#### ✅ DOS (Always Follow)
\`\`\`typescript
// DO: Verify all imports exist
import { useState } from 'react'; // Check package.json first

// DO: Handle all states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

// DO: Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Specific error context:', error);
  throw error;
}

// DO: Type everything explicitly
interface UserProps {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

// DO: Use environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// DO: Follow naming conventions
const UserProfileCard = () => {}; // PascalCase component
const useFetchUserData = () => {}; // useVerbNoun hook
\`\`\`

#### ❌ DON'TS (Never Do)
\`\`\`typescript
// DON'T: Hallucinate libraries or methods
import { useMagicHook } from 'react'; // DOESN'T EXIST
array.findLast(); // Not in all environments

// DON'T: Use any type
const data: any = fetchData(); // NO!
const processItem = (item: any) => {}; // NO!

// DON'T: Skip error handling
fetch('/api/data'); // Where's the error handling?
JSON.parse(data); // What if it fails?

// DON'T: Hardcode sensitive data
const apiKey = "sk_live_abc123"; // NEVER!
const dbUrl = "postgresql://prod..."; // NEVER!

// DON'T: Use async directly in useEffect
useEffect(async () => { // WRONG!
  await fetchData();
}, []);

// DON'T: Mutate state directly
state.items.push(newItem); // WRONG!
user.name = 'John'; // WRONG!
\`\`\`

#### Common AI Pitfalls to Avoid
1. **Outdated Patterns**: AI might suggest \`componentWillMount\` or other deprecated APIs
2. **Wrong Signatures**: \`useState(value, deps)\` - useState doesn't take deps!
3. **Missing Dependencies**: useEffect with empty deps when it uses external values
4. **Invented APIs**: Methods that sound plausible but don't exist
5. **Security Violations**: Exposing secrets, using eval(), or trusting user input
6. **Performance Issues**: Missing memoization, infinite loops, or unnecessary re-renders

### 🧠 Understanding AI Hallucinations

#### What Are AI Hallucinations?
AI hallucinations occur when AI confidently generates code that looks correct but contains:
- Non-existent methods or properties
- Incorrect API signatures
- Imaginary library features
- Plausible but wrong solutions

Research shows 27% of AI suggestions may contain security vulnerabilities or errors.

#### How to Prevent Hallucinations

1. **Version-Specific Queries**
\`\`\`
❌ "How to fetch data in React"
✅ "How to fetch data in React 19 with Next.js 15 App Router"
\`\`\`

2. **Verify Before Trust**
\`\`\`bash
# Always check if a method exists
npm list react # Check version
# Then verify in official docs or node_modules
\`\`\`

3. **Use Context7 or Official Docs**
- Check current documentation
- Verify API signatures
- Confirm feature availability

4. **Test in Small Chunks**
\`\`\`typescript
// Test each new API separately before combining
console.log(typeof Array.prototype.findLast); // 'function' or 'undefined'
\`\`\`

### 🛡️ Defensive Coding with AI

1. **Always Question Generated Code**
   - Does this method actually exist?
   - Is this the current best practice?
   - Are there security implications?

2. **Incremental Integration**
   - Add AI-generated code piece by piece
   - Test each addition
   - Verify behavior matches expectations

3. **Maintain a Skeptical Mindset**
\`\`\`typescript
// AI says this is "more performant"
const result = ~~(value / 2); // Bitwise "optimization"

// But this is clearer and modern JITs optimize it anyway
const result = Math.floor(value / 2);
\`\`\`

4. **Create Validation Habits**
   - Run the code immediately
   - Check browser console
   - Verify with TypeScript compiler
   - Test edge cases

5. **Document AI Interactions**
\`\`\`typescript
// AI-generated: verify this works with our CSP policy
// Context7 verified: correct as of React 19.0
// Last checked: [DATE]
\`\`\`

---

## 🧪 Testing & Quality

### Testing Strategy
\`\`\`bash
# Test structure
tests/
├── unit/         # Unit tests (target: 80% coverage)
├── integration/  # API/service tests
└── e2e/         # End-to-end tests

# Run tests
[PACKAGE_MANAGER] run test          # All tests
[PACKAGE_MANAGER] run test:unit     # Unit only
[PACKAGE_MANAGER] run test:e2e      # E2E only
[PACKAGE_MANAGER] run test:coverage # Coverage report
\`\`\`

### Code Quality Checklist
- [ ] TypeScript/Lint errors resolved
- [ ] Tests written and passing (80% coverage minimum)
- [ ] Documentation updated (including CODEBASE-CONTEXT.md)
- [ ] No hardcoded values or secrets
- [ ] Error handling implemented
- [ ] Performance metrics met (see below)
- [ ] Security scan passed
- [ ] Accessibility audit passed (WCAG 2.1 AA)

### Performance Budgets
\`\`\`yaml
metrics:
  # Core Web Vitals
  LCP: < 2.5s      # Largest Contentful Paint
  FID: < 100ms     # First Input Delay
  CLS: < 0.1       # Cumulative Layout Shift
  
  # Custom metrics
  bundle_size: < 200KB (main.js)
  api_response: < 500ms (p95)
  time_to_interactive: < 3.5s
\`\`\`

---

## 🚀 Deployment

### Environments
| Environment | URL | Deploy Method | Branch |
|------------|-----|---------------|---------|
| Development | [DEV_URL] | Auto | develop |
| Staging | [STAGING_URL] | Auto | main |
| Production | [PROD_URL] | Manual | main + tag |

### CI/CD Pipeline
\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Lint code
        run: npm run lint
      - name: Type check
        run: npm run typecheck
      - name: Run tests
        run: npm run test:coverage
      - name: Check coverage
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage is below 80%"
            exit 1
          fi

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        run: npm audit --audit-level=moderate
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
      - name: SAST scan
        uses: github/super-linter@v5
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      
  build:
    needs: [quality, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build application
        run: npm run build
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
\`\`\`

### Security Scanning
\`\`\`bash
# Local security commands
npm audit                    # Check dependencies
npm run security:secrets     # Scan for secrets
npm run security:sast        # Static analysis
\`\`\`

### Monitoring
- **APM**: [Tool] - [Dashboard URL]
- **Logs**: [Tool] - [Dashboard URL]
- **Alerts**: [Tool] - [Configuration]
- **Uptime**: [Tool] - [Status Page]
- **Error Tracking**: Sentry/Rollbar with AI error grouping

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary>Build Failures</summary>

\`\`\`bash
# Clear caches and reinstall
rm -rf node_modules [LOCK_FILE]
[PACKAGE_MANAGER] cache clean
[PACKAGE_MANAGER] install

# Check for type errors
[PACKAGE_MANAGER] run typecheck

# Verify all imports exist
[PACKAGE_MANAGER] run lint
\`\`\`
</details>

<details>
<summary>Database Connection Issues</summary>

\`\`\`bash
# Check connection
[DATABASE_CLI] -h [HOST] -U [USER] -d [DATABASE]

# Verify environment variables
echo $DATABASE_URL

# Test connection
[PACKAGE_MANAGER] run db:test-connection
\`\`\`
</details>

<details>
<summary>Test Failures</summary>

\`\`\`bash
# Run specific test
[PACKAGE_MANAGER] run test -- [TEST_FILE]

# Debug mode
[PACKAGE_MANAGER] run test:debug

# Update snapshots if needed
[PACKAGE_MANAGER] run test -- -u
\`\`\`
</details>

<details>
<summary>AI-Generated Code Issues</summary>

\`\`\`bash
# Verify method exists
node -e "console.log(typeof Array.prototype.findLast)"

# Check library version
npm list [LIBRARY_NAME]

# Validate against docs
npm run docs:check [LIBRARY_NAME]
\`\`\`
</details>

---

## 📚 Resources

### Documentation
- [Architecture Decisions](./docs/adr/)
- [API Specification](./docs/api/)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Context Files](./docs/context/)

### External Links
- [Framework Docs]([FRAMEWORK_URL])
- [Library Docs]([LIBRARY_URL])
- [Team Handbook]([HANDBOOK_URL])

### Getting Help
- **Slack**: #[PROJECT_CHANNEL]
- **Email**: [TEAM_EMAIL]
- **Wiki**: [WIKI_URL]

---

## 📊 AI Assistance Metrics

Track these metrics to improve AI collaboration:

| Metric | Target | Current |
|--------|--------|---------|
| Average prompt tokens per feature | < 2000 | [MEASURE] |
| AI-generated code test pass rate | > 80% | [MEASURE] |
| Time to merge AI-assisted PRs | < 4 hours | [MEASURE] |
| Security issues in AI code | < 5% | [MEASURE] |
| Context file effectiveness | > 30% token reduction | [MEASURE] |

---

## 🔄 Maintenance

### Regular Tasks
- [ ] Daily: Check security alerts
- [ ] Weekly: Update dependencies (security patches)
- [ ] Monthly: Review and update documentation
- [ ] Quarterly: Architecture review + update ADRs
- [ ] Yearly: Major version upgrades

### Keeping AI Context Current
1. Update \`CODEBASE-CONTEXT.md\` when adding new patterns
2. Update directory README.md files when changing APIs
3. Create new ADRs for architectural decisions
4. Update Context7 config (if used) when upgrading libraries
5. Review AI metrics quarterly and adjust practices

### Documentation Health Checks
\`\`\`bash
# Run documentation validation
npm run docs:validate

# Check for stale context
npm run context:check-freshness

# Generate context report
npm run context:report
\`\`\`

---

## 🎯 Success Metrics

Based on industry research (2025):
- **53% better test coverage** with AI assistance when context is proper
- **30% reduction in prompt tokens** with CODEBASE-CONTEXT.md
- **13% fewer readability errors** in AI-generated code
- **5-15% faster PR approvals** with consistent patterns
- **27% security vulnerability rate** without proper safeguards (avoid this!)

---

**Last Updated**: [DATE] | **Version**: [VERSION] | **Maintainer**: [NAME]

*This is a living document. Keep it current, keep it useful. Research shows teams with up-to-date context files ship 40% faster.*\\`;

export const CODEBASE_CONTEXT_TEMPLATE = `# CODEBASE-CONTEXT.md

## Project Vision
[One paragraph about what we're building and why - be specific about the goals, target users, and unique value proposition]

## Tech Stack & Versions
**Note**: All version constraints are maintained in \`./shared/tech-stack.yaml\` to avoid duplication.

\`\`\`yaml
# Import shared tech stack
# See: ./shared/tech-stack.yaml for:
# - Core framework versions
# - UI & styling libraries
# - State management tools
# - Forms & validation
# - Testing frameworks
# - Beta package tracking
# - Preferred libraries
\`\`\`

### Quick Reference
- **Icons**: Use ONLY the icon library specified in tech-stack.yaml
- **Dates**: Use ONLY the date library specified in tech-stack.yaml
- **HTTP**: Use ONLY the HTTP client specified in tech-stack.yaml
- **Validation**: ALWAYS use the validation library specified in tech-stack.yaml

## Naming Conventions
### File Naming
- **Components**: PascalCase.tsx (e.g., Button.tsx, UserCard.tsx)
- **Pages**: kebab-case.tsx (e.g., sign-in.tsx, user-profile.tsx)
- **Utilities**: camelCase.ts (e.g., formatDate.ts, apiClient.ts)
- **Hooks**: use[Name].ts (e.g., useUsers.ts, useAuth.ts)
- **Types**: [name].types.ts or inline in component files

### Code Naming
- **React Components**: PascalCase (e.g., Button, UserProfile)
- **Functions**: camelCase (e.g., calculateTotal, formatDate)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., API_URL, MAX_RETRIES)
- **Interfaces/Types**: PascalCase with descriptive names

## Code Patterns
### Error Handling
\`\`\`typescript
// Always use try-catch with specific error messages
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('[Specific Context]:', error);
  throw new CustomError('User-friendly message', error);
}
\`\`\`

### State Management
- Global state: [Pattern description]
- Local state: useState for component-specific state
- Server state: [Pattern description]

### API Calls
- Always through service layer, never direct
- Use configured HTTP client with interceptors
- Consistent error handling and response format

## Implementation Constraints for AI
### Security
- NEVER use localStorage for sensitive data (use secure cookies)
- NEVER expose API keys in frontend code
- NEVER trust user input without validation
- NEVER use eval() or Function() constructors

### Code Quality
- ALWAYS validate inputs with [validation library]
- ALWAYS handle loading/error/empty states
- ALWAYS use TypeScript strict mode (no any)
- ALWAYS include proper error boundaries

### Performance
- ALWAYS memoize expensive computations
- ALWAYS lazy load heavy components
- ALWAYS optimize images and assets
- ALWAYS use proper list keys in React

## Directory Purpose
\`\`\`
/src
  /components - Reusable UI components
  /pages OR /app - Application routes
  /services - Business logic and API calls
  /hooks - Custom React hooks
  /utils - Pure utility functions
  /types - TypeScript type definitions
  /styles - Global styles and themes
  /lib - Third-party library configurations
  /constants - Application constants
\`\`\`

## AI Generation Notes
### Preferred Libraries
- Icons: ONLY use [icon-library]
- Dates: Use [date-library]
- HTTP: Use our configured client
- Animation: [animation-library]

### Common Mistakes to Avoid
1. Using outdated patterns (check library version)
2. Creating new validation schemas for common fields
3. Direct DOM manipulation in React
4. Synchronous operations in async contexts
5. Missing dependency arrays in hooks

---

**Remember**: This is a living document. Update it when patterns change. AI effectiveness depends on accurate context.`;

export const DIRECTORY_README_TEMPLATE = `# [DIRECTORY_NAME]

## Purpose
[What this directory contains]

## Public API
[List of exported items]

## AI Generation Notes
[Specific instructions for AI when working in this directory]

## Patterns
[Common patterns used in this directory]`;

export const CONTEXT7_TEMPLATE = `# Context7 Configuration
# Prevents AI hallucinations by syncing with real-time documentation

# Import version constraints from shared tech stack
import:
  - ./shared/tech-stack.yaml

libraries:
  - id: /[framework]/docs
    version: "[IMPORTED_FROM_TECH_STACK]"  # From tech-stack.yaml
    topics: 
      - "[topic1]"
      - "[topic2]"
      - "[topic3]"
    
  - id: /[ui-framework]/docs
    version: "[IMPORTED_FROM_TECH_STACK]"  # From tech-stack.yaml
    topics: 
      - "components"
      - "hooks"
      - "patterns"
    
  - id: /[validation-library]/docs
    version: "[IMPORTED_FROM_TECH_STACK]"  # From tech-stack.yaml
    topics:
      - "schemas"
      - "validation"
      - "error-handling"

# Update configuration
update_schedule: weekly
verification: true
auto_update: true

# AI-specific settings
ai_context:
  max_context_age_days: 7
  verify_imports: true
  check_deprecations: true
  
# Hallucination prevention
hallucination_prevention:
  enabled: true
  strategies:
    - verify_method_existence
    - check_api_signatures
    - validate_import_paths
    - confirm_version_compatibility
    
# Custom rules for this project
project_rules:
  - rule: "Always use [framework] patterns compatible with minimum version"
    priority: high
  - rule: "Never use deprecated APIs"
    priority: critical
  - rule: "Verify all third-party integrations"
    priority: medium
  - rule: "Check version compatibility before using new features"
    priority: high

# Notification settings
notifications:
  breaking_changes: true
  security_updates: true
  deprecations: true
  email: [team-email]`;

export const ADR_TEMPLATE = `# ADR-[NUMBER]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Describe the issue or decision that needs to be made. Include relevant background information.]

## Decision
[Describe the decision that was made and the reasoning behind it.]

## Implementation Constraints for Code Generation
[List specific rules that AI should follow when generating code related to this decision]

### DO:
- [Specific thing AI should always do]
- [Another thing AI should do]

### DON'T:
- [Specific thing AI should never do]
- [Another thing to avoid]

### Code Examples
\`\`\`typescript
// CORRECT: Pattern to follow
[Example of correct implementation]

// WRONG: Pattern to avoid
[Example of what not to do]
\`\`\`

## Consequences

### Positive
- [Positive outcome 1]
- [Positive outcome 2]

### Negative
- [Negative outcome 1]
- [Negative outcome 2]

### Neutral
- [Neutral outcome]

## Notes for AI Code Generation
[Specific instructions for AI when implementing this pattern]

## References
- [Link to relevant documentation]
- [Link to related ADRs]`;

export const TECH_STACK_TEMPLATE = `# Tech Stack Configuration
# Single source of truth for all version constraints
# This file is referenced by all other context files to avoid duplication

versions:
  # Core Frameworks
  node: ">=22.0.0"
  typescript: ">=5.3.0"
  
  # Frontend Frameworks
  [framework]:
    version: ">=[VERSION]"
    docs: "[DOCS_URL]"
  
  # UI Libraries
  [ui-library]:
    version: ">=[VERSION]"
    docs: "[DOCS_URL]"
  
  # State Management
  [state-library]:
    version: ">=[VERSION]"
    docs: "[DOCS_URL]"
  
  # Testing
  [test-framework]:
    version: ">=[VERSION]"
    docs: "[DOCS_URL]"

# Beta Software Tracking
beta_packages:
  - name: "[package-name]"
    current: ">=[VERSION] <[NEXT_MAJOR]"
    ga_expected: "[DATE]"
    notes: "[Migration notes or risks]"

# Preferred Libraries
preferred:
  icons: "[icon-library]"  # ONLY use this
  dates: "[date-library]"
  http: "[http-library]"
  animation: "[animation-library]"
  
# Bundle Size Constraints
constraints:
  max_bundle_size: "150KB parsed (exceptions with justification)"
  max_component_loc: "200 lines"
  max_file_loc: "300 lines"
  
# Version Update Schedule
maintenance:
  security_patches: "immediate"
  minor_updates: "weekly"
  major_updates: "quarterly with migration plan"`;

export const CURSOR_CONTEXT_LOADER_TEMPLATE = `# Cursor Context Auto-Loader Configuration
# This file enables automatic context loading in Cursor

name: "Project Context Auto-Loader"
description: "Automatically loads project context files for consistent AI code generation"

# File patterns where context should be available
path_patterns:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/package.json"
  - "**/*.md"

# Automatically attach context when working in these files
auto_attach: true

# Context files to load
context_files:
  - "agent-context/PROJECT-TEMPLATE.md"
  - "agent-context/CODEBASE-CONTEXT.md"
  - "agent-context/shared/tech-stack.yaml"

# Priority order (higher number = higher priority)
priority: 100

# Conditions for loading
conditions:
  - file_exists: "agent-context/PROJECT-TEMPLATE.md"
  - file_exists: "agent-context/CODEBASE-CONTEXT.md"`;

export const CURSOR_TECH_RULES_TEMPLATE = `# Tech Stack Rules for Cursor
# Enforces version constraints and library preferences

name: "Tech Stack Enforcement"
description: "Ensures AI uses approved versions and libraries"

# Import shared version constraints
import:
  - "../../agent-context/shared/tech-stack.yaml"

rules:
  # Version Constraints
  - id: "min-versions"
    description: "Enforce minimum version requirements"
    severity: "error"
    message: "Must use {library} version {min_version} or higher"
    
  # Library Preferences
  - id: "preferred-libraries"
    description: "Use only approved libraries"
    severity: "error"
    patterns:
      icons: 
        allowed: ["lucide-react"]
        forbidden: ["react-icons", "heroicons", "fontawesome"]
      dates:
        allowed: ["date-fns"]
        forbidden: ["moment", "dayjs"]
        
  # Beta Software
  - id: "beta-tracking"
    description: "Track beta dependencies"
    severity: "warning"
    message: "{package} is in beta - GA expected {date}"
    
# Automatic fixes
auto_fix:
  wrong_imports: true
  version_bumps: false  # Require manual approval`;

export const CURSOR_QUALITY_GATES_TEMPLATE = `# Quality Gates Configuration
# Enforces code quality standards

name: "Code Quality Gates"
description: "Automated quality checks for AI-generated code"

gates:
  # Size Limits
  file_size:
    max_lines: 300
    exceptions:
      - "*.test.ts"  # Test files can be longer
      - "*.spec.ts"
      
  component_size:
    max_lines: 200
    max_complexity: 10
    
  function_size:
    max_lines: 40
    max_params: 4
    
  # Type Safety
  typescript:
    strict: true
    no_any: true
    no_implicit_any: true
    exceptions:
      - "third-party.d.ts"  # Third-party type definitions
      
  # Testing Requirements
  coverage:
    statements: 90
    branches: 85
    functions: 90
    lines: 90
    
  # Performance
  bundle:
    max_size: "150KB"
    analyze: true
    tree_shake: true
    
# Enforcement
enforcement:
  pre_commit: true
  pre_push: true
  ci_required: true
  
# Reporting
reporting:
  format: "github-actions"
  fail_on_warning: false
  fail_on_error: true`;

export const VERSION_SYNC_SCRIPT_TEMPLATE = `#!/usr/bin/env node
/**
 * Version Sync Script
 * Checks for outdated dependencies and updates context files
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

async function checkVersions() {
  console.log('🔍 Checking for outdated dependencies...');
  
  try {
    // Check npm/pnpm/yarn outdated
    const outdated = execSync('[PACKAGE_MANAGER] outdated --json', { 
      encoding: 'utf-8' 
    });
    
    const packages = JSON.parse(outdated || '{}');
    const updates = [];
    
    // Read current tech stack
    const techStackPath = path.join('agent-context', 'shared', 'tech-stack.yaml');
    const techStack = yaml.load(await fs.readFile(techStackPath, 'utf-8'));
    
    // Check each package
    for (const [name, info] of Object.entries(packages)) {
      if (shouldUpdate(name, info, techStack)) {
        updates.push({
          name,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          type: getUpdateType(info)
        });
      }
    }
    
    if (updates.length > 0) {
      console.log('\\n📦 Found updates:');
      updates.forEach(u => {
        console.log(\`  - \${u.name}: \${u.current} → \${u.latest} (\${u.type})\`);
      });
      
      // Update tech-stack.yaml
      await updateTechStack(updates, techStack, techStackPath);
      
      // Update Context7 config
      await updateContext7(updates);
      
      console.log('\\n✅ Context files updated!');
      console.log('\\n📝 Next steps:');
      console.log('  1. Review the changes');
      console.log('  2. Run tests');
      console.log('  3. Commit: git commit -m "chore: sync dependency versions"');
    } else {
      console.log('✅ All dependencies are up to date!');
    }
    
  } catch (error) {
    if (error.status === 1) {
      console.log('✅ No outdated dependencies found!');
    } else {
      console.error('❌ Error checking versions:', error.message);
      process.exit(1);
    }
  }
}

function shouldUpdate(name, info, techStack) {
  // Security updates: always
  if (info.type === 'security') return true;
  
  // Major versions: manual review
  if (info.type === 'major') return false;
  
  // Check if package is in our tech stack
  const isCore = Object.values(techStack.versions).some(v => 
    v.name === name || name.includes(v.name)
  );
  
  return isCore;
}

function getUpdateType(info) {
  const current = info.current.split('.');
  const latest = info.latest.split('.');
  
  if (current[0] !== latest[0]) return 'major';
  if (current[1] !== latest[1]) return 'minor';
  return 'patch';
}

async function updateTechStack(updates, techStack, techStackPath) {
  // Update versions in tech stack
  updates.forEach(update => {
    for (const [key, value] of Object.entries(techStack.versions)) {
      if (typeof value === 'object' && value.name === update.name) {
        value.version = \`>=\${update.latest}\`;
      }
    }
  });
  
  // Write updated file
  await fs.writeFile(
    techStackPath,
    yaml.dump(techStack, { lineWidth: -1 })
  );
}

async function updateContext7(updates) {
  const context7Path = path.join('agent-context', '.context7.yaml');
  
  try {
    const context7 = yaml.load(await fs.readFile(context7Path, 'utf-8'));
    
    // Update library versions
    updates.forEach(update => {
      const lib = context7.libraries.find(l => 
        l.id.includes(update.name) || update.name.includes(l.id.split('/')[1])
      );
      
      if (lib) {
        lib.version = update.latest;
      }
    });
    
    // Update last sync date
    context7.last_sync = new Date().toISOString();
    
    await fs.writeFile(
      context7Path,
      yaml.dump(context7, { lineWidth: -1 })
    );
  } catch (error) {
    console.warn('⚠️  Could not update Context7 config:', error.message);
  }
}

// Run the sync
checkVersions().catch(console.error);`;

export const GITHUB_ACTION_SYNC_TEMPLATE = `name: Weekly Context Sync

on:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync-versions:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: [PACKAGE_MANAGER] install
        
      - name: Run version sync
        run: node agent-context/scripts/sync-versions.js
        
      - name: Check for changes
        id: changes
        run: |
          if git diff --quiet; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi
          
      - name: Create Pull Request
        if: steps.changes.outputs.has_changes == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: sync dependency versions'
          title: '🔄 Weekly Context Sync'
          body: |
            ## Weekly Context Sync
            
            This PR updates the context files with the latest dependency versions.
            
            ### Changes
            - Updated \`agent-context/shared/tech-stack.yaml\`
            - Updated \`agent-context/.context7.yaml\` 
            
            ### Review Checklist
            - [ ] Version bumps are reasonable
            - [ ] No breaking changes without migration notes
            - [ ] Beta packages are tracked correctly
            
            *This PR was auto-generated by the weekly sync workflow.*
          branch: context-sync/weekly-update
          delete-branch: true
          
      - name: Notify on failure
        if: failure()
        run: |
          echo "::error::Context sync failed. Please check the logs."`;