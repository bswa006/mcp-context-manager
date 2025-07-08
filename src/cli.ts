#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Handle different commands
if (command === 'serve' || !command) {
  // Get the server path
  const serverPath = join(__dirname, 'server.js');

  // Start the server with stdio inheritance
  const child = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else if (command === '--help' || command === '-h') {
  console.log(`
mcp-context-manager - AI Agent Template MCP Server

Usage:
  mcp-context-manager [command]

Commands:
  serve    Start the MCP server (default)
  help     Show this help message

Examples:
  mcp-context-manager
  mcp-context-manager serve
  npx mcp-context-manager serve
`);
  process.exit(0);
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run "mcp-context-manager --help" for usage information');
  process.exit(1);
}