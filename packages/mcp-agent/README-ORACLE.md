# 🔮 MCP-Agent: The Code Quality Oracle

> **From Code Generator to Code Guide**: MCP-Agent is now a pure oracle that analyzes and guides without modifying code.

## 🎯 The Oracle Philosophy

MCP-Agent has evolved into a **semantic reviewer and guide** - a real-time AI quality expert that tells agents how to fix their code before it hits production.

### What Changed?

**Before (v1.0)**: MCP would modify and "fix" code automatically
**Now (v2.0)**: MCP analyzes, explains, and guides - leaving code generation to AI agents

### Why This Matters

1. **AI agents maintain control** - They fix code in their own style
2. **No output mismatches** - Preserves the AI's voice and approach  
3. **Trust and transparency** - See exactly what needs fixing and why
4. **Ecosystem friendly** - Tools prefer middleware that enhances, not overrides

## 🏗️ Architecture: Read-Eval-Explain

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agent (Claude, GPT, etc.)          │
│                         ↓ generates                      │
│                    Generated Code                        │
│                         ↓                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │              MCP Oracle                          │   │
│  │                                                  │   │
│  │  1. Read (AST)  →  2. Evaluate  →  3. Explain  │   │
│  │                                                  │   │
│  │  Returns: Structured Guidance                    │   │
│  │  ✓ What's wrong                                  │   │
│  │  ✓ Why it matters                                │   │
│  │  ✓ How to fix (patterns, not code)              │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                                │
│              AI Agent applies guidance                   │
└─────────────────────────────────────────────────────────┘
```

## 📊 What MCP Oracle Provides

### Structured Guidance Format

```typescript
interface CodeGuidance {
  issues: GuidanceIssue[];      // What's wrong
  suggestions: Suggestion[];     // How to improve
  patterns: Pattern[];          // Recognized patterns
  quality: QualityAssessment;   // Overall assessment
  explanation: Explanation;     // Natural language summary
}

interface GuidanceIssue {
  message: string;              // What's wrong
  
  semantic: {
    why: string;                // Why it's a problem
    impact: {                   // How it affects the app
      type: 'performance' | 'security' | 'maintainability';
      severity: number;         // 1-10
      description: string;
    };
    when: string;               // When this causes issues
  };
  
  guidance: {
    pattern: string;            // Pattern name to follow
    approach: string;           // How to fix conceptually
    steps: string[];           // Step-by-step guidance
    considerations: string[];   // Things to consider
    antipatterns: string[];    // What NOT to do
  };
}
```

## 🚀 Usage Examples

### Basic Oracle Usage

```typescript
import { MCPOracle } from 'mcp-agent/oracle';

const oracle = new MCPOracle();

const code = `
  function Component({ userId }) {
    const [user, setUser] = useState();
    
    useEffect(() => {
      fetchUser(userId).then(setUser);
    });
    
    return <div onClick={() => handleClick()}>{user?.name}</div>;
  }
`;

const guidance = await oracle.analyze(code);

// Output:
// {
//   issues: [{
//     message: "useEffect missing dependency array",
//     semantic: {
//       why: "Can cause infinite re-renders and stale closures",
//       impact: { 
//         type: "reliability", 
//         severity: 8,
//         description: "Component will fetch on every render"
//       }
//     },
//     guidance: {
//       pattern: "Hook Dependencies",
//       approach: "Add all referenced values to dependency array",
//       steps: [
//         "1. Identify all external values used in useEffect",
//         "2. Add [userId] as the dependency array",
//         "3. Consider if fetchUser needs memoization"
//       ]
//     }
//   }]
// }
```

### AI Integration

```typescript
// For Claude
import { MCPAnthropicOracle } from 'mcp-agent/anthropic';

const oracle = new MCPAnthropicOracle();
const enhancedClaude = oracle.enhance(anthropic);

// Claude now receives guidance automatically
const response = await enhancedClaude.messages.create({
  messages: [{ role: 'user', content: 'Create a React component' }]
});

// For GPT
import { MCPOpenAIOracle } from 'mcp-agent/openai';

const oracle = new MCPOpenAIOracle();
const enhancedGPT = oracle.enhance(openai);
```

### Getting AI-Friendly Explanations

```typescript
const guidance = await oracle.analyze(code);
const explanation = await oracle.explain(guidance, 'claude');

