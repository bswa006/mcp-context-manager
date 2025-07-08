/**
 * MCP Oracle Usage Examples
 * Shows how to use MCP as a code quality oracle
 */

import { MCPOracle } from '../src/middleware/mcp-oracle';
import { MCPAnthropicOracle } from '../src/agents/mcp-anthropic-oracle';
import { MCPOpenAIOracle } from '../src/agents/mcp-openai-oracle';
import { MCPGenericOracle } from '../src/agents/mcp-generic-oracle';

// Example 1: Direct Oracle Usage
async function directOracleExample() {
  const oracle = new MCPOracle();
  
  const code = `
    function UserProfile({ userId }) {
      const [user, setUser] = useState();
      
      useEffect(() => {
        fetchUser(userId).then(setUser);
      });
      
      return (
        <div onClick={() => handleClick(userId)}>
          {user?.name}
        </div>
      );
    }
  `;
  
  // Get comprehensive guidance
  const guidance = await oracle.analyze(code, {
    language: 'typescript',
    framework: 'react',
  });
  
  console.log('Quality Score:', guidance.quality.score);
  console.log('Issues Found:', guidance.issues.length);
  
  // Display issues with explanations
  guidance.issues.forEach(issue => {
    console.log(`
Issue: ${issue.message}
Why: ${issue.semantic.why}
Impact: ${issue.semantic.impact.description} (Severity: ${issue.semantic.impact.severity}/10)
How to fix: ${issue.guidance.approach}

Steps:
${issue.guidance.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}
    `);
  });
  
  // Get AI-friendly explanation
  const aiExplanation = await oracle.explain(guidance, 'claude');
  console.log('AI Guidance:', aiExplanation.promptGuidance);
}

// Example 2: Anthropic/Claude Integration
async function anthropicOracleExample() {
  const oracle = new MCPAnthropicOracle({
    qualityThreshold: 80,
    defaultFocus: ['performance', 'react-patterns'],
  });
  
  const code = `
    const ProductList = () => {
      const products = useProducts();
      
      return (
        <div>
          {products.map((product, index) => (
            <div key={index} onClick={() => addToCart(product)}>
              {product.name}
            </div>
          ))}
        </div>
      );
    };
  `;
  
  // Get Claude-specific guidance
  const guidance = await oracle.getGuidanceForClaude(code);
  console.log(guidance);
  
  // This guidance can be sent to Claude as a system message
  // to help it understand what needs to be fixed
}

// Example 3: OpenAI Integration with Streaming
async function openAIStreamingExample() {
  const oracle = new MCPOpenAIOracle({
    model: 'gpt-4-turbo',
    analyzeAfter: true,
  });
  
  // Enhance OpenAI client
  import OpenAI from 'openai';
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const enhancedOpenAI = oracle.enhance(openai);
  
  // Use normally - analysis happens automatically
  const completion = await enhancedOpenAI.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'user', content: 'Create a React form component' }
    ],
  });
  
  // Access analysis results
  if (completion._mcp_analysis) {
    console.log('Generated code quality:', completion._mcp_analysis);
  }
}

// Example 4: Generic AI Provider
async function genericProviderExample() {
  const oracle = new MCPGenericOracle({
    provider: 'custom-ai',
    model: 'v1',
    guidanceFormat: 'structured',
  });
  
  // Analyze code
  const code = `
    export default function Button({ onClick, children }) {
      return <button onClick={onClick}>{children}</button>;
    }
  `;
  
  const guidance = await oracle.analyze(code);
  
  // Get formatted guidance for your AI
  const formattedGuidance = await oracle.formatGuidance(guidance, 'concise');
  console.log(formattedGuidance);
  
  // Get specific suggestions
  const performanceSuggestions = await oracle.getSuggestions(code, ['performance']);
  console.log('Performance improvements:', performanceSuggestions);
}

// Example 5: CI/CD Integration
async function cicdExample() {
  const oracle = new MCPOracle();
  
  // Validate against standards
  const code = `/* your code here */`;
  const validation = await oracle.validate(code, {
    minScore: 85,
    requiredPatterns: ['error-boundary', 'loading-state'],
    forbiddenPatterns: ['any-type', 'console-log'],
  });
  
  if (!validation.compliant) {
    console.error('Code quality check failed!');
    console.log(validation.report);
    process.exit(1);
  }
  
  console.log('Code quality check passed!');
}

// Example 6: Real-time Analysis Hook
async function realtimeAnalysisExample() {
  const oracle = new MCPAnthropicOracle();
  
  // Listen for analysis events
  oracle.on('code.analyzed', ({ analysis }) => {
    console.log('Code analyzed:', {
      score: analysis[0].guidance.quality.score,
      issues: analysis[0].guidance.issues.length,
    });
  });
  
  // Enhance your AI client
  // ... analysis happens automatically
}

// Example 7: Pattern-based Guidance
async function patternGuidanceExample() {
  const oracle = new MCPOracle();
  
  const code = `
    function ExpensiveComponent({ data }) {
      const processed = data.map(item => transform(item));
      const filtered = processed.filter(item => item.active);
      
      return <List items={filtered} />;
    }
  `;
  
  // Get performance-focused guidance
  const guidance = await oracle.analyze(code, {
    focus: ['performance'],
  });
  
  // Show pattern-based suggestions
  guidance.suggestions.forEach(suggestion => {
    console.log(`
Suggestion: ${suggestion.title}
Pattern: ${suggestion.pattern.name}
When to use: ${suggestion.pattern.when}
Expected improvement: ${suggestion.improvement.expected}

Implementation concept:
${suggestion.pattern.implementation.concept}

Principles:
${suggestion.pattern.implementation.principles.map(p => `- ${p}`).join('\n')}
    `);
  });
}