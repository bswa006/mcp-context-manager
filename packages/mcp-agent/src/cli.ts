#!/usr/bin/env node
/**
 * MCP Context Manager CLI
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('mcp-context')
  .description('MCP Context Manager - Helps AI agents understand your codebase')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize MCP context management in your project')
  .action(async () => {
    const spinner = ora('Initializing MCP Context Manager...').start();
    
    try {
      // Create .mcp directory
      const mcpDir = path.join(process.cwd(), '.mcp');
      await fs.mkdir(mcpDir, { recursive: true });
      
      // Create instructions file
      const instructions = `# MCP Context Manager Instructions

## What is this?
MCP Context Manager helps AI assistants understand your codebase by providing them with structured templates and ensuring they use project-specific context.

## How it works:
1. MCP provides a PROJECT-TEMPLATE.md template
2. You ask your AI assistant to analyze your codebase and fill the template
3. MCP monitors that the AI uses this filled template when generating code

## Getting Started:

### Step 1: Start the MCP server
\`\`\`bash
npx mcp-context serve
\`\`\`

### Step 2: In your AI tool (Claude, Cursor, etc.), run:
\`\`\`
Please use the MCP Context Manager to:
1. Create the agent-context directory
2. Read the template from 'template://project-template'
3. Analyze this codebase
4. Create agent-context/PROJECT-TEMPLATE.md with all placeholders filled
5. Create agent-context/CODEBASE-CONTEXT.md with our patterns
6. Create agent-context/.context7.yaml for hallucination prevention
7. Create directory READMEs in both their folders and agent-context/
\`\`\`

### Step 3: Verify files were created:
- agent-context/PROJECT-TEMPLATE.md
- agent-context/CODEBASE-CONTEXT.md
- agent-context/.context7.yaml
- agent-context/adr/ (for architecture decisions)
- agent-context/directories/ (copies of directory READMEs)
- src/components/README.md (and copy in agent-context)
- etc.

### Step 4: Always remind AI to use context:
Before generating code, tell your AI:
"Please read agent-context/PROJECT-TEMPLATE.md and agent-context/CODEBASE-CONTEXT.md before generating code"

## MCP Tools Available:
- create_project_template - Tells AI to create PROJECT-TEMPLATE.md
- create_codebase_context - Tells AI to create CODEBASE-CONTEXT.md
- create_directory_readme - Tells AI to create directory README
- check_context_usage - Verifies AI is using context files
`;
      
      await fs.writeFile(path.join(mcpDir, 'INSTRUCTIONS.md'), instructions);
      
      // Create MCP config for Claude Desktop
      const mcpConfig = {
        mcpServers: {
          "mcp-context-manager": {
            command: "npx",
            args: ["mcp-context-manager", "serve"],
            env: {}
          }
        }
      };
      
      await fs.writeFile(
        path.join(mcpDir, 'claude_desktop_config.json'), 
        JSON.stringify(mcpConfig, null, 2)
      );
      
      spinner.succeed('MCP Context Manager initialized!');
      
      console.log(`
${chalk.bold.green('✅ Setup Complete!')}

${chalk.bold('Next steps:')}

1. ${chalk.cyan('For Claude Desktop:')}
   - Copy the config from ${chalk.yellow('.mcp/claude_desktop_config.json')}
   - Add it to your Claude Desktop MCP settings

2. ${chalk.cyan('For other AI tools:')}
   - Run: ${chalk.yellow('npx mcp-context-manager serve')}
   - Configure your AI tool to use the MCP server

3. ${chalk.cyan('In your AI assistant, say:')}
   ${chalk.gray('"Please use MCP Context Manager to analyze this codebase and create context files"')}

${chalk.bold('📖 Full instructions:')} ${chalk.yellow('.mcp/INSTRUCTIONS.md')}
`);
      
    } catch (error) {
      spinner.fail('Failed to initialize');
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Start the MCP context server')
  .action(async () => {
    console.log(chalk.bold.cyan('🚀 Starting MCP Context Manager Server...'));
    console.log(chalk.gray('The server will provide context templates to your AI assistant.'));
    console.log();
    
    // Import and run the server
    const { MCPContextServer } = await import('./server/index.js');
    const server = new MCPContextServer();
    await server.run();
  });

program
  .command('check')
  .description('Check if context files exist')
  .action(async () => {
    console.log(chalk.bold('Checking context files...'));
    
    const files = [
      'PROJECT-TEMPLATE.md',
      'CODEBASE-CONTEXT.md',
      'src/components/README.md',
      'src/services/README.md',
    ];
    
    for (const file of files) {
      try {
        await fs.access(path.join(process.cwd(), file));
        console.log(chalk.green('✓'), file);
      } catch {
        console.log(chalk.red('✗'), file, chalk.gray('(not found)'));
      }
    }
    
    console.log(`
${chalk.bold('Tips:')}
- Missing files? Ask your AI to create them using MCP tools
- Make sure to tell AI to read these files before generating code
`);
  });

program.parse(process.argv);