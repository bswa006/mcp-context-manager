import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

interface TokenUsageEntry {
  id: string;
  timestamp: Date;
  task: string;
  contextFiles: string[];
  tokensUsed: number;
  model: string;
  tier: 'minimal' | 'standard' | 'comprehensive';
  success: boolean;
  timeSaved?: number; // in minutes
  errorsPrevented?: number;
}

interface TokenMetrics {
  daily: {
    date: string;
    totalTokens: number;
    totalCost: number;
    taskCount: number;
    averageTokensPerTask: number;
  }[];
  monthly: {
    month: string;
    totalTokens: number;
    totalCost: number;
    taskCount: number;
    roi: number;
  };
  byTaskType: Record<string, {
    count: number;
    totalTokens: number;
    averageTokens: number;
    successRate: number;
  }>;
  byTier: Record<string, {
    count: number;
    totalTokens: number;
    averageTokens: number;
  }>;
}

interface ModelPricing {
  inputTokenCost: number; // Cost per 1M tokens
  outputTokenCost: number;
}

export class TokenTracker {
  private readonly dataPath: string;
  private readonly metricsPath: string;
  private usage: TokenUsageEntry[] = [];
  
  private readonly modelPricing: Record<string, ModelPricing> = {
    'claude-3-sonnet': {
      inputTokenCost: 3.00,  // $3 per 1M input tokens
      outputTokenCost: 15.00, // $15 per 1M output tokens
    },
    'claude-3-opus': {
      inputTokenCost: 15.00,
      outputTokenCost: 75.00,
    },
    'gpt-4-turbo': {
      inputTokenCost: 10.00,
      outputTokenCost: 30.00,
    },
    'gpt-3.5-turbo': {
      inputTokenCost: 0.50,
      outputTokenCost: 1.50,
    },
  };

