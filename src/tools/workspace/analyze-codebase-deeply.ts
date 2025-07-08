import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { analyzeCodebase } from '../analyzers/codebase-analyzer.js';
import { detectExistingPatterns } from '../analyzers/pattern-detector.js';

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
    directories: Record<string, DirectoryInfo>;
    rootFiles: string[];
  };
  patterns: {
    naming: {
      components: string;
      hooks: string;
      services: string;
      utils: string;
    };
    imports: {
      style: string;
      common: string[];
    };
    components: {
      style: string;
      propsPattern: string;
      exportPattern: string;
    };
    stateManagement: string[];
    styling: string;
    testing: {
      framework: string;
      pattern: string;
      coverage: boolean;
    };
  };
  codeQuality: {
    hasLinting: boolean;
    hasTypeScript: boolean;
    hasPrettier: boolean;
    hasPreCommitHooks: boolean;
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
    peerDependencies: Record<string, string>;
  };
  recommendations: string[];
  evidenceFiles: EvidenceFile[];
}

interface DirectoryInfo {
  purpose: string;
  fileCount: number;
  primaryFileType: string;
  examples: string[];
}

interface EvidenceFile {
  path: string;
  purpose: string;
  patterns: string[];
}

export async function analyzeCodebaseDeeply(projectPath: string): Promise<DeepAnalysisResult> {
  const analysisId = `ANALYSIS_${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  const result: DeepAnalysisResult = {
    success: false,
    analysisId,
    timestamp,
    projectPath,
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
      rootFiles: [],
    },
    patterns: {
      naming: {
        components: 'PascalCase',
        hooks: 'camelCase with use prefix',
        services: 'camelCase',
        utils: 'camelCase',
      },
      imports: {
        style: 'named',
        common: [],
      },
      components: {
        style: 'functional',
        propsPattern: 'interface',
        exportPattern: 'default',
      },
      stateManagement: [],
      styling: 'tailwind',
      testing: {
        framework: 'jest',
        pattern: 'separate __tests__ directory',
        coverage: false,
      },
    },
    codeQuality: {
      hasLinting: false,
      hasTypeScript: false,
      hasPrettier: false,
      hasPreCommitHooks: false,
    },
    dependencies: {
      production: {},
      development: {},
      peerDependencies: {},
    },
    recommendations: [],
    evidenceFiles: [],
  };

  try {
    // 1. Analyze package.json for tech stack and dependencies
    const packageInfo = analyzePackageJson(projectPath);
    result.dependencies = packageInfo.dependencies;
    result.summary.techStack = packageInfo.techStack;
    result.summary.frameworks = packageInfo.frameworks;
    result.summary.testingFrameworks = packageInfo.testingFrameworks;
    result.codeQuality = packageInfo.codeQuality;

    // 2. Deep directory structure analysis
    const structureAnalysis = analyzeDirectoryStructure(projectPath);
    result.structure = structureAnalysis;
    result.summary.totalFiles = structureAnalysis.totalFiles;

    // 3. Analyze code patterns across all files
    const fileAnalysis = await analyzeAllFiles(projectPath);
    result.patterns = fileAnalysis.patterns;
    result.summary.totalLines = fileAnalysis.totalLines;
    result.evidenceFiles = fileAnalysis.evidenceFiles;

    // 4. Use existing pattern detector for component patterns
    const componentPatterns = await detectExistingPatterns(join(projectPath, 'src'), 'component');
    if (componentPatterns.patterns.components.length > 0) {
      const topPattern = componentPatterns.patterns.components[0];
      result.patterns.components.style = topPattern.pattern;
    }

    // 5. Use existing pattern detector for hooks
    const hookPatterns = await detectExistingPatterns(join(projectPath, 'src'), 'hook');
    if (hookPatterns.patterns.hooks.length > 0) {
      result.patterns.stateManagement = hookPatterns.patterns.hooks
        .filter(h => h.type === 'built-in-hook')
        .map(h => h.pattern);
    }

    // 6. Generate recommendations based on analysis
    result.recommendations = generateRecommendations(result);

    // 7. Store analysis results for later use
    storeAnalysisResults(analysisId, result);

    result.success = true;
  } catch (error) {
    result.success = false;
    result.recommendations = [`Analysis failed: ${error}`];
  }

  return result;
}

function analyzePackageJson(projectPath: string): any {
  const packageJsonPath = join(projectPath, 'package.json');
  const result = {
    dependencies: {
      production: {} as Record<string, string>,
      development: {} as Record<string, string>,
      peerDependencies: {} as Record<string, string>,
    },
    techStack: [] as string[],
    frameworks: [] as string[],
    testingFrameworks: [] as string[],
    codeQuality: {
      hasLinting: false,
      hasTypeScript: false,
      hasPrettier: false,
      hasPreCommitHooks: false,
    },
  };

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Dependencies
    result.dependencies.production = packageJson.dependencies || {};
    result.dependencies.development = packageJson.devDependencies || {};
    result.dependencies.peerDependencies = packageJson.peerDependencies || {};

    const allDeps = { ...result.dependencies.production, ...result.dependencies.development };

    // Detect tech stack
    if (allDeps.typescript) {
      result.techStack.push('TypeScript');
      result.codeQuality.hasTypeScript = true;
    }
    if (allDeps.react) result.frameworks.push('React');
    if (allDeps.next) result.frameworks.push('Next.js');
    if (allDeps.vue) result.frameworks.push('Vue');
    if (allDeps.angular) result.frameworks.push('Angular');
    if (allDeps.express) result.frameworks.push('Express');
    if (allDeps.nestjs) result.frameworks.push('NestJS');

    // Testing frameworks
    if (allDeps.jest) result.testingFrameworks.push('Jest');
    if (allDeps.vitest) result.testingFrameworks.push('Vitest');
    if (allDeps.mocha) result.testingFrameworks.push('Mocha');
    if (allDeps['@testing-library/react']) result.testingFrameworks.push('React Testing Library');

    // Code quality
    if (allDeps.eslint) result.codeQuality.hasLinting = true;
    if (allDeps.prettier) result.codeQuality.hasPrettier = true;
    if (allDeps.husky || allDeps['lint-staged']) result.codeQuality.hasPreCommitHooks = true;

    // Additional tech stack
    if (allDeps.tailwindcss) result.techStack.push('TailwindCSS');
    if (allDeps['styled-components']) result.techStack.push('Styled Components');
    if (allDeps.vite) result.techStack.push('Vite');
    if (allDeps.webpack) result.techStack.push('Webpack');

  } catch (error) {
    // No package.json or invalid
  }

  return result;
}

function analyzeDirectoryStructure(projectPath: string): any {
  const structure = {
    directories: {} as Record<string, DirectoryInfo>,
    rootFiles: [] as string[],
    totalFiles: 0,
  };

  function analyzeDirectory(dirPath: string, relativePath: string = '') {
    try {
      const items = readdirSync(dirPath);
      const files: string[] = [];
      const subdirs: string[] = [];

      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'build') {
          continue;
        }

        const fullPath = join(dirPath, item);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
          subdirs.push(item);
          analyzeDirectory(fullPath, join(relativePath, item));
        } else {
          files.push(item);
          structure.totalFiles++;
        }
      }

      if (relativePath === '') {
        structure.rootFiles = files;
      } else {
        const purpose = inferDirectoryPurpose(relativePath, files);
        const fileTypes = files.map(f => extname(f)).filter(Boolean);
        const primaryType = getMostCommon(fileTypes);

        structure.directories[relativePath] = {
          purpose,
          fileCount: files.length,
          primaryFileType: primaryType,
          examples: files.slice(0, 3),
        };
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  analyzeDirectory(projectPath);
  return structure;
}

function inferDirectoryPurpose(path: string, files: string[]): string {
  const dirname = path.split('/').pop() || '';
  
  // Common directory patterns
  if (dirname === 'components' || files.some(f => f.endsWith('.tsx') || f.endsWith('.jsx'))) {
    return 'UI Components';
  }
  if (dirname === 'hooks' || files.some(f => f.startsWith('use'))) {
    return 'Custom React Hooks';
  }
  if (dirname === 'services' || dirname === 'api') {
    return 'API Services';
  }
  if (dirname === 'utils' || dirname === 'helpers') {
    return 'Utility Functions';
  }
  if (dirname === 'types' || files.some(f => f.endsWith('.d.ts'))) {
    return 'TypeScript Types';
  }
  if (dirname === 'styles' || files.some(f => f.endsWith('.css') || f.endsWith('.scss'))) {
    return 'Stylesheets';
  }
  if (dirname === 'tests' || dirname === '__tests__' || files.some(f => f.includes('.test.'))) {
    return 'Test Files';
  }
  if (dirname === 'pages' || dirname === 'routes') {
    return 'Application Routes';
  }
  if (dirname === 'layouts') {
    return 'Layout Components';
  }
  if (dirname === 'contexts' || dirname === 'providers') {
    return 'React Contexts';
  }
  
  return 'Mixed Purpose';
}

async function analyzeAllFiles(projectPath: string): Promise<any> {
  const result = {
    patterns: {
      naming: {
        components: 'PascalCase',
        hooks: 'camelCase with use prefix',
        services: 'camelCase',
        utils: 'camelCase',
      },
      imports: {
        style: 'named',
        common: [] as string[],
      },
      components: {
        style: 'functional',
        propsPattern: 'interface',
        exportPattern: 'default',
      },
      stateManagement: [] as string[],
      styling: 'unknown',
      testing: {
        framework: 'unknown',
        pattern: 'unknown',
        coverage: false,
      },
    },
    totalLines: 0,
    evidenceFiles: [] as EvidenceFile[],
  };

  const srcPath = join(projectPath, 'src');
  if (!existsSync(srcPath)) {
    return result;
  }

  // Collect all source files
  const sourceFiles = findAllSourceFiles(srcPath);
  const importCounts = new Map<string, number>();
  const componentStyles = new Map<string, number>();
  const stylingMethods = new Map<string, number>();

  for (const file of sourceFiles.slice(0, 50)) { // Analyze first 50 files for performance
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n').length;
      result.totalLines += lines;

      // Analyze imports
      const imports = content.match(/import .+ from ['"](.+)['"]/g) || [];
      imports.forEach(imp => {
        const moduleMatch = imp.match(/from ['"](.+)['"]/);
        if (moduleMatch && !moduleMatch[1].startsWith('.')) {
          importCounts.set(moduleMatch[1], (importCounts.get(moduleMatch[1]) || 0) + 1);
        }
      });

      // Analyze component styles
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        if (content.includes('React.FC')) {
          componentStyles.set('React.FC', (componentStyles.get('React.FC') || 0) + 1);
        } else if (content.match(/function\s+[A-Z]\w+/)) {
          componentStyles.set('function', (componentStyles.get('function') || 0) + 1);
        } else if (content.match(/const\s+[A-Z]\w+\s*=.*=>/)) {
          componentStyles.set('arrow', (componentStyles.get('arrow') || 0) + 1);
        }

        // Check styling
        if (content.includes('className=')) {
          if (content.match(/className=["'][^"']*\b(flex|grid|p-|m-|bg-)/)) {
            stylingMethods.set('tailwind', (stylingMethods.get('tailwind') || 0) + 1);
          }
        }
        if (content.includes('styled.') || content.includes('styled(')) {
          stylingMethods.set('styled-components', (stylingMethods.get('styled-components') || 0) + 1);
        }
        if (content.includes('styles.') || content.includes('.module.css')) {
          stylingMethods.set('css-modules', (stylingMethods.get('css-modules') || 0) + 1);
        }

        // Add as evidence file if it has interesting patterns
        if (componentStyles.size > 0 || stylingMethods.size > 0) {
          result.evidenceFiles.push({
            path: relative(projectPath, file),
            purpose: 'Component implementation',
            patterns: ['component-structure', 'styling-approach'],
          });
        }
      }

      // Check for test files
      if (file.includes('.test.') || file.includes('.spec.')) {
        const testFramework = detectTestFramework(content);
        if (testFramework) {
          result.patterns.testing.framework = testFramework;
        }
      }
    } catch (error) {
      // Skip files we can't read
    }
  }

  // Determine most common patterns
  result.patterns.imports.common = Array.from(importCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([module]) => module);

  const topComponentStyle = getMostCommonEntry(componentStyles);
  if (topComponentStyle) {
    result.patterns.components.style = topComponentStyle;
  }

  const topStyling = getMostCommonEntry(stylingMethods);
  if (topStyling) {
    result.patterns.styling = topStyling;
  }

  return result;
}

function findAllSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];

  function traverse(currentDir: string) {
    try {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = join(currentDir, item);
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          traverse(fullPath);
        } else if (validExtensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  traverse(dir);
  return files;
}

function detectTestFramework(content: string): string | null {
  if (content.includes('describe(') && content.includes('it(')) {
    if (content.includes('jest')) return 'jest';
    if (content.includes('vitest')) return 'vitest';
    if (content.includes('mocha')) return 'mocha';
    return 'jest'; // Default assumption
  }
  return null;
}

function getMostCommon(items: string[]): string {
  const counts = new Map<string, number>();
  items.forEach(item => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  
  let maxCount = 0;
  let mostCommon = '';
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = item;
    }
  });
  
  return mostCommon;
}

function getMostCommonEntry(map: Map<string, number>): string | null {
  let maxCount = 0;
  let mostCommon: string | null = null;
  
  map.forEach((count, key) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = key;
    }
  });
  
  return mostCommon;
}

function generateRecommendations(analysis: DeepAnalysisResult): string[] {
  const recommendations: string[] = [];

  // TypeScript recommendation
  if (!analysis.codeQuality.hasTypeScript && analysis.summary.primaryLanguage === 'JavaScript') {
    recommendations.push('Consider migrating to TypeScript for better type safety');
  }

  // Testing recommendations
  if (analysis.summary.testingFrameworks.length === 0) {
    recommendations.push('Add a testing framework (Jest or Vitest recommended)');
  }
  if (!analysis.patterns.testing.coverage) {
    recommendations.push('Set up code coverage reporting');
  }

  // Code quality recommendations
  if (!analysis.codeQuality.hasLinting) {
    recommendations.push('Add ESLint for code quality enforcement');
  }
  if (!analysis.codeQuality.hasPrettier) {
    recommendations.push('Add Prettier for consistent code formatting');
  }
  if (!analysis.codeQuality.hasPreCommitHooks) {
    recommendations.push('Set up pre-commit hooks with Husky');
  }

  // Pattern recommendations
  if (analysis.patterns.components.style === 'mixed') {
    recommendations.push('Standardize on a single component style (functional components recommended)');
  }
  if (analysis.patterns.imports.style === 'mixed') {
    recommendations.push('Standardize import style across the codebase');
  }

  // State management
  if (analysis.patterns.stateManagement.length === 0) {
    recommendations.push('Consider adding state management for complex state');
  }

  return recommendations;
}

function storeAnalysisResults(analysisId: string, results: DeepAnalysisResult) {
  // Store in memory for use by other tools
  global.codebaseAnalysis = global.codebaseAnalysis || {};
  global.codebaseAnalysis[analysisId] = results;
  global.latestAnalysisId = analysisId;
}

function existsSync(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

// Extend global namespace
declare global {
  var codebaseAnalysis: Record<string, DeepAnalysisResult>;
  var latestAnalysisId: string;
}