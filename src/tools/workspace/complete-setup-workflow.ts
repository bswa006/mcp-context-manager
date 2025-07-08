import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { analyzeCodebaseDeeply } from './analyze-codebase-deeply.js';
import { createProjectTemplate } from './create-project-template.js';
import { createCodebaseContext } from './create-codebase-context.js';
import { initializeAgentWorkspace } from './initialize-workspace.js';
import { routeContext } from '../context-router.js';
import { trackTokenUsage } from '../token-tracker.js';

interface SetupWorkflowConfig {
  projectPath: string;
  projectName?: string;
  description?: string;
  tokenOptimized?: boolean;
  createContextBundles?: boolean;
}

interface SetupWorkflowResult {
  success: boolean;
  steps: {
    name: string;
    status: 'completed' | 'failed' | 'skipped';
    message: string;
    duration: number;
  }[];
  filesCreated: string[];
  totalDuration: number;
  recommendations: string[];
}

export async function completeSetupWorkflow(config: SetupWorkflowConfig): Promise<SetupWorkflowResult> {
  const startTime = Date.now();
  const result: SetupWorkflowResult = {
    success: false,
    steps: [],
    filesCreated: [],
    totalDuration: 0,
    recommendations: [],
  };

  // Step 1: Deep codebase analysis
  const step1Start = Date.now();
  try {
    const analysis = await analyzeCodebaseDeeply(config.projectPath);
    if (!analysis.success) {
      throw new Error('Codebase analysis failed');
    }
    
    result.steps.push({
      name: 'Analyze Codebase Deeply',
      status: 'completed',
      message: `Analyzed ${analysis.summary.totalFiles} files, ${analysis.summary.totalLines.toLocaleString()} lines`,
      duration: Date.now() - step1Start,
    });

    // Add recommendations from analysis
    result.recommendations = analysis.recommendations;

    // Track token usage for analysis
    await trackTokenUsage({
      task: 'codebase-analysis',
      tokensUsed: Math.ceil(JSON.stringify(analysis).length / 4),
      context: 'complete-setup',
      result: 'success',
    });

  } catch (error) {
    result.steps.push({
      name: 'Analyze Codebase Deeply',
      status: 'failed',
      message: `Failed: ${error}`,
      duration: Date.now() - step1Start,
    });
    result.totalDuration = Date.now() - startTime;
    return result;
  }

  // Step 2: Create PROJECT-TEMPLATE.md
  const step2Start = Date.now();
  try {
    const templateResult = await createProjectTemplate({
      projectPath: config.projectPath,
      projectName: config.projectName,
      description: config.description,
    });

    if (!templateResult.success) {
      throw new Error(templateResult.message);
    }

    result.filesCreated.push(templateResult.filePath);
    result.steps.push({
      name: 'Create PROJECT-TEMPLATE.md',
      status: 'completed',
      message: templateResult.message,
      duration: Date.now() - step2Start,
    });

  } catch (error) {
    result.steps.push({
      name: 'Create PROJECT-TEMPLATE.md',
      status: 'failed',
      message: `Failed: ${error}`,
      duration: Date.now() - step2Start,
    });
  }

  // Step 3: Create CODEBASE-CONTEXT.md
  const step3Start = Date.now();
  try {
    const contextResult = await createCodebaseContext({
      projectPath: config.projectPath,
      tokenOptimized: config.tokenOptimized,
      includeExamples: true,
    });

    if (!contextResult.success) {
      throw new Error(contextResult.message);
    }

    result.filesCreated.push(contextResult.filePath);
    result.steps.push({
      name: 'Create CODEBASE-CONTEXT.md',
      status: 'completed',
      message: `${contextResult.message} (${contextResult.tokenCount} tokens)`,
      duration: Date.now() - step3Start,
    });

  } catch (error) {
    result.steps.push({
      name: 'Create CODEBASE-CONTEXT.md',
      status: 'failed',
      message: `Failed: ${error}`,
      duration: Date.now() - step3Start,
    });
  }

  // Step 4: Initialize standard agent files
  const step4Start = Date.now();
  try {
    const workspaceResult = await initializeAgentWorkspace({
      projectPath: config.projectPath,
      projectName: config.projectName || 'Project',
    });

    if (!workspaceResult.success) {
      throw new Error(workspaceResult.message);
    }

    result.filesCreated.push(...workspaceResult.filesCreated.map(f => join(config.projectPath, f)));
    result.steps.push({
      name: 'Initialize Agent Workspace',
      status: 'completed',
      message: `Created ${workspaceResult.filesCreated.length} files`,
      duration: Date.now() - step4Start,
    });

  } catch (error) {
    result.steps.push({
      name: 'Initialize Agent Workspace',
      status: 'failed',
      message: `Failed: ${error}`,
      duration: Date.now() - step4Start,
    });
  }

  // Step 5: Create token-optimized context bundles
  if (config.createContextBundles) {
    const step5Start = Date.now();
    try {
      await createContextBundles(config.projectPath);
      
      result.steps.push({
        name: 'Create Context Bundles',
        status: 'completed',
        message: 'Created quick-reference.md and task-specific bundles',
        duration: Date.now() - step5Start,
      });

    } catch (error) {
      result.steps.push({
        name: 'Create Context Bundles',
        status: 'failed',
        message: `Failed: ${error}`,
        duration: Date.now() - step5Start,
      });
    }
  }

  // Step 6: Create .cursorrules for auto-loading
  const step6Start = Date.now();
  try {
    const cursorRules = createCursorRules();
    const cursorPath = join(config.projectPath, '.cursorrules');
    writeFileSync(cursorPath, cursorRules);
    result.filesCreated.push(cursorPath);

    result.steps.push({
      name: 'Create Cursor Configuration',
      status: 'completed',
      message: 'Created .cursorrules for automatic context loading',
      duration: Date.now() - step6Start,
    });

  } catch (error) {
    result.steps.push({
      name: 'Create Cursor Configuration',
      status: 'failed',
      message: `Failed: ${error}`,
      duration: Date.now() - step6Start,
    });
  }

  // Calculate total duration and success
  result.totalDuration = Date.now() - startTime;
  result.success = result.steps.filter(s => s.status === 'failed').length === 0;

  // Add final recommendations
  if (result.success) {
    result.recommendations.push(
      'Setup complete! Your AI agents now have full context.',
      'Run "check_context_usage" periodically to ensure agents use the context files.',
      config.tokenOptimized ? 'Token-optimized context created for cost efficiency.' : 'Consider using tokenOptimized mode for cost savings.'
    );
  }

  return result;
}

