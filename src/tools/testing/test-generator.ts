import { readFileSync, existsSync } from 'fs';
import { parse } from '@babel/parser';
import * as t from '@babel/types';

// Import traverse properly for ESM
import babelTraverse from '@babel/traverse';
const traverse = babelTraverse.default || babelTraverse;
type NodePath<T = any> = any;

interface TestGenerationConfig {
  targetFile: string;
  testFramework?: 'jest' | 'vitest' | 'mocha';
  coverageTarget?: number;
  includeEdgeCases?: boolean;
  includeAccessibility?: boolean;
}

interface TestGenerationResult {
  success: boolean;
  testCode: string;
  coverage: {
    estimated: number;
    functions: number;
    branches: number;
    lines: number;
  };
  testCategories: {
    unit: number;
    integration: number;
    edgeCases: number;
    errorHandling: number;
    accessibility: number;
  };
  suggestions: string[];
}

export async function generateTestsForCoverage(
  config: TestGenerationConfig
): Promise<TestGenerationResult> {
  const result: TestGenerationResult = {
    success: false,
    testCode: '',
    coverage: {
      estimated: 0,
      functions: 0,
      branches: 0,
      lines: 0,
    },
    testCategories: {
      unit: 0,
      integration: 0,
      edgeCases: 0,
      errorHandling: 0,
      accessibility: 0,
    },
    suggestions: [],
  };

  try {
    // Read target file
    if (!existsSync(config.targetFile)) {
      throw new Error(`Target file not found: ${config.targetFile}`);
    }

    const fileContent = readFileSync(config.targetFile, 'utf-8');
    const fileType = detectFileType(fileContent);
    
    // Parse the file to understand structure
    const ast = parseCode(fileContent);
    const analysis = analyzeCode(ast, fileType);
    
    // Generate tests based on analysis
    const testFramework = config.testFramework || detectTestFramework();
    const tests = generateTests(analysis, testFramework, config);
    
    // Calculate coverage estimation
    const coverage = estimateCoverage(analysis, tests);
    
    // Generate suggestions for reaching target coverage
    const suggestions = generateSuggestions(
      coverage,
      config.coverageTarget || 80,
      analysis
    );
    
    result.success = true;
    result.testCode = tests.code;
    result.coverage = coverage;
    result.testCategories = tests.categories;
    result.suggestions = suggestions;

  } catch (error) {
    result.success = false;
    result.suggestions = [`Error generating tests: ${error}`];
  }

  return result;
}

interface FileType {
  type: 'component' | 'hook' | 'service' | 'utility' | 'api';
  framework: 'react' | 'node' | 'vanilla';
}

function detectFileType(content: string): FileType {
  const hasReactImport = content.includes('from \'react\'') || content.includes('from "react"');
  const hasJSX = /<[A-Z][a-zA-Z]*/.test(content);
  const isHook = /export\s+(?:default\s+)?function\s+use[A-Z]/.test(content);
  const hasAPIPatterns = /fetch|axios|request/.test(content);
  
  if (hasReactImport && hasJSX) {
    return { type: 'component', framework: 'react' };
  }
  if (isHook) {
    return { type: 'hook', framework: 'react' };
  }
  if (hasAPIPatterns) {
    return { type: 'service', framework: 'node' };
  }
  
  return { type: 'utility', framework: 'vanilla' };
}

function parseCode(content: string): any {
  return parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

interface CodeAnalysis {
  exports: {
    name: string;
    type: 'function' | 'class' | 'component' | 'const';
    params: string[];
    hasAsync: boolean;
    complexity: number;
  }[];
  imports: string[];
  stateVariables: string[];
  effects: string[];
  conditionals: number;
  loops: number;
  errorHandlers: number;
}

function analyzeCode(ast: any, fileType: FileType): CodeAnalysis {
  const analysis: CodeAnalysis = {
    exports: [],
    imports: [],
    stateVariables: [],
    effects: [],
    conditionals: 0,
    loops: 0,
    errorHandlers: 0,
  };

  traverse(ast, {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      analysis.imports.push(path.node.source.value);
    },
    
    ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
      if (path.node.declaration) {
        if (t.isFunctionDeclaration(path.node.declaration)) {
          analysis.exports.push({
            name: path.node.declaration.id?.name || 'anonymous',
            type: 'function',
            params: path.node.declaration.params.map(() => 'param'),
            hasAsync: path.node.declaration.async,
            complexity: calculateComplexity(path.node.declaration),
          });
        }
      }
    },
    
    ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
      if (t.isFunctionDeclaration(path.node.declaration)) {
        analysis.exports.push({
          name: path.node.declaration.id?.name || 'default',
          type: fileType.type === 'component' ? 'component' : 'function',
          params: path.node.declaration.params.map(() => 'param'),
          hasAsync: path.node.declaration.async,
          complexity: calculateComplexity(path.node.declaration),
        });
      }
    },
    
    CallExpression(path: NodePath<t.CallExpression>) {
      if (t.isIdentifier(path.node.callee)) {
        if (path.node.callee.name === 'useState') {
          analysis.stateVariables.push('state');
        }
        if (path.node.callee.name === 'useEffect') {
          analysis.effects.push('effect');
        }
      }
    },
    
    IfStatement() {
      analysis.conditionals++;
    },
    
    ConditionalExpression() {
      analysis.conditionals++;
    },
    
    ForStatement() {
      analysis.loops++;
    },
    
    WhileStatement() {
      analysis.loops++;
    },
    
    TryStatement() {
      analysis.errorHandlers++;
    },
  });

  return analysis;
}

