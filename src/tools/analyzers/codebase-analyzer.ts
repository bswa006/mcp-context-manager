import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';

interface CodebaseAnalysis {
  structure: DirectoryStructure;
  patterns: {
    namingConventions: NamingConventions;
    componentPatterns: string[];
    commonImports: string[];
    stateManagement: string[];
  };
  techStack: {
    detected: string[];
    versions: Record<string, string>;
  };
  metrics: {
    totalFiles: number;
    totalDirectories: number;
    fileTypes: Record<string, number>;
  };
}

interface DirectoryStructure {
  name: string;
  type: 'directory' | 'file';
  children?: DirectoryStructure[];
}

interface NamingConventions {
  components: string[];
  hooks: string[];
  services: string[];
  utils: string[];
}

export async function analyzeCodebase(
  projectPath: string,
  depth: number = 2
): Promise<CodebaseAnalysis> {
  const analysis: CodebaseAnalysis = {
    structure: analyzeStructure(projectPath, depth),
    patterns: {
      namingConventions: analyzeNamingConventions(projectPath),
      componentPatterns: [],
      commonImports: [],
      stateManagement: [],
    },
    techStack: analyzeTechStack(projectPath),
    metrics: {
      totalFiles: 0,
      totalDirectories: 0,
      fileTypes: {},
    },
  };

  // Analyze patterns in source files
  analyzePatterns(projectPath, analysis);
  
  // Calculate metrics
  calculateMetrics(projectPath, analysis);

  return analysis;
}

function analyzeStructure(path: string, depth: number, currentDepth: number = 0): DirectoryStructure {
  const name = path.split('/').pop() || '';
  const stats = statSync(path);

  if (!stats.isDirectory() || currentDepth >= depth) {
    return { name, type: 'file' };
  }

  const children = readdirSync(path)
    .filter(item => !item.startsWith('.') && item !== 'node_modules')
    .map(item => analyzeStructure(join(path, item), depth, currentDepth + 1));

  return {
    name,
    type: 'directory',
    children,
  };
}

function analyzeNamingConventions(projectPath: string): NamingConventions {
  const conventions: NamingConventions = {
    components: [],
    hooks: [],
    services: [],
    utils: [],
  };

  // Look for common source directories
  const srcPath = join(projectPath, 'src');
  if (!existsSync(srcPath)) {
    return conventions;
  }

  // Analyze component naming
  const componentsPath = join(srcPath, 'components');
  if (existsSync(componentsPath)) {
    conventions.components = readdirSync(componentsPath)
      .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'))
      .slice(0, 5);
  }

  // Analyze hooks naming
  const hooksPath = join(srcPath, 'hooks');
  if (existsSync(hooksPath)) {
    conventions.hooks = readdirSync(hooksPath)
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .slice(0, 5);
  }

  return conventions;
}

function analyzeTechStack(projectPath: string): { detected: string[]; versions: Record<string, string> } {
  const packageJsonPath = join(projectPath, 'package.json');
  const detected: string[] = [];
  const versions: Record<string, string> = {};

  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Detect major technologies
      if (deps.react) {
        detected.push('React');
        versions.react = deps.react;
      }
      if (deps.typescript) {
        detected.push('TypeScript');
        versions.typescript = deps.typescript;
      }
      if (deps.tailwindcss) {
        detected.push('TailwindCSS');
        versions.tailwindcss = deps.tailwindcss;
      }
      if (deps.vite) {
        detected.push('Vite');
        versions.vite = deps.vite;
      }
      if (deps.next) {
        detected.push('Next.js');
        versions.next = deps.next;
      }
    } catch (error) {
      console.error('Failed to analyze package.json:', error);
    }
  }

  return { detected, versions };
}

function analyzePatterns(projectPath: string, analysis: CodebaseAnalysis) {
  const srcPath = join(projectPath, 'src');
  if (!existsSync(srcPath)) {
    return;
  }

  const componentFiles = findFiles(srcPath, ['.tsx', '.jsx'], 2);
  const imports = new Set<string>();
  const patterns = new Set<string>();
  const statePatterns = new Set<string>();

  for (const file of componentFiles.slice(0, 10)) { // Analyze first 10 files
    try {
      const content = readFileSync(file, 'utf-8');
      
      // Extract imports
      const importMatches = content.match(/import .+ from ['"](.+)['"]/g) || [];
      importMatches.forEach(imp => {
        const match = imp.match(/from ['"](.+)['"]/);
        if (match) imports.add(match[1]);
      });

      // Detect component patterns
      if (content.includes('React.FC')) patterns.add('React.FC components');
      if (content.includes('export default function')) patterns.add('Function components');
      if (content.includes('className=')) patterns.add('className styling');
      
      // Detect state management
      if (content.includes('useState')) statePatterns.add('useState hook');
      if (content.includes('useReducer')) statePatterns.add('useReducer hook');
      if (content.includes('useContext')) statePatterns.add('Context API');
    } catch (error) {
      // Skip files that can't be read
    }
  }

  analysis.patterns.commonImports = Array.from(imports).slice(0, 10);
  analysis.patterns.componentPatterns = Array.from(patterns);
  analysis.patterns.stateManagement = Array.from(statePatterns);
}

function calculateMetrics(projectPath: string, analysis: CodebaseAnalysis) {
  const files = findFiles(projectPath, [], 5);
  
  analysis.metrics.totalFiles = files.length;
  
  files.forEach(file => {
    const ext = extname(file);
    analysis.metrics.fileTypes[ext] = (analysis.metrics.fileTypes[ext] || 0) + 1;
  });

  // Count directories
  const countDirs = (structure: DirectoryStructure): number => {
    if (structure.type === 'file') return 0;
    let count = 1;
    structure.children?.forEach(child => {
      count += countDirs(child);
    });
    return count;
  };
  
  analysis.metrics.totalDirectories = countDirs(analysis.structure);
}

function findFiles(dir: string, extensions: string[], maxDepth: number, currentDepth: number = 0): string[] {
  if (currentDepth >= maxDepth) return [];
  
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        files.push(...findFiles(fullPath, extensions, maxDepth, currentDepth + 1));
      } else if (extensions.length === 0 || extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

function existsSync(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}