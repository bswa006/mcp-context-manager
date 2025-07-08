import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { setupResources } from './resources/index.js';
import { setupTools } from './tools/index.js';
import { setupPrompts } from './prompts/index.js';

// Initialize MCP server
const server = new Server(
  {
    name: 'mcp-context-manager',
    version: '2.0.1',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Setup resources (template content, patterns, context)
setupResources(server);

// Setup tools (generators, validators, analyzers)
setupTools(server);

// Setup prompts (workflow templates)
setupPrompts(server);

// Handle errors
server.onerror = (error) => {
  console.error('[MCP Error]', error);
};

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Agent Template MCP Server started');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});