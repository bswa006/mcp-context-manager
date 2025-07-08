import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type TaskType = 'component' | 'hook' | 'service' | 'api' | 'test' | 'error-handling';

export async function getPatternForTask(
  taskType: TaskType,
  requirements?: string[]
): Promise<string> {
  const projectPath = process.env.PROJECT_PATH || process.cwd();
  const contextPath = join(projectPath, 'CODEBASE-CONTEXT.md');
  const templatePath = join(projectPath, '..', 'PROJECT-TEMPLATE-v10.md');
  
  let basePattern = getBasePattern(taskType);
  
  // Enhance with project-specific patterns
  if (existsSync(contextPath)) {
    const contextContent = readFileSync(contextPath, 'utf-8');
    basePattern = enhanceWithProjectContext(basePattern, contextContent, taskType);
  }
  
  // Add requirements-specific adjustments
  if (requirements && requirements.length > 0) {
    basePattern = adjustForRequirements(basePattern, requirements, taskType);
  }
  
  return basePattern;
}

function getBasePattern(taskType: TaskType): string {
  const patterns: Record<TaskType, string> = {
    component: `# React Component Pattern

## Required Structure
\`\`\`typescript
import React from 'react';
import type { ComponentNameProps } from '../types';

interface ComponentNameProps {
  // Define all props with TypeScript types
  required: string;
  optional?: boolean;
  children?: React.ReactNode;
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  required,
  optional = false,
  children 
}) => {
  // 1. Hooks (if needed)
  const [state, setState] = useState<Type>(initialValue);
  
  // 2. Data fetching (if needed)
  const { data, isLoading, error } = useQuery(...);
  
  // 3. Event handlers
  const handleEvent = useCallback(() => {
    // Handle with proper error handling
  }, [dependencies]);
  
  // 4. Effects (if needed)
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // 5. Early returns for states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  // 6. Main render
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
\`\`\`

## Checklist
- [ ] TypeScript interfaces for all props
- [ ] Loading, error, and empty states handled
- [ ] Event handlers wrapped in useCallback if passed as props
- [ ] No inline styles (use className)
- [ ] Accessibility attributes included
- [ ] Memoization applied where needed
`,

    hook: `# React Hook Pattern

## Required Structure
\`\`\`typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { HookReturnType } from '../types';

interface UseHookNameOptions {
  // Hook configuration options
  initialValue?: Type;
  onSuccess?: (data: Type) => void;
  onError?: (error: Error) => void;
}

interface UseHookNameReturn {
  data: Type | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useHookName(
  param: string,
  options: UseHookNameOptions = {}
): UseHookNameReturn {
  // 1. State management
  const [data, setData] = useState<Type | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 2. Callbacks
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall(param);
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [param, options.onSuccess, options.onError]);
  
  // 3. Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // 4. Memoized values
  const memoizedValue = useMemo(() => {
    // Expensive computations
    return computeValue(data);
  }, [data]);
  
  // 5. Return consistent interface
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
\`\`\`

## Rules
- [ ] Must start with "use"
- [ ] Cannot be called conditionally
- [ ] Must return consistent interface
- [ ] Handle all edge cases
- [ ] Clean up effects properly
`,

    service: `# Service Layer Pattern

## Required Structure
\`\`\`typescript
import type { ApiResponse, ServiceError } from '../types';

class ServiceName {
  private baseUrl: string;
  
  constructor(baseUrl: string = process.env.API_URL || '') {
    this.baseUrl = baseUrl;
  }
  
  // GET method example
  async getItems(params?: QueryParams): Promise<ApiResponse<Item[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await fetch(\`\${this.baseUrl}/items\${queryString}\`);
      
      if (!response.ok) {
        throw new ServiceError(\`Failed to fetch items: \${response.statusText}\`, response.status);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('ServiceName.getItems error:', error);
      return { 
        data: null, 
        error: this.formatError(error) 
      };
    }
  }
  
  // POST method example
  async createItem(item: CreateItemDto): Promise<ApiResponse<Item>> {
    try {
      const response = await fetch(\`\${this.baseUrl}/items\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ServiceError(errorData.message || 'Failed to create item', response.status);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('ServiceName.createItem error:', error);
      return { 
        data: null, 
        error: this.formatError(error) 
      };
    }
  }
  
  // Helper methods
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => \`\${key}=\${encodeURIComponent(String(value))}\`);
    return filtered.length > 0 ? \`?\${filtered.join('&')}\` : '';
  }
  
  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: \`Bearer \${token}\` } : {};
  }
  
  private formatError(error: unknown): ServiceError {
    if (error instanceof ServiceError) return error;
    if (error instanceof Error) return new ServiceError(error.message);
    return new ServiceError('An unknown error occurred');
  }
}

export default new ServiceName();
\`\`\`

## Requirements
- [ ] Consistent error handling
- [ ] Type-safe responses
- [ ] Proper HTTP methods
- [ ] Authentication handling
- [ ] Request/response logging
- [ ] Input validation
`,

    api: `# API Endpoint Pattern

## RESTful API Structure
\`\`\`typescript
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schemas
const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
});

const querySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sort: z.enum(['name', 'price', 'created']).default('created'),
});

// Controller class
export class ItemController {
  // GET /items
  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query params
      const query = querySchema.parse(req.query);
      
      // Business logic
      const { items, total } = await itemService.findAll(query);
      
      // Standard response format
      res.json({
        data: items,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  // POST /items
  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate body
      const data = createItemSchema.parse(req.body);
      
      // Check permissions
      if (!req.user?.canCreateItems) {
        throw new ForbiddenError('Insufficient permissions');
      }
      
      // Business logic
      const item = await itemService.create(data, req.user.id);
      
      // Created response
      res.status(201).json({
        data: item,
        message: 'Item created successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  }
  
  // Error handler middleware
  handleError(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error('API Error:', err);
    
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message,
          details: err.details,
        },
      });
    }
    
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: err.message,
        },
      });
    }
    
    // Generic error
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}
\`\`\`

## API Checklist
- [ ] Input validation with Zod
- [ ] Consistent error responses
- [ ] Proper HTTP status codes
- [ ] Authentication/authorization
- [ ] Rate limiting
- [ ] Request logging
- [ ] CORS configuration
`,

    test: `# Test Pattern

## Unit Test Structure
\`\`\`typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// Mock dependencies
jest.mock('../hooks/useData', () => ({
  useData: jest.fn(),
}));

describe('ComponentName', () => {
  // Setup
  const defaultProps = {
    id: '123',
    name: 'Test Item',
    onClick: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Rendering tests
  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeEnabled();
    });
    
    it('should render loading state', () => {
      (useData as jest.Mock).mockReturnValue({
        isLoading: true,
        data: null,
        error: null,
      });
      
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
    });
    
    it('should render error state', () => {
      const error = new Error('Failed to load');
      (useData as jest.Mock).mockReturnValue({
        isLoading: false,
        data: null,
        error,
      });
      
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });
  
  // Interaction tests
  describe('Interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClick).toHaveBeenCalledWith('123');
    });
    
    it('should update state on input change', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      
      const input = screen.getByLabelText('Name');
      await user.clear(input);
      await user.type(input, 'New Name');
      
      expect(input).toHaveValue('New Name');
    });
  });
  
  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      render(<ComponentName {...defaultProps} items={[]} />);
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
    
    it('should handle missing optional props', () => {
      const { onClick, ...requiredOnly } = defaultProps;
      
      expect(() => render(<ComponentName {...requiredOnly} />)).not.toThrow();
    });
  });
  
  // Accessibility
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby');
    });
    
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });
});
\`\`\`

## Test Requirements
- [ ] Test all props combinations
- [ ] Test all states (loading, error, empty, success)
- [ ] Test user interactions
- [ ] Test edge cases
- [ ] Test accessibility
- [ ] Mock external dependencies
- [ ] Use meaningful test descriptions
`,

    'error-handling': `# Error Handling Pattern

## Comprehensive Error Handling
\`\`\`typescript
// 1. Custom Error Classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(\`\${resource} not found\`, 'NOT_FOUND', 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
  }
}

// 2. Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // Log to error tracking service
    if (process.env.NODE_ENV === 'production') {
      errorTracker.logError(error, {
        componentStack: errorInfo.componentStack,
        props: this.props,
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 3. Async Error Handler
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error(\`Error in \${context}:\`, error);
    
    // Transform known errors
    if (error instanceof AppError) {
      return { data: null, error };
    }
    
    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        data: null,
        error: new AppError('Network error', 'NETWORK_ERROR', 0),
      };
    }
    
    // Generic error
    return {
      data: null,
      error: new AppError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR'
      ),
    };
  }
}

// 4. React Hook with Error Handling
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  
  const resetError = useCallback(() => setError(null), []);
  
  const handleError = useCallback((error: Error) => {
    console.error('Error handled:', error);
    setError(error);
    
    // Show user notification
    if (error instanceof AppError && error.isOperational) {
      showNotification({
        type: 'error',
        message: error.message,
      });
    } else {
      showNotification({
        type: 'error',
        message: 'An unexpected error occurred',
      });
    }
  }, []);
  
  return { error, resetError, handleError };
}

// 5. API Error Response Handler
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);
  
  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }),
      { status: error.statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
        },
      }),
      { status: error.statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Unknown error
  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
\`\`\`

## Error Handling Checklist
- [ ] Custom error classes for different scenarios
- [ ] Error boundaries for React components
- [ ] Async operation error handling
- [ ] User-friendly error messages
- [ ] Error logging and tracking
- [ ] Network error handling
- [ ] Form validation errors
- [ ] API error responses
`
  };

  return patterns[taskType];
}

