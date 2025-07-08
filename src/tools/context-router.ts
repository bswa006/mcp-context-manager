import { readFile } from 'fs/promises';
import { join } from 'path';
import * as yaml from 'js-yaml';

interface ContextRecommendation {
  path: string;
  tokens: number;
}

interface TaskMapping {
  description: string;
  keywords: string[];
  recommended_contexts: {
    tier1: ContextRecommendation[];
    tier2: ContextRecommendation[];
    tier3: ContextRecommendation[];
  };
  total_tokens: {
    minimal: number;
    standard: number;
    comprehensive: number;
  };
}

interface ContextRouterConfig {
  version: string;
  updated: string;
  task_mappings: Record<string, TaskMapping>;
  default: TaskMapping;
}

export class ContextRouter {
  private config: ContextRouterConfig | null = null;
  private readonly configPath: string;

  constructor(workspacePath: string) {
    this.configPath = join(workspacePath, 'agent-context', 'context-router.yaml');
  }

  async initialize(): Promise<void> {
    try {
      const configContent = await readFile(this.configPath, 'utf-8');
      this.config = yaml.load(configContent) as ContextRouterConfig;
    } catch (error) {
      console.warn('Context router config not found, using defaults');
      this.config = this.getDefaultConfig();
    }
  }

  async recommendContext(
    task: string,
    options: {
      maxTokens?: number;
      tier?: 'minimal' | 'standard' | 'comprehensive';
    } = {}
  ): Promise<{
    recommendations: ContextRecommendation[];
    totalTokens: number;
    confidence: number;
    matchedTask: string;
  }> {
    if (!this.config) {
      await this.initialize();
    }

    const { taskType, confidence } = this.identifyTaskType(task);
    const mapping = this.config!.task_mappings[taskType] || this.config!.default;
    
    const tier = options.tier || this.selectTier(options.maxTokens || 3000, mapping);
    const recommendations = this.getRecommendationsForTier(mapping, tier);
    const totalTokens = mapping.total_tokens[tier];

    return {
      recommendations,
      totalTokens,
      confidence,
      matchedTask: taskType,
    };
  }

  private identifyTaskType(task: string): { taskType: string; confidence: number } {
    const taskLower = task.toLowerCase();
    let bestMatch = { taskType: 'default', confidence: 0 };

    for (const [taskType, mapping] of Object.entries(this.config!.task_mappings)) {
      let score = 0;
      let matches = 0;

      for (const keyword of mapping.keywords) {
        if (taskLower.includes(keyword)) {
          matches++;
          // Exact word match scores higher
          if (new RegExp(`\\b${keyword}\\b`).test(taskLower)) {
            score += 1.0;
          } else {
            score += 0.7;
          }
        }
      }

      const confidence = matches > 0 ? score / mapping.keywords.length : 0;

      if (confidence > bestMatch.confidence) {
        bestMatch = { taskType, confidence };
      }
    }

    return bestMatch;
  }

  private selectTier(
    maxTokens: number,
    mapping: TaskMapping
  ): 'minimal' | 'standard' | 'comprehensive' {
    if (maxTokens <= mapping.total_tokens.minimal) {
      return 'minimal';
    } else if (maxTokens <= mapping.total_tokens.standard) {
      return 'standard';
    } else {
      return 'comprehensive';
    }
  }

  private getRecommendationsForTier(
    mapping: TaskMapping,
    tier: 'minimal' | 'standard' | 'comprehensive'
  ): ContextRecommendation[] {
    switch (tier) {
      case 'minimal':
        return mapping.recommended_contexts.tier1;
      case 'standard':
        return [
          ...mapping.recommended_contexts.tier1,
          ...mapping.recommended_contexts.tier2,
        ];
      case 'comprehensive':
        return [
          ...mapping.recommended_contexts.tier1,
          ...mapping.recommended_contexts.tier2,
          ...mapping.recommended_contexts.tier3,
        ];
    }
  }

  async getContextContent(recommendations: ContextRecommendation[]): Promise<string[]> {
    const contents: string[] = [];
    
    for (const rec of recommendations) {
      try {
        const fullPath = join(process.cwd(), 'agent-context', rec.path);
        const content = await readFile(fullPath, 'utf-8');
        contents.push(content);
      } catch (error) {
        console.warn(`Failed to read context file: ${rec.path}`);
      }
    }
    
    return contents;
  }

  getAvailableTasks(): string[] {
    if (!this.config) {
      return [];
    }
    return Object.keys(this.config.task_mappings);
  }

  getTaskInfo(taskType: string): TaskMapping | null {
    if (!this.config) {
      return null;
    }
    return this.config.task_mappings[taskType] || null;
  }

  private getDefaultConfig(): ContextRouterConfig {
    return {
      version: '1.0',
      updated: new Date().toISOString().split('T')[0],
      task_mappings: {
        create_component: {
          description: 'Creating new React components',
          keywords: ['component', 'react', 'ui', 'interface'],
          recommended_contexts: {
            tier1: [{ path: 'quick-reference.md', tokens: 230 }],
            tier2: [{ path: 'patterns/component-patterns.yaml', tokens: 400 }],
            tier3: [{ path: 'CODEBASE-CONTEXT.md', tokens: 2500 }],
          },
          total_tokens: {
            minimal: 230,
            standard: 630,
            comprehensive: 3130,
          },
        },
      },
      default: {
        description: 'General development tasks',
        keywords: [],
        recommended_contexts: {
          tier1: [{ path: 'quick-reference.md', tokens: 230 }],
          tier2: [{ path: 'CODEBASE-CONTEXT.md', tokens: 2500 }],
          tier3: [{ path: 'PROJECT-TEMPLATE.md', tokens: 2000 }],
        },
        total_tokens: {
          minimal: 230,
          standard: 2730,
          comprehensive: 4730,
        },
      },
    };
  }
}

// Utility function for CLI or API usage
export async function suggestContext(
  task: string,
  workspacePath: string,
  options: {
    maxTokens?: number;
    tier?: 'minimal' | 'standard' | 'comprehensive';
    returnContent?: boolean;
  } = {}
): Promise<{
  recommendations: ContextRecommendation[];
  totalTokens: number;
  confidence: number;
  matchedTask: string;
  content?: string[];
}> {
  const router = new ContextRouter(workspacePath);
  await router.initialize();
  
  const result = await router.recommendContext(task, options);
  
  if (options.returnContent) {
    const content = await router.getContextContent(result.recommendations);
    return { ...result, content };
  }
  
  return result;
}

// Wrapper function for MCP tool
export async function routeContext(task: string): Promise<{
  recommendations: ContextRecommendation[];
  totalTokens: number;
  confidence: number;
  matchedTask: string;
}> {
  const router = new ContextRouter(process.cwd());
  await router.initialize();
  return router.recommendContext(task);
}