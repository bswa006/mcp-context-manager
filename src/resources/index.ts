import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractPatternLibrary, extractWorkflowTemplates, extractTestPatterns } from './extractors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = join(__dirname, '../../../');

// Define available resources for AI agent self-guidance
const resources: Resource[] = [
  {
    uri: 'template://ai-constraints',
    name: 'AI Constraints & Rules',
    description: 'CRITICAL: Rules and constraints AI must follow when generating code',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://current-patterns',
    name: 'Current Code Patterns',
    description: 'REQUIRED: Patterns to match when generating new code',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://hallucination-prevention',
    name: 'Hallucination Prevention Guide',
    description: 'IMPORTANT: Common AI mistakes and how to avoid them',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://naming-conventions',
    name: 'Naming Conventions',
    description: 'MANDATORY: Exact naming patterns to follow',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://security-requirements',
    name: 'Security Requirements',
    description: 'CRITICAL: Security patterns that must be followed',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://api-signatures',
    name: 'Valid API Signatures',
    description: 'REFERENCE: Correct API methods and signatures to use',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://error-handling',
    name: 'Error Handling Patterns',
    description: 'REQUIRED: How to handle errors, loading, and edge cases',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://agent-memory',
    name: 'Agent Memory',
    description: 'Persistent memory of patterns, successes, and learnings',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://agent-context',
    name: 'Agent Context',
    description: 'Real-time context tracking for current development session',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://pattern-library',
    name: 'Pattern Library',
    description: 'Comprehensive library of code patterns for different scenarios',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://workflow-templates',
    name: 'Workflow Templates',
    description: 'Step-by-step workflows for common development tasks',
    mimeType: 'text/markdown',
  },
  {
    uri: 'template://test-patterns',
    name: 'Test Patterns',
    description: 'Testing patterns and strategies for 80%+ coverage',
    mimeType: 'text/markdown',
  },
];

export function setupResources(server: Server) {
  // Handle resource listing
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources,
    };
  });

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    try {
      let content = '';
      let filePath = '';
      // Get project path from environment or use template root
      const projectPath = process.env.PROJECT_PATH || TEMPLATE_ROOT;
      
      switch (uri) {
        case 'template://ai-constraints':
          content = extractAIConstraints();
          break;
          
        case 'template://current-patterns':
          content = extractCurrentPatterns(projectPath);
          break;
          
        case 'template://hallucination-prevention':
          content = extractHallucinationPrevention();
          break;
          
        case 'template://naming-conventions':
          content = extractNamingConventions();
          break;
          
        case 'template://security-requirements':
          content = extractSecurityRequirements();
          break;
          
        case 'template://api-signatures':
          content = extractValidAPIs();
          break;
          
        case 'template://error-handling':
          content = extractErrorHandlingPatterns();
          break;
          
        case 'template://agent-memory':
          filePath = join(TEMPLATE_ROOT, 'AGENT-MEMORY.md');
          break;
          
        case 'template://agent-context':
          filePath = join(TEMPLATE_ROOT, 'AGENT-CONTEXT.md');
          break;
          
        case 'template://pattern-library':
          content = extractPatternLibrary();
          break;
          
        case 'template://workflow-templates':
          content = extractWorkflowTemplates();
          break;
          
        case 'template://test-patterns':
          content = extractTestPatterns();
          break;
          
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
      
      // Read file if path is specified
      if (filePath && existsSync(filePath)) {
        content = readFileSync(filePath, 'utf-8');
      } else if (!content) {
        throw new Error(`Resource file not found: ${filePath}`);
      }
      
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read resource ${uri}: ${error}`);
    }
  });
}

// Extract AI constraints and rules
function extractAIConstraints(): string {
  const templatePath = join(TEMPLATE_ROOT, 'PROJECT-TEMPLATE-v10.md');
  const contextPath = join(TEMPLATE_ROOT, 'CODEBASE-CONTEXT.md');
  
  let constraints = `# AI CONSTRAINTS AND RULES
## CRITICAL: You MUST follow these rules when generating code

### ❌ NEVER DO THESE (Automatic Rejection)
`;

  // Extract DON'Ts from template
  if (existsSync(templatePath)) {
    const content = readFileSync(templatePath, 'utf-8');
    const dontSection = content.match(/#### ❌ DON'TS \(Never Do\)(.*?)#### Common AI Pitfalls/s);
    if (dontSection) {
      constraints += dontSection[1].trim() + '\n\n';
    }
  }

  constraints += `
### ✅ ALWAYS DO THESE (Required Patterns)
`;

  // Extract DOs from template
  if (existsSync(templatePath)) {
    const content = readFileSync(templatePath, 'utf-8');
    const doSection = content.match(/#### ✅ DOS \(Always Follow\)(.*?)#### ❌ DON'TS/s);
    if (doSection) {
      constraints += doSection[1].trim() + '\n\n';
    }
  }

  // Add context-specific constraints
  if (existsSync(contextPath)) {
    const contextContent = readFileSync(contextPath, 'utf-8');
    const constraintsSection = contextContent.match(/## Implementation Constraints for AI(.*?)##/s);
    if (constraintsSection) {
      constraints += `### PROJECT-SPECIFIC CONSTRAINTS\n${constraintsSection[1].trim()}\n`;
    }
  }

  return constraints;
}

