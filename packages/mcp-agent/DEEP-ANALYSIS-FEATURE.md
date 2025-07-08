# Deep Codebase Analysis Feature

## 🎯 The Problem We Solved

Previously, AI agents would:
- Only check `package.json` and `.md` files
- Guess patterns from file names
- Make assumptions about architecture
- Create inaccurate context files

## 🔍 The Solution: Mandatory Deep Analysis

### New Workflow

1. **`analyze_codebase_deeply`** (MANDATORY FIRST STEP)
   - Reads EVERY source file
   - Analyzes actual code patterns
   - Collects evidence for claims
   - Understands real architecture

2. **Evidence-Based Templates**
   - Every pattern must reference actual files
   - Every convention needs 5+ examples
   - Code snippets required for patterns
   - No guessing allowed

### What the AI Now Does

#### Phase 1: Complete File Discovery
```bash
# AI executes:
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"
# Then reads EVERY file found
```

#### Phase 2: Pattern Detection
- **Naming**: Analyzes 20+ files to find actual conventions
- **Imports**: Examines import statements across codebase
- **Error Handling**: Finds real try-catch patterns
- **State**: Identifies actual state management usage
- **Styling**: Detects CSS approach from implementations

#### Phase 3: Evidence Collection
```
❌ BAD: "Project uses React hooks"
✅ GOOD: "Project uses React hooks (found useState in 47 files, useEffect in 38 files, custom hooks in src/hooks/)"

❌ BAD: "Naming convention is PascalCase for components"
✅ GOOD: "Components use PascalCase (Button.tsx, UserCard.tsx, NavigationMenu.tsx found in src/components/)"
```

#### Phase 4: Architecture Understanding
- Builds dependency graph from imports
- Understands module relationships
- Identifies architectural layers
- Detects circular dependencies

## 📊 Analysis Requirements

The AI must analyze:

1. **Components**
   - Every component file
   - Props patterns
   - State patterns
   - Styling approach

2. **Business Logic**
   - All service files
   - API patterns
   - Error handling
   - Data transformations

3. **State Management**
   - Store definitions
   - Action patterns
   - State structure

4. **Testing**
   - Test file patterns
   - Testing utilities
   - Coverage approach

## 🚫 Enforcement

The `create_project_template` tool now:
- Requires `analysis_complete: true` parameter
- Rejects attempts without prior analysis
- Ensures evidence-based documentation

## 📈 Results

### Before Deep Analysis
- Inaccurate patterns
- Wrong conventions
- Missed architecture
- Generic templates

### After Deep Analysis
- Accurate patterns with evidence
- Real conventions from code
- Correct architecture understanding
- Project-specific templates

## 🎯 Impact

1. **Accuracy**: Templates reflect actual codebase
2. **Evidence**: Every claim backed by code
3. **Completeness**: No missed patterns
4. **Trust**: AI understands your real code

The AI now truly understands your codebase before creating context files!