  constructor(workspacePath: string) {
    this.dataPath = join(workspacePath, '.token-usage', 'usage.json');
    this.metricsPath = join(workspacePath, '.token-usage', 'metrics.json');
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(join(process.cwd(), '.token-usage'), { recursive: true });
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.usage = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start fresh
      this.usage = [];
    }
  }

  async trackUsage(
    task: string,
    contextFiles: string[],
    tokensUsed: number,
    model: string,
    tier: 'minimal' | 'standard' | 'comprehensive',
    success: boolean = true,
    metadata?: {
      timeSaved?: number;
      errorsPrevented?: number;
    }
  ): Promise<void> {
    const entry: TokenUsageEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      task,
      contextFiles,
      tokensUsed,
      model,
      tier,
      success,
      ...metadata,
    };

    this.usage.push(entry);
    await this.save();
    await this.updateMetrics();
  }

  async getMetrics(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<TokenMetrics> {
    const now = new Date();
    const metrics: TokenMetrics = {
      daily: [],
      monthly: {
        month: now.toISOString().substring(0, 7),
        totalTokens: 0,
        totalCost: 0,
        taskCount: 0,
        roi: 0,
      },
      byTaskType: {},
      byTier: {
        minimal: { count: 0, totalTokens: 0, averageTokens: 0 },
        standard: { count: 0, totalTokens: 0, averageTokens: 0 },
        comprehensive: { count: 0, totalTokens: 0, averageTokens: 0 },
      },
    };

    // Calculate daily metrics for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().substring(0, 10);
      
      const dayUsage = this.usage.filter(
        u => u.timestamp.toString().substring(0, 10) === dateStr
      );
      
      const dayTokens = dayUsage.reduce((sum, u) => sum + u.tokensUsed, 0);
      const dayCost = this.calculateCost(dayUsage);
      
      metrics.daily.push({
        date: dateStr,
        totalTokens: dayTokens,
        totalCost: dayCost,
        taskCount: dayUsage.length,
        averageTokensPerTask: dayUsage.length > 0 ? dayTokens / dayUsage.length : 0,
      });
    }

    // Calculate monthly metrics
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthUsage = this.usage.filter(u => new Date(u.timestamp) >= monthStart);
    
    metrics.monthly.totalTokens = monthUsage.reduce((sum, u) => sum + u.tokensUsed, 0);
    metrics.monthly.totalCost = this.calculateCost(monthUsage);
    metrics.monthly.taskCount = monthUsage.length;
    
    // Calculate ROI
    const timeSaved = monthUsage.reduce((sum, u) => sum + (u.timeSaved || 0), 0);
    const hoursSaved = timeSaved / 60;
    const dollarsSaved = hoursSaved * 50; // Assuming $50/hour developer cost
    metrics.monthly.roi = metrics.monthly.totalCost > 0 
      ? (dollarsSaved / metrics.monthly.totalCost) * 100 
      : 0;

    // Metrics by task type
    const taskGroups = this.groupBy(monthUsage, 'task');
    for (const [task, entries] of Object.entries(taskGroups)) {
      const totalTokens = entries.reduce((sum, u) => sum + u.tokensUsed, 0);
      const successCount = entries.filter(u => u.success).length;
      
      metrics.byTaskType[task] = {
        count: entries.length,
        totalTokens,
        averageTokens: totalTokens / entries.length,
        successRate: (successCount / entries.length) * 100,
      };
    }

    // Metrics by tier
    const tierGroups = this.groupBy(monthUsage, 'tier');
    for (const [tier, entries] of Object.entries(tierGroups)) {
      const totalTokens = entries.reduce((sum, u) => sum + u.tokensUsed, 0);
      
      metrics.byTier[tier] = {
        count: entries.length,
        totalTokens,
        averageTokens: totalTokens / entries.length,
      };
    }

    return metrics;
  }

  async getTokenBudgetStatus(
    monthlyBudget: number
  ): Promise<{
    spent: number;
    remaining: number;
    percentUsed: number;
    projectedTotal: number;
    willExceedBudget: boolean;
  }> {
    const metrics = await this.getMetrics();
    const spent = metrics.monthly.totalCost;
    const remaining = monthlyBudget - spent;
    const percentUsed = (spent / monthlyBudget) * 100;
    
    // Project total based on current usage rate
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const dailyRate = spent / daysPassed;
    const projectedTotal = dailyRate * daysInMonth;
    
    return {
      spent,
      remaining,
      percentUsed,
      projectedTotal,
      willExceedBudget: projectedTotal > monthlyBudget,
    };
  }

  async generateReport(): Promise<string> {
    const metrics = await this.getMetrics();
    const budget = await this.getTokenBudgetStatus(100); // $100 monthly budget
    
    const report = `
# Token Usage Report

## Monthly Summary (${metrics.monthly.month})
- Total Tokens Used: ${metrics.monthly.totalTokens.toLocaleString()}
- Total Cost: $${metrics.monthly.totalCost.toFixed(2)}
- Tasks Completed: ${metrics.monthly.taskCount}
- ROI: ${metrics.monthly.roi.toFixed(0)}%

## Budget Status
- Monthly Budget: $100.00
- Spent: $${budget.spent.toFixed(2)} (${budget.percentUsed.toFixed(1)}%)
- Remaining: $${budget.remaining.toFixed(2)}
- Projected Total: $${budget.projectedTotal.toFixed(2)}
${budget.willExceedBudget ? '⚠️ WARNING: Projected to exceed budget!' : '✅ Within budget'}

## Usage by Task Type
${Object.entries(metrics.byTaskType)
  .map(([task, data]) => `- ${task}: ${data.count} tasks, ${data.averageTokens.toFixed(0)} avg tokens, ${data.successRate.toFixed(1)}% success`)
  .join('\n')}

## Usage by Tier
${Object.entries(metrics.byTier)
  .map(([tier, data]) => `- ${tier}: ${data.count} tasks, ${data.averageTokens.toFixed(0)} avg tokens`)
  .join('\n')}

## Daily Trend (Last 7 Days)
${metrics.daily.slice(0, 7)
  .map(d => `- ${d.date}: ${d.taskCount} tasks, $${d.totalCost.toFixed(2)}`)
  .join('\n')}
`;

    return report;
  }

  private calculateCost(entries: TokenUsageEntry[]): number {
    return entries.reduce((total, entry) => {
      const pricing = this.modelPricing[entry.model] || this.modelPricing['claude-3-sonnet'];
      // Assuming 80% input tokens, 20% output tokens as typical ratio
      const inputTokens = entry.tokensUsed * 0.8;
      const outputTokens = entry.tokensUsed * 0.2;
      
      const inputCost = (inputTokens / 1_000_000) * pricing.inputTokenCost;
      const outputCost = (outputTokens / 1_000_000) * pricing.outputTokenCost;
      
      return total + inputCost + outputCost;
    }, 0);
  }

  private groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      (groups[value] = groups[value] || []).push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(this.usage, null, 2));
  }

  private async updateMetrics(): Promise<void> {
    const metrics = await this.getMetrics();
    await fs.writeFile(this.metricsPath, JSON.stringify(metrics, null, 2));
  }

  async exportToCSV(): Promise<string> {
    const headers = [
      'Date',
      'Task',
      'Tokens Used',
      'Model',
      'Tier',
      'Cost',
      'Success',
      'Time Saved (min)',
      'Errors Prevented',
    ];
    
    const rows = this.usage.map(entry => {
      const pricing = this.modelPricing[entry.model] || this.modelPricing['claude-3-sonnet'];
      const cost = (entry.tokensUsed / 1_000_000) * pricing.inputTokenCost;
      
      return [
        new Date(entry.timestamp).toISOString(),
        entry.task,
        entry.tokensUsed.toString(),
        entry.model,
        entry.tier,
        cost.toFixed(4),
        entry.success ? 'Yes' : 'No',
        entry.timeSaved?.toString() || '0',
        entry.errorsPrevented?.toString() || '0',
      ];
    });
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    const exportPath = join(process.cwd(), '.token-usage', `export-${Date.now()}.csv`);
    await fs.writeFile(exportPath, csv);
    
    return exportPath;
  }
}

// Singleton instance for easy access
let tracker: TokenTracker | null = null;

export function getTokenTracker(workspacePath: string): TokenTracker {
  if (!tracker) {
    tracker = new TokenTracker(workspacePath);
  }
  return tracker;
}

// Wrapper function for easy usage
export async function trackTokenUsage(options: {
  task: string;
  tokensUsed: number;
  context?: string;
  result?: string;
  tier?: 'minimal' | 'standard' | 'comprehensive';
  model?: string;
}): Promise<void> {
  const tracker = getTokenTracker(process.cwd());
  await tracker.initialize();
  await tracker.trackUsage(
    options.task,
    options.context ? [options.context] : [],
    options.tokensUsed,
    options.model || 'claude-3-sonnet',
    options.tier || 'standard',
    options.result === 'success',
    {
      timeSaved: 5,
      errorsPrevented: 0,
    }
  );
}