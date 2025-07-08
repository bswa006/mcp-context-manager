/**
 * Example: Generic AI Provider Integration
 * Shows how to integrate MCP with any AI provider
 */

import { MCPGeneric } from '../src/agents/mcp-generic';

// Example 1: Cohere Integration
const cohereMCP = new MCPGeneric({
  provider: 'cohere',
  model: 'command',
  apiKey: process.env.MCP_API_KEY,
  validateBefore: true,
  correctAfter: true,
  codeBlockRegex: /```(\w+)?\n([\s\S]*?)```/g,
});

// Wrap any Cohere client
import { CohereClient } from 'cohere-ai';
const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });
const enhancedCohere = cohereMCP.wrap(cohere);

// Example 2: Hugging Face Integration
const huggingFaceMCP = new MCPGeneric({
  provider: 'huggingface',
  model: 'codellama',
  apiKey: process.env.MCP_API_KEY,
  hooks: {
    beforeRequest: async (request) => {
      // Custom pre-processing for HF format
      if (request.inputs) {
        const validation = await huggingFaceMCP.validateCode(
          request.inputs,
          'typescript'
        );
        if (!validation.result.valid) {
          request.inputs += `\n\n# Quality Requirements:\n${validation.issues.join('\n')}`;
        }
      }
      return request;
    },
    afterResponse: async (response) => {
      // Custom post-processing for HF format
      if (response.generated_text) {
        response.generated_text = await huggingFaceMCP.correctContent(
          response.generated_text
        );
      }
      return response;
    }
  }
});

// Example 3: Custom AI Provider
class CustomAIClient {
  async generate(prompt: string): Promise<string> {
    // Your custom AI logic
    return `Generated code for: ${prompt}`;
  }
}

const customMCP = new MCPGeneric({
  provider: 'custom',
  model: 'internal-v1',
  apiKey: process.env.MCP_API_KEY,
});

// Method 1: Wrap the client
const customClient = new CustomAIClient();
const enhancedCustom = customMCP.wrap(customClient);

// Now all methods are automatically validated
const result = await enhancedCustom.generate('Create a React component');

// Method 2: Manual validation
const customClient2 = new CustomAIClient();

async function generateWithValidation(prompt: string) {
  // Generate code
  const code = await customClient2.generate(prompt);
  
  // Validate
  const validation = await customMCP.validateCode(code, 'typescript');
  
  if (!validation.result.valid) {
    console.log('Quality issues found:', validation.issues);
    // Apply corrections
    return customMCP.correctContent(code);
  }
  
  return code;
}

// Example 4: Streaming Integration
import { Transform } from 'stream';

class StreamingAIClient {
  async *generateStream(prompt: string) {
    // Simulated streaming
    yield 'function ';
    yield 'MyComponent() {\n';
    yield '  return <div>Hello</div>;\n';
    yield '}';
  }
}

const streamingMCP = new MCPGeneric({
  provider: 'streaming-ai',
  model: 'stream-v1',
  apiKey: process.env.MCP_API_KEY,
  streamValidation: true,
});

async function validateStream() {
  const client = new StreamingAIClient();
  const validatingStream = streamingMCP.createValidatingStream();
  
  // Create a transform to convert async iterator to stream
  const transform = new Transform({
    async transform(chunk, encoding, callback) {
      callback(null, chunk);
    }
  });
  
  // Pipe through validation
  for await (const chunk of client.generateStream('Create component')) {
    transform.write(chunk);
  }
  transform.end();
  
  // Read validated output
  for await (const validated of transform.pipe(validatingStream)) {
    console.log('Validated chunk:', validated);
  }
}

// Example 5: REST API Integration
const apiMCP = new MCPGeneric({
  provider: 'api',
  model: 'code-gen-api',
  apiKey: process.env.MCP_API_KEY,
  hooks: {
    beforeRequest: async (request) => {
      // Add MCP headers
      request.headers = {
        ...request.headers,
        'X-MCP-Validation': 'enabled',
        'X-MCP-Min-Score': '85',
      };
      return request;
    }
  }
});

// Use with fetch or axios
async function callAPIWithValidation(prompt: string) {
  const response = await fetch('https://api.example.com/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  
  // Validate response
  if (data.code) {
    const validation = await apiMCP.validateCode(data.code, data.language || 'typescript');
    if (!validation.result.valid) {
      data.code = await apiMCP.correctContent(data.code);
      data.mcp_corrected = true;
    }
  }
  
  return data;
}