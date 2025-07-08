// Extract pattern library
export function extractPatternLibrary(): string {
  return `# PATTERN LIBRARY
## Comprehensive Code Patterns for Every Scenario

### Component Patterns

#### Basic Functional Component
\`\`\`typescript
import React from 'react';

interface ComponentNameProps {
  title: string;
  onClick?: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ title, onClick }) => {
  return (
    <div className="component-name">
      <h2>{title}</h2>
      {onClick && <button onClick={onClick}>Click me</button>}
    </div>
  );
};

export default ComponentName;
\`\`\`

#### Component with State & Effects
\`\`\`typescript
import React, { useState, useEffect } from 'react';

const DataFetcher: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data.length) return <EmptyState />;

  return <DataList data={data} />;
};
\`\`\`

### Hook Patterns

#### Custom Data Hook
\`\`\`typescript
import { useState, useEffect } from 'react';

export function useFetchData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error, refetch: () => {} };
}
\`\`\`

### Service Patterns

#### API Service with Retry
\`\`\`typescript
class ApiService {
  private baseUrl: string;
  private maxRetries = 3;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return await response.json();
  }
}
\`\`\`

### Testing Patterns

#### Component Test Pattern
\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    title: 'Test Title',
    onClick: jest.fn(),
  };

  it('renders without crashing', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    render(<ComponentName {...defaultProps} />);
    
    await user.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\``;
}

// Extract workflow templates
export function extractWorkflowTemplates(): string {
  return `# WORKFLOW TEMPLATES
## Step-by-Step Guides for Common Tasks

### 🚀 New Feature Workflow

1. **Understand Requirements**
   - Read user story/requirements
   - Identify dependencies
   - Plan component structure

2. **Check Existing Patterns**
   \`\`\`
   Tool: detect_existing_patterns
   Directory: ./src/components
   Pattern Types: ["naming", "structure", "imports"]
   \`\`\`

3. **Verify APIs Before Use**
   \`\`\`
   Tool: check_before_suggesting
   Imports: ["react", "useState", "useEffect"]
   Methods: ["Array.prototype.map", "Object.keys"]
   Patterns: ["functional components", "hooks"]
   \`\`\`

4. **Get Pattern Template**
   \`\`\`
   Tool: get_pattern_for_task
   Task Type: "component"
   Context: { hasState: true, hasAsync: true }
   \`\`\`

5. **Generate Code**
   - Follow retrieved pattern
   - Include error handling
   - Add loading states

6. **Validate Generated Code**
   \`\`\`
   Tool: validate_generated_code
   Code: <generated_code>
   Type: "component"
   Target File: "./src/components/NewFeature.tsx"
   \`\`\`

7. **Security Check**
   \`\`\`
   Tool: check_security_compliance
   Code: <generated_code>
   Check Types: ["secrets", "injection", "validation"]
   \`\`\`

8. **Generate Tests**
   \`\`\`
   Tool: generate_tests_for_coverage
   Target File: "./src/components/NewFeature.tsx"
   Coverage Target: 80
   Include Edge Cases: true
   \`\`\`

9. **Track Performance**
   \`\`\`
   Tool: track_agent_performance
   Feature Name: "NewFeature Component"
   Metrics: { ... }
   \`\`\`

### 🐛 Bug Fix Workflow

1. **Analyze the Bug**
   - Read error message/stack trace
   - Identify affected files
   - Understand root cause

2. **Check Current Implementation**
   - Read affected files
   - Understand existing logic
   - Identify the fix location

3. **Verify Fix Approach**
   \`\`\`
   Tool: check_before_suggesting
   Methods: <methods_to_use>
   Patterns: <patterns_to_follow>
   \`\`\`

4. **Apply Fix**
   - Minimal changes only
   - Preserve existing patterns
   - Add error prevention

5. **Validate Fix**
   \`\`\`
   Tool: validate_generated_code
   Code: <fixed_code>
   Context: "Bug fix for <issue>"
   \`\`\`

6. **Update/Add Tests**
   - Add test for the bug scenario
   - Ensure fix doesn't break existing tests

### 🔄 Refactoring Workflow

1. **Analyze Current Code**
   - Identify code smells
   - Check complexity
   - Find duplications

2. **Plan Refactoring**
   - Define clear goals
   - List affected files
   - Plan incremental steps

3. **Detect Patterns**
   \`\`\`
   Tool: detect_existing_patterns
   Directory: <target_directory>
   Pattern Types: ["structure", "naming"]
   \`\`\`

4. **Refactor Step by Step**
   - One change at a time
   - Run tests after each change
   - Maintain functionality

5. **Validate Each Step**
   \`\`\`
   Tool: validate_generated_code
   Code: <refactored_code>
   Type: <code_type>
   \`\`\`

### 📝 Documentation Workflow

1. **Analyze Code to Document**
   - Read implementation
   - Understand purpose
   - Identify key features

2. **Generate Documentation**
   - Clear descriptions
   - Usage examples
   - API references

3. **Include Examples**
   - Working code samples
   - Common use cases
   - Edge cases

4. **Update README**
   - Installation steps
   - Configuration
   - Usage guide`;
}