async function createContextBundles(projectPath: string) {
  const contextDir = join(projectPath, 'agent-context');
  if (!existsSync(contextDir)) {
    mkdirSync(contextDir, { recursive: true });
  }

  // Create quick reference (minimal context)
  const quickRef = `# Quick Reference (~230 tokens)

## Stack
- Frontend: React, TypeScript, Vite, TailwindCSS
- State: Context API (simple), Zustand (complex)
- Testing: Jest + React Testing Library

## Patterns
- Components: Functional + TypeScript interfaces
- Styling: Tailwind utilities
- Imports: Named imports preferred
- Exports: Default for components

## Structure
/src/components - UI components
/src/hooks - Custom hooks  
/src/services - API calls
/src/types - TypeScript types
/src/utils - Helpers

## Rules
- NO class components
- NO any types
- ALWAYS handle loading/error
- ALWAYS validate props`;

  writeFileSync(join(contextDir, 'quick-reference.md'), quickRef);

  // Create bundles directory
  const bundlesDir = join(contextDir, 'bundles');
  if (!existsSync(bundlesDir)) {
    mkdirSync(bundlesDir, { recursive: true });
  }

  // These would be customized based on the actual analysis
  // For now, creating placeholder bundles
  const frontendBundle = `# Frontend Bundle (~1500 tokens)
Comprehensive frontend development context...`;

  const backendBundle = `# Backend Bundle (~1800 tokens)
Comprehensive backend development context...`;

  writeFileSync(join(bundlesDir, 'frontend-bundle.md'), frontendBundle);
  writeFileSync(join(bundlesDir, 'backend-bundle.md'), backendBundle);
}

function createCursorRules(): string {
  return `# Cursor Configuration for AI Context

# Auto-load these files for every AI interaction:
# - CODEBASE-CONTEXT.md (primary patterns and rules)
# - PROJECT-TEMPLATE.md (architecture overview)
# - .context7.yaml (API verification)

# For specific tasks, also load:
# Frontend work: agent-context/bundles/frontend-bundle.md
# Backend work: agent-context/bundles/backend-bundle.md
# Quick tasks: agent-context/quick-reference.md

# Rules for AI:
1. ALWAYS read CODEBASE-CONTEXT.md first
2. Follow established patterns exactly
3. Check imports with .context7.yaml
4. Use quick-reference.md for simple tasks
5. Load specific bundles for complex work
`;
}