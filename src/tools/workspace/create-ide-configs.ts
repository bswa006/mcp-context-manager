import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface IDEConfigConfig {
  projectPath: string;
  analysisId?: string;
  ide: 'cursor' | 'vscode' | 'intellij' | 'all';
  autoLoadContext?: boolean;
  customRules?: string[];
  includeDebugConfigs?: boolean;
}

interface IDEConfigResult {
  success: boolean;
  filesCreated: string[];
  message: string;
  recommendations: string[];
}

export async function createIDEConfigs(
  config: IDEConfigConfig
): Promise<IDEConfigResult> {
  const result: IDEConfigResult = {
    success: false,
    filesCreated: [],
    message: '',
    recommendations: [],
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];
    const ides = config.ide === 'all' ? ['cursor', 'vscode', 'intellij'] : [config.ide];
    
    for (const ide of ides) {
      switch (ide) {
        case 'cursor':
          await createCursorConfig(config, analysis, result);
          break;
        case 'vscode':
          await createVSCodeConfig(config, analysis, result);
          break;
        case 'intellij':
          await createIntelliJConfig(config, analysis, result);
          break;
      }
    }
    
    // Add general recommendations
    result.recommendations = generateIDERecommendations(analysis, config);
    
    result.success = true;
    result.message = `Created IDE configurations for ${ides.join(', ')}. ${config.autoLoadContext ? 'Auto-loading enabled.' : 'Manual loading required.'}`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to create IDE configs: ${error}`;
  }

  return result;
}

async function createCursorConfig(
  config: IDEConfigConfig,
  analysis: DeepAnalysisResult,
  result: IDEConfigResult
): Promise<void> {
  // Create .cursorrules file
  const cursorRules = generateCursorRules(analysis, config);
  const cursorRulesPath = join(config.projectPath, '.cursorrules');
  writeFileSync(cursorRulesPath, cursorRules);
  result.filesCreated.push(cursorRulesPath);
  
  // Create .cursor directory if needed
  const cursorDir = join(config.projectPath, '.cursor');
  if (!existsSync(cursorDir)) {
    mkdirSync(cursorDir, { recursive: true });
  }
  
  // Create composer template
  const composerTemplate = generateCursorComposerTemplate(analysis);
  const composerPath = join(cursorDir, 'composer-template.md');
  writeFileSync(composerPath, composerTemplate);
  result.filesCreated.push(composerPath);
  
  // Create chat template
  const chatTemplate = generateCursorChatTemplate(analysis);
  const chatPath = join(cursorDir, 'chat-template.md');
  writeFileSync(chatPath, chatTemplate);
  result.filesCreated.push(chatPath);
  
  // Create settings.json for Cursor
  const cursorSettings = generateCursorSettings(analysis, config);
  const settingsPath = join(cursorDir, 'settings.json');
  writeFileSync(settingsPath, JSON.stringify(cursorSettings, null, 2));
  result.filesCreated.push(settingsPath);
}

async function createVSCodeConfig(
  config: IDEConfigConfig,
  analysis: DeepAnalysisResult,
  result: IDEConfigResult
): Promise<void> {
  // Create .vscode directory
  const vscodeDir = join(config.projectPath, '.vscode');
  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true });
  }
  
  // Create settings.json
  const settings = generateVSCodeSettings(analysis, config);
  const settingsPath = join(vscodeDir, 'settings.json');
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  result.filesCreated.push(settingsPath);
  
  // Create extensions.json
  const extensions = generateVSCodeExtensions(analysis);
  const extensionsPath = join(vscodeDir, 'extensions.json');
  writeFileSync(extensionsPath, JSON.stringify(extensions, null, 2));
  result.filesCreated.push(extensionsPath);
  
  // Create launch.json if debug configs requested
  if (config.includeDebugConfigs) {
    const launch = generateVSCodeLaunch(analysis);
    const launchPath = join(vscodeDir, 'launch.json');
    writeFileSync(launchPath, JSON.stringify(launch, null, 2));
    result.filesCreated.push(launchPath);
  }
  
  // Create tasks.json
  const tasks = generateVSCodeTasks(analysis);
  const tasksPath = join(vscodeDir, 'tasks.json');
  writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  result.filesCreated.push(tasksPath);
}

async function createIntelliJConfig(
  config: IDEConfigConfig,
  analysis: DeepAnalysisResult,
  result: IDEConfigResult
): Promise<void> {
  // Create .idea directory
  const ideaDir = join(config.projectPath, '.idea');
  if (!existsSync(ideaDir)) {
    mkdirSync(ideaDir, { recursive: true });
  }
  
  // Create context.xml for AI assistant
  const contextXml = generateIntelliJContext(analysis, config);
  const contextPath = join(ideaDir, 'ai-context.xml');
  writeFileSync(contextPath, contextXml);
  result.filesCreated.push(contextPath);
  
  // Create code style settings
  const codeStyle = generateIntelliJCodeStyle(analysis);
  const codeStylePath = join(ideaDir, 'codeStyleSettings.xml');
  writeFileSync(codeStylePath, codeStyle);
  result.filesCreated.push(codeStylePath);
}

function generateCursorRules(analysis: DeepAnalysisResult, config: IDEConfigConfig): string {
  const { patterns, summary, codeQuality, recommendations } = analysis;
  const customRules = config.customRules || [];
  
  return `# Cursor Rules for ${analysis.projectPath.split('/').pop()}

## Auto-Load Context Files
${config.autoLoadContext ? `ALWAYS load these files at conversation start:
- agent-context/CODEBASE-CONTEXT.md
- agent-context/conversation-starters.md
- agent-context/minimal-context.md (for quick tasks)` : 'Manual context loading required.'}

## Project Configuration
- **Language**: ${summary.primaryLanguage}
- **Frameworks**: ${summary.frameworks.join(', ')}
- **Testing**: ${summary.testingFrameworks.join(', ') || 'Not configured'}

## Code Style Rules
1. **Components**: Always use ${patterns.components.style} style
2. **Props**: Define with ${patterns.components.propsPattern}
3. **Imports**: Use ${patterns.imports.style} imports
4. **State**: Prefer ${patterns.stateManagement[0] || 'local state'}
5. **Styling**: Apply ${patterns.styling} patterns

## File Naming Conventions
${generateNamingConventions(patterns.naming)}

## Import Order
1. External dependencies
2. Internal aliases/paths
3. Relative imports
4. Style imports

## Component Structure
\`\`\`typescript
${generateComponentTemplate(patterns)}
\`\`\`

## Testing Requirements
- Framework: ${summary.testingFrameworks[0] || 'Configure testing first'}
- Coverage: Minimum 80%
- Pattern: One test file per component/module

## Performance Guidelines
${generatePerformanceGuidelines(analysis)}

## Security Requirements
${generateSecurityRequirements(analysis)}

## DO NOT
- Use \`any\` type in TypeScript
- Create class components
- Use inline styles (use ${patterns.styling})
- Commit sensitive data
- Skip error handling
- Ignore accessibility

## ALWAYS
- Handle loading states
- Handle error states  
- Handle empty states
- Validate props with TypeScript
- Add appropriate ARIA labels
- Write tests for new features

## Git Commit Format
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

Types: feat, fix, docs, style, refactor, test, chore

${customRules.length > 0 ? `\n## Custom Rules\n${customRules.map(rule => `- ${rule}`).join('\n')}` : ''}

## AI Behavior
- Read context files before suggesting code
- Follow existing patterns in the codebase
- Ask for clarification on ambiguous requests
- Suggest tests with new features
- Provide migration guides for breaking changes

## Quick Commands
- "Load context" - Load all context files
- "Quick task" - Load minimal context only
- "Full context" - Load comprehensive documentation

---
Generated: ${new Date().toISOString()}
Based on analysis of ${summary.totalFiles} files`;
}

function generateCursorComposerTemplate(analysis: DeepAnalysisResult): string {
  return `# Cursor Composer Template

## Quick Start Prompts

### Create Component
\`\`\`
Create a new ${analysis.patterns.components.style} component called [ComponentName] that:
- Uses ${analysis.patterns.components.propsPattern} for props
- Follows our ${analysis.patterns.styling} styling patterns
- Includes proper TypeScript types
- Has loading, error, and empty states
\`\`\`

### Add Feature
\`\`\`
Add a [feature description] that:
- Integrates with existing [system/component]
- Uses ${analysis.patterns.stateManagement[0] || 'local state'} for state management
- Follows our established patterns
- Includes tests
\`\`\`

### Fix Bug
\`\`\`
Fix the [issue description]:
- Check [relevant files]
- Ensure no regression
- Add test to prevent recurrence
- Update documentation if needed
\`\`\`

### Refactor Code
\`\`\`
Refactor [component/module] to:
- Improve performance/readability
- Follow current best practices
- Maintain backward compatibility
- Update tests accordingly
\`\`\`

## Context Loading Commands

### Minimal Context (Quick Tasks)
\`\`\`
@agent-context/minimal-context.md
\`\`\`

### Standard Context (Feature Work)
\`\`\`
@agent-context/standard-context.md
@agent-context/conversation-starters.md
\`\`\`

### Full Context (Architecture)
\`\`\`
@agent-context/CODEBASE-CONTEXT.md
@agent-context/PROJECT-TEMPLATE.md
@agent-context/.context7.yaml
\`\`\``;
}

