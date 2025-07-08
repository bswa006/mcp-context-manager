import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface TokenOptimizerConfig {
  projectPath: string;
  analysisId?: string;
  tiers?: ('minimal' | 'standard' | 'comprehensive')[];
  trackUsage?: boolean;
  generateMetrics?: boolean;
}

interface TokenOptimizerResult {
  success: boolean;
  filesCreated: string[];
  message: string;
  tokenSavings: {
    minimal: number;
    standard: number;
    comprehensive: number;
    percentSaved: number;
  };
}

interface ContextTier {
  name: 'minimal' | 'standard' | 'comprehensive';
  targetTokens: number;
  files: string[];
  content: string;
}

export async function createTokenOptimizer(
  config: TokenOptimizerConfig
): Promise<TokenOptimizerResult> {
  const result: TokenOptimizerResult = {
    success: false,
    filesCreated: [],
    message: '',
    tokenSavings: {
      minimal: 0,
      standard: 0,
      comprehensive: 0,
      percentSaved: 0,
    },
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];
    const tiers = config.tiers || ['minimal', 'standard', 'comprehensive'];
    
    // Create agent-context directory if it doesn't exist
    const contextDir = join(config.projectPath, 'agent-context');
    if (!existsSync(contextDir)) {
      mkdirSync(contextDir, { recursive: true });
    }
    
    // Generate tiered context files
    const contextTiers = generateTieredContexts(analysis, tiers);
    
    // Write each tier
    for (const tier of contextTiers) {
      const filePath = join(contextDir, `${tier.name}-context.md`);
      writeFileSync(filePath, tier.content);
      result.filesCreated.push(filePath);
      
      // Calculate token savings
      const baselineTokens = estimateTokens(getFullContext(analysis));
      const tierTokens = estimateTokens(tier.content);
      result.tokenSavings[tier.name] = tierTokens;
      
      if (tier.name === 'minimal') {
        result.tokenSavings.percentSaved = Math.round((1 - tierTokens / baselineTokens) * 100);
      }
    }
    
    // Create context router configuration
    const routerConfig = createContextRouter(analysis, contextTiers);
    const routerPath = join(contextDir, 'context-router.yaml');
    writeFileSync(routerPath, yaml.dump(routerConfig));
    result.filesCreated.push(routerPath);
    
    // Create usage tracking configuration if requested
    if (config.trackUsage) {
      const trackingConfig = createUsageTracking();
      const trackingPath = join(contextDir, 'token-tracking.yaml');
      writeFileSync(trackingPath, yaml.dump(trackingConfig));
      result.filesCreated.push(trackingPath);
    }
    
    // Generate metrics report if requested
    if (config.generateMetrics) {
      const metricsReport = generateMetricsReport(contextTiers, analysis);
      const metricsPath = join(contextDir, 'token-optimization-report.md');
      writeFileSync(metricsPath, metricsReport);
      result.filesCreated.push(metricsPath);
    }
    
    result.success = true;
    result.message = `Created ${result.filesCreated.length} token-optimized files. Minimal tier saves ${result.tokenSavings.percentSaved}% tokens!`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to create token optimizer: ${error}`;
  }

  return result;
}

function generateTieredContexts(
  analysis: DeepAnalysisResult,
  tiers: ('minimal' | 'standard' | 'comprehensive')[]
): ContextTier[] {
  const contextTiers: ContextTier[] = [];
  
  if (tiers.includes('minimal')) {
    contextTiers.push({
      name: 'minimal',
      targetTokens: 300,
      files: ['quick-reference.md'],
      content: generateMinimalContext(analysis),
    });
  }
  
  if (tiers.includes('standard')) {
    contextTiers.push({
      name: 'standard',
      targetTokens: 1500,
      files: ['quick-reference.md', 'patterns.yaml'],
      content: generateStandardContext(analysis),
    });
  }
  
  if (tiers.includes('comprehensive')) {
    contextTiers.push({
      name: 'comprehensive',
      targetTokens: 3000,
      files: ['quick-reference.md', 'CODEBASE-CONTEXT.md', 'PROJECT-TEMPLATE.md'],
      content: generateComprehensiveContext(analysis),
    });
  }
  
  return contextTiers;
}

function generateMinimalContext(analysis: DeepAnalysisResult): string {
  const { summary, patterns } = analysis;
  
  return `# Minimal Context (~300 tokens)

## Stack
${summary.frameworks.map(f => `- ${f}`).join('\n')}
${summary.techStack.slice(0, 3).map(t => `- ${t}`).join('\n')}

## Patterns
- Components: ${patterns.components.style}
- Props: ${patterns.components.propsPattern}
- State: ${patterns.stateManagement[0] || 'useState'}
- Styling: ${patterns.styling}

## Structure
- /src/components - UI components
- /src/hooks - Custom hooks
- /src/services - API calls
- /src/types - TypeScript types

## Rules
- NO class components
- NO any types
- ALWAYS handle errors
- ALWAYS validate props

## Quick Commands
\`npm run dev\` - Start dev
\`npm run build\` - Build app
\`npm test\` - Run tests`;
}

