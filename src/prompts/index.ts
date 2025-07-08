import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  Prompt,
} from '@modelcontextprotocol/sdk/types.js';
import { workflowPrompts, getWorkflowPrompt, proactiveReminders } from './workflow-prompts.js';

// Define available prompts for AI self-guidance
const prompts: Prompt[] = [
  {
    name: 'before_generating_code',
    description: 'AI MUST use this prompt before generating any code',
    arguments: [
      {
        name: 'task',
        description: 'What the AI is about to generate',
        required: true,
      },
      {
        name: 'targetLocation',
        description: 'Where the code will be placed',
        required: true,
      },
    ],
  },
  {
    name: 'validate_my_suggestion',
    description: 'AI should validate its own code before presenting to user',
    arguments: [
      {
        name: 'code',
        description: 'The code AI is about to suggest',
        required: true,
      },
      {
        name: 'purpose',
        description: 'What the code is supposed to do',
        required: true,
      },
    ],
  },
  {
    name: 'check_patterns',
    description: 'AI checks if it is following project patterns correctly',
    arguments: [
      {
        name: 'codeType',
        description: 'Type of code being generated',
        required: true,
      },
      {
        name: 'projectPath',
        description: 'Path to the project',
        required: false,
      },
    ],
  },
  {
    name: 'prevent_hallucination',
    description: 'AI verifies all imports and methods exist before using them',
    arguments: [
      {
        name: 'codeSnippet',
        description: 'Code snippet to verify',
        required: true,
      },
    ],
  },
  {
    name: 'security_self_check',
    description: 'AI checks its own code for security issues',
    arguments: [
      {
        name: 'generatedCode',
        description: 'Code that AI generated',
        required: true,
      },
    ],
  },
  {
    name: 'workflow_guidance',
    description: 'Get workflow guidance for specific tasks',
    arguments: [
      {
        name: 'taskContext',
        description: 'Description of what the user is asking for',
        required: true,
      },
    ],
  },
  {
    name: 'performance_check',
    description: 'Track agent performance after completing a feature',
    arguments: [
      {
        name: 'featureName',
        description: 'Name of the completed feature',
        required: true,
      },
      {
        name: 'metrics',
        description: 'Performance metrics to track',
        required: true,
      },
    ],
  },
];

export function setupPrompts(server: Server) {
  // Handle prompt listing
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return { prompts };
  });

  // Handle prompt generation
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case 'before_generating_code':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generatePreCodePrompt(args?.task, args?.targetLocation),
              },
            },
          ],
        };

      case 'validate_my_suggestion':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generateValidationPrompt(args?.code, args?.purpose),
              },
            },
          ],
        };

      case 'check_patterns':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generatePatternCheckPrompt(args?.codeType, args?.projectPath),
              },
            },
          ],
        };

      case 'prevent_hallucination':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generateHallucinationCheckPrompt(args?.codeSnippet),
              },
            },
          ],
        };

      case 'security_self_check':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generateSecuritySelfCheckPrompt(args?.generatedCode),
              },
            },
          ],
        };

      case 'workflow_guidance':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generateWorkflowGuidancePrompt(args?.taskContext),
              },
            },
          ],
        };

      case 'performance_check':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: generatePerformanceCheckPrompt(args?.featureName, args?.metrics),
              },
            },
          ],
        };

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });
}

function generatePreCodePrompt(task?: string, targetLocation?: string): string {
  return `🛑 STOP! Before generating code for "${task || 'this task'}" in "${targetLocation || 'this location'}", I MUST:

1. **Load Context Resources**:
   - [ ] Read template://ai-constraints
   - [ ] Read template://current-patterns
   - [ ] Read template://naming-conventions
   - [ ] Read template://error-handling

2. **Check Existing Patterns**:
   - [ ] Use tool: detect_existing_patterns for "${targetLocation}"
   - [ ] Identify the predominant patterns in use
   - [ ] Note any project-specific conventions

3. **Verify Dependencies**:
   - [ ] List all imports I plan to use
   - [ ] Use tool: check_before_suggesting with these imports
   - [ ] Verify all methods/APIs exist in current version

4. **Plan the Code Structure**:
   - [ ] Use tool: get_pattern_for_task for this type of code
   - [ ] Apply project-specific modifications
   - [ ] Ensure all required states are handled

5. **Security Pre-Check**:
   - [ ] Review template://security-requirements
   - [ ] Identify any sensitive operations
   - [ ] Plan secure implementations

Only proceed with code generation after ALL checks pass!`;
}