function generateCursorChatTemplate(analysis: DeepAnalysisResult): string {
  return `# Cursor Chat Template

## Starting a Conversation

### First Message Template
\`\`\`
I'm working on ${analysis.projectPath.split('/').pop()}, a ${analysis.summary.frameworks.join(' + ')} project.

Current task: [describe your task]

Please load the appropriate context files first.
\`\`\`

## Common Requests

### Component Creation
"Create a new component that [description] using our established patterns"

### API Integration  
"Add an API endpoint for [feature] following our service patterns"

### Test Writing
"Write comprehensive tests for [component/feature] using ${analysis.summary.testingFrameworks[0] || 'our test framework'}"

### Performance Optimization
"Optimize [component/feature] for better performance"

### Bug Investigation
"Help me debug [issue description] in [file/component]"

## Context References

Always reference specific files:
- Components: ${analysis.evidenceFiles.find(ef => ef.purpose.includes('Component'))?.path || 'src/components/'}
- Services: ${analysis.evidenceFiles.find(ef => ef.purpose.includes('Service'))?.path || 'src/services/'}
- Types: ${analysis.evidenceFiles.find(ef => ef.purpose.includes('Type'))?.path || 'src/types/'}
- Tests: ${analysis.evidenceFiles.find(ef => ef.purpose.includes('Test'))?.path || 'src/__tests__/'}`;
}

