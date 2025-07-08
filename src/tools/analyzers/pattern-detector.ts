import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

interface DetectedPattern {
  type: string;
  pattern: string;
  examples: string[];
  frequency: number;
  confidence: number;
}

interface PatternAnalysis {
  directory: string;
  fileType: string;
  patterns: {
    imports: DetectedPattern[];
    components: DetectedPattern[];
    hooks: DetectedPattern[];
    stateManagement: DetectedPattern[];
    errorHandling: DetectedPattern[];
    styling: DetectedPattern[];
  };
  recommendations: string[];
}

export async function detectExistingPatterns(
  directory: string,
  fileType: string
): Promise<PatternAnalysis> {
  const analysis: PatternAnalysis = {
    directory,
    fileType,
    patterns: {
      imports: [],
      components: [],
      hooks: [],
      stateManagement: [],
      errorHandling: [],
      styling: [],
    },
    recommendations: [],
  };

  try {
    // Find all relevant files
    const files = findFiles(directory, fileType);
    
    if (files.length === 0) {
      analysis.recommendations.push(`No ${fileType} files found in ${directory}`);
      return analysis;
    }

    // Analyze each file
    const fileContents = files.map(file => ({
      path: file,
      content: readFileSync(file, 'utf-8'),
    }));

    // Detect patterns
    analysis.patterns.imports = detectImportPatterns(fileContents);
    analysis.patterns.components = detectComponentPatterns(fileContents, fileType);
    analysis.patterns.hooks = detectHookPatterns(fileContents);
    analysis.patterns.stateManagement = detectStatePatterns(fileContents);
    analysis.patterns.errorHandling = detectErrorPatterns(fileContents);
    analysis.patterns.styling = detectStylingPatterns(fileContents);

    // Generate recommendations
    generateRecommendations(analysis);

  } catch (error) {
    analysis.recommendations.push(`Error analyzing directory: ${error}`);
  }

  return analysis;
}

