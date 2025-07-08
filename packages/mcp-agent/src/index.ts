/**
 * MCP Context Manager
 * Provides codebase context to AI agents
 */

export { MCPContextServer } from './server/index.js';
export { 
  PROJECT_TEMPLATE_CONTENT,
  CODEBASE_CONTEXT_TEMPLATE,
  DIRECTORY_README_TEMPLATE,
  CONTEXT7_TEMPLATE,
  ADR_TEMPLATE,
  TECH_STACK_TEMPLATE,
  CURSOR_CONTEXT_LOADER_TEMPLATE,
  CURSOR_TECH_RULES_TEMPLATE,
  CURSOR_QUALITY_GATES_TEMPLATE,
  VERSION_SYNC_SCRIPT_TEMPLATE,
  GITHUB_ACTION_SYNC_TEMPLATE
} from './templates/project-template.js';

// For direct usage
export async function startServer() {
  const { MCPContextServer } = await import('./server/index.js');
  const server = new MCPContextServer();
  await server.run();
}