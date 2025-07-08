import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface DeepAnalysisResult {
  success: boolean;
  analysisId: string;
  timestamp: string;
  projectPath: string;
  summary: {
    totalFiles: number;
    totalLines: number;
    techStack: string[];
    primaryLanguage: string;
    frameworks: string[];
    testingFrameworks: string[];
  };
  structure: {
    directories: Record<string, {
      fileCount: number;
      purpose: string;
      mainTypes: string[];
    }>;
    entryPoints: string[];
  };
  patterns: {
    components: {
      style: string;
      propsPattern: string;
      exportPattern: string;
      count: number;
    };
    stateManagement: string[];
    styling: string;
    imports: {
      style: string;
      common: string[];
    };
    naming: {
      components: string;
      hooks: string;
      services: string;
      utils: string;
    };
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  codeQuality: {
    hasTypeScript: boolean;
    hasLinting: boolean;
    hasPrettier: boolean;
    hasPreCommitHooks: boolean;
  };
  evidenceFiles: Array<{
    path: string;
    purpose: string;
    patterns: string[];
  }>;
  recommendations: string[];
}

interface AnalysisConfig {
  projectPath: string;
  maxDepth?: number;
  excludePatterns?: string[];
}

// Global storage for analysis results
declare global {
  var codebaseAnalysis: Record<string, DeepAnalysisResult>;
  var latestAnalysisId: string;
}

if (!global.codebaseAnalysis) {
  global.codebaseAnalysis = {};
}

export async function analyzeCodebaseDeeply(
  config: AnalysisConfig
): Promise<DeepAnalysisResult> {
  const analysisId = `analysis_${Date.now()}`;
  const result: DeepAnalysisResult = {
    success: false,
    analysisId,
    timestamp: new Date().toISOString(),
    projectPath: config.projectPath,
    summary: {
      totalFiles: 0,
      totalLines: 0,
      techStack: [],
      primaryLanguage: 'TypeScript',
      frameworks: [],
      testingFrameworks: [],
    },
    structure: {
      directories: {},
      entryPoints: [],
    },
    patterns: {
      components: {
        style: 'function',
        propsPattern: 'interface',
        exportPattern: 'named',
        count: 0,
      },
      stateManagement: [],
      styling: 'css',
      imports: {
        style: 'named',
        common: [],
      },
      naming: {
        components: 'PascalCase',
        hooks: 'camelCase',
        services: 'camelCase',
        utils: 'camelCase',
      },
    },
    dependencies: {
      production: {},
      development: {},
    },
    codeQuality: {
      hasTypeScript: false,
      hasLinting: false,
      hasPrettier: false,
      hasPreCommitHooks: false,
    },
    evidenceFiles: [],
    recommendations: [],
  };

  try {
    // Read package.json
    const packageJsonPath = join(config.projectPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    
    // Extract dependencies
    result.dependencies.production = packageJson.dependencies || {};
    result.dependencies.development = packageJson.devDependencies || {};
    
    // Detect tech stack
    detectTechStack(result, packageJson);
    
    // Check code quality tools
    await checkCodeQuality(result, config.projectPath);
    
    // Analyze directory structure
    await analyzeDirectoryStructure(
      config.projectPath,
      config.projectPath,
      result,
      0,
      config.maxDepth || 5,
      config.excludePatterns || ['node_modules', '.git', 'dist', 'build', '.next', 'coverage']
    );
    
    // Analyze patterns from source files
    await analyzeCodePatterns(config.projectPath, result);
    
    // Generate recommendations
    generateRecommendations(result);
    
    // Store result globally
    result.success = true;
    global.codebaseAnalysis[analysisId] = result;
    global.latestAnalysisId = analysisId;
    
  } catch (error) {
    result.success = false;
    result.recommendations.push(`Analysis error: ${error}`);
  }

  return result;
}

function detectTechStack(result: DeepAnalysisResult, packageJson: any): void {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Detect frameworks
  if (deps.react) {
    result.summary.frameworks.push('React');
    result.summary.techStack.push('React');
  }
  if (deps.vue) {
    result.summary.frameworks.push('Vue');
    result.summary.techStack.push('Vue');
  }
  if (deps['@angular/core']) {
    result.summary.frameworks.push('Angular');
    result.summary.techStack.push('Angular');
  }
  if (deps.svelte) {
    result.summary.frameworks.push('Svelte');
    result.summary.techStack.push('Svelte');
  }
  if (deps.next) {
    result.summary.frameworks.push('Next.js');
    result.summary.techStack.push('Next.js');
  }
  if (deps.express) {
    result.summary.frameworks.push('Express');
    result.summary.techStack.push('Express');
  }
  if (deps['@nestjs/core']) {
    result.summary.frameworks.push('NestJS');
    result.summary.techStack.push('NestJS');
  }
  
  // Detect state management
  if (deps.redux || deps['@reduxjs/toolkit']) {
    result.patterns.stateManagement.push('Redux');
  }
  if (deps.zustand) {
    result.patterns.stateManagement.push('Zustand');
  }
  if (deps.mobx) {
    result.patterns.stateManagement.push('MobX');
  }
  if (deps.recoil) {
    result.patterns.stateManagement.push('Recoil');
  }
  
  // Detect styling
  if (deps.tailwindcss) {
    result.patterns.styling = 'tailwind';
    result.summary.techStack.push('TailwindCSS');
  } else if (deps['styled-components']) {
    result.patterns.styling = 'styled-components';
    result.summary.techStack.push('Styled Components');
  } else if (deps.emotion || deps['@emotion/react']) {
    result.patterns.styling = 'emotion';
    result.summary.techStack.push('Emotion');
  }
  
  // Detect testing frameworks
  if (deps.jest || deps['@jest/core']) {
    result.summary.testingFrameworks.push('Jest');
  }
  if (deps.vitest) {
    result.summary.testingFrameworks.push('Vitest');
  }
  if (deps.mocha) {
    result.summary.testingFrameworks.push('Mocha');
  }
  if (deps.cypress) {
    result.summary.testingFrameworks.push('Cypress');
  }
  if (deps['@testing-library/react']) {
    result.summary.testingFrameworks.push('React Testing Library');
  }
  
  // Detect build tools
  if (deps.vite) {
    result.summary.techStack.push('Vite');
  } else if (deps.webpack) {
    result.summary.techStack.push('Webpack');
  }
  
  // Detect TypeScript
  if (deps.typescript) {
    result.codeQuality.hasTypeScript = true;
    result.summary.techStack.push('TypeScript');
  }
}

async function checkCodeQuality(result: DeepAnalysisResult, projectPath: string): Promise<void> {
  try {
    // Check for ESLint
    const eslintConfigs = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js'];
    for (const config of eslintConfigs) {
      try {
        await stat(join(projectPath, config));
        result.codeQuality.hasLinting = true;
        break;
      } catch {}
    }
    
    // Check for Prettier
    const prettierConfigs = ['.prettierrc', '.prettierrc.js', '.prettierrc.json'];
    for (const config of prettierConfigs) {
      try {
        await stat(join(projectPath, config));
        result.codeQuality.hasPrettier = true;
        break;
      } catch {}
    }
    
    // Check for pre-commit hooks
    try {
      await stat(join(projectPath, '.husky'));
      result.codeQuality.hasPreCommitHooks = true;
    } catch {}
  } catch (error) {
    // Ignore errors
  }
}

async function analyzeDirectoryStructure(
  baseDir: string,
  currentDir: string,
  result: DeepAnalysisResult,
  depth: number,
  maxDepth: number,
  excludePatterns: string[]
): Promise<void> {
  if (depth > maxDepth) return;
  
  try {
    const entries = await readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relativePath = fullPath.replace(baseDir + '/', '');
      
      // Skip excluded patterns
      if (excludePatterns.some(pattern => entry.name.includes(pattern))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Initialize directory info
        if (!result.structure.directories[relativePath]) {
          result.structure.directories[relativePath] = {
            fileCount: 0,
            purpose: inferDirectoryPurpose(entry.name),
            mainTypes: [],
          };
        }
        
        // Recurse into subdirectory
        await analyzeDirectoryStructure(
          baseDir,
          fullPath,
          result,
          depth + 1,
          maxDepth,
          excludePatterns
        );
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        
        // Count files
        result.summary.totalFiles++;
        
        // Update directory file count
        const dirPath = relativePath.substring(0, relativePath.lastIndexOf('/'));
        if (result.structure.directories[dirPath]) {
          result.structure.directories[dirPath].fileCount++;
        }
        
        // Identify entry points
        if (entry.name === 'index.ts' || entry.name === 'index.tsx' || 
            entry.name === 'index.js' || entry.name === 'index.jsx' ||
            entry.name === 'main.ts' || entry.name === 'main.tsx' ||
            entry.name === 'app.ts' || entry.name === 'app.tsx') {
          result.structure.entryPoints.push(relativePath);
        }
        
        // Count lines in source files
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          try {
            const content = await readFile(fullPath, 'utf-8');
            result.summary.totalLines += content.split('\n').length;
          } catch {}
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

async function analyzeCodePatterns(projectPath: string, result: DeepAnalysisResult): Promise<void> {
  const sourceFiles: string[] = [];
  
  // Collect source files
  async function collectSourceFiles(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await collectSourceFiles(fullPath);
        } else if (entry.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) {
          sourceFiles.push(fullPath);
        }
      }
    } catch {}
  }
  
  await collectSourceFiles(projectPath);
  
  // Analyze patterns in source files
  const componentStyles = new Map<string, number>();
  const propsPatterns = new Map<string, number>();
  const importStyles = new Set<string>();
  
  for (const file of sourceFiles.slice(0, 50)) { // Analyze first 50 files for performance
    try {
      const content = await readFile(file, 'utf-8');
      const relativePath = file.replace(projectPath + '/', '');
      
      // Parse with Babel
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });
      
      // Analyze the AST
      traverse.default(ast, {
        // Check for React component patterns
        FunctionDeclaration(path: any) {
          if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
            componentStyles.set('function', (componentStyles.get('function') || 0) + 1);
            result.patterns.components.count++;
          }
        },
        VariableDeclarator(path: any) {
          if (t.isIdentifier(path.node.id) && /^[A-Z]/.test(path.node.id.name)) {
            if (t.isArrowFunctionExpression(path.node.init)) {
              componentStyles.set('arrow', (componentStyles.get('arrow') || 0) + 1);
              result.patterns.components.count++;
            }
          }
        },
        // Check for TypeScript interfaces/types
        TSInterfaceDeclaration(path: any) {
          if (path.node.id.name.endsWith('Props')) {
            propsPatterns.set('interface', (propsPatterns.get('interface') || 0) + 1);
          }
        },
        TSTypeAliasDeclaration(path: any) {
          if (path.node.id.name.endsWith('Props')) {
            propsPatterns.set('type', (propsPatterns.get('type') || 0) + 1);
          }
        },
        // Check import styles
        ImportDeclaration(path: any) {
          if (path.node.specifiers.some((s: any) => t.isImportSpecifier(s))) {
            importStyles.add(path.node.source.value);
          }
        },
      });
      
      // Add to evidence files
      if (result.patterns.components.count > 0) {
        result.evidenceFiles.push({
          path: relativePath,
          purpose: inferFilePurpose(file),
          patterns: ['Component definition', result.patterns.styling],
        });
      }
    } catch {}
  }
  
  // Determine most common patterns
  if (componentStyles.size > 0) {
    const mostCommon = Array.from(componentStyles.entries())
      .sort((a, b) => b[1] - a[1])[0];
    result.patterns.components.style = mostCommon[0];
  }
  
  if (propsPatterns.size > 0) {
    const mostCommon = Array.from(propsPatterns.entries())
      .sort((a, b) => b[1] - a[1])[0];
    result.patterns.components.propsPattern = mostCommon[0];
  }
  
  // Set common imports
  result.patterns.imports.common = Array.from(importStyles).slice(0, 10);
}

