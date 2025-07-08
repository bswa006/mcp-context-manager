interface SecurityCheckResult {
  secure: boolean;
  violations: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    message: string;
    line?: number;
    suggestion: string;
  }[];
  recommendations: string[];
}

export async function checkSecurityCompliance(
  code: string,
  sensitiveOperations?: string[]
): Promise<SecurityCheckResult> {
  const result: SecurityCheckResult = {
    secure: true,
    violations: [],
    recommendations: [],
  };

  // Check for hardcoded secrets
  checkHardcodedSecrets(code, result);
  
  // Check for injection vulnerabilities
  checkInjectionVulnerabilities(code, result);
  
  // Check for XSS vulnerabilities
  checkXSSVulnerabilities(code, result);
  
  // Check authentication/authorization
  checkAuthIssues(code, result);
  
  // Check for sensitive data exposure
  checkDataExposure(code, result);
  
  // Check specific sensitive operations if provided
  if (sensitiveOperations) {
    checkSensitiveOperations(code, sensitiveOperations, result);
  }
  
  // Additional security checks
  checkGeneralSecurity(code, result);
  
  // Determine if code is secure
  result.secure = result.violations.filter(v => 
    v.severity === 'critical' || v.severity === 'high'
  ).length === 0;

  return result;
}

function checkHardcodedSecrets(code: string, result: SecurityCheckResult) {
  const secretPatterns = [
    {
      pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([^"']+)["']/gi,
      message: 'Hardcoded API key detected',
      severity: 'critical' as const,
    },
    {
      pattern: /(?:password|passwd|pwd)\s*[:=]\s*["']([^"']+)["']/gi,
      message: 'Hardcoded password detected',
      severity: 'critical' as const,
    },
    {
      pattern: /(?:secret|token)\s*[:=]\s*["']([^"']+)["']/gi,
      message: 'Hardcoded secret/token detected',
      severity: 'critical' as const,
    },
    {
      pattern: /(?:private[_-]?key)\s*[:=]\s*["']([^"']+)["']/gi,
      message: 'Hardcoded private key detected',
      severity: 'critical' as const,
    },
    {
      pattern: /mongodb:\/\/[^/\s]+:[^@\s]+@/gi,
      message: 'Hardcoded database credentials in connection string',
      severity: 'critical' as const,
    },
  ];

  const lines = code.split('\n');
  
  secretPatterns.forEach(({ pattern, message, severity }) => {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      // Skip if it's clearly a placeholder or example
      const value = match[1] || match[0];
      if (value.includes('process.env') || 
          value.includes('YOUR_') || 
          value.includes('EXAMPLE_') ||
          value === 'xxxxxxxx') {
        continue;
      }
      
      result.violations.push({
        severity,
        type: 'hardcoded-secret',
        message,
        line: lineNumber,
        suggestion: 'Use environment variables: process.env.VARIABLE_NAME',
      });
    }
  });
}

function checkInjectionVulnerabilities(code: string, result: SecurityCheckResult) {
  // SQL Injection
  const sqlPatterns = [
    {
      pattern: /query\s*\(\s*["'`].*\$\{[^}]+\}.*["'`]/g,
      message: 'Potential SQL injection - string interpolation in query',
    },
    {
      pattern: /query\s*\(\s*["'`].*\+.*["'`]/g,
      message: 'Potential SQL injection - string concatenation in query',
    },
    {
      pattern: /\.query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
      message: 'Potential SQL injection - template literal in query',
    },
  ];

  sqlPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      result.violations.push({
        severity: 'high',
        type: 'sql-injection',
        message,
        suggestion: 'Use parameterized queries or prepared statements',
      });
    }
  });

  // Command Injection
  if (code.includes('exec(') || code.includes('execSync(')) {
    if (code.match(/exec(?:Sync)?\s*\([^)]*\$\{[^}]+\}/)) {
      result.violations.push({
        severity: 'critical',
        type: 'command-injection',
        message: 'Potential command injection vulnerability',
        suggestion: 'Sanitize inputs or use safer alternatives like execFile',
      });
    }
  }

  // NoSQL Injection
  if (code.includes('$where') || code.includes('$regex')) {
    result.violations.push({
      severity: 'high',
      type: 'nosql-injection',
      message: 'Potential NoSQL injection with $where or $regex',
      suggestion: 'Validate and sanitize user input before using in queries',
    });
  }
}

function checkXSSVulnerabilities(code: string, result: SecurityCheckResult) {
  // dangerouslySetInnerHTML
  if (code.includes('dangerouslySetInnerHTML')) {
    result.violations.push({
      severity: 'high',
      type: 'xss',
      message: 'Using dangerouslySetInnerHTML can lead to XSS',
      suggestion: 'Sanitize content with DOMPurify or use safer alternatives',
    });
  }

  // Direct innerHTML usage
  if (code.match(/\.innerHTML\s*=/) && !code.includes('sanitize')) {
    result.violations.push({
      severity: 'high',
      type: 'xss',
      message: 'Direct innerHTML assignment can lead to XSS',
      suggestion: 'Use textContent or sanitize HTML content',
    });
  }

  // eval() usage
  if (code.includes('eval(')) {
    result.violations.push({
      severity: 'critical',
      type: 'code-injection',
      message: 'eval() usage is a security risk',
      suggestion: 'Use JSON.parse() or safer alternatives',
    });
  }

  // new Function() with user input
  if (code.match(/new\s+Function\s*\([^)]*\$\{/)) {
    result.violations.push({
      severity: 'critical',
      type: 'code-injection',
      message: 'Dynamic function creation with user input',
      suggestion: 'Avoid dynamic code generation or use safe alternatives',
    });
  }
}

function checkAuthIssues(code: string, result: SecurityCheckResult) {
  // JWT in localStorage
  if (code.includes('localStorage') && (code.includes('token') || code.includes('jwt'))) {
    result.violations.push({
      severity: 'medium',
      type: 'auth',
      message: 'Storing JWT tokens in localStorage is vulnerable to XSS',
      suggestion: 'Use httpOnly cookies for token storage',
    });
  }

  // Missing authorization checks
  if (code.match(/\.(delete|update|create|admin)/i) && 
      !code.match(/check.*permission|authorize|can[A-Z]|isAdmin|requireAuth/i)) {
    result.recommendations.push(
      'Ensure proper authorization checks are in place for sensitive operations'
    );
  }

  // Weak password validation
  if (code.includes('password') && code.match(/length\s*[<>]=?\s*[1-7]\b/)) {
    result.violations.push({
      severity: 'medium',
      type: 'auth',
      message: 'Weak password requirements detected',
      suggestion: 'Require at least 8 characters with complexity requirements',
    });
  }
}

function checkDataExposure(code: string, result: SecurityCheckResult) {
  // Logging sensitive data
  const logPatterns = [
    'console.log.*password',
    'console.log.*token',
    'console.log.*secret',
    'console.log.*creditCard',
    'console.log.*ssn',
  ];

  logPatterns.forEach(pattern => {
    if (code.match(new RegExp(pattern, 'i'))) {
      result.violations.push({
        severity: 'high',
        type: 'data-exposure',
        message: 'Potentially logging sensitive data',
        suggestion: 'Remove or mask sensitive data in logs',
      });
    }
  });

  // Exposing stack traces
  if (code.includes('stack') && code.includes('response')) {
    result.violations.push({
      severity: 'medium',
      type: 'data-exposure',
      message: 'Potentially exposing stack traces to users',
      suggestion: 'Only show stack traces in development mode',
    });
  }

  // Exposing system information
  if (code.match(/process\.env|__dirname|process\.cwd/)) {
    if (code.includes('response') || code.includes('res.json') || code.includes('res.send')) {
      result.recommendations.push(
        'Ensure system paths and environment variables are not exposed to users'
      );
    }
  }
}

function checkSensitiveOperations(
  code: string, 
  operations: string[], 
  result: SecurityCheckResult
) {
  operations.forEach(operation => {
    if (code.includes(operation)) {
      // Check if operation has proper validation
      const lines = code.split('\n');
      const opIndex = code.indexOf(operation);
      const lineNumber = code.substring(0, opIndex).split('\n').length;
      
      // Look for validation patterns near the operation
      const contextStart = Math.max(0, lineNumber - 10);
      const contextEnd = Math.min(lines.length, lineNumber + 10);
      const context = lines.slice(contextStart, contextEnd).join('\n');
      
      if (!context.match(/validat|sanitiz|check|verify|authoriz/i)) {
        result.recommendations.push(
          `Ensure proper validation for sensitive operation: ${operation}`
        );
      }
    }
  });
}

function checkGeneralSecurity(code: string, result: SecurityCheckResult) {
  // CORS wildcard
  if (code.includes('Access-Control-Allow-Origin') && code.includes('*')) {
    result.violations.push({
      severity: 'medium',
      type: 'cors',
      message: 'CORS wildcard origin allows any domain',
      suggestion: 'Specify allowed origins explicitly',
    });
  }

  // Missing HTTPS
  if (code.includes('http://') && !code.includes('localhost') && !code.includes('127.0.0.1')) {
    result.violations.push({
      severity: 'medium',
      type: 'transport',
      message: 'Using HTTP instead of HTTPS',
      suggestion: 'Always use HTTPS for production',
    });
  }

  // Rate limiting
  if ((code.includes('router') || code.includes('app.')) && 
      (code.includes('post') || code.includes('put'))) {
    if (!code.includes('rateLimit') && !code.includes('throttle')) {
      result.recommendations.push(
        'Consider implementing rate limiting for API endpoints'
      );
    }
  }

  // CSRF protection
  if (code.includes('form') && code.includes('post') && !code.includes('csrf')) {
    result.recommendations.push(
      'Ensure CSRF protection is implemented for forms'
    );
  }

  // Security headers
  if (code.includes('express()') && !code.includes('helmet')) {
    result.recommendations.push(
      'Consider using helmet.js for security headers'
    );
  }
}