// Extract current patterns from the actual codebase
function extractCurrentPatterns(projectPath: string): string {
  const contextPath = join(projectPath, 'CODEBASE-CONTEXT.md');
  
  let patterns = `# CURRENT CODE PATTERNS
## You MUST match these existing patterns when generating new code

`;

  if (existsSync(contextPath)) {
    const content = readFileSync(contextPath, 'utf-8');
    
    // Extract code patterns section
    const patternsSection = content.match(/## Code Patterns(.*?)##/s);
    if (patternsSection) {
      patterns += `### Established Patterns\n${patternsSection[1].trim()}\n\n`;
    }
    
    // Extract component structure
    const componentSection = content.match(/## Component Structure Pattern(.*?)##/s);
    if (componentSection) {
      patterns += `### Component Template\n${componentSection[1].trim()}\n\n`;
    }
  }

  // Add pattern examples from template
  const templatePath = join(TEMPLATE_ROOT, 'PROJECT-TEMPLATE-v10.md');
  if (existsSync(templatePath)) {
    const content = readFileSync(templatePath, 'utf-8');
    const keyPatterns = content.match(/### Key Patterns(.*?)---/s);
    if (keyPatterns) {
      patterns += `### Key Architectural Patterns\n${keyPatterns[1].trim()}\n`;
    }
  }

  return patterns;
}

// Extract hallucination prevention guide
function extractHallucinationPrevention(): string {
  const templatePath = join(TEMPLATE_ROOT, 'PROJECT-TEMPLATE-v10.md');
  
  let guide = `# HALLUCINATION PREVENTION GUIDE
## CRITICAL: Verify before suggesting

### Common AI Hallucinations to Avoid
`;

  if (existsSync(templatePath)) {
    const content = readFileSync(templatePath, 'utf-8');
    
    // Extract hallucination section
    const hallSection = content.match(/### 🧠 Understanding AI Hallucinations(.*?)### 🛡️ Defensive Coding with AI/s);
    if (hallSection) {
      guide += hallSection[1].trim() + '\n\n';
    }
    
    // Extract common pitfalls
    const pitfalls = content.match(/#### Common AI Pitfalls to Avoid(.*?)### 🧠 Understanding AI Hallucinations/s);
    if (pitfalls) {
      guide += `### Known Pitfalls\n${pitfalls[1].trim()}\n\n`;
    }
  }

  guide += `
### Validation Checklist
Before suggesting any code, verify:
1. ✓ All imports exist in package.json
2. ✓ All methods exist in the current version
3. ✓ API signatures match documentation
4. ✓ No deprecated patterns used
5. ✓ Security best practices followed
6. ✓ Error handling included
`;

  return guide;
}

// Extract naming conventions
function extractNamingConventions(): string {
  const contextPath = join(TEMPLATE_ROOT, 'CODEBASE-CONTEXT.md');
  const templatePath = join(TEMPLATE_ROOT, 'PROJECT-TEMPLATE-v10.md');
  
  let conventions = `# NAMING CONVENTIONS
## MANDATORY: Follow these exact naming patterns

`;

  // Get from context file first
  if (existsSync(contextPath)) {
    const content = readFileSync(contextPath, 'utf-8');
    const namingSection = content.match(/## Naming Conventions(.*?)##/s);
    if (namingSection) {
      conventions += namingSection[1].trim() + '\n\n';
    }
  }

  // Add from template
  if (existsSync(templatePath)) {
    const content = readFileSync(templatePath, 'utf-8');
    const namingPatterns = content.match(/\*\*Naming Conventions\*\*:(.*?)---/s);
    if (namingPatterns) {
      conventions += `### Additional Patterns\n${namingPatterns[1].trim()}\n`;
    }
  }

  conventions += `
### Enforcement Rules
- Component files: MUST be PascalCase
- Hook files: MUST start with 'use' followed by PascalCase
- API endpoints: MUST use plural nouns
- Variables: MUST be camelCase
- Constants: MUST be UPPER_SNAKE_CASE
- Types/Interfaces: MUST be PascalCase
`;

  return conventions;
}

// Extract security requirements
function extractSecurityRequirements(): string {
  const templatePath = join(TEMPLATE_ROOT, 'PROJECT-TEMPLATE-v10.md');
  
  let security = `# SECURITY REQUIREMENTS
## CRITICAL: These are non-negotiable security rules

### 🚨 IMMEDIATE REJECTION CRITERIA
Any code containing these patterns will be rejected:
`;

  if (existsSync(templatePath)) {
    const content = readFileSync(templatePath, 'utf-8');
    
    // Find security-related DON'Ts
    const securityDonts = content.match(/DON'T: Hardcode sensitive data(.*?)DON'T: Use async directly/s);
    if (securityDonts) {
      security += `\n${securityDonts[0]}\n\n`;
    }
  }

  security += `
### Required Security Patterns
1. **Authentication**: Always use secure token storage (httpOnly cookies)
2. **Input Validation**: Always validate with Zod or similar
3. **SQL Queries**: Always use parameterized queries
4. **Secrets**: Always use environment variables
5. **CORS**: Always configure properly for production
6. **Error Messages**: Never expose system details
7. **Logging**: Never log sensitive data

### Security Checklist for Every Feature
- [ ] No hardcoded secrets or keys
- [ ] All inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Proper authentication checks
- [ ] Rate limiting implemented
- [ ] Error messages sanitized
`;

  return security;
}

// Extract valid API signatures
function extractValidAPIs(): string {
  const packageJsonPath = join(TEMPLATE_ROOT, 'presentation-app/package.json');
  
  let apis = `# VALID API SIGNATURES
## Reference: Only use APIs that actually exist

### Available APIs by Package
`;

  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // React APIs
      if (deps.react) {
        apis += `
### React ${deps.react}
- useState, useEffect, useContext, useReducer, useCallback, useMemo
- useRef, useLayoutEffect, useImperativeHandle
- React.FC, React.ReactNode, React.ReactElement
- NO: useSyncExternalStore (React 18+), useTransition (React 18+)
`;
      }
      
      // TypeScript
      if (deps.typescript) {
        apis += `
### TypeScript ${deps.typescript}
- Utility Types: Partial, Required, Readonly, Pick, Omit
- satisfies operator (TS 4.9+)
- const type parameters (TS 5.0+)
`;
      }
    } catch (error) {
      apis += '\n// Unable to read package.json\n';
    }
  }

  apis += `
### Common Mistakes to Avoid
- ❌ Array.prototype.findLast() - Not in all environments
- ❌ Object.hasOwn() - Use Object.prototype.hasOwnProperty.call()
- ❌ String.prototype.replaceAll() - Use .replace(/pattern/g)
- ❌ Promise.allSettled() - Check environment support
- ❌ Optional chaining in older environments

### Always Verify
Before using any method:
1. Check if it exists in the target environment
2. Verify the exact signature
3. Consider polyfills if needed
`;

  return apis;
}

// Extract error handling patterns
function extractErrorHandlingPatterns(): string {
  const contextPath = join(TEMPLATE_ROOT, 'CODEBASE-CONTEXT.md');
  
  let patterns = `# ERROR HANDLING PATTERNS
## REQUIRED: All code must handle errors properly

### The Three States Rule
Every async operation MUST handle:
1. **Loading State** - Show user something is happening
2. **Error State** - Show user what went wrong
3. **Empty State** - Show user when there's no data

### Standard Error Pattern
\`\`\`typescript
// ALWAYS use this pattern for async operations
try {
  setLoading(true);
  const data = await fetchData();
  
  if (!data || data.length === 0) {
    setEmpty(true);
    return;
  }
  
  setData(data);
} catch (error) {
  console.error('Context for debugging:', error);
  setError(formatUserFriendlyError(error));
} finally {
  setLoading(false);
}
\`\`\`

### Component Error Boundaries
\`\`\`typescript
// For React components
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} retry={refetch} />;
if (!data) return <EmptyState message="No items found" />;
\`\`\`

### API Error Responses
\`\`\`typescript
// Standard API error format
return {
  data: null,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input provided',
    details: validationErrors
  }
};
\`\`\`

### NEVER Do These
- ❌ Ignore errors silently
- ❌ Show raw error messages to users
- ❌ Forget loading states
- ❌ Miss edge cases (network errors, timeouts)
- ❌ Log sensitive data in errors
`;

  return patterns;
}