function generateCursorSettings(analysis: DeepAnalysisResult, config: IDEConfigConfig): any {
  return {
    "cursor.chat.defaultContext": config.autoLoadContext ? [
      "agent-context/CODEBASE-CONTEXT.md",
      "agent-context/conversation-starters.md"
    ] : [],
    "cursor.chat.showSuggestedFiles": true,
    "cursor.cpp.enableContextualCodeActions": true,
    "cursor.aiProvider": "anthropic",
    "cursor.aiModel": "claude-3-opus",
    "cursor.contextLines": 50,
    "cursor.maxTokens": 4000,
    "cursor.temperature": 0.7,
    "cursor.includeComments": true,
    "cursor.includeDiagnostics": true,
  };
}

function generateVSCodeSettings(analysis: DeepAnalysisResult, config: IDEConfigConfig): any {
  const settings: any = {
    // Editor settings
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
      "source.organizeImports": true
    },
    "editor.defaultFormatter": analysis.codeQuality.hasPrettier ? "esbenp.prettier-vscode" : undefined,
    
    // Language-specific settings
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    
    // TypeScript settings
    "typescript.updateImportsOnFileMove.enabled": "always",
    "typescript.preferences.importModuleSpecifier": "relative",
    
    // ESLint settings
    "eslint.enable": analysis.codeQuality.hasLinting,
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact"
    ],
    
    // Files to exclude
    "files.exclude": {
      "**/node_modules": true,
      "**/.git": true,
      "**/dist": true,
      "**/build": true,
      "**/.next": analysis.summary.frameworks.includes('Next.js'),
    },
    
    // Search exclude
    "search.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true,
      "**/.next": true,
      "**/coverage": true,
    }
  };
  
  // Add GitHub Copilot settings if requested
  if (config.autoLoadContext) {
    settings["github.copilot.enable"] = {
      "*": true,
      "yaml": true,
      "plaintext": true,
      "markdown": true
    };
  }
  
  return settings;
}

function generateVSCodeExtensions(analysis: DeepAnalysisResult): any {
  const recommendations = [
    // Essential
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    
    // Framework specific
    ...(analysis.summary.frameworks.includes('React') ? [
      "dsznajder.es7-react-js-snippets",
      "burkeholland.simple-react-snippets"
    ] : []),
    
    ...(analysis.summary.frameworks.includes('Next.js') ? [
      "foxundermoon.next-js"
    ] : []),
    
    // Testing
    ...(analysis.summary.testingFrameworks.includes('Jest') ? [
      "Orta.vscode-jest",
      "firsttris.vscode-jest-runner"
    ] : []),
    
    // Styling
    ...(analysis.patterns.styling === 'tailwind' ? [
      "bradlc.vscode-tailwindcss"
    ] : []),
    
    ...(analysis.patterns.styling === 'styled-components' ? [
      "styled-components.vscode-styled-components"
    ] : []),
    
    // Git
    "eamodio.gitlens",
    "mhutchie.git-graph",
    
    // AI
    "github.copilot",
    "github.copilot-chat",
    
    // Utilities
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "naumovs.color-highlight",
    "wayou.vscode-todo-highlight"
  ];
  
  return { recommendations };
}

