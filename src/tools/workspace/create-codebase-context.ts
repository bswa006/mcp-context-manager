import { writeFileSync } from 'fs';
import { join } from 'path';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface CodebaseContextConfig {
  projectPath: string;
  analysisId?: string;
  includeExamples?: boolean;
  tokenOptimized?: boolean;
}

interface CodebaseContextResult {
  success: boolean;
  filePath: string;
  message: string;
  tokenCount: number;
}

export async function createCodebaseContext(config: CodebaseContextConfig): Promise<CodebaseContextResult> {
  const result: CodebaseContextResult = {
    success: false,
    filePath: '',
    message: '',
    tokenCount: 0,
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];

    // Generate CODEBASE-CONTEXT.md based on actual analysis
    const context = config.tokenOptimized 
      ? generateOptimizedContext(analysis, config)
      : generateFullContext(analysis, config);
    
    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    result.tokenCount = Math.ceil(context.length / 4);
    
    // Write to file
    const filePath = join(config.projectPath, 'CODEBASE-CONTEXT.md');
    writeFileSync(filePath, context);
    
    result.success = true;
    result.filePath = filePath;
    result.message = `CODEBASE-CONTEXT.md created (${result.tokenCount} tokens) based on ${analysis.summary.totalFiles} files`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to create codebase context: ${error}`;
  }

  return result;
}

function generateOptimizedContext(analysis: DeepAnalysisResult, config: CodebaseContextConfig): string {
  const { patterns, summary, structure } = analysis;
  
  return `# CODEBASE-CONTEXT.md (Optimized)

## Stack
${summary.frameworks.map((f: string) => `- ${f}`).join('\n')}
${summary.techStack.filter((t: string) => !summary.frameworks.includes(t)).map((t: string) => `- ${t}`).join('\n')}

## Patterns
### Components: ${patterns.components.style} + ${patterns.components.propsPattern}
### State: ${patterns.stateManagement.join(', ') || 'local'}
### Styling: ${patterns.styling}
### Testing: ${patterns.testing.framework}

## Structure
${Object.entries(structure.directories)
  .filter(([_, info]: [string, any]) => info.fileCount > 3)
  .slice(0, 8)
  .map(([path, info]: [string, any]) => `/${path}: ${info.purpose}`)
  .join('\n')}

## Rules
- ${patterns.components.style} components only
- ${patterns.components.propsPattern} for props
- ${patterns.imports.style} imports
- ${patterns.styling} for styles
${analysis.codeQuality.hasTypeScript ? '- TypeScript strict mode' : ''}
${analysis.codeQuality.hasLinting ? '- ESLint rules enforced' : ''}

## Common Imports
${patterns.imports.common.slice(0, 5).map((imp: string) => `- ${imp}`).join('\n')}

---
Generated: ${new Date().toISOString()} | Files: ${summary.totalFiles}`;
}

function generateFullContext(analysis: DeepAnalysisResult, config: CodebaseContextConfig): string {
  const { patterns, summary, structure, dependencies, evidenceFiles, recommendations } = analysis;
  
  return `# CODEBASE-CONTEXT.md

## Project Vision
Building a ${summary.frameworks.join(' + ')} application with ${summary.primaryLanguage}

## Tech Stack & Versions (Evidence-Based)
${summary.frameworks.map((f: string) => `- **${f}**: ${dependencies.production[f.toLowerCase()] || 'latest'}`).join('\n')}
${summary.techStack.filter((t: string) => !summary.frameworks.includes(t)).map((t: string) => `- **${t}**: ${dependencies.production[t.toLowerCase()] || dependencies.development[t.toLowerCase()] || 'latest'}`).join('\n')}
${summary.testingFrameworks.map((f: string) => `- **Testing**: ${f}`).join('\n')}

## Naming Conventions (Detected)
- **Components**: ${patterns.naming.components} (e.g., UserProfile, TodoList)
- **Hooks**: ${patterns.naming.hooks} (e.g., useFetchData, useAuthState)
- **Services**: ${patterns.naming.services} (e.g., apiService, authService)
- **Utils**: ${patterns.naming.utils} (e.g., formatDate, parseResponse)

## Code Patterns (From ${summary.totalFiles} Files)

### Component Structure
- **Style**: ${patterns.components.style} components
- **Props**: ${patterns.components.propsPattern} definitions
- **Exports**: ${patterns.components.exportPattern}

${config.includeExamples && evidenceFiles.length > 0 ? `
### Example Component Pattern
\`\`\`typescript
// Based on patterns found in ${evidenceFiles[0].path}
import React from 'react';
${patterns.components.propsPattern === 'interface' ? `
interface ComponentNameProps {
  // Props based on ${patterns.components.propsPattern} pattern
}` : `
type ComponentNameProps = {
  // Props based on ${patterns.components.propsPattern} pattern
}`}

${patterns.components.style === 'React.FC' ? 
`const ComponentName: React.FC<ComponentNameProps> = ({ props }) => {` :
patterns.components.style === 'function' ?
`function ComponentName({ props }: ComponentNameProps) {` :
`const ComponentName = ({ props }: ComponentNameProps) => {`}
  // Implementation
  return <div className="${patterns.styling === 'tailwind' ? 'flex items-center' : ''}">{/* content */}</div>;
${patterns.components.style === 'function' ? '}' : '};'}

${patterns.components.exportPattern === 'default' ? 'export default ComponentName;' : 'export { ComponentName };'}
\`\`\`
` : ''}

### State Management
${patterns.stateManagement.length > 0 
  ? patterns.stateManagement.map((s: string) => `- **${s}**: Primary state solution`).join('\n')
  : '- **Local State**: useState for component state\n- **Props Drilling**: For simple parent-child communication'}

### Import Patterns
- **Style**: ${patterns.imports.style} imports
- **Common Libraries**:
${patterns.imports.common.slice(0, 10).map((imp: string) => `  - ${imp}`).join('\n')}

### Styling Patterns
- **Method**: ${patterns.styling}
${patterns.styling === 'tailwind' ? `- **Classes**: Utility-first with Tailwind
- **Breakpoints**: sm:, md:, lg:, xl:
- **Dark Mode**: dark: prefix for dark mode styles` : ''}
${patterns.styling === 'styled-components' ? `- **Components**: CSS-in-JS with styled-components
- **Theme**: Access theme via props.theme
- **Global Styles**: createGlobalStyle for global CSS` : ''}
${patterns.styling === 'css-modules' ? `- **Scoping**: Local scope with .module.css files
- **Naming**: camelCase for class names
- **Composition**: composes for style inheritance` : ''}

## Implementation Constraints for AI

### NEVER
- Use class components (found ${patterns.components.style} everywhere)
- Mix styling approaches (stick to ${patterns.styling})
- Create files without proper TypeScript types
- Ignore the established import style (${patterns.imports.style})
${!analysis.codeQuality.hasTypeScript ? '- Use TypeScript (project uses JavaScript)' : ''}

### ALWAYS
- Follow ${patterns.components.style} component pattern
- Use ${patterns.components.propsPattern} for prop definitions
- Apply ${patterns.styling} for all styling
- ${patterns.components.exportPattern} export components
- Handle loading/error/empty states
${analysis.codeQuality.hasTypeScript ? '- Use strict TypeScript types' : ''}
${analysis.codeQuality.hasLinting ? '- Follow ESLint rules' : ''}
${analysis.codeQuality.hasPrettier ? '- Format with Prettier' : ''}

## Directory Structure & Purpose
${Object.entries(structure.directories)
  .filter(([_, info]: [string, any]) => info.fileCount > 0)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, info]: [string, any]) => `- **/${path}**: ${info.purpose} (${info.fileCount} files, mainly ${info.primaryFileType})`)
  .join('\n')}

## Testing Strategy
- **Framework**: ${patterns.testing.framework || 'Not detected'}
- **Pattern**: ${patterns.testing.pattern}
- **Coverage**: ${patterns.testing.coverage ? 'Enabled' : 'Not configured'}
${summary.testingFrameworks.includes('React Testing Library') ? '- **Component Testing**: React Testing Library for UI tests' : ''}

## Performance Considerations
${dependencies.production['react-memo'] ? '- React.memo for expensive components' : ''}
${dependencies.production['react-lazy'] ? '- Code splitting with React.lazy' : ''}
${summary.techStack.includes('Vite') ? '- Vite for fast HMR and optimized builds' : ''}
${summary.techStack.includes('Next.js') ? '- Next.js automatic code splitting\n- Image optimization with next/image\n- API routes for backend' : ''}

## Key Dependencies to Know
${Object.entries(dependencies.production)
  .filter(([key]) => !['react', 'react-dom'].includes(key))
  .slice(0, 15)
  .map(([key, version]) => `- **${key}**: ${version}`)
  .join('\n')}

## Evidence Files (Real Examples)
${evidenceFiles.slice(0, 10).map((ef: any) => 
  `- **${ef.path}**: ${ef.purpose}\n  Demonstrates: ${ef.patterns.join(', ')}`
).join('\n\n')}

## AI Agent Recommendations
${recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

---

**Generated**: ${new Date().toISOString()}  
**Based on**: ${summary.totalFiles} files analyzed, ${summary.totalLines.toLocaleString()} lines of code  
**Analysis ID**: ${analysis.analysisId}
`;
}