// Extract test patterns
export function extractTestPatterns(): string {
  return `# TEST PATTERNS
## Achieving 80%+ Coverage with Smart Testing

### Testing Strategy

#### Coverage Goals by Type
- **Utility Functions**: 95%+ coverage
- **Business Logic**: 90%+ coverage
- **UI Components**: 80%+ coverage
- **Integration Points**: 85%+ coverage

### Pattern Categories

#### 1. Unit Test Patterns

**Pure Function Testing**
\`\`\`typescript
describe('calculateTotal', () => {
  it('calculates sum correctly', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });

  it('handles empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(calculateTotal([-1, -2, -3])).toBe(-6);
  });

  it('handles decimal numbers', () => {
    expect(calculateTotal([1.5, 2.5])).toBeCloseTo(4);
  });
});
\`\`\`

**Async Function Testing**
\`\`\`typescript
describe('fetchUserData', () => {
  it('fetches user successfully', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const user = await fetchUserData(1);
    expect(user).toEqual(mockUser);
  });

  it('handles fetch errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(fetchUserData(1)).rejects.toThrow('Network error');
  });

  it('handles non-ok responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchUserData(1)).rejects.toThrow('User not found');
  });
});
\`\`\`

#### 2. Component Test Patterns

**Basic Component Testing**
\`\`\`typescript
describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
\`\`\`

**Component with State Testing**
\`\`\`typescript
describe('TodoList', () => {
  it('adds new todo', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText('Add todo');
    const addButton = screen.getByText('Add');
    
    await user.type(input, 'New todo item');
    await user.click(addButton);
    
    expect(screen.getByText('New todo item')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('removes todo', async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={['Test todo']} />);
    
    const deleteButton = screen.getByLabelText('Delete todo');
    await user.click(deleteButton);
    
    expect(screen.queryByText('Test todo')).not.toBeInTheDocument();
  });

  it('toggles todo completion', async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={['Test todo']} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(checkbox).toBeChecked();
    expect(screen.getByText('Test todo')).toHaveClass('completed');
  });
});
\`\`\`

#### 3. Hook Test Patterns

**Custom Hook Testing**
\`\`\`typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
});
\`\`\`

#### 4. Integration Test Patterns

**API Integration Testing**
\`\`\`typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList Integration', () => {
  it('loads and displays users', async () => {
    render(<UserList />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  it('handles server errors', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });
});
\`\`\`

#### 5. Edge Case Testing

**Boundary Testing**
\`\`\`typescript
describe('Pagination', () => {
  it('handles empty data', () => {
    render(<Pagination totalItems={0} itemsPerPage={10} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('handles single page', () => {
    render(<Pagination totalItems={5} itemsPerPage={10} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('handles exact page boundary', () => {
    render(<Pagination totalItems={20} itemsPerPage={10} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('handles large datasets', () => {
    render(<Pagination totalItems={10000} itemsPerPage={10} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
});
\`\`\`

### Test Coverage Tips

1. **Focus on Critical Paths First**
   - User authentication flows
   - Payment processing
   - Data mutations
   - Error handling

2. **Use Coverage Reports**
   \`\`\`bash
   npm test -- --coverage
   \`\`\`

3. **Identify Untested Code**
   - Look for uncovered branches
   - Check error handling paths
   - Test edge cases

4. **Mock External Dependencies**
   - API calls
   - Third-party libraries
   - Browser APIs
   - Timers and dates

5. **Test Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management`;
}