import { ContextValidator } from './context-validator';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as cron from 'node-cron';

interface ScheduleConfig {
  enabled: boolean;
  cronExpression: string; // e.g., "0 9 * * *" for daily at 9 AM
  autoRefresh: boolean;
  notificationWebhook?: string;
  emailRecipients?: string[];
}

interface ScheduleStatus {
  lastRun?: Date;
  nextRun?: Date;
  lastReport?: {
    expiredFiles: number;
    warningsCount: number;
    errorsCount: number;
  };
  isRunning: boolean;
}

export class ContextScheduler {
  private validator: ContextValidator;
  private configPath: string;
  private statusPath: string;
  private config: ScheduleConfig | null = null;
  private task: cron.ScheduledTask | null = null;
  private status: ScheduleStatus = { isRunning: false };

  constructor(workspacePath: string) {
    this.validator = new ContextValidator(workspacePath);
    this.configPath = join(workspacePath, '.context-scheduler', 'config.json');
    this.statusPath = join(workspacePath, '.context-scheduler', 'status.json');
  }

  async initialize(): Promise<void> {
    // Create directory if it doesn't exist
    await fs.mkdir(join(process.cwd(), '.context-scheduler'), { recursive: true });
    
    // Load config
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(configData);
    } catch {
      // Use default config
      this.config = {
        enabled: true,
        cronExpression: '0 9 * * *', // Daily at 9 AM
        autoRefresh: false,
      };
      await this.saveConfig();
    }

    // Load status
    try {
      const statusData = await fs.readFile(this.statusPath, 'utf-8');
      this.status = JSON.parse(statusData);
    } catch {
      // Status file doesn't exist yet
    }

    // Start scheduler if enabled
    if (this.config.enabled) {
      this.start();
    }
  }

  start(): void {
    if (!this.config || this.task) return;

    this.task = cron.schedule(this.config.cronExpression, async () => {
      await this.runValidation();
    });

    this.status.isRunning = true;
    this.updateNextRunTime();
    console.log(`Context validation scheduled with expression: ${this.config.cronExpression}`);
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.status.isRunning = false;
      console.log('Context validation scheduler stopped');
    }
  }

  async runValidation(): Promise<void> {
    console.log('Running scheduled context validation...');
    
    try {
      // Run validation
      const report = await this.validator.validateAll();
      
      // Update status
      this.status.lastRun = new Date();
      this.status.lastReport = {
        expiredFiles: report.expiredFiles,
        warningsCount: report.warningCount,
        errorsCount: report.errorCount,
      };
      
      // Auto-refresh if enabled
      if (this.config?.autoRefresh && report.expiredFiles > 0) {
        console.log(`Auto-refreshing ${report.expiredFiles} expired files...`);
        const { refreshed, failed } = await this.validator.autoRefresh();
        console.log(`Refreshed: ${refreshed.length}, Failed: ${failed.length}`);
      }
      
      // Send notifications if needed
      if (report.expiredFiles > 0 || report.errorCount > 0) {
        await this.sendNotifications(report);
      }
      
      // Save report
      const reportPath = join(
        process.cwd(),
        '.context-scheduler',
        `report-${new Date().toISOString().split('T')[0]}.md`
      );
      const reportContent = await this.validator.generateReport('markdown');
      await fs.writeFile(reportPath, reportContent);
      
      // Update status
      this.updateNextRunTime();
      await this.saveStatus();
      
    } catch (error) {
      console.error('Context validation failed:', error);
    }
  }

  private async sendNotifications(report: any): Promise<void> {
    const message = `
Context Validation Alert:
- Expired Files: ${report.expiredFiles}
- Warnings: ${report.warningCount}
- Errors: ${report.errorCount}

Files needing attention:
${report.summary.needsUpdate.slice(0, 5).join('\n')}
${report.summary.needsUpdate.length > 5 ? `\n... and ${report.summary.needsUpdate.length - 5} more` : ''}
`;

    // Send webhook notification
    if (this.config?.notificationWebhook) {
      try {
        await fetch(this.config.notificationWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: message,
            report: report.summary,
          }),
        });
      } catch (error) {
        console.error('Failed to send webhook notification:', error);
      }
    }

    // Log to console (in production, this could send emails)
    console.log('\n' + message);
  }

  private updateNextRunTime(): void {
    if (!this.config || !this.task) return;
    
    // Parse cron expression to calculate next run
    // This is a simplified version - in production use a proper cron parser
    const now = new Date();
    const [minute, hour] = this.config.cronExpression.split(' ');
    
    const nextRun = new Date(now);
    if (hour !== '*') {
      nextRun.setHours(parseInt(hour), parseInt(minute || '0'), 0, 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    }
    
    this.status.nextRun = nextRun;
  }

  async updateConfig(config: Partial<ScheduleConfig>): Promise<void> {
    this.config = { ...this.config!, ...config };
    await this.saveConfig();
    
    // Restart scheduler if cron expression changed
    if (config.cronExpression && this.task) {
      this.stop();
      this.start();
    }
  }

  async getStatus(): Promise<{
    config: ScheduleConfig;
    status: ScheduleStatus;
    recentReports: string[];
  }> {
    // Get list of recent reports
    const reportsDir = join(process.cwd(), '.context-scheduler');
    const files = await fs.readdir(reportsDir);
    const reports = files
      .filter(f => f.startsWith('report-') && f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 5);
    
    return {
      config: this.config!,
      status: this.status,
      recentReports: reports,
    };
  }

  private async saveConfig(): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  private async saveStatus(): Promise<void> {
    await fs.writeFile(this.statusPath, JSON.stringify(this.status, null, 2));
  }
}

// CLI commands for the scheduler
export async function scheduleCommands(command: string, workspacePath: string, options?: any): Promise<void> {
  const scheduler = new ContextScheduler(workspacePath);
  await scheduler.initialize();
  
  switch (command) {
    case 'start':
      scheduler.start();
      console.log('Context validation scheduler started');
      break;
      
    case 'stop':
      scheduler.stop();
      console.log('Context validation scheduler stopped');
      break;
      
    case 'run':
      await scheduler.runValidation();
      break;
      
    case 'status':
      const status = await scheduler.getStatus();
      console.log('Scheduler Status:');
      console.log(`- Enabled: ${status.config.enabled}`);
      console.log(`- Schedule: ${status.config.cronExpression}`);
      console.log(`- Auto-refresh: ${status.config.autoRefresh}`);
      console.log(`- Running: ${status.status.isRunning}`);
      if (status.status.lastRun) {
        console.log(`- Last run: ${status.status.lastRun}`);
        console.log(`- Last report: ${JSON.stringify(status.status.lastReport)}`);
      }
      if (status.status.nextRun) {
        console.log(`- Next run: ${status.status.nextRun}`);
      }
      break;
      
    case 'config':
      if (options) {
        await scheduler.updateConfig(options);
        console.log('Configuration updated');
      } else {
        const { config } = await scheduler.getStatus();
        console.log('Current configuration:');
        console.log(JSON.stringify(config, null, 2));
      }
      break;
      
    default:
      console.log('Unknown command. Available commands: start, stop, run, status, config');
  }
}