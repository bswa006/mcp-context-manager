/**
 * MCP Context Manager Server v2
 * Built with mcp-framework for better structure and capabilities
 */

import { MCPServer } from 'mcp-framework';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  PROJECT_TEMPLATE_CONTENT,
  CODEBASE_CONTEXT_TEMPLATE,
  DIRECTORY_README_TEMPLATE,
  CONTEXT7_TEMPLATE,
  ADR_TEMPLATE,
  TECH_STACK_TEMPLATE,
  CURSOR_CONTEXT_LOADER_TEMPLATE,
  CURSOR_TECH_RULES_TEMPLATE,
  CURSOR_QUALITY_GATES_TEMPLATE,
  VERSION_SYNC_SCRIPT_TEMPLATE,
  GITHUB_ACTION_SYNC_TEMPLATE
} from '../templates/project-template.js';
import {
  CURSOR_PROJECT_RULE_TEMPLATE,
  CURSOR_AUTO_CONTEXT_RULE,
  CURSOR_QUALITY_GATE_RULE,
  MCP_PROJECT_CONFIG_TEMPLATE,
  CLAUDE_GLOBAL_CONTEXT_TEMPLATE,
  AUTOMATED_CONTEXT_LOADER_SCRIPT,
  DESKTOP_EXTENSION_MANIFEST,
  CURSOR_MCP_CONFIG_TEMPLATE
} from '../templates/cursor-rules.js';
import {
  CODEBASE_ANALYSIS_CHECKLIST,
  DEEP_ANALYSIS_INSTRUCTIONS
} from '../templates/codebase-analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the MCP server instance
const server = new MCPServer({
  name: 'mcp-context-manager',
  version: '2.0.0',
  description: 'MCP Context Management Server - Provides codebase context to AI agents with evidence-based validation'
});

// Define resources
server.resource({
  uri: 'template://project-template',
  name: 'PROJECT-TEMPLATE.md',
  description: 'Master template for AI to analyze and fill with your project data',
  mimeType: 'text/markdown',
  handler: async () => PROJECT_TEMPLATE_CONTENT
});

server.resource({
  uri: 'template://context7-config',
  name: '.context7.yaml',
  description: 'Context7 configuration template for preventing AI hallucinations',
  mimeType: 'text/yaml',
  handler: async () => CONTEXT7_TEMPLATE
});

server.resource({
  uri: 'template://adr-template',
  name: 'ADR Template',
  description: 'Architecture Decision Record template with AI constraints',
  mimeType: 'text/markdown',
  handler: async () => ADR_TEMPLATE
});

server.resource({
  uri: 'template://tech-stack',
  name: 'Tech Stack Configuration',
  description: 'Single source of truth for version constraints',
  mimeType: 'text/yaml',
  handler: async () => TECH_STACK_TEMPLATE
});

server.resource({
  uri: 'template://analysis-checklist',
  name: 'Codebase Analysis Checklist',
  description: 'Comprehensive analysis instructions for deep code understanding',
  mimeType: 'text/markdown',
  handler: async () => CODEBASE_ANALYSIS_CHECKLIST
});

// Dynamic file resources
server.resource({
  uri: 'file://**',
  handler: async (uri: string) => {
    const filePath = uri.replace('file://', '');
    const fullPath = path.join(process.cwd(), filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      return `File not found. Please ask the AI to create this file by analyzing your codebase.`;
    }
  }
});

// Define tools with Zod schemas
const analyzeCodebaseDeeplySchema = z.object({});

server.tool({
  name: 'analyze_codebase_deeply',
  description: 'Perform comprehensive analysis of EVERY file before creating templates',
  schema: analyzeCodebaseDeeplySchema,
  handler: async () => {
    return {
      content: [{
        type: 'text' as const,
        text: CODEBASE_ANALYSIS_CHECKLIST + '\n\n' + DEEP_ANALYSIS_INSTRUCTIONS + `\n\n## CRITICAL REQUIREMENT\n\nYou MUST:\n1. Read EVERY source code file (not just config files)\n2. Analyze actual code patterns (not just file names)\n3. Collect evidence for every pattern claimed\n4. Understand the architecture from code\n5. Only then proceed to create templates\n\nThis is not optional - template quality depends on deep analysis!\n\nStart by listing all source files, then read each one carefully.`
      }]
    };
  }
});