console.log(explanation.promptGuidance);
// "Please fix the following issues:
//  - useEffect missing dependency array: Add all referenced values to the dependency array
//  - Inline function in JSX: Extract using useCallback with dependencies
//  
//  Follow these patterns:
//  - Hook Dependencies: Ensure all external values are in dependency arrays
//  - Memoization Pattern: Use useCallback for stable function references"
```

## 🎨 Key Features

### 1. **Semantic Understanding**
- Not just "what's wrong" but "why it matters"
- Impact analysis (performance, security, maintainability)
- Contextual explanations

### 2. **Pattern-Based Guidance**
- Recognized patterns in code
- Suggested patterns to follow
- Anti-patterns to avoid

### 3. **Step-by-Step Instructions**
- Clear, actionable steps
- Conceptual approaches (not code)
- Considerations and tradeoffs

### 4. **AI-Specific Formatting**
- Claude-optimized explanations
- GPT-friendly prompts
- Generic structured format

## 📋 Common Guidance Examples

### Missing Hook Dependencies
```
Issue: useEffect missing dependency array
Why: Can cause infinite re-renders and stale closures
Impact: Reliability issue - severity 8/10
Pattern: Hook Dependencies
Approach: Add all referenced values to dependency array
Steps:
  1. Identify variables: userId, fetchUser
  2. Add to array: useEffect(() => {...}, [userId])
  3. Verify fetchUser is stable or memoized
```

### Inline Functions in Render
```
Issue: Inline arrow function in onClick prop
Why: Creates new function on every render, causing child re-renders
Impact: Performance issue - severity 6/10  
Pattern: Extract to useCallback
Approach: Move function outside render or memoize
Steps:
  1. Define handleClick with useCallback
  2. Include necessary dependencies
  3. Pass memoized function to onClick
```

### Security Vulnerabilities
```
Issue: Hardcoded API key detected
Why: Exposes sensitive credentials in source code
Impact: Security issue - severity 10/10
Pattern: Environment Variables
Approach: Move secrets to environment configuration
Steps:
  1. Create .env file with API_KEY=...
  2. Access via process.env.API_KEY
  3. Add .env to .gitignore
```

## 🔧 Configuration

```typescript
const oracle = new MCPOracle({
  // Focus areas for analysis
  defaultFocus: ['performance', 'security', 'react-patterns'],
  
  // Quality threshold
  qualityThreshold: 80,
  
  // Guidance format
  guidanceFormat: 'detailed', // or 'concise', 'structured'
  
  // Custom hooks
  hooks: {
    onAnalysis: (guidance) => console.log('Analyzed:', guidance),
    formatGuidance: (guidance) => customFormat(guidance)
  }
});
```

## 🌟 Benefits

### For AI Tools
- **Clear guidance** without overriding generation
- **Structured feedback** easy to parse and apply
- **Pattern library** for consistent improvements

### For Developers  
- **Transparency** - See exactly what needs fixing
- **Education** - Learn why something is problematic
- **Control** - Choose how to implement fixes

### For Teams
- **Consistency** - Same quality standards across all AI tools
- **Compliance** - Enforce organizational patterns
- **Metrics** - Track code quality over time

## 🚦 Migration from v1.0

### What's Removed
- ❌ `correct()` method - No longer modifies code
- ❌ `autoFix` option - Oracle only guides
- ❌ Code generation features - Pure analysis only

### What's New
- ✅ Structured guidance format
- ✅ Semantic explanations ("why")
- ✅ Pattern-based suggestions
- ✅ Step-by-step instructions
- ✅ AI-friendly formatting

### Migration Example

```typescript
// Old (v1.0)
const result = await mcp.correct({
  code: buggyCode,
  autoFix: true
});
// Returns: Fixed code

// New (v2.0)
const guidance = await oracle.analyze(buggyCode);
// Returns: Guidance on what to fix and how
// AI agent applies the fixes
```

## 🎯 Philosophy

> "Guide, don't override. Explain, don't assume. Empower, don't control."

MCP Oracle respects the AI agent's role as the code generator while ensuring quality through intelligent guidance. It's a trusted advisor, not a code generator.

---

**MCP-Agent v2.0**: The semantic reviewer that makes every AI a better coder.