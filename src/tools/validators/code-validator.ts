import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: {
    severity: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    line?: number;
    suggestion: string;
  }[];
  patterns: {
    followed: string[];
    violated: string[];
  };
}

export async function validateGeneratedCode(
  code: string,
  context: string,
  targetFile?: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    score: 100,
    issues: [],
    patterns: {
      followed: [],
      violated: [],
    },
  };

  // Load project patterns
  const projectPath = process.env.PROJECT_PATH || process.cwd();
  const contextPath = join(projectPath, 'CODEBASE-CONTEXT.md');
  let projectPatterns: any = {};
  
  if (existsSync(contextPath)) {
    const contextContent = readFileSync(contextPath, 'utf-8');
    projectPatterns = extractPatternsFromContext(contextContent);
  }

  // Validate against common issues
  validateCommonIssues(code, result);
  
  // Validate naming conventions
  validateNamingConventions(code, context, result, projectPatterns);
  
  // Validate error handling
  validateErrorHandling(code, result);
  
  // Validate security
  validateSecurity(code, result);
  
  // Validate patterns based on context
  validateContextualPatterns(code, context, result, projectPatterns);
  
  // Check if target file exists and validate consistency
  if (targetFile && existsSync(targetFile)) {
    validateConsistency(code, targetFile, result);
  }

  // Calculate final score
  const errorCount = result.issues.filter(i => i.severity === 'error').length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  
  result.score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));
  result.valid = errorCount === 0;

  return result;
}

function extractPatternsFromContext(content: string): any {
  // Extract patterns from CODEBASE-CONTEXT.md
  const patterns: any = {
    naming: {},
    codeStyle: {},
    constraints: [],
  };

  // Extract naming conventions
  const namingMatch = content.match(/## Naming Conventions(.*?)##/s);
  if (namingMatch) {
    const lines = namingMatch[1].split('\n');
    lines.forEach(line => {
      if (line.includes('Components:')) patterns.naming.components = line.split(':')[1].trim();
      if (line.includes('Hooks:')) patterns.naming.hooks = line.split(':')[1].trim();
      if (line.includes('Files:')) patterns.naming.files = line.split(':')[1].trim();
    });
  }

  // Extract constraints
  const constraintsMatch = content.match(/## Implementation Constraints for AI(.*?)##/s);
  if (constraintsMatch) {
    patterns.constraints = constraintsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.substring(1).trim());
  }

  return patterns;
}

function validateCommonIssues(code: string, result: ValidationResult) {
  // Check for 'any' type
  if (code.includes(': any') || code.includes('<any>')) {
    result.issues.push({
      severity: 'error',
      category: 'type-safety',
      message: 'Avoid using "any" type',
      suggestion: 'Use specific types or unknown if type is truly unknown',
    });
    result.patterns.violated.push('no-any-type');
  }

  // Check for console.log
  if (code.includes('console.log(') && !code.includes('// eslint-disable')) {
    result.issues.push({
      severity: 'warning',
      category: 'code-quality',
      message: 'Remove console.log statements',
      suggestion: 'Use proper logging service or remove debug statements',
    });
  }

  // Check for TODO comments
  if (code.includes('TODO') || code.includes('FIXME')) {
    result.issues.push({
      severity: 'info',
      category: 'maintenance',
      message: 'Contains TODO/FIXME comments',
      suggestion: 'Address TODOs before marking as complete',
    });
  }
}

function validateNamingConventions(
  code: string,
  context: string,
  result: ValidationResult,
  patterns: any
) {
  // Component naming
  if (context.includes('component')) {
    const componentMatch = code.match(/(?:const|function|export)\s+([A-Za-z][A-Za-z0-9]*)/);
    if (componentMatch) {
      const name = componentMatch[1];
      if (name[0] !== name[0].toUpperCase()) {
        result.issues.push({
          severity: 'error',
          category: 'naming',
          message: `Component "${name}" should be PascalCase`,
          suggestion: `Rename to "${name[0].toUpperCase() + name.slice(1)}"`,
        });
        result.patterns.violated.push('component-naming');
      } else {
        result.patterns.followed.push('component-naming');
      }
    }
  }

  // Hook naming
  if (context.includes('hook')) {
    const hookMatch = code.match(/(?:const|function|export)\s+(use[A-Za-z][A-Za-z0-9]*)/);
    if (hookMatch) {
      result.patterns.followed.push('hook-naming');
    } else if (code.includes('function') || code.includes('const')) {
      result.issues.push({
        severity: 'error',
        category: 'naming',
        message: 'Custom hooks must start with "use"',
        suggestion: 'Rename the hook to start with "use"',
      });
      result.patterns.violated.push('hook-naming');
    }
  }
}

function validateErrorHandling(code: string, result: ValidationResult) {
  // Check for try-catch in async functions
  if (code.includes('async') && code.includes('await')) {
    if (!code.includes('try') && !code.includes('.catch')) {
      result.issues.push({
        severity: 'error',
        category: 'error-handling',
        message: 'Async operations must have error handling',
        suggestion: 'Wrap in try-catch or use .catch()',
      });
      result.patterns.violated.push('error-handling');
    } else {
      result.patterns.followed.push('error-handling');
    }
  }

  // Check for loading/error/empty states in components
  if (code.includes('return') && code.includes('<')) {
    const hasLoadingState = code.includes('loading') || code.includes('isLoading');
    const hasErrorState = code.includes('error') || code.includes('isError');
    
    if (code.includes('fetch') || code.includes('useQuery')) {
      if (!hasLoadingState) {
        result.issues.push({
          severity: 'warning',
          category: 'ux',
          message: 'Missing loading state',
          suggestion: 'Add loading state for better UX',
        });
      }
      if (!hasErrorState) {
        result.issues.push({
          severity: 'warning',
          category: 'ux',
          message: 'Missing error state',
          suggestion: 'Add error handling UI',
        });
      }
    }
  }
}

function validateSecurity(code: string, result: ValidationResult) {
  // Check for hardcoded secrets
  const secretPatterns = [
    /api[_-]?key\s*=\s*["'][^"']+["']/i,
    /password\s*=\s*["'][^"']+["']/i,
    /secret\s*=\s*["'][^"']+["']/i,
    /token\s*=\s*["'][^"']+["']/i,
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(code)) {
      result.issues.push({
        severity: 'error',
        category: 'security',
        message: 'Hardcoded secrets detected',
        suggestion: 'Use environment variables for sensitive data',
      });
      result.patterns.violated.push('no-hardcoded-secrets');
      break;
    }
  }

  // Check for dangerous patterns
  if (code.includes('dangerouslySetInnerHTML')) {
    result.issues.push({
      severity: 'error',
      category: 'security',
      message: 'Using dangerouslySetInnerHTML is risky',
      suggestion: 'Sanitize content or use safe alternatives',
    });
  }

  if (code.includes('eval(')) {
    result.issues.push({
      severity: 'error',
      category: 'security',
      message: 'eval() is a security risk',
      suggestion: 'Use JSON.parse() or other safe alternatives',
    });
  }
}

