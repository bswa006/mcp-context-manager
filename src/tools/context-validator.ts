import { promises as fs } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import glob from 'glob';

interface ContextMetadata {
  version?: string;
  updated: string;
  expires?: string;
  dependencies?: string[];
  critical_changes?: string[];
  auto_refresh?: boolean;
}

interface ValidationResult {
  file: string;
  isValid: boolean;
  isExpired: boolean;
  daysSinceUpdate: number;
  daysUntilExpiry?: number;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

interface ValidationReport {
  timestamp: Date;
  totalFiles: number;
  validFiles: number;
  expiredFiles: number;
  warningCount: number;
  errorCount: number;
  results: ValidationResult[];
  summary: {
    needsUpdate: string[];
    expiringSoon: string[];
    criticalUpdates: string[];
  };
}

export class ContextValidator {
  private readonly contextPath: string;
  private readonly defaultExpiryDays = 30;
  private readonly warningThresholdDays = 7;

  constructor(workspacePath: string) {
    this.contextPath = join(workspacePath, 'agent-context');
  }

  async validateAll(): Promise<ValidationReport> {
    const patterns = [
      '**/*.md',
      '**/*.yaml',
      '**/*.yml',
    ];
    
    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, { cwd: this.contextPath });
      files.push(...matches);
    }

    const results: ValidationResult[] = [];
    let validCount = 0;
    let expiredCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const result = await this.validateFile(file);
      results.push(result);
      
