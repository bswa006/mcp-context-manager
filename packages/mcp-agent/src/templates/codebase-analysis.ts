/**
 * Comprehensive codebase analysis instructions for AI agents
 */

export const CODEBASE_ANALYSIS_CHECKLIST = `# Comprehensive Codebase Analysis Checklist

## 🔍 MANDATORY: Deep Code Analysis Required

Before creating any context files, you MUST perform a thorough analysis of EVERY file in the codebase:

### 1. File System Scan
\`\`\`bash
# First, understand the complete structure
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -100
find . -type f -name "*.css" -o -name "*.scss" -o -name "*.module.css" | head -20
find . -type f -name "*.json" -o -name "*.yaml" -o -name "*.yml" | head -20
\`\`\`

### 2. Core Source Files Analysis

#### Components (if React/Vue/Angular)
- [ ] Open and read EVERY component file
- [ ] Identify component patterns (functional vs class)
- [ ] Note prop patterns and type definitions
- [ ] Detect state management approach
- [ ] Find naming conventions from actual files
- [ ] Identify styling approach (CSS modules, styled-components, Tailwind classes)

#### Business Logic
- [ ] Read ALL service/API files
- [ ] Understand data fetching patterns
- [ ] Identify error handling patterns
- [ ] Note authentication implementation
- [ ] Find API endpoint patterns
- [ ] Detect data transformation patterns

#### State Management
- [ ] Identify state management library from actual usage
- [ ] Read store definitions
- [ ] Understand action/reducer patterns
- [ ] Note state structure
- [ ] Find data flow patterns

#### Routing
- [ ] Analyze route definitions
- [ ] Identify route protection patterns
- [ ] Note dynamic routing usage
- [ ] Find navigation patterns

### 3. Pattern Detection from Code

#### Naming Conventions (detect from actual files)
\`\`\`typescript
// Analyze at least 20 files to determine:
- Component naming: PascalCase? kebab-case?
- File naming: index.ts? ComponentName.tsx?
- Hook naming: useXxx? useXxxHook?
- Service naming: apiService? ServiceAPI?
- Constant naming: SCREAMING_SNAKE? camelCase?
\`\`\`

#### Import Patterns
\`\`\`typescript
// Check how imports are structured:
- Absolute imports? '@/components'
- Relative imports? '../../../components'
- Barrel exports? 'from ./components'
- Grouped imports? React first, then libraries, then local?
\`\`\`

#### Error Handling
\`\`\`typescript
// Find actual error handling patterns:
- try/catch patterns
- Error boundary usage
- Toast/notification patterns
- Logging approach
- Error recovery strategies
\`\`\`

### 4. Technology Stack Detection

#### From Actual Usage (not just package.json)
- [ ] CSS approach: Check actual style files
- [ ] UI library: Look for component imports
- [ ] Form library: Find form implementations
- [ ] HTTP client: Check API call patterns
- [ ] Date library: Look for date formatting
- [ ] Animation: Find animation usage

#### Version Compatibility
- [ ] Check for deprecated pattern usage
- [ ] Note modern vs legacy approaches
- [ ] Identify polyfills or shims

### 5. Code Quality Indicators

#### Type Safety
- [ ] Count any types vs proper types
- [ ] Check interface vs type usage
- [ ] Note type assertion patterns
- [ ] Find generic usage patterns

#### Testing
- [ ] Read test files to understand testing patterns
- [ ] Note test file locations
- [ ] Identify testing utilities used
- [ ] Check coverage approach

### 6. Architecture Understanding

#### Dependency Graph
\`\`\`typescript
// Analyze imports to understand:
- Which modules depend on which
- Circular dependency risks
- Layer separation (UI -> Business -> Data)
- Shared utility usage
\`\`\`

#### Code Organization
- [ ] Feature-based vs layer-based
- [ ] Monorepo structure understanding
- [ ] Shared code patterns
- [ ] Build configuration analysis

## 📊 Analysis Output Requirements

After analysis, you should be able to answer:

1. **Actual Tech Stack** (from code, not package.json)
   - UI framework and version patterns
   - CSS approach and utility usage
   - State management implementation
   - Form handling approach
   - API communication patterns

2. **Real Naming Conventions** (from actual files)
   - Component naming: [Examples from code]
   - File naming: [Examples from code]
   - Variable naming: [Examples from code]
   - Function naming: [Examples from code]

3. **Code Patterns** (from implementations)
   - Error handling: [Actual examples]
   - Loading states: [Actual examples]
   - Data fetching: [Actual examples]
   - Authentication: [Actual examples]

4. **Architecture Patterns** (from structure)
   - Module organization
   - Dependency flow
   - Shared code approach
   - Build setup

5. **Quality Metrics** (from analysis)
   - Type safety level
   - Test coverage approach
   - Code consistency
   - Performance patterns

## ⚠️ IMPORTANT: Evidence-Based Documentation

When filling templates, EVERY assertion must be backed by evidence:

❌ BAD: "Project uses React hooks"
✅ GOOD: "Project uses React hooks (found useState in 47 files, useEffect in 38 files, custom hooks in src/hooks/)"

❌ BAD: "Naming convention is PascalCase for components"
✅ GOOD: "Components use PascalCase (Button.tsx, UserCard.tsx, NavigationMenu.tsx found in src/components/)"

❌ BAD: "Project uses Zustand for state"
✅ GOOD: "State management uses Zustand v4.5.7 (store definitions in src/stores/, used in 23 components)"

## 🎯 Analysis Execution Order

1. **Start with entry points**
   - index.ts/main.ts/app.ts
   - Root component (App.tsx)
   - Route definitions

2. **Follow imports to understand structure**
   - Read each imported file
   - Build mental dependency map
   - Note patterns as you go

3. **Deep dive into core modules**
   - Most imported modules first
   - Business logic centers
   - Shared utilities

4. **Scan for patterns**
   - After reading 20+ files, patterns emerge
   - Document with specific examples
   - Note exceptions to patterns

## 🚫 DO NOT

- Don't assume patterns from file names alone
- Don't trust package.json without verifying usage
- Don't skip reading actual implementations
- Don't generalize from just 2-3 files
- Don't ignore test files - they reveal patterns too

Remember: The context files are only as good as the analysis. A superficial scan leads to incorrect patterns and bad AI code generation!`;