const createProjectTemplateSchema = z.object({
  analysis_complete: z.boolean().describe('Confirm deep analysis was completed')
});

server.tool({
  name: 'create_project_template',
  description: 'Create PROJECT-TEMPLATE.md AFTER deep analysis',
  schema: createProjectTemplateSchema,
  handler: async ({ analysis_complete }) => {
    if (!analysis_complete) {
      return {
        content: [{
          type: 'text' as const,
          text: `❌ ERROR: Deep analysis not completed!\n\nYou must first run 'analyze_codebase_deeply' and:\n1. Read EVERY source file\n2. Understand actual patterns from code\n3. Collect evidence for patterns\n\nOnly after thorough analysis can you create accurate templates.\n\nPlease run 'analyze_codebase_deeply' first!`
        }]
      };
    }
    
    return {
      content: [{
        type: 'text' as const,
        text: `Now create agent-context/PROJECT-TEMPLATE.md based on your DEEP ANALYSIS:

1. First create the agent-context directory structure:
   - agent-context/
   - agent-context/shared/
   - agent-context/adr/
   - agent-context/directories/
   - agent-context/scripts/
2. Create agent-context/shared/tech-stack.yaml first (use 'create_shared_tech_stack' tool)
3. Read the master template from 'template://project-template'
4. Fill in all [PLACEHOLDER] values with EVIDENCE from your analysis:
   - Every pattern must reference actual files
   - Every convention must have 5+ examples
   - Every tech choice must show actual usage
5. Reference tech-stack.yaml for versions (don't duplicate)
6. Create the file at agent-context/PROJECT-TEMPLATE.md
7. IMPORTANT: After creating PROJECT-TEMPLATE.md, use 'create_initial_adrs' tool to create ADR files
8. FINAL STEP: After ALL context files are created, use 'setup_auto_context_loading' tool to enable automatic context loading

REMEMBER: Use specific evidence from your code analysis:
- "Components use PascalCase (found in Button.tsx, UserCard.tsx, etc.)"
- "API calls use try-catch pattern (seen in userService.ts, authService.ts)"
- "State uses Zustand (stores found in src/stores/)"`
      }]
    };
  }
});

const createCodebaseContextSchema = z.object({});

server.tool({
  name: 'create_codebase_context',
  description: 'Tell AI to create CODEBASE-CONTEXT.md with patterns and AI constraints',
  schema: createCodebaseContextSchema,
  handler: async () => {
    return {
      content: [{
        type: 'text' as const,
        text: `Please create agent-context/CODEBASE-CONTEXT.md based on your DEEP ANALYSIS:

⚠️ PREREQUISITE: You must have completed 'analyze_codebase_deeply' first!

1. Ensure agent-context/shared/tech-stack.yaml exists first
2. Document FROM YOUR ACTUAL CODE ANALYSIS:
   - Project Vision - What this project does (based on actual functionality)
   - Tech Stack - Reference ../shared/tech-stack.yaml
   - Naming Conventions - WITH SPECIFIC EXAMPLES from files you read:
     • "Components: PascalCase (Button.tsx, UserCard.tsx, NavBar.tsx...)"
     • "Hooks: useXxx (useAuth.ts, useUsers.ts, useData.ts...)"
   - Code Patterns - WITH CODE SNIPPETS from actual files:
     • "Error handling: try-catch with toast notifications (userService.ts:45)"
     • "API calls: axios with interceptors (api/client.ts:12)"
   - Implementation Constraints - Based on patterns you observed
   - Directory Purposes - Based on files you actually read

3. EVERY statement must reference specific files/code
4. Create at agent-context/CODEBASE-CONTEXT.md

NO GUESSING - only document what you found in actual code!`
      }]
    };
  }
});