      if (result.isValid) validCount++;
      if (result.isExpired) expiredCount++;
      warningCount += result.warnings.length;
      errorCount += result.errors.length;
    }

    const report: ValidationReport = {
      timestamp: new Date(),
      totalFiles: files.length,
      validFiles: validCount,
      expiredFiles: expiredCount,
      warningCount,
      errorCount,
      results,
      summary: {
        needsUpdate: results
          .filter(r => r.isExpired)
          .map(r => r.file),
        expiringSoon: results
          .filter(r => !r.isExpired && r.daysUntilExpiry && r.daysUntilExpiry <= this.warningThresholdDays)
          .map(r => r.file),
        criticalUpdates: results
          .filter(r => r.errors.length > 0)
          .map(r => r.file),
      },
    };

    return report;
  }

  async validateFile(filePath: string): Promise<ValidationResult> {
    const fullPath = join(this.contextPath, filePath);
    const result: ValidationResult = {
      file: filePath,
      isValid: true,
      isExpired: false,
      daysSinceUpdate: 0,
      warnings: [],
      errors: [],
      suggestions: [],
    };

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const metadata = this.extractMetadata(content, filePath);
      
      // Check last updated date
      if (metadata.updated) {
        const updateDate = new Date(metadata.updated);
        const now = new Date();
        result.daysSinceUpdate = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if expired
        if (metadata.expires) {
          const expiryDate = new Date(metadata.expires);
          if (now > expiryDate) {
            result.isExpired = true;
            result.isValid = false;
            result.errors.push(`File expired on ${metadata.expires}`);
          } else {
            result.daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (result.daysUntilExpiry <= this.warningThresholdDays) {
              result.warnings.push(`File expires in ${result.daysUntilExpiry} days`);
            }
          }
        } else if (result.daysSinceUpdate > this.defaultExpiryDays) {
          result.isExpired = true;
          result.warnings.push(`File hasn't been updated in ${result.daysSinceUpdate} days (default expiry: ${this.defaultExpiryDays} days)`);
        }
      } else {
        result.errors.push('No "updated" metadata found');
        result.isValid = false;
      }

      // Check dependencies
      if (metadata.dependencies) {
        for (const dep of metadata.dependencies) {
          const depPath = join(this.contextPath, dep);
          try {
            await fs.access(depPath);
          } catch {
            result.errors.push(`Missing dependency: ${dep}`);
            result.isValid = false;
          }
        }
      }

      // Content-specific validation
      const contentValidation = this.validateContent(content, filePath);
      result.warnings.push(...contentValidation.warnings);
      result.errors.push(...contentValidation.errors);
      result.suggestions.push(...contentValidation.suggestions);

      // Check for stale references
      const staleRefs = await this.checkStaleReferences(content, filePath);
      if (staleRefs.length > 0) {
        result.warnings.push(...staleRefs);
      }

    } catch (error) {
      result.errors.push(`Failed to read file: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  private extractMetadata(content: string, filePath: string): ContextMetadata {
    const metadata: ContextMetadata = {
      updated: new Date().toISOString().split('T')[0],
    };

    // Try to extract from YAML frontmatter (Markdown files)
    if (filePath.endsWith('.md')) {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        try {
          const yamlData = yaml.load(frontmatterMatch[1]) as any;
          Object.assign(metadata, yamlData);
        } catch (e) {
          // Invalid YAML, ignore
        }
      }
      
      // Also check for inline metadata
      const updatedMatch = content.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/i);
      if (updatedMatch) {
        metadata.updated = updatedMatch[1];
      }
      
      const expiresMatch = content.match(/Expires:\s*(\d{4}-\d{2}-\d{2})/i);
      if (expiresMatch) {
        metadata.expires = expiresMatch[1];
      }
    }

    // For YAML files, check top-level fields
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      try {
        const yamlData = yaml.load(content) as any;
        if (yamlData.updated) metadata.updated = yamlData.updated;
        if (yamlData.expires) metadata.expires = yamlData.expires;
        if (yamlData.version) metadata.version = yamlData.version;
        if (yamlData.dependencies) metadata.dependencies = yamlData.dependencies;
        if (yamlData.critical_changes) metadata.critical_changes = yamlData.critical_changes;
      } catch (e) {
        // Invalid YAML
      }
    }

    return metadata;
  }

  private validateContent(content: string, filePath: string): {
    warnings: string[];
    errors: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check for common issues
    if (content.includes('TODO')) {
      warnings.push('Contains TODO items');
    }

    if (content.includes('FIXME')) {
      warnings.push('Contains FIXME items');
    }

    if (content.includes('DEPRECATED')) {
      warnings.push('Contains deprecated content');
    }

    // Check for version-specific content
    const versionPatterns = [
      /React\s+1[0-7]\./gi,  // Old React versions
      /Node\.js\s+[0-9]\./gi,  // Old Node versions
      /TypeScript\s+[0-3]\./gi,  // Old TypeScript versions
    ];

    for (const pattern of versionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        warnings.push(`Potentially outdated version references: ${matches.join(', ')}`);
      }
    }

    // Check file size
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).length;
    
    if (words > 2000 && filePath.includes('quick-reference')) {
      warnings.push(`File is too large for quick reference (${words} words, should be < 500)`);
    }

    if (lines > 500) {
      suggestions.push('Consider splitting this file into smaller, focused files');
    }

    // Check for missing sections in specific file types
    if (filePath.includes('bundle') && !content.includes('token')) {
      suggestions.push('Bundle files should include token count estimates');
    }

    return { warnings, errors, suggestions };
  }

  private async checkStaleReferences(content: string, filePath: string): Promise<string[]> {
    const warnings: string[] = [];
    
    // Check for file references
    const fileRefPattern = /@?\.?\/?[\w\-\/]+\.(md|yaml|yml|ts|tsx|js|jsx)/g;
    const matches = content.match(fileRefPattern) || [];
    
    for (const match of matches) {
      const referencedFile = match.replace('@', '').replace(/^\.\//, '');
      const fullPath = join(this.contextPath, referencedFile);
      
      try {
        await fs.access(fullPath);
      } catch {
        // Try from project root
        try {
          await fs.access(join(process.cwd(), referencedFile));
        } catch {
          warnings.push(`Stale reference to non-existent file: ${match}`);
        }
      }
    }
    
    return warnings;
  }

  async autoRefresh(dryRun: boolean = false): Promise<{
    refreshed: string[];
    failed: string[];
  }> {
    const report = await this.validateAll();
    const refreshed: string[] = [];
    const failed: string[] = [];

    for (const file of report.summary.needsUpdate) {
      try {
        if (!dryRun) {
          await this.refreshFile(file);
        }
        refreshed.push(file);
      } catch (error) {
        failed.push(file);
      }
    }

    return { refreshed, failed };
  }

  private async refreshFile(filePath: string): Promise<void> {
    const fullPath = join(this.contextPath, filePath);
    let content = await fs.readFile(fullPath, 'utf-8');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Update date in content
    if (filePath.endsWith('.md')) {
      // Update inline date
      content = content.replace(
        /Last updated:\s*\d{4}-\d{2}-\d{2}/gi,
        `Last updated: ${today}`
      );
      
      // Update frontmatter if exists
      if (content.startsWith('---')) {
        content = content.replace(
          /updated:\s*\d{4}-\d{2}-\d{2}/,
          `updated: ${today}`
        );
      }
    } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      content = content.replace(
        /updated:\s*["']?\d{4}-\d{2}-\d{2}["']?/,
        `updated: "${today}"`
      );
    }

    // Update expiry date if needed
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + this.defaultExpiryDays);
    const expiryDate = futureDate.toISOString().split('T')[0];
    
    if (content.includes('expires:')) {
      content = content.replace(
        /expires:\s*["']?\d{4}-\d{2}-\d{2}["']?/,
        `expires: "${expiryDate}"`
      );
    }

    await fs.writeFile(fullPath, content);
  }

  async generateReport(format: 'markdown' | 'json' = 'markdown'): Promise<string> {
    const report = await this.validateAll();
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    // Generate markdown report
    const md = `# Context Validation Report

Generated: ${report.timestamp.toISOString()}

## Summary
- Total Files: ${report.totalFiles}
- Valid Files: ${report.validFiles} (${Math.round(report.validFiles / report.totalFiles * 100)}%)
- Expired Files: ${report.expiredFiles}
- Total Warnings: ${report.warningCount}
- Total Errors: ${report.errorCount}

## Files Needing Attention

### 🚨 Critical Updates Required (${report.summary.criticalUpdates.length})
${report.summary.criticalUpdates.map(f => `- ${f}`).join('\n') || 'None'}

### ⚠️ Expired Files (${report.summary.needsUpdate.length})
${report.summary.needsUpdate.map(f => `- ${f}`).join('\n') || 'None'}

### 📅 Expiring Soon (${report.summary.expiringSoon.length})
${report.summary.expiringSoon.map(f => `- ${f}`).join('\n') || 'None'}

## Detailed Results

${report.results
  .filter(r => r.errors.length > 0 || r.warnings.length > 0)
  .map(r => `### ${r.file}
- Days since update: ${r.daysSinceUpdate}
- Valid: ${r.isValid ? '✅' : '❌'}
- Expired: ${r.isExpired ? '⚠️ Yes' : 'No'}
${r.errors.length > 0 ? `\n**Errors:**\n${r.errors.map(e => `- ${e}`).join('\n')}` : ''}
${r.warnings.length > 0 ? `\n**Warnings:**\n${r.warnings.map(w => `- ${w}`).join('\n')}` : ''}
${r.suggestions.length > 0 ? `\n**Suggestions:**\n${r.suggestions.map(s => `- ${s}`).join('\n')}` : ''}
`).join('\n---\n')}

## Recommendations
1. Run \`mcp-context refresh\` to update expired files
2. Review files with critical errors
3. Consider splitting large files
4. Update version references in outdated files
`;

    return md;
  }
}