function generateValidationPrompt(code?: string, purpose?: string): string {
  return `🔍 VALIDATION REQUIRED! Before presenting this code for "${purpose}", I MUST validate:

\`\`\`
${code || '[generated code]'}
\`\`\`

Validation Steps:
1. **Use tool: validate_generated_code**
   - Pass the code and purpose
   - Check the validation score
   - Address ALL errors (score must be > 80)

2. **Use tool: check_security_compliance**
   - Pass the code for security check
   - Fix any critical/high severity issues
   - Apply all security recommendations

3. **Pattern Compliance Check**:
   - Does it match existing patterns?
   - Are naming conventions followed?
   - Is error handling complete?

4. **Final Review**:
   - [ ] No hardcoded values
   - [ ] All states handled (loading/error/empty)
   - [ ] TypeScript types complete (no 'any')
   - [ ] Imports verified to exist
   - [ ] Security best practices followed

❌ DO NOT present code with validation score < 80!
❌ DO NOT present code with security violations!
✅ Only present code that passes ALL checks!`;
}

function generatePatternCheckPrompt(codeType?: string, projectPath?: string): string {
  return `📋 PATTERN COMPLIANCE CHECK for ${codeType || 'this code type'}:

1. **Load Current Patterns**:
   - Use resource: template://current-patterns
   - Use tool: detect_existing_patterns in ${projectPath || 'project'}

2. **Verify I'm Following**:
   - [ ] Component structure (if applicable)
   - [ ] Hook patterns (if applicable)
   - [ ] Service layer patterns (if applicable)
   - [ ] Error handling patterns
   - [ ] Import style consistency
   - [ ] Export patterns
   - [ ] Naming conventions

3. **Common Mistakes to Avoid**:
   - ❌ Class components (use functional)
   - ❌ Direct API calls (use service layer)
   - ❌ Inline styles (use design system)
   - ❌ Missing TypeScript types
   - ❌ Inconsistent imports
   - ❌ Different naming style

4. **Required Patterns**:
   - ✅ Error boundaries/try-catch
   - ✅ Loading states
   - ✅ Empty states
   - ✅ Type-safe props
   - ✅ Consistent returns

Remember: Generated code should be indistinguishable from existing code!`;
}

function generateHallucinationCheckPrompt(codeSnippet?: string): string {
  return `🧠 HALLUCINATION PREVENTION CHECK:

Code to verify:
\`\`\`
${codeSnippet || '[code snippet]'}
\`\`\`

1. **Extract and Verify ALL**:
   - Imports: ${extractImports(codeSnippet || '')}
   - Methods: ${extractMethods(codeSnippet || '')}
   - APIs: ${extractAPIs(codeSnippet || '')}

2. **Use tool: check_before_suggesting**
   - Pass all imports, methods, and patterns
   - Review the safety report
   - Fix ALL issues before proceeding

3. **Common Hallucinations to Check**:
   - [ ] Array.prototype.findLast() - Not in all environments!
   - [ ] String.prototype.replaceAll() - Use .replace(/g)
   - [ ] Optional chaining (?.) - Check environment support
   - [ ] React 18+ hooks in older projects
   - [ ] Non-existent library methods

4. **Verification Results**:
   - Safe to use: [list verified items]
   - Must change: [list problematic items]
   - Alternatives: [list replacements]

⚠️ NEVER suggest code with unverified methods!
⚠️ ALWAYS provide alternatives for unsupported features!`;
}

