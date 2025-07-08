import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface WorkspaceConfig {
  projectPath: string;
  projectName: string;
  techStack?: {
    language?: string;
    framework?: string;
    uiLibrary?: string;
    testFramework?: string;
  };
}

interface InitializationResult {
  success: boolean;
  filesCreated: string[];
  configuration: {
    templatePath: string;
    contextPath: string;
    memoryPath: string;
    context7Path: string;
  };
  nextSteps: string[];
  message: string;
}

export async function initializeAgentWorkspace(
  config: WorkspaceConfig
): Promise<InitializationResult> {
  const result: InitializationResult = {
    success: false,
    filesCreated: [],
    configuration: {
      templatePath: '',
      contextPath: '',
      memoryPath: '',
      context7Path: '',
    },
    nextSteps: [],
    message: '',
  };

  try {
    // Ensure project directory exists
    if (!existsSync(config.projectPath)) {
      mkdirSync(config.projectPath, { recursive: true });
    }

    // Define file paths
    const templatePath = join(config.projectPath, 'AGENT-CODING-TEMPLATE.md');
    const contextPath = join(config.projectPath, 'AGENT-CONTEXT.md');
    const memoryPath = join(config.projectPath, 'AGENT-MEMORY.md');
    const context7Path = join(config.projectPath, '.context7.yaml');
    const codebaseContextPath = join(config.projectPath, 'CODEBASE-CONTEXT.md');

    // Copy and customize AGENT-CODING-TEMPLATE.md
    if (!existsSync(templatePath)) {
      const templateContent = readFileSync(
        join(__dirname, '../../../AGENT-CODING-TEMPLATE.md'),
        'utf-8'
      );
      const customizedTemplate = customizeTemplate(templateContent, config);
      writeFileSync(templatePath, customizedTemplate);
      result.filesCreated.push('AGENT-CODING-TEMPLATE.md');
    }

    // Copy and customize AGENT-CONTEXT.md
    if (!existsSync(contextPath)) {
      const contextContent = readFileSync(
        join(__dirname, '../../../AGENT-CONTEXT.md'),
        'utf-8'
      );
      const customizedContext = initializeContext(contextContent, config);
      writeFileSync(contextPath, customizedContext);
      result.filesCreated.push('AGENT-CONTEXT.md');
    }

    // Copy AGENT-MEMORY.md
    if (!existsSync(memoryPath)) {
      const memoryContent = readFileSync(
        join(__dirname, '../../../AGENT-MEMORY.md'),
        'utf-8'
      );
      writeFileSync(memoryPath, memoryContent);
      result.filesCreated.push('AGENT-MEMORY.md');
    }

    // Copy and customize .context7.yaml
    if (!existsSync(context7Path)) {
      const context7Content = readFileSync(
        join(__dirname, '../../../.context7.yaml'),
        'utf-8'
      );
      const customizedContext7 = customizeContext7(context7Content, config);
      writeFileSync(context7Path, customizedContext7);
      result.filesCreated.push('.context7.yaml');
    }

    // Create initial CODEBASE-CONTEXT.md if it doesn't exist
    if (!existsSync(codebaseContextPath)) {
      const codebaseContext = generateInitialCodebaseContext(config);
      writeFileSync(codebaseContextPath, codebaseContext);
      result.filesCreated.push('CODEBASE-CONTEXT.md');
    }

    // Set configuration paths
    result.configuration = {
      templatePath,
      contextPath,
      memoryPath,
      context7Path,
    };

    // Define next steps
    result.nextSteps = [
      '1. Review AGENT-CODING-TEMPLATE.md for your mission briefing',
      '2. Check CODEBASE-CONTEXT.md and customize for your project',
      '3. Update .context7.yaml with your specific library versions',
      '4. Start development with pre-flight checklist from template',
      '5. Use tracking tools to monitor performance',
    ];

    result.success = true;
    result.message = `Workspace initialized successfully for ${config.projectName}. Agent memory system is now active!`;

  } catch (error) {
    result.success = false;
    result.message = `Failed to initialize workspace: ${error}`;
  }

  return result;
}