function generateVSCodeLaunch(analysis: DeepAnalysisResult): any {
  const configs = [];
  
  // Node.js debugging
  if (analysis.summary.frameworks.includes('Express') || analysis.summary.frameworks.includes('NestJS')) {
    configs.push({
      type: "node",
      request: "launch",
      name: "Debug Server",
      skipFiles: ["<node_internals>/**"],
      program: "${workspaceFolder}/src/index.js",
      envFile: "${workspaceFolder}/.env",
      outFiles: ["${workspaceFolder}/dist/**/*.js"]
    });
  }
  
  // React/Next.js debugging
  if (analysis.summary.frameworks.includes('React') || analysis.summary.frameworks.includes('Next.js')) {
    configs.push({
      type: "chrome",
      request: "launch",
      name: "Debug Client",
      url: "http://localhost:3000",
      webRoot: "${workspaceFolder}",
      sourceMaps: true
    });
  }
  
  // Jest debugging
  if (analysis.summary.testingFrameworks.includes('Jest')) {
    configs.push({
      type: "node",
      request: "launch",
      name: "Debug Jest Tests",
      program: "${workspaceFolder}/node_modules/.bin/jest",
      args: ["--runInBand", "--no-coverage"],
      console: "integratedTerminal",
      internalConsoleOptions: "neverOpen"
    });
  }
  
  return {
    version: "0.2.0",
    configurations: configs
  };
}

function generateVSCodeTasks(analysis: DeepAnalysisResult): any {
  const tasks: any[] = [
    {
      label: "npm: install",
      type: "npm",
      script: "install",
      problemMatcher: []
    },
    {
      label: "npm: build",
      type: "npm",
      script: "build",
      group: {
        kind: "build",
        isDefault: true
      },
      problemMatcher: "$tsc"
    },
    {
      label: "npm: dev",
      type: "npm",
      script: "dev",
      isBackground: true,
      problemMatcher: []
    }
  ];
  
  // Add test task if testing is configured
  if (analysis.summary.testingFrameworks.length > 0) {
    tasks.push({
      label: "npm: test",
      type: "npm",
      script: "test",
      group: {
        kind: "test",
        isDefault: true
      },
      problemMatcher: []
    });
  }
  
  return {
    version: "2.0.0",
    tasks
  };
}

function generateIntelliJContext(analysis: DeepAnalysisResult, config: IDEConfigConfig): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="AIAssistantContext">
    <option name="contextFiles">
      <list>
        ${config.autoLoadContext ? `
        <option value="$PROJECT_DIR$/agent-context/CODEBASE-CONTEXT.md" />
        <option value="$PROJECT_DIR$/agent-context/conversation-starters.md" />
        <option value="$PROJECT_DIR$/agent-context/minimal-context.md" />
        ` : ''}
      </list>
    </option>
    <option name="projectDescription" value="${analysis.projectPath.split('/').pop()} - ${analysis.summary.frameworks.join(', ')} project" />
    <option name="techStack">
      <list>
        ${analysis.summary.techStack.map(tech => `<option value="${tech}" />`).join('\n        ')}
      </list>
    </option>
    <option name="codePatterns">
      <map>
        <entry key="componentStyle" value="${analysis.patterns.components.style}" />
        <entry key="stateManagement" value="${analysis.patterns.stateManagement[0] || 'local'}" />
        <entry key="styling" value="${analysis.patterns.styling}" />
        <entry key="testing" value="${analysis.summary.testingFrameworks[0] || 'none'}" />
      </map>
    </option>
  </component>
