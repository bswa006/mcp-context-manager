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
import { createConversationStarters } from './workspace/create-conversation-starters.js';
import { createTokenOptimizer } from './workspace/create-token-optimizer.js';
import { createIDEConfigs } from './workspace/create-ide-configs.js';
import { setupPersistenceAutomation } from './workspace/setup-persistence-automation.js';
import { createMaintenanceWorkflows } from './workspace/create-maintenance-workflows.js';
import { analyzeCodebaseDeeply } from './workspace/analyze-codebase-deeply.js';
import { completeSetupWorkflow } from './workspace/complete-setup-workflow.js';
import { toolDefinitions } from './tool-definitions.js';

export function setupTools(server: Server) {
  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error(`Handling tools/list request, returning ${toolDefinitions.length} tools`);
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

        case 'create_conversation_starters': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            includeQuickTasks: z.boolean().optional(),
            includeCurrentWork: z.boolean().optional(),
            tokenLimit: z.number().optional(),
            customTasks: z.array(z.string()).optional(),
          }).parse(args);
          
          const result = await createConversationStarters(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_token_optimizer': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            tiers: z.array(z.enum(['minimal', 'standard', 'comprehensive'])).optional(),
            trackUsage: z.boolean().optional(),
            generateMetrics: z.boolean().optional(),
          }).parse(args);
          
          const result = await createTokenOptimizer(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_ide_configs': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            ide: z.enum(['cursor', 'vscode', 'intellij', 'all']),
            autoLoadContext: z.boolean().optional(),
            customRules: z.array(z.string()).optional(),
            includeDebugConfigs: z.boolean().optional(),
          }).parse(args);
          
          const result = await createIDEConfigs(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'setup_persistence_automation': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            updateSchedule: z.enum(['daily', 'weekly', 'on-change', 'manual']),
            gitHooks: z.boolean().optional(),
            monitoring: z.boolean().optional(),
            notifications: z.object({
              email: z.string().optional(),
              slack: z.string().optional(),
            }).optional(),
          }).parse(args);
          
          const result = await setupPersistenceAutomation(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'create_maintenance_workflows': {
          const params = z.object({
            projectPath: z.string(),
            analysisId: z.string().optional(),
            teamSize: z.number(),
            updateFrequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
            includeChecklists: z.boolean().optional(),
            includeMetrics: z.boolean().optional(),
            includeTraining: z.boolean().optional(),
          }).parse(args);
          
          const result = await createMaintenanceWorkflows(params);
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
            maxDepth: z.number().optional(),
            excludePatterns: z.array(z.string()).optional(),
          }).parse(args);
          
          const result = await analyzeCodebaseDeeply(params);
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
            projectName: z.string(),
            teamSize: z.number().optional(),
            updateSchedule: z.enum(['daily', 'weekly', 'on-change', 'manual']).optional(),
            ide: z.enum(['cursor', 'vscode', 'intellij', 'all']).optional(),
            includeAll: z.boolean().optional(),
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

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new Error(`Tool execution failed: ${error}`);
    }
  });
}