function inferDirectoryPurpose(dirName: string): string {
  const purposeMap: Record<string, string> = {
    components: 'UI components',
    pages: 'Page components',
    views: 'View components',
    hooks: 'Custom React hooks',
    utils: 'Utility functions',
    helpers: 'Helper functions',
    services: 'API services',
    api: 'API integrations',
    store: 'State management',
    stores: 'State stores',
    contexts: 'React contexts',
    types: 'TypeScript types',
    interfaces: 'TypeScript interfaces',
    models: 'Data models',
    styles: 'Style files',
    css: 'CSS files',
    assets: 'Static assets',
    public: 'Public files',
    tests: 'Test files',
    __tests__: 'Test files',
    docs: 'Documentation',
    config: 'Configuration files',
    scripts: 'Build/utility scripts',
  };
  
  return purposeMap[dirName.toLowerCase()] || 'Project files';
}

function inferFilePurpose(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  
  if (fileName.includes('.test.') || fileName.includes('.spec.')) {
    return 'Test file';
  }
  if (fileName.includes('index.')) {
    return 'Entry point';
  }
  if (/^[A-Z]/.test(fileName) && filePath.includes('component')) {
    return 'Component file';
  }
  if (fileName.startsWith('use') && filePath.includes('hook')) {
    return 'Hook file';
  }
  if (filePath.includes('service') || filePath.includes('api')) {
    return 'Service file';
  }
  if (filePath.includes('util') || filePath.includes('helper')) {
    return 'Utility file';
  }
  if (filePath.includes('type') || filePath.includes('interface')) {
    return 'Type definition';
  }
  
  return 'Source file';
}

function generateRecommendations(result: DeepAnalysisResult): void {
  // Testing recommendations
  if (result.summary.testingFrameworks.length === 0) {
    result.recommendations.push('Consider adding a testing framework (Jest, Vitest, or Mocha)');
  }
  
  // TypeScript recommendations
  if (!result.codeQuality.hasTypeScript && result.summary.primaryLanguage === 'JavaScript') {
    result.recommendations.push('Consider migrating to TypeScript for better type safety');
  }
  
  // Linting recommendations
  if (!result.codeQuality.hasLinting) {
    result.recommendations.push('Add ESLint for consistent code quality');
  }
  
  // Prettier recommendations
  if (!result.codeQuality.hasPrettier) {
    result.recommendations.push('Add Prettier for consistent code formatting');
  }
  
  // Pre-commit hooks
  if (!result.codeQuality.hasPreCommitHooks) {
    result.recommendations.push('Set up Husky for pre-commit hooks');
  }
  
  // State management
  if (result.patterns.stateManagement.length === 0 && result.summary.frameworks.includes('React')) {
    result.recommendations.push('Consider adding state management (Context API, Zustand, or Redux)');
  }
  
  // Documentation
  result.recommendations.push('Create comprehensive documentation in agent-context/ directory');
}