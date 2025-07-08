import { Project, SourceFile, Node, SyntaxKind, FunctionDeclaration, ArrowFunction, ClassDeclaration, InterfaceDeclaration, TypeAliasDeclaration, VariableDeclaration, ImportDeclaration, ExportDeclaration, CallExpression, PropertyAccessExpression, Identifier } from 'ts-morph';
import * as path from 'path';
import { promises as fs } from 'fs';

export interface ASTAnalysisResult {
  filePath: string;
  components: ComponentInfo[];
  functions: FunctionInfo[];
  hooks: HookInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  interfaces: InterfaceInfo[];
  types: TypeInfo[];
  dependencies: DependencyInfo[];
  complexity: ComplexityMetrics;
  patterns: PatternInfo[];
}

export interface ComponentInfo {
  name: string;
  type: 'function' | 'class' | 'arrow';
  props?: string;
  hooks: string[];
  stateVariables: string[];
  effects: string[];
  location: LocationInfo;
  complexity: number;
}

export interface FunctionInfo {
  name: string;
  type: 'function' | 'arrow' | 'method';
  parameters: ParameterInfo[];
  returnType?: string;
  async: boolean;
  generator: boolean;
  location: LocationInfo;
  complexity: number;
  callsTo: string[];
}

export interface HookInfo {
  name: string;
  dependencies: string[];
  location: LocationInfo;
  component: string;
  violations?: string[];
}

export interface ImportInfo {
  source: string;
  specifiers: ImportSpecifier[];
  type: 'named' | 'default' | 'namespace' | 'side-effect';
  location: LocationInfo;
}

export interface ExportInfo {
  name: string;
  type: 'named' | 'default' | 'namespace';
  kind: 'value' | 'type' | 'interface';
  location: LocationInfo;
}

export interface InterfaceInfo {
  name: string;
  properties: PropertyInfo[];
  extends?: string[];
  location: LocationInfo;
}

export interface TypeInfo {
  name: string;
  type: string;
  location: LocationInfo;
}

export interface DependencyInfo {
  from: string;
  to: string;
  type: 'import' | 'call' | 'extends' | 'implements';
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  nestingDepth: number;
  parameterCount: number;
}

export interface PatternInfo {
  type: string;
  name: string;
  confidence: number;
  evidence: string[];
  location: LocationInfo;
}

interface LocationInfo {
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

interface ImportSpecifier {
  name: string;
  alias?: string;
  isTypeOnly: boolean;
}

interface ParameterInfo {
  name: string;
  type?: string;
  optional: boolean;
  defaultValue?: string;
}

interface PropertyInfo {
  name: string;
  type?: string;
  optional: boolean;
  readonly: boolean;
}

export class ASTAnalyzer {
  private project: Project;
  private cache: Map<string, ASTAnalysisResult> = new Map();

