import { MCPServer } from 'mcp-framework';

// Create a simple test server to understand the API
const server = new MCPServer({
  name: 'test-server',
  version: '1.0.0',
});

// Try to understand the API
console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(server)));

// Check if we can access the underlying SDK server
console.log('Has server property?', 'server' in server);