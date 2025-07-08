// Proactive prompts for AI agents to guide themselves

export const workflowPrompts = {
  // When starting a new feature
  newFeature: {
    trigger: 'User asks to create a new component or feature',
    prompt: `Before I start coding, let me follow the proper workflow:
1. First, I'll check existing patterns in the codebase
2. Verify all APIs and imports I plan to use
3. Get the appropriate pattern template
4. Generate the code following established patterns
5. Validate the code for security and best practices
6. Generate tests to achieve 80%+ coverage
Let me start by analyzing the requirements...`,
    actions: [
      'detect_existing_patterns',
      'check_before_suggesting',
      'get_pattern_for_task',
      'validate_generated_code',
      'check_security_compliance',
      'generate_tests_for_coverage',
    ],
  },

  // When fixing a bug
  bugFix: {
    trigger: 'User reports an error or bug',
    prompt: `I'll help fix this bug. Let me follow the bug fix workflow:
1. First, I'll analyze the error and understand the root cause
2. Check the current implementation
3. Verify my fix approach won't introduce new issues
4. Apply minimal changes while preserving patterns
5. Validate the fix and add tests
Let me start by examining the error...`,
    actions: [
      'detect_existing_patterns',
      'check_before_suggesting',
      'validate_generated_code',
    ],
  },

  // When refactoring code
  refactoring: {
    trigger: 'User asks to refactor or improve code',
    prompt: `I'll help refactor this code. Let me follow the refactoring workflow:
1. Analyze the current code structure
2. Identify improvement opportunities
3. Detect existing patterns to maintain
4. Plan incremental changes
5. Validate each step
Let me start by analyzing the code...`,
    actions: [
      'detect_existing_patterns',
      'validate_generated_code',
      'check_security_compliance',
    ],
  },

  // When adding tests
  addingTests: {
    trigger: 'User asks to add tests or improve coverage',
    prompt: `I'll help generate comprehensive tests. Let me analyze what's needed:
1. Check current test coverage
2. Identify untested code paths
3. Generate tests for different scenarios
4. Include edge cases and error handling
5. Aim for 80%+ coverage
Let me analyze the code to test...`,
    actions: [
      'generate_tests_for_coverage',
      'validate_generated_code',
    ],
  },

  // When unsure about an API
  apiUncertainty: {
    trigger: 'About to use an unfamiliar API or method',
    prompt: `Wait, I should verify this API exists before using it. Let me check:
1. Verify the import/package exists
2. Check the method signature
3. Ensure it's not deprecated
4. Look for the correct pattern
This prevents hallucinations and ensures correct usage...`,
    actions: [
      'check_before_suggesting',
      'get_pattern_for_task',
    ],
  },

  // When generating complex code
  complexCode: {
    trigger: 'Creating code with multiple components or complex logic',
    prompt: `This is a complex implementation. Let me break it down:
1. Plan the component structure
2. Verify all dependencies
3. Follow established patterns
4. Include proper error handling
5. Add comprehensive tests
6. Check security implications
Let me start with the architecture...`,
    actions: [
      'detect_existing_patterns',
      'check_before_suggesting',
      'get_pattern_for_task',
      'validate_generated_code',
      'check_security_compliance',
      'generate_tests_for_coverage',
    ],
  },

  // When dealing with security-sensitive code
  securityConcern: {
    trigger: 'Working with authentication, data validation, or sensitive operations',
    prompt: `This involves security-sensitive operations. Let me ensure safety:
1. Check for hardcoded secrets
2. Validate all inputs
3. Prevent injection attacks
4. Use secure patterns
5. Follow security best practices
Let me review security requirements...`,
    actions: [
      'check_security_compliance',
      'validate_generated_code',
    ],
  },

  // Periodic self-check
  selfCheck: {
    trigger: 'After generating significant code',
    prompt: `Let me do a quick self-check:
1. Did I verify all APIs exist?
2. Did I follow existing patterns?
3. Did I handle errors properly?
4. Did I include tests?
5. Did I check for security issues?
Let me validate my work...`,
    actions: [
      'validate_generated_code',
      'track_agent_performance',
    ],
  },
};

// Helper function to get appropriate prompt
export function getWorkflowPrompt(context: string): typeof workflowPrompts[keyof typeof workflowPrompts] | null {
  const lowerContext = context.toLowerCase();
  
  if (lowerContext.includes('create') || lowerContext.includes('new') || lowerContext.includes('add')) {
    return workflowPrompts.newFeature;
  }
  
  if (lowerContext.includes('error') || lowerContext.includes('bug') || lowerContext.includes('fix')) {
    return workflowPrompts.bugFix;
  }
  
  if (lowerContext.includes('refactor') || lowerContext.includes('improve') || lowerContext.includes('clean')) {
    return workflowPrompts.refactoring;
  }
  
  if (lowerContext.includes('test') || lowerContext.includes('coverage')) {
    return workflowPrompts.addingTests;
  }
  
  if (lowerContext.includes('auth') || lowerContext.includes('security') || lowerContext.includes('password')) {
    return workflowPrompts.securityConcern;
  }
  
  return null;
}

// Proactive reminders
export const proactiveReminders = {
  beforeSuggesting: 'Remember: Always use check_before_suggesting before writing any code',
  afterGenerating: 'Remember: Always validate generated code before presenting it',
  securityCheck: 'Remember: Check for security issues in authentication and data handling code',
  testReminder: 'Remember: Generate tests to achieve 80%+ coverage for new features',
  patternReminder: 'Remember: Follow existing patterns detected in the codebase',
};

// Performance tracking reminder
export function shouldTrackPerformance(linesOfCode: number, isFeatureComplete: boolean): boolean {
  return linesOfCode > 50 || isFeatureComplete;
}