export const ANALYSIS_VERIFICATION_PROMPTS = [
  "Show me 5 specific examples of component naming from actual files",
  "What error handling pattern is used in the API calls? Show code",
  "List 10 actual import statements to demonstrate import patterns",
  "What state management is ACTUALLY used? Show store definitions",
  "How are forms handled? Show a real form implementation",
  "What testing patterns are used? Show test file examples",
  "Demonstrate the routing pattern with actual route definitions",
  "What CSS approach is used? Show style implementations",
  "How is authentication implemented? Show the actual code",
  "What are the actual TypeScript patterns? Show interfaces/types"
];

export const DEEP_ANALYSIS_INSTRUCTIONS = `
## Deep Analysis Instructions

### Phase 1: Discovery (Read Everything)
1. Start at project root, read ALL configuration files
2. Follow src/ or source code directory
3. Read EVERY .ts/.tsx/.js/.jsx file
4. Read ALL .css/.scss/.module.css files
5. Read test files to understand testing approach
6. Read build configuration files

### Phase 2: Pattern Recognition
After reading files, identify:
- Repeated patterns (must appear in 5+ files)
- Naming conventions (with 10+ examples)
- Import structures (with examples)
- Error handling (with code snippets)
- Component patterns (with implementations)

### Phase 3: Architecture Understanding
- Draw the dependency graph mentally
- Understand data flow
- Identify architectural layers
- Note coupling and cohesion

### Phase 4: Evidence Collection
For EVERY pattern claimed, collect:
- File paths where pattern is found
- Code snippets demonstrating pattern
- Counter-examples if any
- Frequency of pattern usage

### Phase 5: Validation
Before writing templates:
- Can you answer all verification prompts?
- Do you have code evidence for every claim?
- Have you read at least 80% of source files?
- Can you explain the architecture?

Only proceed to template creation after completing ALL phases!
`;