function validateContextualPatterns(
  code: string,
  context: string,
  result: ValidationResult,
  patterns: any
) {
  // Check against project-specific constraints
  if (patterns.constraints) {
    for (const constraint of patterns.constraints) {
      if (constraint.includes('NEVER') && constraint.includes('localStorage')) {
        if (code.includes('localStorage')) {
          result.issues.push({
            severity: 'error',
            category: 'constraint-violation',
            message: 'Project constraint violated: ' + constraint,
            suggestion: 'Follow project-specific rules',
          });
        }
      }
    }
  }

  // Validate imports
  if (code.includes('import type') || !code.includes('import')) {
    result.patterns.followed.push('type-imports');
  } else if (code.match(/import\s*{[^}]*}\s*from\s*['"].*types/)) {
    result.issues.push({
      severity: 'warning',
      category: 'imports',
      message: 'Use "import type" for type-only imports',
      suggestion: 'Change to: import type { ... } from ...',
    });
  }
}

function validateConsistency(code: string, targetFile: string, result: ValidationResult) {
  try {
    const existingCode = readFileSync(targetFile, 'utf-8');
    
    // Check import style consistency
    const existingImportStyle = detectImportStyle(existingCode);
    const newImportStyle = detectImportStyle(code);
    
    if (existingImportStyle && newImportStyle && existingImportStyle !== newImportStyle) {
      result.issues.push({
        severity: 'warning',
        category: 'consistency',
        message: 'Import style differs from existing code',
        suggestion: `Use ${existingImportStyle} to match existing code`,
      });
    }

    // Check indentation consistency
    const existingIndent = detectIndentation(existingCode);
    const newIndent = detectIndentation(code);
    
    if (existingIndent !== newIndent) {
      result.issues.push({
        severity: 'info',
        category: 'formatting',
        message: 'Indentation style differs from existing code',
        suggestion: `Use ${existingIndent} indentation to match`,
      });
    }
  } catch (error) {
    // File read error, skip consistency check
  }
}

function detectImportStyle(code: string): string {
  if (code.includes('import React from')) return 'default imports';
  if (code.includes('import * as')) return 'namespace imports';
  if (code.includes('import {')) return 'named imports';
  return '';
}

function detectIndentation(code: string): string {
  const lines = code.split('\n');
  for (const line of lines) {
    if (line.startsWith('  ') && !line.startsWith('    ')) return '2 spaces';
    if (line.startsWith('    ')) return '4 spaces';
    if (line.startsWith('\t')) return 'tabs';
  }
  return '2 spaces'; // default
}