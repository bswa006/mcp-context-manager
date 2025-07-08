import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TechStack {
  language?: string;
  framework?: string;
  uiLibrary?: string;
  buildTool?: string;
}

export async function generateContextFile(
  projectPath: string,
  techStack?: TechStack
): Promise<string> {
  // Check if package.json exists
  const packageJsonPath = join(projectPath, 'package.json');
  let packageInfo: any = {};
  
  if (existsSync(packageJsonPath)) {
    try {
      packageInfo = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch (error) {
      console.error('Failed to parse package.json:', error);
    }
  }

  // Auto-detect tech stack if not provided
  const detectedStack = techStack || detectTechStack(packageInfo);
  
  // Generate the context file content
  return `# CODEBASE-CONTEXT.md

## Project Vision
${packageInfo.description || 'Add your project vision and goals here'}

## Tech Stack & Versions
${formatTechStack(detectedStack, packageInfo)}

## Naming Conventions
${generateNamingConventions(detectedStack)}

## Code Patterns
${generateCodePatterns(detectedStack)}

## Implementation Constraints for AI
${generateConstraints(detectedStack)}

## Directory Purpose
${generateDirectoryPurpose(projectPath)}

## Component Structure Pattern
${generateComponentPattern(detectedStack)}

## Animation Guidelines
${detectedStack.uiLibrary?.includes('tailwind') ? generateAnimationGuidelines() : '// Add animation guidelines if needed'}

## Performance Considerations
- Lazy load components when necessary
- Optimize bundle size
- Use code splitting for large features
- Monitor Core Web Vitals
`;
}

function detectTechStack(packageInfo: any): TechStack {
  const deps = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
  
  return {
    language: deps.typescript ? 'typescript' : 'javascript',
    framework: detectFramework(deps),
    uiLibrary: detectUILibrary(deps),
    buildTool: detectBuildTool(deps),
  };
}

function detectFramework(deps: any): string {
  if (deps.react) return 'react';
  if (deps.vue) return 'vue';
  if (deps.angular) return 'angular';
  if (deps.svelte) return 'svelte';
  if (deps.next) return 'nextjs';
  return 'unknown';
}

function detectUILibrary(deps: any): string {
  if (deps.tailwindcss) return 'tailwindcss';
  if (deps['styled-components']) return 'styled-components';
  if (deps['@emotion/react']) return 'emotion';
  if (deps['@mui/material']) return 'material-ui';
  return 'css';
}

function detectBuildTool(deps: any): string {
  if (deps.vite) return 'vite';
  if (deps.webpack) return 'webpack';
  if (deps.parcel) return 'parcel';
  if (deps.esbuild) return 'esbuild';
  return 'unknown';
}

function formatTechStack(stack: TechStack, packageInfo: any): string {
  const deps = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
  
  return `- Language: ${stack.language}
- Framework: ${stack.framework} ${deps[stack.framework || ''] ? `v${deps[stack.framework || ''].replace('^', '')}` : ''}
- UI Library: ${stack.uiLibrary}
- Build Tool: ${stack.buildTool}
- Package Manager: ${detectPackageManager()}
- Node.js: ${process.version}`;
}

function detectPackageManager(): string {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('package-lock.json')) return 'npm';
  return 'npm';
}

function generateNamingConventions(stack: TechStack): string {
  const isReact = stack.framework === 'react' || stack.framework === 'nextjs';
  
  return `- Components: PascalCase (${isReact ? 'UserProfile, TodoList' : 'user-profile, todo-list'})
- ${isReact ? 'Hooks' : 'Composables'}: ${isReact ? 'useVerbNoun (useFetchData, useAuthState)' : 'useVerbNoun'}
- Files: ${isReact ? 'PascalCase for components' : 'kebab-case'}
- Types: PascalCase interfaces and types
- Constants: UPPER_SNAKE_CASE
- Functions: camelCase`;
}

function generateCodePatterns(stack: TechStack): string {
  if (stack.framework === 'react' || stack.framework === 'nextjs') {
    return `- Components: Functional components only with ${stack.language === 'typescript' ? 'React.FC type' : 'arrow functions'}
- Props: ${stack.language === 'typescript' ? 'TypeScript interfaces' : 'PropTypes'} for all component props
- State: ${stack.framework === 'nextjs' ? 'Server Components by default, useState for client' : 'useState and custom hooks'}
- Imports: ${stack.language === 'typescript' ? 'Type-only imports with `import type`' : 'Named imports preferred'}
- Error handling: Error boundaries and try-catch blocks
- Styling: ${stack.uiLibrary === 'tailwindcss' ? 'TailwindCSS utilities' : 'CSS modules or styled components'}`;
  }
  
  return `- Components: Framework-specific patterns
- State Management: Framework conventions
- Error Handling: Try-catch with user feedback
- Testing: Unit and integration tests`;
}

function generateConstraints(stack: TechStack): string {
  const constraints = [
    '- ALWAYS validate inputs and handle edge cases',
    '- NEVER expose sensitive data in client code',
    '- ALWAYS follow accessibility guidelines (WCAG 2.1)',
  ];
  
  if (stack.language === 'typescript') {
    constraints.push(
      '- ALWAYS use proper TypeScript types, avoid `any`',
      '- ALWAYS use `import type` for type-only imports'
    );
  }
  
  if (stack.framework === 'react' || stack.framework === 'nextjs') {
    constraints.push(
      '- NEVER use class components, only functional',
      '- ALWAYS handle loading/error/empty states',
      '- NEVER mutate state directly'
    );
  }
  
  if (stack.uiLibrary === 'tailwindcss') {
    constraints.push('- NEVER hardcode colors - use Tailwind theme colors');
  }
  
  return constraints.join('\n');
}

function generateDirectoryPurpose(projectPath: string): string {
  // Basic directory structure - can be enhanced by analyzing actual directories
  return `/src - Source code
  /components - Reusable UI components
  /pages or /app - Application pages/routes
  /hooks - Custom hooks (React) or composables
  /services - API and business logic
  /utils - Utility functions
  /types - TypeScript type definitions
  /styles - Global styles and themes
/public - Static assets
/tests - Test files`;
}

function generateComponentPattern(stack: TechStack): string {
  if (stack.framework === 'react' && stack.language === 'typescript') {
    return `\`\`\`typescript
import React from 'react';
import type { ComponentProps } from '../../types';

interface ComponentNameProps {
  // Define props with TypeScript
}

const ComponentName: React.FC<ComponentNameProps> = ({ props }) => {
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
\`\`\``;
  }
  
  return '// Add component pattern for your framework';
}

function generateAnimationGuidelines(): string {
  return `- Use CSS transitions for micro-interactions
- Common animations: fadeIn, slideIn, scaleIn
- Apply with className and animation utilities
- Keep animations subtle and purposeful
- Respect prefers-reduced-motion preference`;
}