function generateSecuritySelfCheckPrompt(generatedCode?: string): string {
  return `🔒 SECURITY SELF-AUDIT for generated code:

\`\`\`
${generatedCode || '[generated code]'}
\`\`\`

1. **Use tool: check_security_compliance**
   - Get full security analysis
   - Address ALL critical/high issues
   - Apply security recommendations

2. **Manual Security Checklist**:
   - [ ] No hardcoded secrets/keys/passwords
   - [ ] No SQL/NoSQL injection vulnerabilities
   - [ ] No XSS vulnerabilities
   - [ ] No eval() or Function() with user input
   - [ ] No sensitive data in logs
   - [ ] Proper input validation
   - [ ] Safe error messages (no stack traces)

3. **Authentication/Authorization**:
   - [ ] Tokens stored securely (httpOnly cookies)
   - [ ] Permission checks before operations
   - [ ] No authorization bypasses

4. **Data Protection**:
   - [ ] Environment variables for config
   - [ ] Encrypted sensitive data
   - [ ] HTTPS for all external calls
   - [ ] No data exposure in responses

🚨 CRITICAL: Do not present code with security violations!
✅ Only present code that passes security review!`;
}

// Helper functions for hallucination check
function extractImports(code: string): string {
  const imports = code.match(/import .+ from ['"]([^'"]+)['"]/g) || [];
  return imports.length > 0 ? imports.join(', ') : 'None found';
}

function extractMethods(code: string): string {
  const methods = code.match(/\.\w+\(/g) || [];
  const unique = [...new Set(methods.map(m => m.slice(1, -1)))];
  return unique.length > 0 ? unique.join(', ') : 'None found';
}

function extractAPIs(code: string): string {
  const apis = code.match(/(?:fetch|axios|api\.\w+)\(/g) || [];
  return apis.length > 0 ? apis.join(', ') : 'None found';
}

function generateWorkflowGuidancePrompt(taskContext?: string): string {
  const context = taskContext || '';
  const workflow = getWorkflowPrompt(context);
  
  if (workflow) {
    return `📋 WORKFLOW GUIDANCE:

${workflow.prompt}

Recommended Tools to Use:
${workflow.actions.map(action => `- ${action}`).join('\n')}

Remember:
${Object.values(proactiveReminders).join('\n')}`;
  }
  
  return `📋 GENERAL WORKFLOW GUIDANCE:

For any development task, follow this workflow:
1. Understand requirements thoroughly
2. Check existing patterns with detect_existing_patterns
3. Verify APIs with check_before_suggesting
4. Get pattern template with get_pattern_for_task
5. Generate code following patterns
6. Validate with validate_generated_code
7. Check security with check_security_compliance
8. Generate tests with generate_tests_for_coverage
9. Track performance with track_agent_performance

${Object.values(proactiveReminders).join('\n')}`;
}

function generatePerformanceCheckPrompt(featureName?: string, metrics?: string): string {
  return `📊 PERFORMANCE TRACKING for "${featureName || 'completed feature'}":

Use tool: track_agent_performance with these metrics:
${metrics || 'No metrics provided'}

Track these key metrics:
1. **Token Usage**
   - Baseline: 2000 tokens
   - Target: < 3000 tokens
   - Measure efficiency

2. **Code Quality**
   - Validation score (target: > 80)
   - Security score (target: > 95)
   - Test coverage (target: > 80%)

3. **Development Time**
   - Time to complete
   - Compare with baseline
   - Identify bottlenecks

4. **Hallucination Prevention**
   - Detected: How many caught?
   - Prevented: How many avoided?
   - Examples for learning

5. **Error Tracking**
   - Syntax errors
   - Runtime errors
   - Type errors

After tracking, review:
- What went well?
- What could improve?
- Any patterns to remember?
- Update agent memory with learnings

🎯 Goal: Continuous improvement with each feature!`;
}