function customizeTemplate(template: string, config: WorkspaceConfig): string {
  const now = new Date().toISOString();
  
  return template
    .replace(/\[PROJECT_NAME\]/g, config.projectName)
    .replace(/\[PROJECT_PATH\]/g, config.projectPath)
    .replace(/\[DETECTED_LANGUAGE\]/g, config.techStack?.language || 'typescript')
    .replace(/\[DETECTED_FRAMEWORK\]/g, config.techStack?.framework || 'react')
    .replace(/\[DETECTED_UI_LIBRARY\]/g, config.techStack?.uiLibrary || 'tailwindcss')
    .replace(/\[DETECTED_TEST_FRAMEWORK\]/g, config.techStack?.testFramework || 'jest')
    .replace(/\[AUTO_UPDATE\]/g, now)
    .replace(/\[TIMESTAMP\]/g, now);
}

function initializeContext(context: string, config: WorkspaceConfig): string {
  const now = new Date().toISOString();
  const sessionId = `SESSION_${Date.now()}`;
  
  return context
    .replace(/\[SESSION_ID\]/g, sessionId)
    .replace(/\[TIMESTAMP\]/g, now)
    .replace(/\[AUTO_UPDATE\]/g, now);
}

function customizeContext7(context7: string, config: WorkspaceConfig): string {
  // Adjust library priorities based on tech stack
  if (config.techStack?.framework === 'nextjs') {
    context7 = context7.replace(
      'priority: high\n\n  # Next.js',
      'priority: critical\n\n  # Next.js'
    );
  }
  
  if (config.techStack?.uiLibrary === 'mui') {
    context7 = context7.replace(
      'priority: low\n\n  # State Management',
      'priority: high\n\n  # State Management'
    );
  }
  
  if (config.techStack?.testFramework === 'vitest') {
    context7 = context7.replace(
      '- id: /vitest/docs\n    version: 1.0.0',
      '- id: /vitest/docs\n    version: 1.0.0\n    priority: high'
    );
  }
  
  return context7;
}

function generateInitialCodebaseContext(config: WorkspaceConfig): string {
  return `# CODEBASE-CONTEXT.md

## Project Vision
Building ${config.projectName} with AI-assisted development for maximum efficiency and quality.

## Tech Stack & Versions
- Language: ${config.techStack?.language || 'TypeScript'} (latest)
- Framework: ${config.techStack?.framework || 'React'} (latest)
- UI Library: ${config.techStack?.uiLibrary || 'TailwindCSS'} (latest)
- Testing: ${config.techStack?.testFramework || 'Jest'} (latest)
- Package Manager: pnpm (recommended)

## Naming Conventions
- Components: PascalCase (UserProfile, TodoList)
- Hooks: useVerbNoun (useFetchData, useAuthState)
- Files: PascalCase for components, kebab-case for utilities
- Types: PascalCase interfaces and types
- Constants: UPPER_SNAKE_CASE

## Code Patterns
- Components: Functional components only with React.FC type
- Props: TypeScript interfaces for all component props
- State: Local state with useState, global with Context/Zustand
- Imports: Type-only imports with \`import type\`
- Error handling: Try-catch with user-friendly messages
- Styling: ${config.techStack?.uiLibrary || 'TailwindCSS'} utilities

## Implementation Constraints for AI
- NEVER use class components
- NEVER use \`any\` type
- ALWAYS handle loading/error/empty states
- ALWAYS validate props with TypeScript
- ALWAYS include unit tests
- ALWAYS check imports exist
- NEVER hardcode sensitive data
- ALWAYS use environment variables

## Directory Purpose
/src - Source code
  /components - Reusable UI components
  /hooks - Custom React hooks
  /services - API and business logic
  /utils - Utility functions
  /types - TypeScript type definitions
  /styles - Global styles and themes
/tests - Test files
/public - Static assets

## Component Structure Pattern
\`\`\`typescript
import React from 'react';
import type { ComponentNameProps } from '../types';

interface ComponentNameProps {
  // Define props
}

const ComponentName: React.FC<ComponentNameProps> = ({ props }) => {
  // Hooks
  
  // Event handlers
  
  // Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  // Main render
  return (
    <div className="component-wrapper">
      {/* Content */}
    </div>
  );
};

export default ComponentName;
\`\`\`

## Performance Considerations
- Implement code splitting for large features
- Use React.memo for expensive components
- Lazy load images and heavy components
- Monitor bundle size (target: <200KB main)
- Optimize re-renders with proper dependencies

---

**Last Updated**: ${new Date().toISOString()} | **Agent**: AI Development Assistant
`;
}