import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface HallucinationCheckResult {
  safe: boolean;
  issues: {
    type: 'import' | 'method' | 'pattern';
    item: string;
    issue: string;
    suggestion?: string;
  }[];
  warnings: string[];
}

export async function checkBeforeSuggesting(
  imports: string[],
  methods: string[],
  patterns?: string[]
): Promise<HallucinationCheckResult> {
  const result: HallucinationCheckResult = {
    safe: true,
    issues: [],
    warnings: [],
  };

  // Check imports
  const projectPath = process.env.PROJECT_PATH || process.cwd();
  const packageJsonPath = join(projectPath, 'package.json');
  
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    };

    for (const imp of imports) {
      // Extract package name from import
      const packageName = extractPackageName(imp);
      
      if (!isBuiltinModule(packageName) && !allDeps[packageName]) {
        result.safe = false;
        result.issues.push({
          type: 'import',
          item: imp,
          issue: `Package "${packageName}" not found in dependencies`,
          suggestion: `Check if the package is installed or use a different approach`,
        });
      }
    }
  }

  // Check methods
  for (const method of methods) {
    const validation = validateMethod(method);
    if (!validation.valid) {
      result.safe = false;
      result.issues.push({
        type: 'method',
        item: method,
        issue: validation.issue,
        suggestion: validation.suggestion,
      });
    }
  }

  // Check patterns
  if (patterns) {
    for (const pattern of patterns) {
      const validation = validatePattern(pattern);
      if (!validation.valid) {
        result.safe = false;
        result.issues.push({
          type: 'pattern',
          item: pattern,
          issue: validation.issue,
          suggestion: validation.suggestion,
        });
      }
    }
  }

  // Add warnings for common mistakes
  if (methods.some(m => m.includes('findLast'))) {
    result.warnings.push(
      'Array.prototype.findLast() is not available in all environments. Consider using a polyfill or alternative approach.'
    );
  }

  if (imports.some(i => i.includes('react') && i.includes('useSyncExternalStore'))) {
    result.warnings.push(
      'useSyncExternalStore is only available in React 18+. Verify the project React version.'
    );
  }

  return result;
}

function extractPackageName(importStatement: string): string {
  // Handle various import formats
  const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
  if (match) {
    const path = match[1];
    // Handle scoped packages like @types/node
    if (path.startsWith('@')) {
      const parts = path.split('/');
      return parts.slice(0, 2).join('/');
    }
    // Regular packages
    return path.split('/')[0];
  }
  return importStatement;
}

function isBuiltinModule(name: string): boolean {
  const builtins = [
    'fs', 'path', 'http', 'https', 'crypto', 'os', 'util',
    'stream', 'events', 'child_process', 'cluster', 'url',
    'querystring', 'assert', 'buffer', 'process', 'console',
  ];
  return builtins.includes(name);
}

interface MethodValidation {
  valid: boolean;
  issue: string;
  suggestion?: string;
}

function validateMethod(method: string): MethodValidation {
  const knownIssues: Record<string, MethodValidation> = {
    'Array.prototype.findLast': {
      valid: false,
      issue: 'Not available in all JavaScript environments',
      suggestion: 'Use arr.slice().reverse().find() or a polyfill',
    },
    'Object.hasOwn': {
      valid: false,
      issue: 'ES2022 feature, not widely supported',
      suggestion: 'Use Object.prototype.hasOwnProperty.call(obj, prop)',
    },
    'String.prototype.replaceAll': {
      valid: false,
      issue: 'Not available in older environments',
      suggestion: 'Use str.replace(/pattern/g, replacement)',
    },
    'Promise.any': {
      valid: false,
      issue: 'ES2021 feature, check environment support',
      suggestion: 'Use Promise.race() or a polyfill',
    },
    'WeakRef': {
      valid: false,
      issue: 'ES2021 feature, limited support',
      suggestion: 'Consider if WeakRef is truly necessary',
    },
  };

  if (knownIssues[method]) {
    return knownIssues[method];
  }

  // Check for React hooks in wrong context
  if (method.includes('use') && method[3] === method[3].toUpperCase()) {
    if (method.includes('useSyncExternalStore') || method.includes('useTransition')) {
      return {
        valid: false,
        issue: 'React 18+ hook, may not be available',
        suggestion: 'Check React version or use alternative approach',
      };
    }
  }

  return { valid: true, issue: '' };
}

interface PatternValidation {
  valid: boolean;
  issue: string;
  suggestion?: string;
}

function validatePattern(pattern: string): PatternValidation {
  const deprecatedPatterns = [
    {
      pattern: 'componentWillMount',
      issue: 'Deprecated React lifecycle method',
      suggestion: 'Use useEffect with empty dependency array',
    },
    {
      pattern: 'componentWillReceiveProps',
      issue: 'Deprecated React lifecycle method',
      suggestion: 'Use useEffect with dependencies',
    },
    {
      pattern: 'dangerouslySetInnerHTML',
      issue: 'Security risk if used with user input',
      suggestion: 'Sanitize content or use a safe alternative',
    },
    {
      pattern: 'eval(',
      issue: 'Security vulnerability',
      suggestion: 'Parse JSON or use Function constructor cautiously',
    },
    {
      pattern: 'innerHTML',
      issue: 'XSS vulnerability risk',
      suggestion: 'Use textContent or sanitized content',
    },
  ];

  for (const deprecated of deprecatedPatterns) {
    if (pattern.includes(deprecated.pattern)) {
      return {
        valid: false,
        issue: deprecated.issue,
        suggestion: deprecated.suggestion,
      };
    }
  }

  return { valid: true, issue: '' };
}