</project>`;
}

function generateIntelliJCodeStyle(analysis: DeepAnalysisResult): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="CodeStyleSettingsManager">
    <option name="PER_PROJECT_SETTINGS">
      <value>
        <TypeScriptCodeStyleSettings>
          <option name="USE_SEMICOLON_AFTER_STATEMENT" value="true" />
          <option name="FORCE_SEMICOLON_STYLE" value="true" />
          <option name="USE_DOUBLE_QUOTES" value="${analysis.patterns.imports.common.some(i => i.includes('"')) ? 'true' : 'false'}" />
          <option name="FORCE_QUOTE_STYLE" value="true" />
          <option name="IMPORT_SORT_MODULE_NAME_ORDER" value="ES6_IMPORT_ORDER" />
          <option name="IMPORT_PREFER_ABSOLUTE_PATH" value="false" />
        </TypeScriptCodeStyleSettings>
        <codeStyleSettings language="TypeScript">
          <option name="RIGHT_MARGIN" value="100" />
          <option name="KEEP_FIRST_COLUMN_COMMENT" value="false" />
          <option name="ALIGN_MULTILINE_PARAMETERS" value="true" />
          <option name="ALIGN_MULTILINE_FOR" value="true" />
          <option name="SPACE_BEFORE_METHOD_PARENTHESES" value="false" />
          <option name="CALL_PARAMETERS_WRAP" value="1" />
          <option name="METHOD_PARAMETERS_WRAP" value="1" />
          <option name="EXTENDS_KEYWORD_WRAP" value="1" />
          <option name="METHOD_CALL_CHAIN_WRAP" value="1" />
          <option name="BINARY_OPERATION_WRAP" value="1" />
          <option name="TERNARY_OPERATION_WRAP" value="1" />
          <option name="ARRAY_INITIALIZER_WRAP" value="1" />
        </codeStyleSettings>
      </value>
    </option>
    <option name="USE_PER_PROJECT_SETTINGS" value="true" />
  </component>
</project>`;
}

// Helper functions
function generateNamingConventions(naming: any): string {
  return `- Components: ${naming.components} (e.g., UserProfile.tsx)
- Hooks: ${naming.hooks} (e.g., useAuth.ts)
- Services: ${naming.services} (e.g., apiService.ts)
- Utils: ${naming.utils} (e.g., formatters.ts)
- Types: PascalCase (e.g., UserType.ts)
- Constants: UPPER_SNAKE_CASE (e.g., API_ENDPOINTS.ts)`;
}

function generateComponentTemplate(patterns: any): string {
  const propsPattern = patterns.components.propsPattern;
  const componentStyle = patterns.components.style;
  
  if (componentStyle === 'React.FC') {
    return `import React from 'react';

${propsPattern} ComponentNameProps {
  // props
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // destructured props
}) => {
  // hooks
  
  // handlers
  
  // render
  return (
    <div>
      {/* content */}
    </div>
  );
};`;
  }
  
  return `import React from 'react';

${propsPattern} ComponentNameProps {
  // props
}

export function ComponentName({
  // destructured props
}: ComponentNameProps) {
  // hooks
  
  // handlers
  
  // render
  return (
    <div>
      {/* content */}
    </div>
  );
}`;
}

function generatePerformanceGuidelines(analysis: DeepAnalysisResult): string {
  const guidelines = [];
  
  if (analysis.summary.frameworks.includes('React')) {
    guidelines.push('- Use React.memo for expensive components');
    guidelines.push('- Implement code splitting with lazy()');
    guidelines.push('- Optimize re-renders with useMemo/useCallback');
  }
  
  if (analysis.patterns.styling === 'tailwind') {
    guidelines.push('- Purge unused Tailwind classes in production');
  }
  
  if (analysis.summary.techStack.includes('Vite')) {
    guidelines.push('- Leverage Vite\'s built-in optimizations');
  }
  
  guidelines.push('- Monitor bundle size regularly');
  guidelines.push('- Implement lazy loading for images');
  
  return guidelines.join('\n');
}

function generateSecurityRequirements(analysis: DeepAnalysisResult): string {
  const requirements = [
    '- Never expose API keys in code',
    '- Validate all user inputs',
    '- Sanitize data before rendering',
    '- Use HTTPS in production',
    '- Implement proper authentication',
  ];
  
  if (analysis.dependencies.production['jsonwebtoken']) {
    requirements.push('- Secure JWT token storage');
  }
  
  if (analysis.summary.frameworks.includes('Next.js')) {
    requirements.push('- Use Next.js API route protection');
  }
  
  return requirements.join('\n');
}

function generateIDERecommendations(analysis: DeepAnalysisResult, config: IDEConfigConfig): string[] {
  const recommendations = [];
  
  if (config.autoLoadContext) {
    recommendations.push('Enable auto-loading of context files for faster development');
  } else {
    recommendations.push('Consider enabling auto-loading of context files');
  }
  
  if (!analysis.codeQuality.hasLinting) {
    recommendations.push('Set up ESLint for consistent code quality');
  }
  
  if (!analysis.codeQuality.hasPrettier) {
    recommendations.push('Add Prettier for automatic code formatting');
  }
  
  if (analysis.summary.testingFrameworks.length === 0) {
    recommendations.push('Configure a testing framework for better code quality');
  }
  
  recommendations.push('Review and customize the generated IDE settings');
  recommendations.push('Share IDE configs with your team via version control');
  
  return recommendations;
}