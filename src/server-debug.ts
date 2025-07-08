#!/usr/bin/env node
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
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Debug log file
const logFile = join(homedir(), 'mcp-debug.log');
const log = (msg: string) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  console.error(logMsg.trim());
  try {
    appendFileSync(logFile, logMsg);
  } catch (e) {
    // Ignore file write errors
  }
};

log('=== MCP Context Manager Debug Server Starting ===');
log(`Node version: ${process.version}`);
log(`CWD: ${process.cwd()}`);
log(`__dirname: ${import.meta.url}`);
log(`ENV PATH: ${process.env.PATH}`);

// Initialize MCP server
const server = new Server(
  {
    name: 'mcp-context-manager',
    version: '2.0.2',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Simple tool for testing
const testTools = [
  {
    name: 'test_tool',
    description: 'A test tool to verify MCP is working',
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
];

log('Setting up handlers...');

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  log(`Received tools/list request: ${JSON.stringify(request)}`);
  const response = { tools: testTools };
  log(`Sending response: ${JSON.stringify(response)}`);
  return response;
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  log(`Received tool call: ${JSON.stringify(request)}`);
  return {
    content: [
      {
        type: 'text',
        text: `Test tool executed with message: ${request.params.arguments?.message}`,
      },
    ],
  };
});

// Handle errors
server.onerror = (error) => {
  log(`MCP Error: ${error}`);
};

// Handle transport events
const setupTransportLogging = (transport: StdioServerTransport) => {
  const originalWrite = process.stdout.write.bind(process.stdout);
  const originalError = process.stderr.write.bind(process.stderr);
  
  // Log all stdout
  process.stdout.write = function(chunk: any, ...args: any[]) {
    log(`STDOUT: ${chunk}`);
    return originalWrite(chunk, ...args);
  };
  
  // Log all stderr except our own logs
  process.stderr.write = function(chunk: any, ...args: any[]) {
    if (!chunk.toString().includes('MCP Context Manager Debug')) {
      log(`STDERR: ${chunk}`);
    }
    return originalError(chunk, ...args);
  };
};

// Start the server
async function main() {
  try {
    log('Creating StdioServerTransport...');
    const transport = new StdioServerTransport();
    
    setupTransportLogging(transport);
    
    log('Connecting transport...');
    await server.connect(transport);
    
    log('=== MCP Server Started Successfully ===');
    log(`Debug log location: ${logFile}`);
    
    // Log every 10 seconds to show we're still alive
    setInterval(() => {
      log('Server heartbeat - still running');
    }, 10000);
    
  } catch (error) {
    log(`Failed to start server: ${error}`);
    log(`Stack trace: ${error instanceof Error ? error.stack : 'No stack trace'}`);
    process.exit(1);
  }
}

// Handle process events
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error}`);
  log(`Stack: ${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  process.exit(0);
});

log('Starting main function...');
main().catch((error) => {
  log(`Main function error: ${error}`);
  process.exit(1);
});