function generateStandardContext(analysis: DeepAnalysisResult): string {
  const { summary, patterns, structure, dependencies } = analysis;
  
  return `# Standard Context (~1500 tokens)

## Project Overview
- **Name**: ${analysis.projectPath.split('/').pop()}
- **Stack**: ${summary.frameworks.join(', ')}
- **Language**: ${summary.primaryLanguage}
- **Testing**: ${summary.testingFrameworks.join(', ') || 'None'}

## Tech Stack Details
${summary.frameworks.map(f => `- **${f}**: ${dependencies.production[f.toLowerCase()] || 'latest'}`).join('\n')}
${summary.techStack.slice(0, 5).map(t => `- **${t}**: Used for ${getUsageDescription(t)}`).join('\n')}

## Code Patterns

### Components
- Style: ${patterns.components.style}
- Props: ${patterns.components.propsPattern}
- Exports: ${patterns.components.exportPattern}

\`\`\`typescript
${generateComponentExample(patterns)}
\`\`\`

### State Management
${patterns.stateManagement.map(s => `- ${s}`).join('\n') || '- Local state only'}

### Import Convention
- Style: ${patterns.imports.style}
- Common: ${patterns.imports.common.slice(0, 5).join(', ')}

## Directory Structure
${Object.entries(structure.directories)
  .filter(([_, info]: [string, any]) => info.fileCount > 3)
  .slice(0, 8)
  .map(([path, info]: [string, any]) => `- **/${path}**: ${info.purpose} (${info.fileCount} files)`)
  .join('\n')}

## Key Dependencies
${Object.entries(dependencies.production)
  .slice(0, 10)
  .map(([pkg, version]) => `- ${pkg}: ${version}`)
  .join('\n')}

## Development Workflow
1. Clone repo and install: \`npm install\`
2. Start dev server: \`npm run dev\`
3. Run tests: \`npm test\`
4. Build for production: \`npm run build\`

## Common Tasks
- Create component: Use ${patterns.components.style} pattern
- Add API call: Check /src/services for examples
- Write tests: Use ${summary.testingFrameworks[0] || 'Jest'}
- Handle state: Use ${patterns.stateManagement[0] || 'useState'}`;
}

function generateComprehensiveContext(analysis: DeepAnalysisResult): string {
  const standard = generateStandardContext(analysis);
  const { recommendations, evidenceFiles, codeQuality } = analysis;
  
  return `${standard}

## Evidence-Based Patterns

### Real Examples from Codebase
${evidenceFiles.slice(0, 5).map(ef => 
  `#### ${ef.path}
- Purpose: ${ef.purpose}
- Patterns: ${ef.patterns.join(', ')}`
).join('\n\n')}

## Code Quality Setup
- TypeScript: ${codeQuality.hasTypeScript ? '✅ Strict mode' : '❌ Not configured'}
- Linting: ${codeQuality.hasLinting ? '✅ ESLint configured' : '❌ Not configured'}
- Prettier: ${codeQuality.hasPrettier ? '✅ Auto-formatting' : '❌ Not configured'}
- Pre-commit: ${codeQuality.hasPreCommitHooks ? '✅ Hooks active' : '❌ Not configured'}

## Architecture Decisions
${generateArchitectureSection(analysis)}

## Performance Patterns
${generatePerformanceSection(analysis)}

## Security Patterns
${generateSecuritySection(analysis)}

## Recommendations
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Testing Strategy
${generateTestingStrategy(analysis)}

## Deployment
${generateDeploymentSection(analysis)}`;
}

