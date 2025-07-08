import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { checkBeforeSuggesting } from './validators/hallucination-preventer.js';
import { validateGeneratedCode } from './validators/code-validator.js';
import { getPatternForTask } from './patterns/pattern-provider.js';
import { checkSecurityCompliance } from './validators/security-validator.js';
import { detectExistingPatterns } from './analyzers/pattern-detector.js';
import { initializeAgentWorkspace } from './workspace/initialize-workspace.js';
import { generateTestsForCoverage } from './testing/test-generator.js';
import { trackAgentPerformance } from './performance/track-performance.js';
import { analyzeCodebaseDeeply } from './workspace/analyze-codebase-deeply.js';
import { createProjectTemplate } from './workspace/create-project-template.js';
import { createCodebaseContext } from './workspace/create-codebase-context.js';
import { completeSetupWorkflow } from './workspace/complete-setup-workflow.js';
import { routeContext } from './context-router.js';
import { toolDefinitions } from './tool-definitions.js';

export function setupTools(server: Server) {
  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolDefinitions };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'check_before_suggesting': {
          const params = z.object({
            imports: z.array(z.string()),
            methods: z.array(z.string()),
            patterns: z.array(z.string()).optional(),
          }).parse(args);
          
          const result = await checkBeforeSuggesting(
            params.imports,
            params.methods,
            params.patterns
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'validate_generated_code': {
          const params = z.object({
            code: z.string(),
            context: z.string(),
            targetFile: z.string().optional(),
          }).parse(args);
          
          const result = await validateGeneratedCode(
            params.code,
            params.context,
            params.targetFile
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_pattern_for_task': {
          const params = z.object({
            taskType: z.enum(['component', 'hook', 'service', 'api', 'test', 'error-handling']),
            requirements: z.array(z.string()).optional(),
          }).parse(args);
          
          const pattern = await getPatternForTask(
            params.taskType,
            params.requirements
          );
          return {
            content: [
              {
                type: 'text',
                text: pattern,
              },
            ],
          };
        }

        case 'check_security_compliance': {
          const params = z.object({
            code: z.string(),
            sensitiveOperations: z.array(z.string()).optional(),
          }).parse(args);
          
          const result = await checkSecurityCompliance(
            params.code,
            params.sensitiveOperations
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'detect_existing_patterns': {
          const params = z.object({
            directory: z.string(),
            fileType: z.string(),
          }).parse(args);
          
          const patterns = await detectExistingPatterns(
            params.directory,
            params.fileType
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(patterns, null, 2),
              },
            ],
          };
        }

        case 'initialize_agent_workspace': {
          const params = z.object({
            projectPath: z.string(),
            projectName: z.string(),
            techStack: z.object({
              language: z.string().optional(),
              framework: z.string().optional(),
              uiLibrary: z.string().optional(),
              testFramework: z.string().optional(),
            }).optional(),
          }).parse(args);
          
          const result = await initializeAgentWorkspace(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'generate_tests_for_coverage': {
          const params = z.object({
            targetFile: z.string(),
            testFramework: z.enum(['jest', 'vitest', 'mocha']).optional(),
            coverageTarget: z.number().optional(),
            includeEdgeCases: z.boolean().optional(),
            includeAccessibility: z.boolean().optional(),
          }).parse(args);
          
          const result = await generateTestsForCoverage(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'analyze_codebase_deeply': {
          const params = z.object({
            projectPath: z.string(),
          }).parse(args);
          
          const result = await analyzeCodebaseDeeply(params.projectPath);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_project_template': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            projectName: z.string().optional(),
            description: z.string().optional(),
          }).parse(args);
          
          const result = await createProjectTemplate(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_codebase_context': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            includeExamples: z.boolean().optional(),
            tokenOptimized: z.boolean().optional(),
          }).parse(args);
          
          const result = await createCodebaseContext(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'complete_setup_workflow': {
          const params = z.object({
            projectPath: z.string(),
            projectName: z.string().optional(),
            description: z.string().optional(),
            tokenOptimized: z.boolean().optional(),
            createContextBundles: z.boolean().optional(),
          }).parse(args);
          
          const result = await completeSetupWorkflow(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_context_recommendation': {
          const params = z.object({
            task: z.string(),
            tokenBudget: z.number().optional(),
          }).parse(args);
          
          const result = await routeContext(params.task);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'track_agent_performance': {
          const params = z.object({
            featureName: z.string(),
            timestamp: z.string(),
            metrics: z.object({
              tokensUsed: z.number(),
              timeElapsed: z.number(),
              validationScore: z.number(),
              securityScore: z.number(),
              testCoverage: z.number(),
              hallucinations: z.object({
                detected: z.number(),
                prevented: z.number(),
                examples: z.array(z.string()),
              }).optional().default({
                detected: 0,
                prevented: 0,
                examples: [],
              }),
              errors: z.object({
                syntax: z.number(),
                runtime: z.number(),
                type: z.number(),
              }).optional().default({
                syntax: 0,
                runtime: 0,
                type: 0,
              }),
            }),
            improvements: z.object({
              tokenReduction: z.number().optional(),
              timeReduction: z.number().optional(),
              qualityIncrease: z.number().optional(),
            }).optional(),
          }).parse(args);
          
          const result = await trackAgentPerformance(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new Error(`Tool execution failed: ${error}`);
    }
  });
}