import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolDefinitions: Tool[] = [
  {
    name: 'check_before_suggesting',
    description: 'CRITICAL: AI must use this before suggesting any code to prevent hallucinations',
    inputSchema: {
      type: 'object',
      properties: {
        imports: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of imports to verify (e.g., ["react", "useState from react"])',
        },
        methods: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of methods to verify (e.g., ["Array.prototype.findLast", "String.prototype.replaceAll"])',
        },
        patterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of patterns to verify (e.g., ["async/await", "error boundaries"])',
        },
      },
      required: ['imports', 'methods', 'patterns'],
    },
  },
  {
    name: 'validate_generated_code',
    description: 'Validate generated code for patterns, security, and best practices',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The generated code to validate',
        },
        type: {
          type: 'string',
          enum: ['component', 'function', 'service', 'test', 'config'],
          description: 'Type of code being validated',
        },
        targetFile: {
          type: 'string',
          description: 'Target file path for context',
        },
      },
      required: ['code', 'type'],
    },
  },
  {
    name: 'get_pattern_for_task',
    description: 'Get the correct pattern to use for a specific task',
    inputSchema: {
      type: 'object',
      properties: {
        taskType: {
          type: 'string',
          enum: ['component', 'api', 'test', 'hook', 'service', 'utility'],
          description: 'Type of task to get pattern for',
        },
        context: {
          type: 'object',
          properties: {
            hasState: { type: 'boolean' },
            hasAsync: { type: 'boolean' },
            needsAuth: { type: 'boolean' },
            complexity: {
              type: 'string',
              enum: ['simple', 'medium', 'complex'],
            },
          },
        },
      },
      required: ['taskType'],
    },
  },
  {
    name: 'check_security_compliance',
    description: 'Check code for security vulnerabilities and compliance',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to check for security issues',
        },
        checkTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['secrets', 'injection', 'xss', 'auth', 'crypto', 'validation'],
          },
          description: 'Types of security checks to perform',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'detect_existing_patterns',
    description: 'Analyze existing codebase to detect patterns and conventions',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Directory to analyze',
        },
        patternTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['naming', 'structure', 'imports', 'testing', 'styling'],
          },
          description: 'Types of patterns to detect',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'initialize_agent_workspace',
    description: 'Initialize AI agent workspace with template files and context',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        projectName: {
          type: 'string',
          description: 'Name of the project',
        },
        techStack: {
          type: 'object',
          properties: {
            language: { type: 'string' },
            framework: { type: 'string' },
            uiLibrary: { type: 'string' },
            testFramework: { type: 'string' },
          },
          description: 'Optional tech stack configuration',
        },
      },
      required: ['projectPath', 'projectName'],
    },
  },
  {
    name: 'generate_tests_for_coverage',
    description: 'Generate intelligent tests to achieve 80%+ coverage',
    inputSchema: {
      type: 'object',
      properties: {
        targetFile: {
          type: 'string',
          description: 'File to generate tests for',
        },
        testFramework: {
          type: 'string',
          enum: ['jest', 'vitest', 'mocha'],
          description: 'Test framework to use',
        },
        coverageTarget: {
          type: 'number',
          description: 'Target coverage percentage (default: 80)',
        },
        includeEdgeCases: {
          type: 'boolean',
          description: 'Include edge case tests',
        },
        includeAccessibility: {
          type: 'boolean',
          description: 'Include accessibility tests for components',
        },
      },
      required: ['targetFile'],
    },
  },
  {
    name: 'track_agent_performance',
    description: 'Track and analyze AI agent performance metrics',
    inputSchema: {
      type: 'object',
      properties: {
        featureName: {
          type: 'string',
          description: 'Name of the feature being tracked',
        },
        timestamp: {
          type: 'string',
          description: 'ISO timestamp of the feature completion',
        },
        metrics: {
          type: 'object',
          properties: {
            tokensUsed: { type: 'number' },
            timeElapsed: { type: 'number' },
            validationScore: { type: 'number' },
            securityScore: { type: 'number' },
            testCoverage: { type: 'number' },
            hallucinations: {
              type: 'object',
              properties: {
                detected: { type: 'number' },
                prevented: { type: 'number' },
                examples: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            errors: {
              type: 'object',
              properties: {
                syntax: { type: 'number' },
                runtime: { type: 'number' },
                type: { type: 'number' },
              },
            },
          },
          required: ['tokensUsed', 'timeElapsed', 'validationScore', 'securityScore', 'testCoverage'],
        },
        improvements: {
          type: 'object',
          properties: {
            tokenReduction: { type: 'number' },
            timeReduction: { type: 'number' },
            qualityIncrease: { type: 'number' },
          },
        },
      },
      required: ['featureName', 'timestamp', 'metrics'],
    },
  },
  // UX Enhancement Tools
  {
    name: 'create_conversation_starters',
    description: 'Create conversation starters to help AI understand project context quickly',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        analysisId: {
          type: 'string',
          description: 'Analysis ID from analyze_codebase_deeply',
        },
        includeQuickTasks: {
          type: 'boolean',
          description: 'Include common quick tasks section',
        },
        includeCurrentWork: {
          type: 'boolean',
          description: 'Include recent git commits',
        },
        tokenLimit: {
          type: 'number',
          description: 'Maximum tokens for the file',
        },
        customTasks: {
          type: 'array',
          items: { type: 'string' },
          description: 'Custom quick tasks to include',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'create_token_optimizer',
    description: 'Create tiered context files for token optimization with ROI tracking',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        analysisId: {
          type: 'string',
          description: 'Analysis ID from analyze_codebase_deeply',
        },
        tiers: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['minimal', 'standard', 'comprehensive'],
          },
          description: 'Which context tiers to generate',
        },
        trackUsage: {
          type: 'boolean',
          description: 'Enable token usage tracking',
        },
        generateMetrics: {
          type: 'boolean',
          description: 'Generate ROI metrics report',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'create_ide_configs',
    description: 'Create IDE-specific configurations for Cursor, VS Code, and IntelliJ',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        analysisId: {
          type: 'string',
          description: 'Analysis ID from analyze_codebase_deeply',
        },
        ide: {
          type: 'string',
          enum: ['cursor', 'vscode', 'intellij', 'all'],
          description: 'Which IDE configurations to create',
        },
        autoLoadContext: {
          type: 'boolean',
          description: 'Enable automatic context loading',
        },
        customRules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Custom rules to add',
        },
        includeDebugConfigs: {
          type: 'boolean',
          description: 'Include debugging configurations',
        },
      },
      required: ['projectPath', 'ide'],
    },
  },
  {
    name: 'setup_persistence_automation',
    description: 'Set up automated context updates with monitoring and validation',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        analysisId: {
          type: 'string',
          description: 'Analysis ID from analyze_codebase_deeply',
        },
        updateSchedule: {
          type: 'string',
          enum: ['daily', 'weekly', 'on-change', 'manual'],
          description: 'How often to update context',
        },
        gitHooks: {
          type: 'boolean',
          description: 'Install git hooks for validation',
        },
        monitoring: {
          type: 'boolean',
          description: 'Enable context monitoring',
        },
        notifications: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            slack: { type: 'string' },
          },
          description: 'Notification settings',
        },
      },
      required: ['projectPath', 'updateSchedule'],
    },
  },
  {
    name: 'create_maintenance_workflows',
    description: 'Create team workflows for maintaining AI context quality over time',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        analysisId: {
          type: 'string',
          description: 'Analysis ID from analyze_codebase_deeply',
        },
        teamSize: {
          type: 'number',
          description: 'Number of developers on the team',
        },
        updateFrequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'biweekly', 'monthly'],
          description: 'How often the team updates context',
        },
        includeChecklists: {
          type: 'boolean',
          description: 'Include review checklists',
        },
        includeMetrics: {
          type: 'boolean',
          description: 'Include metrics dashboard',
        },
        includeTraining: {
          type: 'boolean',
          description: 'Include training materials',
        },
      },
      required: ['projectPath', 'teamSize', 'updateFrequency'],
    },
  },
  {
    name: 'analyze_codebase_deeply',
    description: 'Perform comprehensive analysis of codebase to understand patterns, tech stack, and architecture',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory to analyze',
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum directory depth to analyze (default: 5)',
        },
        excludePatterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Patterns to exclude from analysis',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'complete_setup_workflow',
    description: 'Complete MCP setup workflow: analyze codebase, create all context files, and configure automation',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory',
        },
        projectName: {
          type: 'string',
          description: 'Name of the project',
        },
        teamSize: {
          type: 'number',
          description: 'Number of developers on the team',
        },
        updateSchedule: {
          type: 'string',
          enum: ['daily', 'weekly', 'on-change', 'manual'],
          description: 'How often to update context files',
        },
        ide: {
          type: 'string',
          enum: ['cursor', 'vscode', 'intellij', 'all'],
          description: 'Which IDE configurations to create',
        },
        includeAll: {
          type: 'boolean',
          description: 'Include all optional features',
        },
      },
      required: ['projectPath', 'projectName'],
    },
  },
];