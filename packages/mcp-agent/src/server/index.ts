/**
 * MCP Context Manager Server
 * Provides PROJECT-TEMPLATE.md to AI agents and ensures they use it
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
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
  CODEBASE_ANALYSIS_CHECKLIST,
  DEEP_ANALYSIS_INSTRUCTIONS
} from '../templates/codebase-analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MCPContextServer {
  private server: Server;
  private projectRoot: string;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-context-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.projectRoot = process.cwd();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'template://project-template',
            name: 'PROJECT-TEMPLATE.md',
            description: 'Master template for AI to analyze and fill with your project data',
            mimeType: 'text/markdown',
          },
          {
            uri: 'template://context7-config',
            name: '.context7.yaml',
            description: 'Context7 configuration template for preventing AI hallucinations',
            mimeType: 'text/yaml',
          },
          {
            uri: 'template://adr-template',
            name: 'ADR Template',
            description: 'Architecture Decision Record template with AI constraints',
            mimeType: 'text/markdown',
          },
          {
            uri: 'template://tech-stack',
            name: 'Tech Stack Configuration',
            description: 'Single source of truth for version constraints',
            mimeType: 'text/yaml',
          },
          {
            uri: 'template://cursor-context-loader',
            name: 'Cursor Context Loader',
            description: 'Auto-attach configuration for Cursor',
            mimeType: 'text/yaml',
          },
          {
            uri: 'template://cursor-tech-rules',
            name: 'Cursor Tech Rules',
            description: 'Version and library enforcement rules',
            mimeType: 'text/yaml',
          },
          {
            uri: 'template://cursor-quality-gates',
            name: 'Cursor Quality Gates',
            description: 'Code quality enforcement configuration',
            mimeType: 'text/yaml',
          },
          {
            uri: 'template://version-sync-script',
            name: 'Version Sync Script',
            description: 'Automated version update script',
            mimeType: 'text/javascript',
          },
          {
            uri: 'template://github-action-sync',
            name: 'GitHub Action Sync',
            description: 'Weekly context sync workflow',
            mimeType: 'text/yaml',
          },
          {
            uri: 'template://analysis-checklist',
            name: 'Codebase Analysis Checklist',
            description: 'Comprehensive analysis instructions for deep code understanding',
            mimeType: 'text/markdown',
          },
          {
            uri: 'file://agent-context/PROJECT-TEMPLATE.md',
            name: 'Your PROJECT-TEMPLATE.md',
            description: 'Your filled PROJECT-TEMPLATE.md (if exists)',
            mimeType: 'text/markdown',
          },
          {
            uri: 'file://agent-context/CODEBASE-CONTEXT.md', 
            name: 'Your CODEBASE-CONTEXT.md',
            description: 'Your codebase context file (if exists)',
            mimeType: 'text/markdown',
          },
          {
            uri: 'file://agent-context/.context7.yaml',
            name: 'Your Context7 Config',
            description: 'Your Context7 configuration (if exists)',
            mimeType: 'text/yaml',
          },
        ],
      };
    });

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'template://project-template') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: PROJECT_TEMPLATE_CONTENT,
            },
          ],
        };
      }
      
      if (uri === 'template://context7-config') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/yaml',
              text: CONTEXT7_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://adr-template') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: ADR_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://tech-stack') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/yaml',
              text: TECH_STACK_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://cursor-context-loader') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/yaml',
              text: CURSOR_CONTEXT_LOADER_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://cursor-tech-rules') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/yaml',
              text: CURSOR_TECH_RULES_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://cursor-quality-gates') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/yaml',
              text: CURSOR_QUALITY_GATES_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://version-sync-script') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/javascript',
              text: VERSION_SYNC_SCRIPT_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://github-action-sync') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/yaml',
              text: GITHUB_ACTION_SYNC_TEMPLATE,
            },
          ],
        };
      }
      
      if (uri === 'template://analysis-checklist') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: CODEBASE_ANALYSIS_CHECKLIST,
            },
          ],
        };
      }

      // Read local files
      if (uri.startsWith('file://')) {
        const filePath = uri.replace('file://', '');
        const fullPath = path.join(this.projectRoot, filePath);
        
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
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
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: `File not found. Please ask the AI to create this file by analyzing your codebase.`,
              },
            ],
          };
        }
      }

      throw new Error(`Unknown resource: ${uri}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_codebase_deeply',
            description: 'Perform comprehensive analysis of EVERY file before creating templates',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_project_template',
            description: 'Create PROJECT-TEMPLATE.md AFTER deep analysis',
            inputSchema: {
              type: 'object',
              properties: {
                analysis_complete: {
                  type: 'boolean',
                  description: 'Confirm deep analysis was completed',
                },
              },
              required: ['analysis_complete'],
            },
          },
          {
            name: 'create_codebase_context',
            description: 'Tell AI to create CODEBASE-CONTEXT.md with patterns and AI constraints',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_context7_config',
            description: 'Tell AI to create .context7.yaml for hallucination prevention',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_directory_readme',
            description: 'Tell AI to create README.md for a directory with AI notes',
            inputSchema: {
              type: 'object',
              properties: {
                directory: {
                  type: 'string',
                  description: 'Directory path (e.g., src/components)',
                },
              },
              required: ['directory'],
            },
          },
          {
            name: 'create_adr',
            description: 'Tell AI to create an Architecture Decision Record',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'ADR title (e.g., "Authentication Strategy")',
                },
                number: {
                  type: 'string',
                  description: 'ADR number (e.g., "001")',
                },
              },
              required: ['title'],
            },
          },
          {
            name: 'create_initial_adrs',
            description: 'Create initial set of ADR files for the project',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'check_context_usage',
            description: 'Verify AI is using the context files before generating code',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_cursor_config',
            description: 'Tell AI to create Cursor-specific configuration files',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_shared_tech_stack',
            description: 'Tell AI to create shared tech stack configuration',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_maintenance_scripts',
            description: 'Tell AI to create version sync and automation scripts',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'analyze_codebase_deeply':
          return {
            content: [
              {
                type: 'text',
                text: CODEBASE_ANALYSIS_CHECKLIST + '\n\n' + DEEP_ANALYSIS_INSTRUCTIONS + `\n\n## CRITICAL REQUIREMENT\n\nYou MUST:\n1. Read EVERY source code file (not just config files)\n2. Analyze actual code patterns (not just file names)\n3. Collect evidence for every pattern claimed\n4. Understand the architecture from code\n5. Only then proceed to create templates\n\nThis is not optional - template quality depends on deep analysis!\n\nStart by listing all source files, then read each one carefully.`,
              },
            ],
          };
          
        case 'create_project_template':
          const analysisComplete = args?.analysis_complete as boolean;
          
          if (!analysisComplete) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ ERROR: Deep analysis not completed!\n\nYou must first run 'analyze_codebase_deeply' and:\n1. Read EVERY source file\n2. Understand actual patterns from code\n3. Collect evidence for patterns\n\nOnly after thorough analysis can you create accurate templates.\n\nPlease run 'analyze_codebase_deeply' first!`,
                },
              ],
            };
          }
          return {
            content: [
              {
                type: 'text',
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

REMEMBER: Use specific evidence from your code analysis:
- "Components use PascalCase (found in Button.tsx, UserCard.tsx, etc.)"
- "API calls use try-catch pattern (seen in userService.ts, authService.ts)"
- "State uses Zustand (stores found in src/stores/)"`,
              },
            ],
          };

        case 'create_codebase_context':
          return {
            content: [
              {
                type: 'text',
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

NO GUESSING - only document what you found in actual code!`,
              },
            ],
          };

        case 'create_context7_config':
          return {
            content: [
              {
                type: 'text',
                text: `Please create agent-context/.context7.yaml configuration by:

1. First ensure agent-context directory exists
2. Reading the Context7 template from 'template://context7-config'
3. Analyzing your project dependencies in package.json
4. Filling in all library versions and framework names
5. Adding project-specific rules based on your patterns
6. Setting up hallucination prevention strategies
7. Creating the file at agent-context/.context7.yaml

This configuration will:
- Sync with real-time documentation
- Prevent AI from using outdated APIs
- Verify method existence before generation
- Alert on breaking changes

IMPORTANT: This prevents the 27% error rate in AI-generated code!`,
              },
            ],
          };

        case 'create_directory_readme':
          const directory = args?.directory as string;
          return {
            content: [
              {
                type: 'text',
                text: `Please create a README.md for the ${directory} directory:

1. Analyze all files in ${directory}
2. Document the purpose of this directory
3. List the public API (exported functions/components)
4. Add AI generation notes specific to this directory
5. Include examples of the patterns used
6. Create the README.md in the ${directory} folder itself

NOTE: Also create a copy in agent-context/directories/${directory.replace(/\//g, '-')}-README.md

Use this format:
# ${directory}

## Purpose
[What this directory contains]

## Public API
[List of exported items with descriptions]

## AI Generation Notes
### MUST Follow These Patterns
[Specific patterns AI must follow]

### NEVER Do These
[Things AI should never do in this directory]

## Component/Function Examples
[Code examples showing correct patterns]

## Testing Requirements
[How to test code in this directory]`,
              },
            ],
          };
          
        case 'create_adr':
          const title = args?.title as string;
          const number = args?.number as string || 'XXX';
          return {
            content: [
              {
                type: 'text',
                text: `Please create an Architecture Decision Record:

1. Read the ADR template from 'template://adr-template'
2. Create agent-context/adr/${number}-${title.toLowerCase().replace(/\s+/g, '-')}.md
3. Also create a copy in docs/adr/ if that directory exists
4. Fill in:
   - Context: Why this decision is needed
   - Decision: What was decided and why
   - Implementation Constraints: Rules for AI code generation
   - DO/DON'T sections with code examples
   - Consequences: Impact of this decision

IMPORTANT: ADRs guide AI to generate consistent, correct code. Include:
- Specific code patterns to follow
- Common mistakes to avoid
- Security considerations
- Performance implications`,
              },
            ],
          };
          
        case 'create_initial_adrs':
          return {
            content: [
              {
                type: 'text',
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

Also create agent-context/adr/README.md listing all ADRs.`,
              },
            ],
          };

        case 'check_context_usage':
          return {
            content: [
              {
                type: 'text',
                text: `Before generating any code, please confirm you have:

1. ✓ Read agent-context/PROJECT-TEMPLATE.md
2. ✓ Read agent-context/CODEBASE-CONTEXT.md
3. ✓ Checked agent-context/shared/tech-stack.yaml for versions
4. ✓ Checked agent-context/.context7.yaml for library versions
5. ✓ Understood the naming conventions
6. ✓ Understood the code patterns
7. ✓ Read relevant directory README files
8. ✓ Checked agent-context/adr/ for architectural decisions
9. ✓ Checked .cursor/rules/ for Cursor-specific rules

Always follow the patterns and constraints defined in these files.

NOTE: All context files are in the agent-context/ folder.`,
              },
            ],
          };
          
        case 'create_cursor_config':
          return {
            content: [
              {
                type: 'text',
                text: `Please create Cursor-specific configuration files:

1. Create .cursor/rules/ directory structure
2. Read templates:
   - 'template://cursor-context-loader' for auto-attach config
   - 'template://cursor-tech-rules' for version enforcement
   - 'template://cursor-quality-gates' for quality standards
3. Create files:
   - .cursor/rules/context-loader.yaml
   - .cursor/rules/tech-rules.yaml
   - .cursor/rules/quality-gates.yaml
4. Fill in project-specific values
5. Reference agent-context/shared/tech-stack.yaml for versions

These files will:
- Auto-load context when you open files
- Enforce version constraints
- Apply quality gates
- Reduce token usage by 30%

IMPORTANT: This enables automatic context loading in Cursor!`,
              },
            ],
          };
          
        case 'create_shared_tech_stack':
          return {
            content: [
              {
                type: 'text',
                text: `Please create the shared tech stack configuration FROM YOUR ANALYSIS:

⚠️ PREREQUISITE: You must have completed 'analyze_codebase_deeply' first!

1. Create agent-context/shared/ directory
2. Read 'template://tech-stack' template
3. Create agent-context/shared/tech-stack.yaml with:
   - Versions from package.json
   - BUT ALSO verify actual usage in code:
     • "react: >=18.3.0 (using hooks in 47 files, Suspense in 3 files)"
     • "tailwindcss: >=3.4.0 (utility classes found in all components)"
   - Preferred libraries BASED ON ACTUAL USAGE:
     • "icons: lucide-react (imported in Button.tsx, Header.tsx, etc.)"
     • "dates: date-fns (used in formatDate.ts, UserCard.tsx)"
   - Beta package tracking (if found in code)
   - Bundle constraints (based on current build)

4. Every library listed must be ACTUALLY USED in code
5. Note which libraries are imported but unused

DON'T list libraries just because they're in package.json - verify usage!`,
              },
            ],
          };
          
        case 'create_maintenance_scripts':
          return {
            content: [
              {
                type: 'text',
                text: `Please create maintenance automation scripts:

1. Create agent-context/scripts/ directory
2. Read templates:
   - 'template://version-sync-script' for dependency updates
   - 'template://github-action-sync' for weekly automation
3. Create files:
   - agent-context/scripts/sync-versions.js
   - .github/workflows/context-sync.yml
4. Replace [PACKAGE_MANAGER] with your package manager
5. Make sync-versions.js executable

These scripts will:
- Check for outdated dependencies weekly
- Update tech-stack.yaml automatically
- Update Context7 config with new versions
- Create PRs for review

This prevents version drift and keeps context current!`,
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Context Manager Server running...');
  }
}

// Start the server
const server = new MCPContextServer();
server.run().catch(console.error);