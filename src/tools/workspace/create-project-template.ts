import { writeFileSync } from 'fs';
import { join } from 'path';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface ProjectTemplateConfig {
  projectPath: string;
  analysisId?: string;
  projectName?: string;
  description?: string;
}

interface ProjectTemplateResult {
  success: boolean;
  filePath: string;
  message: string;
  analysisUsed: boolean;
}

export async function createProjectTemplate(config: ProjectTemplateConfig): Promise<ProjectTemplateResult> {
  const result: ProjectTemplateResult = {
    success: false,
    filePath: '',
    message: '',
    analysisUsed: false,
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];
    result.analysisUsed = true;

    // Generate PROJECT-TEMPLATE.md based on actual analysis
    const template = generateProjectTemplate(analysis, config);
    
    // Write to file
    const filePath = join(config.projectPath, 'PROJECT-TEMPLATE.md');
    writeFileSync(filePath, template);
    
    result.success = true;
    result.filePath = filePath;
    result.message = `PROJECT-TEMPLATE.md created successfully based on analysis of ${analysis.summary.totalFiles} files`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to create project template: ${error}`;
  }

  return result;
}

function generateProjectTemplate(analysis: DeepAnalysisResult, config: ProjectTemplateConfig): string {
  const { summary, structure, patterns, dependencies } = analysis;
  const projectName = config.projectName || analysis.projectPath.split('/').pop() || 'Project';
  const description = config.description || `${summary.frameworks.join(' + ')} application`;

  return `# PROJECT-TEMPLATE.md

## 🎯 Project: ${projectName}
${description}

## 📊 Quick Stats
- **Files Analyzed**: ${summary.totalFiles}
- **Total Lines**: ${summary.totalLines.toLocaleString()}
- **Primary Language**: ${summary.primaryLanguage}
- **Tech Stack**: ${summary.techStack.join(', ')}

## 🏗️ Architecture Overview

### Tech Stack (Detected)
${summary.frameworks.map((f: string) => `- **Framework**: ${f} ${dependencies.production[f.toLowerCase()] || ''}`).join('\n')}
${summary.testingFrameworks.map((f: string) => `- **Testing**: ${f}`).join('\n')}
${summary.techStack.filter((t: string) => !summary.frameworks.includes(t)).map((t: string) => `- **${t}**: ${dependencies.production[t.toLowerCase()] || dependencies.development[t.toLowerCase()] || 'latest'}`).join('\n')}

### Directory Structure
\`\`\`
${generateDirectoryTree(structure)}
\`\`\`

### Directory Purposes
${Object.entries(structure.directories)
  .filter(([_, info]: [string, any]) => info.fileCount > 0)
  .map(([path, info]: [string, any]) => `- **/${path}**: ${info.purpose} (${info.fileCount} files)`)
  .join('\n')}

## 🎨 Code Patterns (Evidence-Based)

### Component Patterns
- **Style**: ${patterns.components.style} components
- **Props**: ${patterns.components.propsPattern} definitions
- **Exports**: ${patterns.components.exportPattern} exports

### State Management
${patterns.stateManagement.length > 0 
  ? patterns.stateManagement.map((s: string) => `- ${s}`).join('\n')
  : '- Local state with useState (no global state management detected)'}

### Styling Approach
- **Method**: ${patterns.styling}
${patterns.styling === 'tailwind' ? '- Utility-first CSS with Tailwind classes' : ''}
${patterns.styling === 'styled-components' ? '- CSS-in-JS with styled-components' : ''}
${patterns.styling === 'css-modules' ? '- Scoped styles with CSS modules' : ''}

### Import Conventions
- **Style**: ${patterns.imports.style} imports preferred
- **Common Dependencies**:
${patterns.imports.common.slice(0, 5).map((imp: string) => `  - ${imp}`).join('\n')}

## 📦 Dependencies

### Core Dependencies
\`\`\`json
${JSON.stringify(
  Object.entries(dependencies.production)
    .slice(0, 10)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
  null,
  2
)}
\`\`\`

### Development Dependencies
\`\`\`json
${JSON.stringify(
  Object.entries(dependencies.development)
    .filter(([k]) => ['typescript', 'eslint', 'prettier', 'jest', 'vitest'].includes(k))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
  null,
  2
)}
\`\`\`

## 🔍 Code Quality Setup
- TypeScript: ${analysis.codeQuality.hasTypeScript ? '✅ Configured' : '❌ Not found'}
- ESLint: ${analysis.codeQuality.hasLinting ? '✅ Configured' : '❌ Not found'}
- Prettier: ${analysis.codeQuality.hasPrettier ? '✅ Configured' : '❌ Not found'}
- Pre-commit Hooks: ${analysis.codeQuality.hasPreCommitHooks ? '✅ Configured' : '❌ Not found'}

## 📋 AI Agent Instructions

### Based on Codebase Analysis:
1. **Component Creation**: Use ${patterns.components.style} components with ${patterns.components.propsPattern} for props
2. **State Management**: ${patterns.stateManagement.length > 0 ? `Leverage existing ${patterns.stateManagement[0]}` : 'Use local state with useState'}
3. **Styling**: Apply ${patterns.styling} patterns consistently
4. **Testing**: ${summary.testingFrameworks.length > 0 ? `Write tests using ${summary.testingFrameworks[0]}` : 'No testing framework detected - suggest adding one'}
5. **Imports**: Follow ${patterns.imports.style} import style

### Detected Patterns to Follow:
${analysis.evidenceFiles.slice(0, 5).map((ef: any) => 
  `- **${ef.path}**: ${ef.purpose} (demonstrates ${ef.patterns.join(', ')})`
).join('\n')}

## 🚀 Recommendations

${analysis.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

## 📄 Key Files to Review

${analysis.evidenceFiles.slice(0, 10).map((ef: any) => `- \`${ef.path}\` - ${ef.purpose}`).join('\n')}

---

**Generated**: ${new Date().toISOString()}  
**Analysis ID**: ${analysis.analysisId}  
**Based on**: ${summary.totalFiles} files, ${summary.totalLines.toLocaleString()} lines of code
`;
}

function generateDirectoryTree(structure: any): string {
  const lines: string[] = ['project/'];
  
  // Add root files
  structure.rootFiles.slice(0, 5).forEach((file: string) => {
    lines.push(`├── ${file}`);
  });
  if (structure.rootFiles.length > 5) {
    lines.push(`├── ... (${structure.rootFiles.length - 5} more files)`);
  }
  
  // Add directories
  const dirs = Object.entries(structure.directories)
    .filter(([_, info]: [string, any]) => info.fileCount > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  
  dirs.forEach(([path, info]: [string, any], index) => {
    const isLast = index === dirs.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const parts = path.split('/');
    const indent = '    '.repeat(parts.length - 1);
    
    lines.push(`${indent}${prefix}${parts[parts.length - 1]}/ (${info.fileCount} files, ${info.purpose})`);
  });
  
  return lines.join('\n');
}