function findFiles(directory: string, fileType: string): string[] {
  const files: string[] = [];
  const extensions = getExtensionsForFileType(fileType);

  function traverse(dir: string) {
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = join(dir, item);
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.includes(extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  traverse(directory);
  return files;
}

function getExtensionsForFileType(fileType: string): string[] {
  const typeMap: Record<string, string[]> = {
    component: ['.tsx', '.jsx'],
    hook: ['.ts', '.tsx', '.js', '.jsx'],
    service: ['.ts', '.js'],
    api: ['.ts', '.js'],
    test: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'],
  };

  return typeMap[fileType] || ['.ts', '.tsx', '.js', '.jsx'];
}

function detectImportPatterns(files: Array<{path: string, content: string}>): DetectedPattern[] {
  const importCounts = new Map<string, number>();
  const importExamples = new Map<string, string[]>();

  files.forEach(({ content }) => {
    const imports = content.match(/import .+ from ['"](.+)['"]/g) || [];
    
    imports.forEach(imp => {
      // Categorize import style
      let style = 'unknown';
      if (imp.includes('* as')) style = 'namespace';
      else if (imp.includes('{')) style = 'named';
      else if (imp.includes('import type')) style = 'type-only';
      else style = 'default';

      importCounts.set(style, (importCounts.get(style) || 0) + 1);
      
      const examples = importExamples.get(style) || [];
      if (examples.length < 3) {
        examples.push(imp.trim());
        importExamples.set(style, examples);
      }
    });
  });

  const patterns: DetectedPattern[] = [];
  const totalImports = Array.from(importCounts.values()).reduce((a, b) => a + b, 0);

  importCounts.forEach((count, style) => {
    patterns.push({
      type: 'import-style',
      pattern: style,
      examples: importExamples.get(style) || [],
      frequency: count,
      confidence: count / totalImports,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function detectComponentPatterns(
  files: Array<{path: string, content: string}>,
  fileType: string
): DetectedPattern[] {
  if (fileType !== 'component') return [];

  const patterns: DetectedPattern[] = [];
  const componentStyles = new Map<string, number>();
  const examples = new Map<string, string[]>();

  files.forEach(({ content, path }) => {
    // Function components
    if (content.match(/const\s+\w+:\s*React\.FC/)) {
      incrementPattern(componentStyles, examples, 'React.FC', path);
    } else if (content.match(/function\s+\w+\s*\([^)]*\)\s*{/)) {
      incrementPattern(componentStyles, examples, 'function-declaration', path);
    } else if (content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/)) {
      incrementPattern(componentStyles, examples, 'arrow-function', path);
    }

    // Props patterns
    if (content.includes('interface') && content.includes('Props')) {
      incrementPattern(componentStyles, examples, 'interface-props', path);
    } else if (content.includes('type') && content.includes('Props')) {
      incrementPattern(componentStyles, examples, 'type-props', path);
    }

    // Export patterns
    if (content.includes('export default')) {
      incrementPattern(componentStyles, examples, 'default-export', path);
    } else if (content.match(/export\s*{/)) {
      incrementPattern(componentStyles, examples, 'named-export', path);
    }
  });

  // Convert to pattern array
  componentStyles.forEach((count, style) => {
    patterns.push({
      type: 'component-structure',
      pattern: style,
      examples: examples.get(style) || [],
      frequency: count,
      confidence: count / files.length,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function detectHookPatterns(files: Array<{path: string, content: string}>): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const hookUsage = new Map<string, number>();
  const customHooks = new Set<string>();

  files.forEach(({ content }) => {
    // Built-in hooks
    const builtInHooks = [
      'useState', 'useEffect', 'useContext', 'useReducer',
      'useCallback', 'useMemo', 'useRef', 'useLayoutEffect',
    ];

    builtInHooks.forEach(hook => {
      const regex = new RegExp(`\\b${hook}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        hookUsage.set(hook, (hookUsage.get(hook) || 0) + matches.length);
      }
    });

    // Custom hooks
    const customHookMatches = content.match(/\buse[A-Z][a-zA-Z]+/g) || [];
    customHookMatches.forEach(hook => {
      if (!builtInHooks.includes(hook)) {
        customHooks.add(hook);
      }
    });
  });

  // Add built-in hook patterns
  hookUsage.forEach((count, hook) => {
    patterns.push({
      type: 'built-in-hook',
      pattern: hook,
      examples: [`const [...] = ${hook}(...)`],
      frequency: count,
      confidence: 1.0,
    });
  });

  // Add custom hook patterns
  customHooks.forEach(hook => {
    patterns.push({
      type: 'custom-hook',
      pattern: hook,
      examples: [hook],
      frequency: 1,
      confidence: 0.8,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function detectStatePatterns(files: Array<{path: string, content: string}>): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const statePatterns = new Map<string, number>();

  files.forEach(({ content }) => {
    // Local state
    if (content.includes('useState')) {
      statePatterns.set('local-state', (statePatterns.get('local-state') || 0) + 1);
    }

    // Reducer pattern
    if (content.includes('useReducer')) {
      statePatterns.set('reducer', (statePatterns.get('reducer') || 0) + 1);
    }

    // Context
    if (content.includes('useContext') || content.includes('createContext')) {
      statePatterns.set('context', (statePatterns.get('context') || 0) + 1);
    }

    // State management libraries
    if (content.includes('useSelector') || content.includes('useDispatch')) {
      statePatterns.set('redux', (statePatterns.get('redux') || 0) + 1);
    }
    if (content.includes('useStore') && content.includes('zustand')) {
      statePatterns.set('zustand', (statePatterns.get('zustand') || 0) + 1);
    }
    if (content.includes('useRecoilState')) {
      statePatterns.set('recoil', (statePatterns.get('recoil') || 0) + 1);
    }
  });

  statePatterns.forEach((count, pattern) => {
    patterns.push({
      type: 'state-management',
      pattern,
      examples: [],
      frequency: count,
      confidence: count / files.length,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function detectErrorPatterns(files: Array<{path: string, content: string}>): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const errorPatterns = new Map<string, number>();
  const examples = new Map<string, string[]>();

  files.forEach(({ content, path }) => {
    // Try-catch
    if (content.includes('try {') && content.includes('catch')) {
      incrementPattern(errorPatterns, examples, 'try-catch', 'try-catch blocks');
    }

    // .catch() on promises
    if (content.match(/\.\s*catch\s*\(/)) {
      incrementPattern(errorPatterns, examples, 'promise-catch', '.catch() on promises');
    }

    // Error boundaries
    if (content.includes('componentDidCatch') || content.includes('ErrorBoundary')) {
      incrementPattern(errorPatterns, examples, 'error-boundary', 'React Error Boundary');
    }

    // Loading/Error/Empty states
    if (content.includes('isLoading') || content.includes('loading')) {
      incrementPattern(errorPatterns, examples, 'loading-state', 'Loading state handling');
    }
    if (content.includes('error') && content.includes('return')) {
      incrementPattern(errorPatterns, examples, 'error-state', 'Error state handling');
    }
  });

  errorPatterns.forEach((count, pattern) => {
    patterns.push({
      type: 'error-handling',
      pattern,
      examples: examples.get(pattern) || [],
      frequency: count,
      confidence: count / files.length,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function detectStylingPatterns(files: Array<{path: string, content: string}>): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const stylingPatterns = new Map<string, number>();

  files.forEach(({ content }) => {
    // CSS Modules
    if (content.includes('styles.') || content.includes('.module.css')) {
      stylingPatterns.set('css-modules', (stylingPatterns.get('css-modules') || 0) + 1);
    }

    // Styled Components
    if (content.includes('styled.') || content.includes('styled(')) {
      stylingPatterns.set('styled-components', (stylingPatterns.get('styled-components') || 0) + 1);
    }

    // Tailwind
    if (content.match(/className\s*=\s*["'][^"']*\b(flex|grid|p-|m-|bg-|text-)/)) {
      stylingPatterns.set('tailwind', (stylingPatterns.get('tailwind') || 0) + 1);
    }

    // Inline styles
    if (content.includes('style={{') || content.includes('style={')) {
      stylingPatterns.set('inline-styles', (stylingPatterns.get('inline-styles') || 0) + 1);
    }

    // CSS-in-JS (Emotion)
    if (content.includes('@emotion') || content.includes('css`')) {
      stylingPatterns.set('emotion', (stylingPatterns.get('emotion') || 0) + 1);
    }
  });

  stylingPatterns.forEach((count, pattern) => {
    patterns.push({
      type: 'styling',
      pattern,
      examples: [],
      frequency: count,
      confidence: count / files.length,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function incrementPattern(
  counts: Map<string, number>,
  examples: Map<string, string[]>,
  pattern: string,
  example: string
) {
  counts.set(pattern, (counts.get(pattern) || 0) + 1);
  
  const exampleList = examples.get(pattern) || [];
  if (exampleList.length < 3 && !exampleList.includes(example)) {
    exampleList.push(example);
    examples.set(pattern, exampleList);
  }
}

function generateRecommendations(analysis: PatternAnalysis) {
  const { patterns } = analysis;

  // Import recommendations
  const topImportStyle = patterns.imports[0];
  if (topImportStyle) {
    analysis.recommendations.push(
      `Use ${topImportStyle.pattern} imports (${Math.round(topImportStyle.confidence * 100)}% of codebase)`
    );
  }

  // Component recommendations
  const topComponentStyle = patterns.components[0];
  if (topComponentStyle) {
    analysis.recommendations.push(
      `Follow ${topComponentStyle.pattern} pattern for components`
    );
  }

  // State management recommendations
  const topStatePattern = patterns.stateManagement[0];
  if (topStatePattern) {
    analysis.recommendations.push(
      `Use ${topStatePattern.pattern} for state management`
    );
  }

  // Error handling recommendations
  if (patterns.errorHandling.length === 0) {
    analysis.recommendations.push(
      'Add error handling patterns (try-catch, error boundaries)'
    );
  }

  // Styling recommendations
  const topStylingPattern = patterns.styling[0];
  if (topStylingPattern) {
    analysis.recommendations.push(
      `Continue using ${topStylingPattern.pattern} for styling`
    );
  }

  // Hook usage
  const mostUsedHooks = patterns.hooks
    .filter(h => h.type === 'built-in-hook')
    .slice(0, 3)
    .map(h => h.pattern);
  
  if (mostUsedHooks.length > 0) {
    analysis.recommendations.push(
      `Common hooks: ${mostUsedHooks.join(', ')}`
    );
  }
}