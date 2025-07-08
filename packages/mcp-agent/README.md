# MCP Context Manager

> **The Missing Link**: Provides PROJECT-TEMPLATE.md to AI agents and ensures they use it for consistent, context-aware code generation.

## 🎯 What It Does

MCP Context Manager is a Model Context Protocol (MCP) server that:

1. **Provides Templates** - Gives AI agents the PROJECT-TEMPLATE.md template
2. **Guides Analysis** - Tells AI to analyze your codebase and fill the template
3. **Ensures Usage** - Monitors that AI uses the context when generating code

## 🚀 Quick Start

### 1. Install and Initialize

```bash
# Install globally
npm install -g mcp-context-manager

# Or use directly with npx
npx mcp-context-manager init
```

### 2. Configure Your AI Tool

#### For Claude Desktop:
1. Copy config from `.mcp/claude_desktop_config.json`
2. Add to Claude Desktop MCP settings

#### For Cursor/Other Tools:
```bash
npx mcp-context-manager serve
```

### 3. Tell Your AI to Create Context Files

In your AI assistant, say:
```
Please use the MCP Context Manager to:
1. First run 'analyze_codebase_deeply' tool
2. Read EVERY source code file (not just configs)
3. Understand actual patterns from the code
4. Collect evidence for every pattern found
5. Only then create context files with real examples

This is critical - don't skip the deep analysis!
```

The AI will:
- Read every .ts/.tsx/.js/.jsx file
- Analyze actual code patterns
- Understand your real architecture
- Create accurate context based on evidence

### 4. Use Context in Every Session

Before generating code, always tell your AI:
```
Please read agent-context/PROJECT-TEMPLATE.md and agent-context/CODEBASE-CONTEXT.md before generating any code. Follow the patterns and constraints defined there.
```

## 📁 What Gets Created

```
your-project/
├── agent-context/              # All AI context files
│   ├── PROJECT-TEMPLATE.md     # Complete project documentation
│   ├── CODEBASE-CONTEXT.md     # Your specific patterns & conventions
│   ├── .context7.yaml          # Hallucination prevention config
│   ├── adr/                    # Architecture Decision Records
│   │   └── *.md               # Individual ADRs
│   └── directories/            # Directory-specific docs
│       ├── src-components-README.md
│       ├── src-services-README.md
│       └── src-hooks-README.md
├── src/
│   ├── components/
│   │   └── README.md          # Component patterns (also in agent-context)
│   ├── services/
│   │   └── README.md          # Service patterns (also in agent-context)
│   └── hooks/
│       └── README.md          # Hook patterns (also in agent-context)
└── .mcp/
    └── INSTRUCTIONS.md        # How to use MCP
```

## 🔧 Available MCP Tools

The server provides these tools to AI agents:

- **`analyze_codebase_deeply`** 🔍 - MANDATORY FIRST STEP: Deep analysis of every file
- **`create_project_template`** - Create PROJECT-TEMPLATE.md (requires analysis_complete: true)
- **`create_codebase_context`** - Create CODEBASE-CONTEXT.md with evidence-based patterns
- **`create_initial_adrs`** - Create initial Architecture Decision Records
- **`create_adr`** - Create a specific Architecture Decision Record
- **`create_directory_readme`** - Create README for a specific directory
- **`check_context_usage`** - Verify AI is using context files
- **`create_cursor_config`** - Create Cursor auto-loading configuration
- **`create_shared_tech_stack`** - Create deduplicated version config
- **`create_maintenance_scripts`** - Create automation scripts

## 📋 PROJECT-TEMPLATE.md Contents

The template includes:
- Project metadata (name, version, stage)
- Tech stack details
- Architecture patterns
- Development setup
- AI assistance configuration
- Testing strategy
- Deployment process
- Common commands
- Troubleshooting guides

## 🎯 Benefits

Based on research:
- **53% better test coverage** with proper context
- **30% fewer prompt tokens** needed
- **84% fewer security issues** in generated code
- **5-10X faster development** with consistent patterns

## 🤖 How It Works

1. **MCP Server** provides templates and tools
2. **AI Agent** analyzes your codebase
3. **AI fills templates** with your actual data
4. **Every generation** uses this context
5. **Consistent code** matching your patterns

## 💡 Best Practices

1. **Update Regularly** - Keep context files current as project evolves
2. **Be Specific** - Fill templates with detailed, specific information
3. **Document Patterns** - Clear examples help AI follow them
4. **Review Generated Files** - Ensure AI captured patterns correctly

## 🔍 Commands

```bash
# Initialize in project
mcp-context init

# Start server
mcp-context serve

# Check if context files exist
mcp-context check
```

## 🛠️ Troubleshooting

### AI doesn't create files?
- Make sure MCP server is running
- Verify AI tool is connected to MCP
- Try more specific instructions

### AI ignores context?
- Remind AI to read context files first
- Check files were created correctly
- Ensure paths are correct

## 📚 Example AI Conversation

```
You: Please use MCP Context Manager to analyze this project and create all context files.

AI: I'll start with a deep analysis of your codebase using the MCP Context Manager...

[Running analyze_codebase_deeply tool]
[Reading src/components/Button.tsx...]
[Reading src/components/UserCard.tsx...]
[Reading src/services/api/userService.ts...]
[... reads EVERY source file ...]

I've analyzed 147 source files. Here's what I found:
- Components use PascalCase (Button.tsx, UserCard.tsx, NavBar.tsx...)
- State management: Zustand (found stores in src/stores/)
- API calls: Axios with try-catch pattern (seen in 23 service files)
- Styling: Tailwind utility classes (used in all components)

Now creating context files based on this evidence...
[Creates agent-context/PROJECT-TEMPLATE.md with specific examples]
[Creates agent-context/CODEBASE-CONTEXT.md with code snippets]
[Creates agent-context/adr/001-frontend-framework.md]
[Creates agent-context/adr/002-state-management.md]
[Creates agent-context/adr/003-api-patterns.md]
[Creates agent-context/adr/004-testing-strategy.md]
[Creates agent-context/adr/005-code-style.md]
[Creates agent-context/adr/006-security-patterns.md]

You: Now create a new user authentication component.

AI: Based on my analysis, I'll follow these patterns from your codebase:
- Component naming: PascalCase (like UserCard.tsx, LoginForm.tsx)
- Error handling: try-catch with toast (as in userService.ts:45)
- State: Zustand store (following authStore.ts pattern)
[Generates code matching YOUR specific patterns with evidence]
```

## 🤝 Contributing

This is a minimal MCP server focused on one thing: ensuring AI agents use project context. PRs welcome!

## 📄 License

MIT

---

**Remember**: The key to AI-assisted development is context. This tool ensures your AI always has it.