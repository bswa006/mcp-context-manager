# Cursor MCP Integration Guide

## ✅ Cursor Now Supports MCP Servers!

As of 2025, Cursor has full support for Model Context Protocol (MCP) servers. Here's how to connect your MCP Context Manager.

## Quick Setup

### 1. Enable MCP in Cursor
1. Open Cursor
2. Go to **Settings** → **Cursor Settings**
3. Find **MCP Servers** option and **enable** it
4. Click **"Add new MCP server"**

### 2. Configure MCP Context Manager

#### Option A: Project-Specific Configuration
Already created at `.cursor/mcp.json`:
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

#### Option B: Global Configuration
Create `~/.cursor/mcp.json` in your home directory:
```json
{
  "mcpServers": {
    "context-manager": {
      "command": "npx",
      "args": ["-y", "@mcp/context-manager", "serve"],
      "env": {}
    }
  }
}
```

### 3. Verify Connection
1. After adding the configuration, click **Enable**
2. Look for a **green dot** indicating successful connection
3. You should see available tools:
   - `create_project_template`
   - `create_codebase_context`
   - `create_directory_readme`
   - `check_context_usage`

## Using MCP Context Manager in Cursor

### First Time Setup
In Cursor's chat, say:
```
Please use the MCP Context Manager tools to:
1. Read the template from 'template://project-template'
2. Analyze this entire codebase
3. Create PROJECT-TEMPLATE.md with all placeholders filled
4. Create CODEBASE-CONTEXT.md with our coding patterns
5. Create README files for src/components, src/services, etc.
```

### Daily Usage
Before generating code, tell Cursor:
```
Please check context usage with the MCP tool, then read PROJECT-TEMPLATE.md and CODEBASE-CONTEXT.md before generating any code.
```

## Features Available in Cursor

### 1. **Auto-Run for Agent**
- Enable auto-run in Cursor settings for seamless tool usage
- Agent will use MCP tools without asking for approval

### 2. **Tool Management**
- Enable/disable specific tools from the chat interface
- Click tool names to toggle them on/off

### 3. **Multiple MCP Servers**
- Connect multiple MCP servers simultaneously
- MCP Context Manager works alongside other tools

### 4. **Visual Feedback**
- See tool arguments and responses in expandable views
- Green dot indicates active connection

## Troubleshooting

### Server Not Connecting?
1. Make sure you built the project:
   ```bash
   cd /Users/biswa/Desktop/ai-agent-template/ai-agent-template-mcp/packages/mcp-agent
   npm run build
   ```

2. Check the server runs manually:
   ```bash
   node dist/server/index.js
   ```

3. Verify path in `.cursor/mcp.json` is absolute

### Tools Not Showing?
1. Click refresh in MCP settings
2. Disable and re-enable the server
3. Restart Cursor

### Can't See MCP Option?
- Update Cursor to the latest version
- MCP support was added in late 2024/early 2025

## Best Practices

1. **Keep Context Updated**: Regularly update PROJECT-TEMPLATE.md as your project evolves
2. **Review Generated Files**: Always review AI-generated context files for accuracy
3. **Use Tool Toggle**: Disable tools you don't need to reduce context
4. **Project vs Global**: Use project-specific config for team consistency

## Example Workflow

1. **New Project**:
   ```
   Agent: Use create_project_template tool
   ```

2. **Adding Feature**:
   ```
   Agent: Check context usage, then implement user authentication
   ```

3. **Code Review**:
   ```
   Agent: Verify this code follows patterns in CODEBASE-CONTEXT.md
   ```

## Advanced Configuration

### With NPX (Recommended for Teams)
```json
{
  "mcpServers": {
    "context-manager": {
      "command": "npx",
      "args": ["-y", "@mcp/context-manager@latest", "serve"],
      "env": {}
    }
  }
}
```

### With Custom Environment
```json
{
  "mcpServers": {
    "context-manager": {
      "command": "node",
      "args": ["dist/server/index.js"],
      "env": {
        "PROJECT_ROOT": "/path/to/project",
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

---

Your MCP Context Manager is now ready to use with Cursor! The configuration is already in place at `.cursor/mcp.json`.