const createInitialAdrsSchema = z.object({});

server.tool({
  name: 'create_initial_adrs',
  description: 'Create initial set of ADR files for the project',
  schema: createInitialAdrsSchema,
  handler: async () => {
    return {
      content: [{
        type: 'text' as const,
        text: `Please create the initial set of Architecture Decision Records based on your codebase analysis:

⚠️ PREREQUISITE: You must have completed 'analyze_codebase_deeply' first!

Create the following ADR files in agent-context/adr/ directory:

1. **001-frontend-framework.md** - Document the UI framework choice
   - Why React/Vue/Angular/etc was chosen
   - Component patterns to follow
   - State management approach
   - DO: Use functional components, hooks
   - DON'T: Use class components (if React)

2. **002-state-management.md** - Document state management
   - Why Redux/Zustand/Context/MobX/etc
   - Store structure patterns
   - Action/reducer patterns
   - DO: Keep stores focused
   - DON'T: Put everything in global state

3. **003-api-patterns.md** - Document API communication
   - REST vs GraphQL decision
   - Error handling patterns
   - Authentication approach
   - DO: Use consistent error format
   - DON'T: Expose sensitive data

4. **004-testing-strategy.md** - Document testing approach
   - Unit vs Integration vs E2E split
   - Testing libraries chosen
   - Coverage requirements
   - DO: Test business logic thoroughly
   - DON'T: Test implementation details

5. **005-code-style.md** - Document code conventions
   - Naming conventions with examples
   - File organization patterns
   - Import ordering rules
   - DO: Follow established patterns
   - DON'T: Mix naming conventions

6. **006-security-patterns.md** - Document security approach
   - Authentication method
   - Authorization patterns
   - Data validation rules
   - DO: Validate all inputs
   - DON'T: Trust client data

Each ADR must:
- Reference actual code examples from your analysis
- Include specific DO/DON'T sections for AI
- Provide implementation constraints
- Show actual patterns found in the codebase

Also create agent-context/adr/README.md listing all ADRs.`
      }]
    };
  }
});

const completeSetupWorkflowSchema = z.object({});

server.tool({
  name: 'complete_setup_workflow',
  description: 'Complete workflow: analyze, create all files, and setup auto-loading',
  schema: completeSetupWorkflowSchema,
  handler: async () => {
    return {
      content: [{
        type: 'text' as const,
        text: `🚀 Complete MCP Context Manager Setup Workflow

Please follow these steps IN ORDER to fully setup your project:

1. **First**: Use 'analyze_codebase_deeply' tool
   - Read EVERY source file
   - Understand patterns and architecture
   - Collect evidence for documentation

2. **Second**: Create core context files
   - Use 'create_shared_tech_stack' tool
   - Use 'create_project_template' tool
   - Use 'create_codebase_context' tool
   - Use 'create_context7_config' tool

3. **Third**: Create architecture records
   - Use 'create_initial_adrs' tool
   - This creates 6 essential ADR files

4. **Fourth**: Create directory documentation
   - Use 'create_directory_readme' for each major directory
   - Focus on src/components, src/services, src/hooks, etc.

5. **Fifth**: Create maintenance scripts
   - Use 'create_maintenance_scripts' tool
   - Sets up version sync and automation

6. **Sixth**: Create Cursor configuration
   - Use 'create_cursor_config' tool
   - Enables Cursor-specific optimizations

7. **FINAL**: Setup automatic context loading
   - Use 'setup_auto_context_loading' tool
   - This enables automatic context reading!

After completion:
- Cursor will auto-load context for every file
- Claude can access context via @context mentions
- No need to manually remind AI to read context

START NOW with step 1: analyze_codebase_deeply`
      }]
    };
  }
});

// Start the server
export async function startServer() {
  await server.start();
  console.error('MCP Context Manager Server v2 running...');
}

// For CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}