interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export async function validatePattern(
  code: string,
  patternType: 'component' | 'hook' | 'service' | 'api'
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  // Common validations
  validateCommonPatterns(code, result);

  // Pattern-specific validations
  switch (patternType) {
    case 'component':
      validateComponentPattern(code, result);
      break;
    case 'hook':
      validateHookPattern(code, result);
      break;
    case 'service':
      validateServicePattern(code, result);
      break;
    case 'api':
      validateApiPattern(code, result);
      break;
  }

  result.isValid = result.errors.length === 0;
  return result;
}

function validateCommonPatterns(code: string, result: ValidationResult) {
  // Check for any type usage
  if (code.includes(': any') || code.includes('<any>')) {
    result.errors.push('Avoid using "any" type - use specific types instead');
  }

  // Check for console.log in production code
  if (code.includes('console.log(') && !code.includes('// eslint-disable')) {
    result.warnings.push('Remove console.log statements from production code');
  }

  // Check for hardcoded secrets
  const secretPatterns = [
    /api[_-]?key\s*=\s*["'][^"']+["']/i,
    /password\s*=\s*["'][^"']+["']/i,
    /secret\s*=\s*["'][^"']+["']/i,
  ];
  
  for (const pattern of secretPatterns) {
    if (pattern.test(code)) {
      result.errors.push('Never hardcode secrets or API keys - use environment variables');
    }
  }

  // Check for proper error handling
  if (code.includes('async') && !code.includes('try') && !code.includes('.catch')) {
    result.warnings.push('Add error handling for async operations');
  }
}

function validateComponentPattern(code: string, result: ValidationResult) {
  // Check for functional component pattern
  if (code.includes('class') && code.includes('extends') && code.includes('Component')) {
    result.errors.push('Use functional components instead of class components');
  }

  // Check for React.FC usage (if TypeScript)
  if (code.includes('interface') && code.includes('Props') && !code.includes('React.FC')) {
    result.suggestions.push('Consider using React.FC<Props> for component type');
  }

  // Check for proper exports
  if (!code.includes('export default') && !code.includes('export {')) {
    result.warnings.push('Component should be exported');
  }

  // Check for loading/error/empty states
  const hasLoadingState = code.includes('loading') || code.includes('isLoading');
  const hasErrorState = code.includes('error') || code.includes('isError');
  
  if (!hasLoadingState) {
    result.suggestions.push('Consider handling loading state');
  }
  
  if (!hasErrorState) {
    result.suggestions.push('Consider handling error state');
  }
}

function validateHookPattern(code: string, result: ValidationResult) {
  // Check hook naming convention
  if (!code.match(/function use[A-Z]/)) {
    result.errors.push('Custom hooks must start with "use" followed by uppercase letter');
  }

  // Check for rules of hooks violations
  if (code.includes('if') && code.includes('useState')) {
    const ifIndex = code.indexOf('if');
    const useStateIndex = code.indexOf('useState');
    if (ifIndex < useStateIndex) {
      result.warnings.push('Hooks must not be called conditionally');
    }
  }

  // Check for cleanup in useEffect
  if (code.includes('useEffect') && code.includes('addEventListener') && !code.includes('return')) {
    result.warnings.push('useEffect with subscriptions should return a cleanup function');
  }
}

function validateServicePattern(code: string, result: ValidationResult) {
  // Check for proper error handling in services
  if (code.includes('fetch') || code.includes('axios')) {
    if (!code.includes('try') && !code.includes('.catch')) {
      result.errors.push('API calls must include error handling');
    }
  }

  // Check for consistent return types
  if (code.includes('async function')) {
    result.suggestions.push('Ensure consistent return types for async functions');
  }

  // Check for proper typing
  if (!code.includes('interface') && !code.includes('type')) {
    result.warnings.push('Define types for service parameters and return values');
  }
}

function validateApiPattern(code: string, result: ValidationResult) {
  // Check for RESTful conventions
  if (code.includes('/api/')) {
    const hasPlurals = code.match(/\/api\/[a-z]+s(?:\/|$)/);
    if (!hasPlurals) {
      result.suggestions.push('Use plural nouns for REST endpoints (e.g., /api/users)');
    }
  }

  // Check for proper HTTP methods
  const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const hasHttpMethod = httpMethods.some(method => code.includes(method));
  if (!hasHttpMethod && code.includes('fetch')) {
    result.warnings.push('Specify HTTP method explicitly');
  }

  // Check for proper status codes
  if (code.includes('status(') || code.includes('statusCode')) {
    const validStatusCodes = [200, 201, 204, 400, 401, 403, 404, 500];
    result.suggestions.push('Use standard HTTP status codes');
  }

  // Check for input validation
  if (code.includes('req.body') || code.includes('request.body')) {
    if (!code.includes('validate') && !code.includes('schema')) {
      result.errors.push('Validate request body before processing');
    }
  }
}