  constructor(tsConfigPath?: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true,
    });
  }

  async analyzeFile(filePath: string): Promise<ASTAnalysisResult> {
    const cached = this.cache.get(filePath);
    if (cached) {
      return cached;
    }

    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const result = await this.analyzeSourceFile(sourceFile);
    
    this.cache.set(filePath, result);
    return result;
  }

  async analyzeDirectory(dirPath: string, patterns: string[] = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']): Promise<ASTAnalysisResult[]> {
    const results: ASTAnalysisResult[] = [];
    
    for (const pattern of patterns) {
      const files = await this.findFiles(dirPath, pattern);
      for (const file of files) {
        try {
          const result = await this.analyzeFile(file);
          results.push(result);
        } catch (error) {
          console.error(`Error analyzing ${file}:`, error);
        }
      }
    }
    
    return results;
  }

  private async analyzeSourceFile(sourceFile: SourceFile): Promise<ASTAnalysisResult> {
    const filePath = sourceFile.getFilePath();
    
    const result: ASTAnalysisResult = {
      filePath,
      components: this.extractComponents(sourceFile),
      functions: this.extractFunctions(sourceFile),
      hooks: this.extractHooks(sourceFile),
      imports: this.extractImports(sourceFile),
      exports: this.extractExports(sourceFile),
      interfaces: this.extractInterfaces(sourceFile),
      types: this.extractTypes(sourceFile),
      dependencies: this.extractDependencies(sourceFile),
      complexity: this.calculateComplexity(sourceFile),
      patterns: this.detectPatterns(sourceFile),
    };

    return result;
  }

  private extractComponents(sourceFile: SourceFile): ComponentInfo[] {
    const components: ComponentInfo[] = [];
    
    // Function components
    sourceFile.getFunctions().forEach(func => {
      if (this.isReactComponent(func)) {
        components.push(this.analyzeFunctionComponent(func));
      }
    });

    // Arrow function components
    sourceFile.getVariableDeclarations().forEach(varDecl => {
      const initializer = varDecl.getInitializer();
      if (Node.isArrowFunction(initializer) && this.isReactComponent(initializer)) {
        components.push(this.analyzeArrowComponent(varDecl, initializer));
      }
    });

    // Class components
    sourceFile.getClasses().forEach(classDecl => {
      if (this.isReactClassComponent(classDecl)) {
        components.push(this.analyzeClassComponent(classDecl));
      }
    });

    return components;
  }

  private extractFunctions(sourceFile: SourceFile): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    // Regular functions
    sourceFile.getFunctions().forEach(func => {
      if (!this.isReactComponent(func)) {
        functions.push(this.analyzeFunctionDeclaration(func));
      }
    });

    // Arrow functions
    sourceFile.getVariableDeclarations().forEach(varDecl => {
      const initializer = varDecl.getInitializer();
      if (Node.isArrowFunction(initializer) && !this.isReactComponent(initializer)) {
        functions.push(this.analyzeArrowFunction(varDecl, initializer));
      }
    });

    // Methods in classes
    sourceFile.getClasses().forEach(classDecl => {
      classDecl.getMethods().forEach(method => {
        functions.push(this.analyzeMethod(method, classDecl.getName() || 'Anonymous'));
      });
    });

    return functions;
  }

  private extractHooks(sourceFile: SourceFile): HookInfo[] {
    const hooks: HookInfo[] = [];
    
    sourceFile.forEachDescendant(node => {
      if (Node.isCallExpression(node)) {
        const expression = node.getExpression();
        if (Node.isIdentifier(expression)) {
          const hookName = expression.getText();
          if (hookName.startsWith('use')) {
            hooks.push(this.analyzeHook(node, hookName));
          }
        }
      }
    });

    return hooks;
  }

  private extractImports(sourceFile: SourceFile): ImportInfo[] {
    return sourceFile.getImportDeclarations().map(importDecl => {
      const source = importDecl.getModuleSpecifierValue();
      const namedImports = importDecl.getNamedImports();
      const defaultImport = importDecl.getDefaultImport();
      const namespaceImport = importDecl.getNamespaceImport();
      
      const specifiers: ImportSpecifier[] = [];
      
      if (defaultImport) {
        specifiers.push({
          name: defaultImport.getText(),
          isTypeOnly: importDecl.isTypeOnly(),
        });
      }
      
      if (namespaceImport) {
        specifiers.push({
          name: namespaceImport.getText(),
          isTypeOnly: importDecl.isTypeOnly(),
        });
      }
      
      namedImports.forEach(namedImport => {
        specifiers.push({
          name: namedImport.getName(),
          alias: namedImport.getAliasNode()?.getText(),
          isTypeOnly: namedImport.isTypeOnly() || importDecl.isTypeOnly(),
        });
      });

      let type: ImportInfo['type'] = 'side-effect';
      if (defaultImport) type = 'default';
      else if (namespaceImport) type = 'namespace';
      else if (namedImports.length > 0) type = 'named';

      return {
        source,
        specifiers,
        type,
        location: this.getLocation(importDecl),
      };
    });
  }

  private extractExports(sourceFile: SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = [];

    // Named exports
    sourceFile.getExportDeclarations().forEach(exportDecl => {
      exportDecl.getNamedExports().forEach(namedExport => {
        exports.push({
          name: namedExport.getName(),
          type: 'named',
          kind: 'value',
          location: this.getLocation(namedExport),
        });
      });
    });

    // Default exports
    sourceFile.getDefaultExportSymbol()?.getDeclarations().forEach(decl => {
      exports.push({
        name: 'default',
        type: 'default',
        kind: 'value',
        location: this.getLocation(decl),
      });
    });

    // Export assignments
    sourceFile.getExportAssignments().forEach(exportAssign => {
      exports.push({
        name: exportAssign.getExpression().getText(),
        type: exportAssign.isExportEquals() ? 'namespace' : 'default',
        kind: 'value',
        location: this.getLocation(exportAssign),
      });
    });

    return exports;
  }

  private extractInterfaces(sourceFile: SourceFile): InterfaceInfo[] {
    return sourceFile.getInterfaces().map(interfaceDecl => ({
      name: interfaceDecl.getName(),
      properties: interfaceDecl.getProperties().map(prop => ({
        name: prop.getName(),
        type: prop.getType().getText(),
        optional: prop.hasQuestionToken(),
        readonly: prop.isReadonly(),
      })),
      extends: interfaceDecl.getExtends().map(ext => ext.getText()),
      location: this.getLocation(interfaceDecl),
    }));
  }

  private extractTypes(sourceFile: SourceFile): TypeInfo[] {
    return sourceFile.getTypeAliases().map(typeAlias => ({
      name: typeAlias.getName(),
      type: typeAlias.getType().getText(),
      location: this.getLocation(typeAlias),
    }));
  }

  private extractDependencies(sourceFile: SourceFile): DependencyInfo[] {
    const dependencies: DependencyInfo[] = [];
    const fileName = path.basename(sourceFile.getFilePath());

    // Import dependencies
    this.extractImports(sourceFile).forEach(imp => {
      dependencies.push({
        from: fileName,
        to: imp.source,
        type: 'import',
      });
    });

    // TODO: Add call dependencies, extends, implements

    return dependencies;
  }

  private calculateComplexity(sourceFile: SourceFile): ComplexityMetrics {
    let cyclomaticComplexity = 1;
    let cognitiveComplexity = 0;
    let maxNestingDepth = 0;
    let currentDepth = 0;
    let maxParams = 0;

    sourceFile.forEachDescendant(node => {
      // Cyclomatic complexity
      if (Node.isIfStatement(node) || 
          Node.isWhileStatement(node) || 
          Node.isForStatement(node) || 
          Node.isDoStatement(node) ||
          Node.isCaseClause(node) ||
          Node.isConditionalExpression(node)) {
        cyclomaticComplexity++;
      }

      // Cognitive complexity
      if (Node.isIfStatement(node) || 
          Node.isWhileStatement(node) || 
          Node.isForStatement(node)) {
        cognitiveComplexity += 1 + currentDepth;
      }

      // Nesting depth
      if (Node.isBlock(node) || Node.isIfStatement(node) || Node.isIterationStatement(node)) {
        currentDepth++;
        maxNestingDepth = Math.max(maxNestingDepth, currentDepth);
      }

      // Parameter count
      if (Node.isFunctionDeclaration(node) || Node.isArrowFunction(node) || Node.isMethodDeclaration(node)) {
        const params = node.getParameters().length;
        maxParams = Math.max(maxParams, params);
      }
    });

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode: sourceFile.getEndLineNumber(),
      nestingDepth: maxNestingDepth,
      parameterCount: maxParams,
    };
  }

  private detectPatterns(sourceFile: SourceFile): PatternInfo[] {
    const patterns: PatternInfo[] = [];

    // Detect React patterns
    if (this.hasReactImport(sourceFile)) {
      // Hook patterns
      const customHooks = this.detectCustomHooks(sourceFile);
      customHooks.forEach(hook => {
        patterns.push({
          type: 'custom-hook',
          name: hook.name,
          confidence: 0.9,
          evidence: [`Custom hook ${hook.name} follows React conventions`],
          location: hook.location,
        });
      });

      // Component patterns
      const hocPattern = this.detectHOCPattern(sourceFile);
      if (hocPattern) {
        patterns.push(hocPattern);
      }

      // Context pattern
      const contextPattern = this.detectContextPattern(sourceFile);
      if (contextPattern) {
        patterns.push(contextPattern);
      }
    }

    // Detect design patterns
    const singletonPattern = this.detectSingletonPattern(sourceFile);
    if (singletonPattern) {
      patterns.push(singletonPattern);
    }

    const factoryPattern = this.detectFactoryPattern(sourceFile);
    if (factoryPattern) {
      patterns.push(factoryPattern);
    }

    return patterns;
  }

  // Helper methods
  private isReactComponent(node: FunctionDeclaration | ArrowFunction): boolean {
    const name = Node.isFunctionDeclaration(node) ? node.getName() : null;
    if (name && /^[A-Z]/.test(name)) {
      // Check if returns JSX
      const returnStatements = node.getDescendantsOfKind(SyntaxKind.ReturnStatement);
      return returnStatements.some(ret => {
        const expr = ret.getExpression();
        return expr && (
          Node.isJsxElement(expr) || 
          Node.isJsxFragment(expr) || 
          Node.isJsxSelfClosingElement(expr)
        );
      });
    }
    return false;
  }

  private isReactClassComponent(classDecl: ClassDeclaration): boolean {
    const heritage = classDecl.getExtends();
    if (!heritage) return false;
    
    const text = heritage.getText();
    return text.includes('Component') || text.includes('PureComponent');
  }

  private hasReactImport(sourceFile: SourceFile): boolean {
    return sourceFile.getImportDeclarations().some(imp => 
      imp.getModuleSpecifierValue() === 'react'
    );
  }

  private getLocation(node: Node): LocationInfo {
    const start = node.getStartLinePos();
    const end = node.getEndLinePos();
    const sourceFile = node.getSourceFile();
    
    return {
      line: sourceFile.getLineAndColumnAtPos(start).line,
      column: sourceFile.getLineAndColumnAtPos(start).column,
      endLine: sourceFile.getLineAndColumnAtPos(end).line,
      endColumn: sourceFile.getLineAndColumnAtPos(end).column,
    };
  }

  private analyzeFunctionComponent(func: FunctionDeclaration): ComponentInfo {
    const name = func.getName() || 'Anonymous';
    const hooks = this.extractComponentHooks(func);
    const stateVariables = this.extractStateVariables(func);
    const effects = this.extractEffects(func);
    
    return {
      name,
      type: 'function',
      props: func.getParameters()[0]?.getType().getText(),
      hooks,
      stateVariables,
      effects,
      location: this.getLocation(func),
      complexity: this.calculateNodeComplexity(func),
    };
  }

  private analyzeArrowComponent(varDecl: VariableDeclaration, arrow: ArrowFunction): ComponentInfo {
    const name = varDecl.getName();
    const hooks = this.extractComponentHooks(arrow);
    const stateVariables = this.extractStateVariables(arrow);
    const effects = this.extractEffects(arrow);
    
    return {
      name,
      type: 'arrow',
      props: arrow.getParameters()[0]?.getType().getText(),
      hooks,
      stateVariables,
      effects,
      location: this.getLocation(varDecl),
      complexity: this.calculateNodeComplexity(arrow),
    };
  }

  private analyzeClassComponent(classDecl: ClassDeclaration): ComponentInfo {
    const name = classDecl.getName() || 'Anonymous';
    const stateVariables = this.extractClassStateVariables(classDecl);
    
    return {
      name,
      type: 'class',
      props: classDecl.getProperty('props')?.getType().getText(),
      hooks: [],
      stateVariables,
      effects: [],
      location: this.getLocation(classDecl),
      complexity: this.calculateNodeComplexity(classDecl),
    };
  }

  private analyzeFunctionDeclaration(func: FunctionDeclaration): FunctionInfo {
    return {
      name: func.getName() || 'Anonymous',
      type: 'function',
      parameters: func.getParameters().map(param => ({
        name: param.getName(),
        type: param.getType().getText(),
        optional: param.isOptional(),
        defaultValue: param.getInitializer()?.getText(),
      })),
      returnType: func.getReturnType().getText(),
      async: func.isAsync(),
      generator: func.isGenerator(),
      location: this.getLocation(func),
      complexity: this.calculateNodeComplexity(func),
      callsTo: this.extractFunctionCalls(func),
    };
  }

  private analyzeArrowFunction(varDecl: VariableDeclaration, arrow: ArrowFunction): FunctionInfo {
    return {
      name: varDecl.getName(),
      type: 'arrow',
      parameters: arrow.getParameters().map(param => ({
        name: param.getName(),
        type: param.getType().getText(),
        optional: param.isOptional(),
        defaultValue: param.getInitializer()?.getText(),
      })),
      returnType: arrow.getReturnType().getText(),
      async: arrow.isAsync(),
      generator: false,
      location: this.getLocation(varDecl),
      complexity: this.calculateNodeComplexity(arrow),
      callsTo: this.extractFunctionCalls(arrow),
    };
  }

  private analyzeMethod(method: Node, className: string): FunctionInfo {
    // Type guard to ensure we have a method-like node
    if (!Node.isMethodDeclaration(method) && !Node.isMethodSignature(method)) {
      throw new Error('Node is not a method');
    }
    
    return {
      name: `${className}.${method.getName()}`,
      type: 'method',
      parameters: Node.isMethodDeclaration(method) ? 
        method.getParameters().map(param => ({
          name: param.getName(),
          type: param.getType().getText(),
          optional: param.isOptional(),
          defaultValue: param.getInitializer()?.getText(),
        })) : [],
      returnType: method.getReturnType()?.getText(),
      async: Node.isMethodDeclaration(method) ? method.isAsync() : false,
      generator: false,
      location: this.getLocation(method),
      complexity: this.calculateNodeComplexity(method),
      callsTo: Node.isMethodDeclaration(method) ? this.extractFunctionCalls(method) : [],
    };
  }

  private analyzeHook(callExpr: CallExpression, hookName: string): HookInfo {
    const component = this.findContainingComponent(callExpr);
    const dependencies = this.extractHookDependencies(callExpr, hookName);
    const violations = this.detectHookViolations(callExpr, hookName);
    
    return {
      name: hookName,
      dependencies,
      location: this.getLocation(callExpr),
      component: component || 'Unknown',
      violations: violations.length > 0 ? violations : undefined,
    };
  }

  private extractComponentHooks(node: Node): string[] {
    const hooks: string[] = [];
    
    node.forEachDescendant(child => {
      if (Node.isCallExpression(child)) {
        const expr = child.getExpression();
        if (Node.isIdentifier(expr) && expr.getText().startsWith('use')) {
          hooks.push(expr.getText());
        }
      }
    });
    
    return [...new Set(hooks)];
  }

  private extractStateVariables(node: Node): string[] {
    const stateVars: string[] = [];
    
    node.forEachDescendant(child => {
      if (Node.isCallExpression(child)) {
        const expr = child.getExpression();
        if (Node.isIdentifier(expr) && expr.getText() === 'useState') {
          const parent = child.getParent();
          if (Node.isVariableDeclaration(parent)) {
            const nameNode = parent.getNameNode();
            if (Node.isArrayBindingPattern(nameNode)) {
              const elements = nameNode.getElements();
              if (elements.length > 0 && Node.isBindingElement(elements[0])) {
                stateVars.push(elements[0].getName());
              }
            }
          }
        }
      }
    });
    
    return stateVars;
  }

  private extractEffects(node: Node): string[] {
    const effects: string[] = [];
    
    node.forEachDescendant(child => {
      if (Node.isCallExpression(child)) {
        const expr = child.getExpression();
        if (Node.isIdentifier(expr) && expr.getText() === 'useEffect') {
          effects.push('useEffect');
        }
      }
    });
    
    return effects;
  }

  private extractClassStateVariables(classDecl: ClassDeclaration): string[] {
    const stateVars: string[] = [];
    
    // Check constructor for state initialization
    const constructor = classDecl.getConstructors()[0];
    if (constructor) {
      constructor.forEachDescendant(node => {
        if (Node.isPropertyAccessExpression(node) && 
            node.getExpression().getText() === 'this' && 
            node.getName() === 'state') {
          const parent = node.getParent();
          if (Node.isBinaryExpression(parent) && parent.getOperatorToken().getText() === '=') {
            const right = parent.getRight();
            if (Node.isObjectLiteralExpression(right)) {
              right.getProperties().forEach(prop => {
                if (Node.isPropertyAssignment(prop)) {
                  stateVars.push(prop.getName());
                }
              });
            }
          }
        }
      });
    }
    
    return stateVars;
  }

  private extractFunctionCalls(node: Node): string[] {
    const calls: string[] = [];
    
    node.forEachDescendant(child => {
      if (Node.isCallExpression(child)) {
        const expr = child.getExpression();
        if (Node.isIdentifier(expr)) {
          calls.push(expr.getText());
        } else if (Node.isPropertyAccessExpression(expr)) {
          calls.push(expr.getText());
        }
      }
    });
    
    return [...new Set(calls)];
  }

  private extractHookDependencies(callExpr: CallExpression, hookName: string): string[] {
    const deps: string[] = [];
    
    if (hookName === 'useEffect' || hookName === 'useCallback' || hookName === 'useMemo') {
      const args = callExpr.getArguments();
      if (args.length >= 2) {
        const depsArg = args[1];
        if (Node.isArrayLiteralExpression(depsArg)) {
          depsArg.getElements().forEach(elem => {
            if (Node.isIdentifier(elem)) {
              deps.push(elem.getText());
            }
          });
        }
      }
    }
    
    return deps;
  }

  private detectHookViolations(callExpr: CallExpression, hookName: string): string[] {
    const violations: string[] = [];
    
    // Check if hook is called conditionally
    let parent = callExpr.getParent();
    while (parent) {
      if (Node.isIfStatement(parent) || 
          Node.isWhileStatement(parent) || 
          Node.isForStatement(parent)) {
        violations.push('Hook called conditionally');
        break;
      }
      parent = parent.getParent();
    }
    
    // Check if hook is called at top level
    const func = callExpr.getAncestors().find(a => 
      Node.isFunctionDeclaration(a) || 
      Node.isArrowFunction(a) || 
      Node.isMethodDeclaration(a)
    );
    
    if (!func) {
      violations.push('Hook not called inside function component');
    }
    
    return violations;
  }

  private findContainingComponent(node: Node): string | null {
    const ancestors = node.getAncestors();
    
    for (const ancestor of ancestors) {
      if (Node.isFunctionDeclaration(ancestor)) {
        const name = ancestor.getName();
        if (name && /^[A-Z]/.test(name)) {
          return name;
        }
      } else if (Node.isVariableDeclaration(ancestor)) {
        const name = ancestor.getName();
        if (/^[A-Z]/.test(name)) {
          return name;
        }
      } else if (Node.isClassDeclaration(ancestor)) {
        if (this.isReactClassComponent(ancestor)) {
          return ancestor.getName() || 'Anonymous';
        }
      }
    }
    
    return null;
  }

  private calculateNodeComplexity(node: Node): number {
    let complexity = 1;
    
    node.forEachDescendant(child => {
      if (Node.isIfStatement(child) || 
          Node.isWhileStatement(child) || 
          Node.isForStatement(child) || 
          Node.isDoStatement(child) ||
          Node.isCaseClause(child) ||
          Node.isConditionalExpression(child)) {
        complexity++;
      }
    });
    
    return complexity;
  }

  private detectCustomHooks(sourceFile: SourceFile): Array<{ name: string; location: LocationInfo }> {
    const customHooks: Array<{ name: string; location: LocationInfo }> = [];
    
    // Function declarations
    sourceFile.getFunctions().forEach(func => {
      const name = func.getName();
      if (name && name.startsWith('use') && /^use[A-Z]/.test(name)) {
        customHooks.push({ name, location: this.getLocation(func) });
      }
    });
    
    // Arrow functions
    sourceFile.getVariableDeclarations().forEach(varDecl => {
      const name = varDecl.getName();
      if (name.startsWith('use') && /^use[A-Z]/.test(name)) {
        const initializer = varDecl.getInitializer();
        if (Node.isArrowFunction(initializer)) {
          customHooks.push({ name, location: this.getLocation(varDecl) });
        }
      }
    });
    
    return customHooks;
  }

  private detectHOCPattern(sourceFile: SourceFile): PatternInfo | null {
    const hocFunctions = sourceFile.getFunctions().filter(func => {
      const name = func.getName();
      if (!name || !name.startsWith('with')) return false;
      
      // Check if returns a function that returns a component
      const returnType = func.getReturnType();
      return returnType.getText().includes('Component') || 
             returnType.getText().includes('FC') ||
             returnType.getText().includes('JSX.Element');
    });
    
    if (hocFunctions.length > 0) {
      return {
        type: 'higher-order-component',
        name: hocFunctions[0].getName() || 'Unknown',
        confidence: 0.8,
        evidence: ['Function name starts with "with"', 'Returns a component'],
        location: this.getLocation(hocFunctions[0]),
      };
    }
    
    return null;
  }

  private detectContextPattern(sourceFile: SourceFile): PatternInfo | null {
    const contextCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(call => {
        const expr = call.getExpression();
        return Node.isPropertyAccessExpression(expr) && 
               expr.getExpression().getText() === 'React' && 
               expr.getName() === 'createContext';
      });
    
    if (contextCalls.length > 0) {
      return {
        type: 'react-context',
        name: 'Context Provider',
        confidence: 1.0,
        evidence: ['Uses React.createContext'],
        location: this.getLocation(contextCalls[0]),
      };
    }
    
    return null;
  }

  private detectSingletonPattern(sourceFile: SourceFile): PatternInfo | null {
    const classes = sourceFile.getClasses();
    
    for (const classDecl of classes) {
      const staticInstance = classDecl.getStaticProperty('instance');
      const getInstance = classDecl.getStaticMethod('getInstance');
      
      if (staticInstance && getInstance) {
        return {
          type: 'singleton',
          name: classDecl.getName() || 'Unknown',
          confidence: 0.9,
          evidence: ['Has static instance property', 'Has getInstance method'],
          location: this.getLocation(classDecl),
        };
      }
    }
    
    return null;
  }

  private detectFactoryPattern(sourceFile: SourceFile): PatternInfo | null {
    const factoryFunctions = sourceFile.getFunctions().filter(func => {
      const name = func.getName();
      if (!name || !name.toLowerCase().includes('factory')) return false;
      
      // Check if returns different types based on parameters
      const returnStatements = func.getDescendantsOfKind(SyntaxKind.ReturnStatement);
      return returnStatements.length > 1;
    });
    
    if (factoryFunctions.length > 0) {
      return {
        type: 'factory',
        name: factoryFunctions[0].getName() || 'Unknown',
        confidence: 0.7,
        evidence: ['Function name contains "factory"', 'Multiple return statements'],
        location: this.getLocation(factoryFunctions[0]),
      };
    }
    
    return null;
  }

  private async findFiles(dirPath: string, pattern: string): Promise<string[]> {
    const { globby } = await import('globby');
    return globby(pattern, { cwd: dirPath, absolute: true });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}