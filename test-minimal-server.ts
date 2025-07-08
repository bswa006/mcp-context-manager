import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create minimal server
const server = new Server(
  {
    name: 'test-minimal-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add a simple tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'test_tool',
        description: 'A simple test tool',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Test message',
            },
          },
          required: ['message'],
        },
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Test Minimal MCP Server started');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});