function createContextRouter(analysis: DeepAnalysisResult, tiers: ContextTier[]): any {
  return {
    version: '1.0',
    updated: new Date().toISOString(),
    task_mappings: {
      create_component: {
        description: 'Creating new UI components',
        keywords: ['component', 'ui', 'interface', 'render'],
        recommended_contexts: {
          tier1: [{ path: 'minimal-context.md', tokens: 300 }],
          tier2: [{ path: 'patterns/component-patterns.yaml', tokens: 500 }],
          tier3: [{ path: 'standard-context.md', tokens: 1500 }],
        },
        total_tokens: {
          minimal: 300,
          standard: 800,
          comprehensive: 1500,
        },
      },
      add_feature: {
        description: 'Adding new features',
        keywords: ['feature', 'functionality', 'implement', 'add'],
        recommended_contexts: {
          tier1: [{ path: 'standard-context.md', tokens: 1500 }],
          tier2: [{ path: 'PROJECT-TEMPLATE.md', tokens: 2000 }],
          tier3: [{ path: 'comprehensive-context.md', tokens: 3000 }],
        },
        total_tokens: {
          minimal: 1500,
          standard: 3500,
          comprehensive: 3000,
        },
      },
      fix_bug: {
        description: 'Debugging and fixing issues',
        keywords: ['fix', 'bug', 'error', 'issue', 'problem'],
        recommended_contexts: {
          tier1: [{ path: 'minimal-context.md', tokens: 300 }],
          tier2: [{ path: '.context7.yaml', tokens: 1000 }],
          tier3: [{ path: 'standard-context.md', tokens: 1500 }],
        },
        total_tokens: {
          minimal: 300,
          standard: 1300,
          comprehensive: 1500,
        },
      },
      refactor: {
        description: 'Refactoring existing code',
        keywords: ['refactor', 'improve', 'optimize', 'clean'],
        recommended_contexts: {
          tier1: [{ path: 'standard-context.md', tokens: 1500 }],
          tier2: [{ path: 'patterns/*.yaml', tokens: 800 }],
          tier3: [{ path: 'CODEBASE-CONTEXT.md', tokens: 2500 }],
        },
        total_tokens: {
          minimal: 1500,
          standard: 2300,
          comprehensive: 2500,
        },
      },
    },
    default: {
      description: 'General development tasks',
      keywords: [],
      recommended_contexts: {
        tier1: [{ path: 'minimal-context.md', tokens: 300 }],
        tier2: [{ path: 'standard-context.md', tokens: 1500 }],
        tier3: [{ path: 'comprehensive-context.md', tokens: 3000 }],
      },
      total_tokens: {
        minimal: 300,
        standard: 1500,
        comprehensive: 3000,
      },
    },
  };
}

function createUsageTracking(): any {
  return {
    enabled: true,
    tracking: {
      model_costs: {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
      },
      storage: {
        location: '.token-usage',
        format: 'json',
        rotation: 'monthly',
      },
      reporting: {
        frequency: 'weekly',
        metrics: ['total_tokens', 'cost_by_model', 'cost_by_task', 'savings_achieved'],
      },
    },
    alerts: {
      daily_limit: 50000,
      weekly_limit: 300000,
      cost_limit: 100,
    },
  };
}

function generateMetricsReport(tiers: ContextTier[], analysis: DeepAnalysisResult): string {
  const baselineTokens = estimateTokens(getFullContext(analysis));
  
  return `# Token Optimization Report

## Executive Summary
- **Baseline Token Usage**: ${baselineTokens.toLocaleString()} tokens
- **Minimal Tier**: ${tiers.find(t => t.name === 'minimal')?.targetTokens || 300} tokens (${Math.round((300 / baselineTokens) * 100)}% of baseline)
- **Standard Tier**: ${tiers.find(t => t.name === 'standard')?.targetTokens || 1500} tokens (${Math.round((1500 / baselineTokens) * 100)}% of baseline)
- **Comprehensive Tier**: ${tiers.find(t => t.name === 'comprehensive')?.targetTokens || 3000} tokens (${Math.round((3000 / baselineTokens) * 100)}% of baseline)

## Cost Analysis (Monthly Estimate)
Assuming 100 AI interactions per day:

### Without Optimization
- Tokens per interaction: ${baselineTokens}
- Monthly tokens: ${(baselineTokens * 100 * 30).toLocaleString()}
- Estimated cost: $${((baselineTokens * 100 * 30 * 0.003) / 1000).toFixed(2)}

### With Optimization (80% minimal, 15% standard, 5% comprehensive)
- Average tokens per interaction: ${Math.round(300 * 0.8 + 1500 * 0.15 + 3000 * 0.05)}
- Monthly tokens: ${(615 * 100 * 30).toLocaleString()}
- Estimated cost: $${((615 * 100 * 30 * 0.003) / 1000).toFixed(2)}
- **Monthly Savings**: $${(((baselineTokens - 615) * 100 * 30 * 0.003) / 1000).toFixed(2)}

## ROI Calculation
- Implementation time: 30 minutes
- Monthly savings: $${(((baselineTokens - 615) * 100 * 30 * 0.003) / 1000).toFixed(2)}
- Annual savings: $${(((baselineTokens - 615) * 100 * 365 * 0.003) / 1000).toFixed(2)}
- **ROI**: ${Math.round((((baselineTokens - 615) * 100 * 365 * 0.003) / 1000 / 0.5) * 100)}%

## Recommendations
1. Use minimal tier for 80% of tasks (component creation, simple fixes)
2. Use standard tier for feature development
3. Reserve comprehensive tier for architecture decisions
4. Monitor actual usage and adjust tiers as needed
5. Consider creating custom tiers for specific workflows

## Usage Guidelines

### Task-to-Tier Mapping
- **Minimal Tier**: Component creation, simple bug fixes, code formatting
- **Standard Tier**: Feature implementation, API integration, state management
- **Comprehensive Tier**: Architecture changes, performance optimization, security reviews

### Token Budget by Role
- **Junior Developer**: 500 tokens/task average
- **Senior Developer**: 1000 tokens/task average  
- **Architect**: 2000 tokens/task average

Generated: ${new Date().toISOString()}`;
}