function calculateComplexity(node: any): number {
  let complexity = 1;
  
  traverse(node, {
    IfStatement() { complexity++; },
    ConditionalExpression() { complexity++; },
    ForStatement() { complexity++; },
    WhileStatement() { complexity++; },
    LogicalExpression() { complexity++; },
  });
  
  return complexity;
}

function detectTestFramework(): 'jest' | 'vitest' | 'mocha' {
  // Check package.json or use default
  if (existsSync('package.json')) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps.vitest) return 'vitest';
    if (deps.mocha) return 'mocha';
  }
  
  return 'jest';
}

interface GeneratedTests {
  code: string;
  categories: {
    unit: number;
    integration: number;
    edgeCases: number;
    errorHandling: number;
    accessibility: number;
  };
}

function generateTests(
  analysis: CodeAnalysis,
  framework: string,
  config: TestGenerationConfig
): GeneratedTests {
  const tests: GeneratedTests = {
    code: '',
    categories: {
      unit: 0,
      integration: 0,
      edgeCases: 0,
      errorHandling: 0,
      accessibility: 0,
    },
  };

  const imports = generateImports(analysis, framework);
  const testSuites = analysis.exports.map(exp => 
    generateTestSuite(exp, analysis, framework, config)
  );
  
  tests.code = `${imports}\n\n${testSuites.join('\n\n')}`;
  
  // Count test categories
  testSuites.forEach(suite => {
    tests.categories.unit += (suite.match(/it\(/g) || []).length;
    tests.categories.edgeCases += (suite.match(/edge case/gi) || []).length;
    tests.categories.errorHandling += (suite.match(/error|catch|throw/gi) || []).length;
    tests.categories.accessibility += (suite.match(/aria|role|accessible/gi) || []).length;
  });
  
  return tests;
}

function generateImports(analysis: CodeAnalysis, framework: string): string {
  const fileType = analysis.exports[0]?.type;
  
  if (fileType === 'component') {
    return `import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${analysis.exports[0].name} } from '${analysis.exports[0].name}';

// Mock dependencies
${analysis.imports.filter(imp => imp.startsWith('.')).map(imp => 
  `jest.mock('${imp}');`
).join('\n')}`;
  }
  
  return `import { describe, it, expect, beforeEach, jest } from '${framework}';
import { ${analysis.exports.map(e => e.name).join(', ')} } from './module';`;
}

function generateTestSuite(
  exportItem: any,
  analysis: CodeAnalysis,
  framework: string,
  config: TestGenerationConfig
): string {
  if (exportItem.type === 'component') {
    return generateComponentTests(exportItem, analysis, config);
  }
  
  if (exportItem.type === 'function') {
    return generateFunctionTests(exportItem, analysis, config);
  }
  
  return generateGenericTests(exportItem, analysis, config);
}

function generateComponentTests(
  component: any,
  analysis: CodeAnalysis,
  config: TestGenerationConfig
): string {
  return `describe('${component.name}', () => {
  const defaultProps = {
    // Add default props here
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<${component.name} {...defaultProps} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
    
    it('should render with all props', () => {
      const props = {
        ...defaultProps,
        // Add all props
      };
      render(<${component.name} {...props} />);
      // Add assertions
    });
    
    ${analysis.stateVariables.length > 0 ? `
    it('should handle loading state', () => {
      render(<${component.name} {...defaultProps} isLoading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    
    it('should handle error state', () => {
      const error = new Error('Test error');
      render(<${component.name} {...defaultProps} error={error} />);
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    it('should handle empty state', () => {
      render(<${component.name} {...defaultProps} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });` : ''}
  });
  
  describe('Interactions', () => {
    it('should handle user interactions', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<${component.name} {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
  
  ${config.includeEdgeCases ? `
  describe('Edge Cases', () => {
    it('should handle null props gracefully', () => {
      render(<${component.name} {...defaultProps} data={null} />);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
    
    it('should handle very large datasets', () => {
      const largeData = Array(1000).fill(null).map((_, i) => ({ id: i }));
      render(<${component.name} {...defaultProps} data={largeData} />);
      // Performance assertions
    });
  });` : ''}
  
  ${config.includeAccessibility ? `
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<${component.name} {...defaultProps} />);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby');
    });
    
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<${component.name} {...defaultProps} />);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
    
    it('should announce changes to screen readers', async () => {
      const { rerender } = render(<${component.name} {...defaultProps} />);
      
      rerender(<${component.name} {...defaultProps} status="success" />);
      
      expect(screen.getByRole('status')).toHaveTextContent(/success/i);
    });
  });` : ''}
});`;
}

function generateFunctionTests(
  func: any,
  analysis: CodeAnalysis,
  config: TestGenerationConfig
): string {
  return `describe('${func.name}', () => {
  ${func.hasAsync ? `
  it('should handle async operations', async () => {
    const result = await ${func.name}(/* params */);
    expect(result).toBeDefined();
  });
  
  it('should handle async errors', async () => {
    // Mock error scenario
    await expect(${func.name}(/* invalid params */)).rejects.toThrow();
  });` : `
  it('should return expected result', () => {
    const result = ${func.name}(/* params */);
    expect(result).toBeDefined();
  });`}
  
  ${analysis.errorHandlers > 0 ? `
  it('should handle errors gracefully', () => {
    expect(() => ${func.name}(/* invalid params */)).not.toThrow();
  });` : ''}
  
  ${config.includeEdgeCases ? `
  describe('Edge Cases', () => {
    it('should handle null input', () => {
      const result = ${func.name}(null);
      expect(result).toBeDefined();
    });
    
    it('should handle empty input', () => {
      const result = ${func.name}([]);
      expect(result).toBeDefined();
    });
    
    it('should handle large input', () => {
      const largeInput = Array(10000).fill(0);
      const result = ${func.name}(largeInput);
      expect(result).toBeDefined();
    });
  });` : ''}
});`;
}

function generateGenericTests(
  item: any,
  analysis: CodeAnalysis,
  config: TestGenerationConfig
): string {
  return `describe('${item.name}', () => {
  it('should be defined', () => {
    expect(${item.name}).toBeDefined();
  });
  
  // Add more specific tests based on the implementation
});`;
}

function estimateCoverage(analysis: CodeAnalysis, tests: GeneratedTests): any {
  const totalFunctions = analysis.exports.length;
  const totalBranches = analysis.conditionals;
  const totalLines = analysis.exports.reduce((acc, exp) => acc + exp.complexity * 10, 0);
  
  const coveredFunctions = Math.min(tests.categories.unit, totalFunctions);
  const coveredBranches = Math.min(
    tests.categories.unit + tests.categories.edgeCases,
    totalBranches
  );
  const coveredLines = Math.min(
    (tests.categories.unit * 10) + (tests.categories.edgeCases * 5),
    totalLines
  );
  
  return {
    estimated: Math.round(
      ((coveredFunctions / totalFunctions) * 0.3 +
       (coveredBranches / Math.max(totalBranches, 1)) * 0.3 +
       (coveredLines / Math.max(totalLines, 1)) * 0.4) * 100
    ),
    functions: Math.round((coveredFunctions / totalFunctions) * 100),
    branches: Math.round((coveredBranches / Math.max(totalBranches, 1)) * 100),
    lines: Math.round((coveredLines / Math.max(totalLines, 1)) * 100),
  };
}

function generateSuggestions(
  coverage: any,
  target: number,
  analysis: CodeAnalysis
): string[] {
  const suggestions: string[] = [];
  
  if (coverage.estimated < target) {
    const gap = target - coverage.estimated;
    
    if (coverage.functions < target) {
      suggestions.push(
        `Add ${Math.ceil(gap / 10)} more unit tests to cover all exported functions`
      );
    }
    
    if (coverage.branches < target) {
      suggestions.push(
        'Add tests for all conditional branches (if/else, switch cases)'
      );
    }
    
    if (analysis.errorHandlers > 0 && coverage.estimated < target) {
      suggestions.push(
        'Add specific error handling tests for try/catch blocks'
      );
    }
    
    if (analysis.effects.length > 0) {
      suggestions.push(
        'Add tests for useEffect hooks and their cleanup functions'
      );
    }
    
    suggestions.push(
      'Consider adding integration tests to test component interactions',
      'Add edge case tests for boundary conditions',
      'Include performance tests for operations with large datasets'
    );
  } else {
    suggestions.push(
      `Great! Estimated coverage of ${coverage.estimated}% exceeds target of ${target}%`,
      'Consider adding e2e tests for critical user journeys',
      'Add visual regression tests for UI components'
    );
  }
  
  return suggestions;
}