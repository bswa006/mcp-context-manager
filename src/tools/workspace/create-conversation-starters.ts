import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface ConversationStarterConfig {
  projectPath: string;
  analysisId?: string;
  includeQuickTasks?: boolean;
  includeCurrentWork?: boolean;
  tokenLimit?: number;
  customTasks?: string[];
}

interface ConversationStarterResult {
  success: boolean;
  filePath: string;
  message: string;
  tokenCount: number;
  filesCreated: string[];
}

export async function createConversationStarters(
  config: ConversationStarterConfig
): Promise<ConversationStarterResult> {
  const result: ConversationStarterResult = {
    success: false,
    filePath: '',
    message: '',
    tokenCount: 0,
    filesCreated: [],
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];
    
    // Check for existing git history to find recent work
    const recentWork = await getRecentWork(config.projectPath);
    
    // Generate conversation starters based on analysis and config
    const starters = generateConversationStarters(analysis, config, recentWork);
    
    // Estimate token count
    result.tokenCount = Math.ceil(starters.length / 4);
    
    // Apply token limit if specified
    let finalContent = starters;
    if (config.tokenLimit && result.tokenCount > config.tokenLimit) {
      finalContent = trimToTokenLimit(starters, config.tokenLimit);
      result.tokenCount = config.tokenLimit;
    }
    
    // Write to file
    const filePath = join(config.projectPath, 'agent-context', 'conversation-starters.md');
    writeFileSync(filePath, finalContent);
    
    result.success = true;
    result.filePath = filePath;
    result.filesCreated = [filePath];
    result.message = `Created conversation-starters.md (${result.tokenCount} tokens) with project context and ${config.includeQuickTasks ? 'quick tasks' : 'overview only'}`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to create conversation starters: ${error}`;
  }

  return result;
}

function generateConversationStarters(
  analysis: DeepAnalysisResult,
  config: ConversationStarterConfig,
  recentWork: string[]
): string {
  const { summary, patterns, structure, recommendations } = analysis;
  const projectName = analysis.projectPath.split('/').pop() || 'Project';
  
  let content = `# 🚀 AI Context Loading Instructions

## Quick Start (Copy & Paste)
\`\`\`
I'm working on ${projectName}, a ${summary.frameworks.join(' + ')} application. 
Please load and review these context files in order:
1. agent-context/CODEBASE-CONTEXT.md - patterns and conventions
2. agent-context/PROJECT-TEMPLATE.md - architecture overview
3. agent-context/.context7.yaml - API verification
\`\`\`

## Project Overview
- **Tech Stack**: ${summary.techStack.join(', ')}
- **Total Files**: ${summary.totalFiles}
- **Primary Language**: ${summary.primaryLanguage}
- **Testing**: ${summary.testingFrameworks.join(', ') || 'Not configured'}

## Key Patterns to Follow
- **Components**: ${patterns.components.style} with ${patterns.components.propsPattern}
- **State**: ${patterns.stateManagement.join(', ') || 'Local state only'}
- **Styling**: ${patterns.styling}
- **Imports**: ${patterns.imports.style} style preferred

## Project Structure
${Object.entries(structure.directories)
  .filter(([_, info]: [string, any]) => info.fileCount > 5)
  .slice(0, 6)
  .map(([path, info]: [string, any]) => `- **${path}**: ${info.purpose}`)
  .join('\n')}
`;

  // Add recent work section if requested and available
  if (config.includeCurrentWork && recentWork.length > 0) {
    content += `\n## Recent Work (Last 7 days)
${recentWork.slice(0, 5).map(commit => `- ${commit}`).join('\n')}
`;
  }

  // Add quick tasks section if requested
  if (config.includeQuickTasks) {
    content += `\n## Common Quick Tasks
${generateQuickTasks(analysis, config.customTasks)}
`;
  }

  // Add recommendations if any
  if (recommendations.length > 0) {
    content += `\n## Important Recommendations
${recommendations.slice(0, 3).map(rec => `- ${rec}`).join('\n')}
`;
  }

  // Add token optimization tip
  content += `\n## Token Optimization
- For simple tasks: Load only CODEBASE-CONTEXT.md
- For new features: Load PROJECT-TEMPLATE.md + CODEBASE-CONTEXT.md
- For debugging: Add .context7.yaml for import verification
- For architecture: Load all three files

## Starting a Task
After loading context, you can say:
- "Create a new component called..."
- "Add a feature that..."
- "Fix the issue with..."
- "Refactor the..."
- "Add tests for..."
`;

  // Add evidence files section
  if (analysis.evidenceFiles.length > 0) {
    content += `\n## Example Files to Reference
${analysis.evidenceFiles.slice(0, 5).map(ef => `- ${ef.path}: ${ef.purpose}`).join('\n')}
`;
  }

  return content;
}

function generateQuickTasks(analysis: DeepAnalysisResult, customTasks?: string[]): string {
  const defaultTasks = [
    `Create a new ${analysis.patterns.components.style} component with TypeScript`,
    `Add a new API endpoint following existing patterns`,
    `Write tests for a component using ${analysis.summary.testingFrameworks[0] || 'Jest'}`,
    `Add error handling to an existing feature`,
    `Implement a new hook following the use* pattern`,
  ];
  
  const tasks = customTasks && customTasks.length > 0 ? customTasks : defaultTasks;
  
  return tasks.map((task, i) => `${i + 1}. ${task}`).join('\n');
}

async function getRecentWork(projectPath: string): Promise<string[]> {
  try {
    // Check if it's a git repository
    const gitPath = join(projectPath, '.git');
    if (!existsSync(gitPath)) {
      return [];
    }
    
    // Get recent commits (this is a simplified version)
    // In a real implementation, you'd use git commands or a git library
    const { execSync } = await import('child_process');
    const recentCommits = execSync(
      'git log --oneline --since="7 days ago" --max-count=10',
      { cwd: projectPath, encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);
    
    return recentCommits;
  } catch (error) {
    // If git commands fail, return empty array
    return [];
  }
}

function trimToTokenLimit(content: string, tokenLimit: number): string {
  // Simple token estimation: 1 token ≈ 4 characters
  const charLimit = tokenLimit * 4;
  
  if (content.length <= charLimit) {
    return content;
  }
  
  // Trim content intelligently by sections
  const sections = content.split('\n## ');
  let trimmedContent = sections[0]; // Keep the header
  let currentLength = trimmedContent.length;
  
  // Add sections until we hit the limit
  for (let i = 1; i < sections.length; i++) {
    const section = '\n## ' + sections[i];
    if (currentLength + section.length > charLimit) {
      // Add a truncation notice
      trimmedContent += '\n\n*[Content trimmed to fit token limit]*';
      break;
    }
    trimmedContent += section;
    currentLength += section.length;
  }
  
  return trimmedContent;
}