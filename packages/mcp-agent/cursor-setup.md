# Connecting MCP Context Manager to Cursor

## Method 1: Direct MCP Integration (if Cursor supports MCP)

### 1. Start the MCP Server
```bash
cd /Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent
npm run build
node dist/server/index.js
```

### 2. Configure Cursor
Add to Cursor's MCP configuration (if available):
```json
{
  "mcpServers": {
    "context-manager": {
      "command": "node",
      "args": ["/Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent/dist/server/index.js"],
      "env": {}
    }
  }
}
```

## Method 2: Using MCP via Cursor's AI Assistant

Since Cursor may not have direct MCP support, you can use the MCP Context Manager by:

### 1. Install and Run Globally
```bash
# Install globally
npm install -g /Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent

# Or link for development
cd /Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent
npm link

# Run in your project
cd /path/to/your/project
mcp-context init
mcp-context serve
```

### 2. Tell Cursor's AI to Use It
In Cursor, tell the AI assistant:

```
I have MCP Context Manager running. Please:
1. Create PROJECT-TEMPLATE.md by analyzing this codebase
2. Fill all [PLACEHOLDER] values with actual project data
3. Create CODEBASE-CONTEXT.md with our coding patterns
4. Create README.md files for main directories

The MCP server provides tools to help with this.
```

## Method 3: Manual Template Usage in Cursor

### 1. Copy the Template
```bash
# Initialize in your project
cd /path/to/your/project
npx /Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent init
```

### 2. Use in Cursor
1. Open the `.mcp/INSTRUCTIONS.md` file
2. Follow the instructions to create context files
3. Tell Cursor's AI to always read PROJECT-TEMPLATE.md and CODEBASE-CONTEXT.md before generating code

## Method 4: Cursor Custom Instructions

Add to Cursor's custom instructions or system prompt:

```
Before generating any code:
1. Check if PROJECT-TEMPLATE.md exists in the root
2. Check if CODEBASE-CONTEXT.md exists
3. Read both files and follow the patterns defined there
4. Use the naming conventions, error handling, and constraints specified

If these files don't exist, ask me to create them first by analyzing the codebase.
```

## Verifying Connection

To verify MCP is working with Cursor:

1. Ask Cursor: "Can you see the MCP Context Manager tools?"
2. Or try: "Please use the create_project_template tool to analyze this codebase"

## Troubleshooting

### Server won't start?
```bash
# Check Node version
node --version  # Should be 18+

# Rebuild
cd /Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent
npm install
npm run build
```

### Cursor can't connect?
- Make sure the server is running in a terminal
- Try the manual template method instead
- Check Cursor's documentation for MCP support

## Best Practice Workflow

1. Start MCP server in terminal
2. In Cursor, ask AI to create context files
3. Review and edit the generated files
4. For every new feature, remind AI to read context files first
5. Keep context files updated as project evolves