// Helper functions
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function getFullContext(analysis: DeepAnalysisResult): string {
  // Simulate full context size
  return JSON.stringify(analysis);
}

function getUsageDescription(tech: string): string {
  const usageMap: Record<string, string> = {
    'TypeScript': 'type safety and better DX',
    'TailwindCSS': 'utility-first styling',
    'Vite': 'fast development and building',
    'Jest': 'unit and integration testing',
    'ESLint': 'code quality enforcement',
    'Prettier': 'code formatting',
  };
  return usageMap[tech] || 'project functionality';
}

function generateComponentExample(patterns: any): string {
  const propsType = patterns.components.propsPattern === 'interface' ? 'interface' : 'type';
  const componentStyle = patterns.components.style;
  
  if (componentStyle === 'React.FC') {
    return `${propsType} ComponentProps {
  title: string;
  onClick?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};`;
  } else if (componentStyle === 'function') {
    return `${propsType} ComponentProps {
  title: string;
  onClick?: () => void;
}

function Component({ title, onClick }: ComponentProps) {
  return <div onClick={onClick}>{title}</div>;
}`;
  } else {
    return `${propsType} ComponentProps {
  title: string;
  onClick?: () => void;
}

const Component = ({ title, onClick }: ComponentProps) => {
  return <div onClick={onClick}>{title}</div>;
};`;
  }
}

function generateArchitectureSection(analysis: DeepAnalysisResult): string {
  return `- Component architecture: ${analysis.patterns.components.style}
- State architecture: ${analysis.patterns.stateManagement.join(', ') || 'Local state'}
- Folder structure: Feature-based organization
- Code splitting: ${analysis.dependencies.production['react-loadable'] ? 'Implemented' : 'Consider adding'}`;
}

function generatePerformanceSection(analysis: DeepAnalysisResult): string {
  return `- Bundler: ${analysis.summary.techStack.includes('Vite') ? 'Vite (optimized)' : 'Webpack'}
- Code splitting: ${analysis.dependencies.production['@loadable/component'] ? 'Active' : 'Not implemented'}
- Image optimization: ${analysis.dependencies.production['next/image'] ? 'Next.js Image' : 'Manual'}
- Caching strategy: Browser caching + Service workers`;
}

function generateSecuritySection(analysis: DeepAnalysisResult): string {
  return `- Authentication: ${analysis.dependencies.production['jsonwebtoken'] ? 'JWT-based' : 'Not implemented'}
- Input validation: ${analysis.dependencies.production['joi'] || analysis.dependencies.production['yup'] ? 'Schema validation' : 'Manual'}
- XSS prevention: React default escaping
- HTTPS: Required for production`;
}

function generateTestingStrategy(analysis: DeepAnalysisResult): string {
  const testFramework = analysis.summary.testingFrameworks[0] || 'None';
  return `- Framework: ${testFramework}
- Coverage target: 80%
- Test types: Unit, Integration, E2E
- CI/CD: ${analysis.dependencies.development['husky'] ? 'Pre-commit hooks' : 'Not configured'}`;
}

function generateDeploymentSection(analysis: DeepAnalysisResult): string {
  if (analysis.summary.frameworks.includes('Next.js')) {
    return '- Platform: Vercel (recommended)\n- Build: `npm run build`\n- Environment: Use .env.local';
  }
  return '- Platform: Any static host\n- Build: `npm run build`\n- Serve: ./dist folder';
}