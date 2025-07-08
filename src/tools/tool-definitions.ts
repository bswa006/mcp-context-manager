import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolDefinitions: Tool[] = [
  // Core Setup Tools
  {
    name: 'analyze_codebase_deeply',
    description: '🔍 MANDATORY FIRST STEP: Deep analysis of every file in the codebase',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project directory to analyze',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'create_project_template',
    description: 'Create PROJECT-TEMPLATE.md with architecture overview (requires analysis)',
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
        projectName: {
          type: 'string',
          description: 'Name of the project',
        },
        description: {
          type: 'string',
          description: 'Project description',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'create_codebase_context',
    description: 'Create CODEBASE-CONTEXT.md with evidence-based patterns',
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
        includeExamples: {
          type: 'boolean',
          description: 'Include code examples from analysis',
        },
        tokenOptimized: {
          type: 'boolean',
          description: 'Create token-optimized version',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'complete_setup_workflow',
    description: '🚀 One command to do everything! Analyzes codebase and creates all context files',
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
        description: {
          type: 'string',
          description: 'Project description',
        },
        tokenOptimized: {
          type: 'boolean',
          description: 'Create token-optimized contexts',
        },
        createContextBundles: {
          type: 'boolean',
          description: 'Create task-specific context bundles',
        },
      },
      required: ['projectPath'],
    },
  },
  // Token Optimization Tools
  {
    name: 'get_context_recommendation',
    description: 'Get recommended context files based on task type for token optimization',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Description of the task to perform',
        },
        tokenBudget: {
          type: 'number',
          description: 'Maximum tokens to use (optional)',
        },
      },
      required: ['task'],
    },
  },
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
];

// Re-export for backward compatibility
export const setupWorkflowTools = toolDefinitions.filter(t => 
  ['analyze_codebase_deeply', 'create_project_template', 'create_codebase_context', 'complete_setup_workflow'].includes(t.name)
);

export const validationTools = toolDefinitions.filter(t => 
  ['check_before_suggesting', 'validate_generated_code', 'check_security_compliance'].includes(t.name)
);

export const analysisTools = toolDefinitions.filter(t => 
  ['detect_existing_patterns', 'get_pattern_for_task', 'track_agent_performance'].includes(t.name)
);