function enhanceWithProjectContext(
  basePattern: string,
  contextContent: string,
  taskType: TaskType
): string {
  // Extract relevant sections from context
  const sections = {
    techStack: extractSection(contextContent, 'Tech Stack & Versions'),
    codePatterns: extractSection(contextContent, 'Code Patterns'),
    naming: extractSection(contextContent, 'Naming Conventions'),
    constraints: extractSection(contextContent, 'Implementation Constraints'),
  };

  // Prepend project-specific information
  let enhanced = `# Project-Specific Context

## Tech Stack
${sections.techStack}

## Code Patterns
${sections.codePatterns}

## Constraints
${sections.constraints}

---

${basePattern}`;

  return enhanced;
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}([^#]+)`, 's');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function adjustForRequirements(
  pattern: string,
  requirements: string[],
  taskType: TaskType
): string {
  let adjusted = pattern;
  
  // Add requirement-specific notes
  const requirementNotes = requirements.map(req => `- ${req}`).join('\n');
  
  adjusted = `# Additional Requirements
${requirementNotes}

---

${adjusted}`;

  // Adjust based on specific requirements
  requirements.forEach(req => {
    const lowerReq = req.toLowerCase();
    
    if (lowerReq.includes('form') && taskType === 'component') {
      adjusted += '\n\n## Form Handling Addition\n- Use react-hook-form with Zod validation\n- Include proper error messages\n- Add loading state for submission';
    }
    
    if (lowerReq.includes('realtime') || lowerReq.includes('websocket')) {
      adjusted += '\n\n## Realtime Addition\n- Include WebSocket connection handling\n- Add reconnection logic\n- Handle connection state in UI';
    }
    
    if (lowerReq.includes('pagination')) {
      adjusted += '\n\n## Pagination Addition\n- Include page state management\n- Add loading indicators for page changes\n- Implement proper URL params';
    }
  });

  return adjusted;
}