/**
 * Cursor Project Rules templates for automatic context loading
 */

export const CURSOR_PROJECT_RULE_TEMPLATE = `---
id: always-read-context
path_pattern: "**/*"
title: Always Read Agent Context
description: Automatically loads agent-context files before code generation
---

# CRITICAL: Always Read Context Files First

Before generating ANY code, you MUST:

1. Read and understand agent-context/PROJECT-TEMPLATE.md
2. Read and understand agent-context/CODEBASE-CONTEXT.md  
3. Check agent-context/shared/tech-stack.yaml for version constraints
4. Review relevant agent-context/adr/*.md files
5. Check directory-specific READMEs in agent-context/directories/

## Why This Matters

- Ensures consistent code patterns
- Prevents version conflicts
- Maintains architectural decisions
- Reduces bugs and tech debt

## Context Files Location

All context files are in the \`agent-context/\` directory at project root.

Never generate code without consulting these files first.`;

export const CURSOR_AUTO_CONTEXT_RULE = `---
id: auto-load-project-context
path_pattern: "**/*.{ts,tsx,js,jsx}"
title: Auto-Load Project Context
description: Automatically references context files for code files
---

# Project Context Auto-Loader

When working with [CURRENT_FILE], always reference:

1. **Project Overview**: agent-context/PROJECT-TEMPLATE.md
2. **Code Patterns**: agent-context/CODEBASE-CONTEXT.md
3. **Architecture**: agent-context/adr/[relevant-adr].md
4. **Directory Guide**: agent-context/directories/[current-directory]-README.md

## Pattern Enforcement

Follow the patterns documented in CODEBASE-CONTEXT.md:
- Naming conventions
- Error handling patterns
- State management approach
- API communication standards

## Version Constraints

Check agent-context/shared/tech-stack.yaml before using any library.`;

export const CURSOR_QUALITY_GATE_RULE = `---
id: quality-gates
path_pattern: "**/*.{ts,tsx,js,jsx}"
title: Code Quality Gates
description: Enforces quality standards before code generation
---

# Quality Gates

Before generating code, verify:

✓ Pattern compliance with agent-context/CODEBASE-CONTEXT.md
✓ Architecture alignment with agent-context/adr/
✓ Version compatibility with agent-context/shared/tech-stack.yaml
✓ Security patterns from agent-context/adr/006-security-patterns.md

## Pre-Generation Checklist

1. Have you read the relevant context files?
2. Does the code follow established patterns?
3. Are you using approved libraries/versions?
4. Have you considered security implications?

If any answer is NO, read the context files first.`;

export const MCP_PROJECT_CONFIG_TEMPLATE = `{
  "mcpServers": {
    "context-manager": {
      "command": "npx",
      "args": ["mcp-context-manager", "serve"],
      "env": {},
      "resources": {
        "auto_expose": true,
        "patterns": [
          "agent-context/**/*.md",
          "agent-context/**/*.yaml"
        ]
      }
    }
  },
  "autostart": true,
  "expose_as_mentions": true
}`;

export const CLAUDE_GLOBAL_CONTEXT_TEMPLATE = `# Claude Global Context Rules

## Project Context Loading

When working in any project with an agent-context/ directory:

1. **Automatically check for context files**:
   - agent-context/PROJECT-TEMPLATE.md
   - agent-context/CODEBASE-CONTEXT.md
   - agent-context/adr/*.md

2. **Load relevant context before code generation**:
   - Read patterns from CODEBASE-CONTEXT.md
   - Check architecture decisions in adr/
   - Verify versions in shared/tech-stack.yaml

3. **Follow established patterns**:
   - Use documented naming conventions
   - Apply consistent error handling
   - Maintain architectural boundaries

## MCP Integration

If MCP Context Manager is available:
- Resources are exposed via @ mentions
- Use @agent-context to access all context files
- Context persists throughout the session

## Quality Standards

Never generate code without:
- Understanding the project's patterns
- Checking version constraints
- Following security guidelines
- Maintaining consistency`;

export const AUTOMATED_CONTEXT_LOADER_SCRIPT = `#!/usr/bin/env node
/**
 * Automated Context Loader for development environments
 * Watches for file changes and ensures context is loaded
 */

import { watch } from 'fs';
import { exec } from 'child_process';
import path from 'path';

const CONTEXT_DIR = 'agent-context';
const CURSOR_RULES_DIR = '.cursor/rules';

// Watch for context changes and update rules
watch(CONTEXT_DIR, { recursive: true }, (eventType, filename) => {
  if (filename?.endsWith('.md') || filename?.endsWith('.yaml')) {
    console.log(\`Context updated: \${filename}\`);
    updateCursorRules();
  }
});

function updateCursorRules() {
  // Generate dynamic rules based on current context
  const timestamp = new Date().toISOString();
  const rule = \`---
id: context-updated-\${timestamp}
path_pattern: "**/*"
title: Context Updated
description: Context files were updated, please reload
---

# Context Files Updated

The agent-context files have been updated. Please reload them before generating any code.

Last update: \${timestamp}
\`;

  // Write rule to trigger reload
  const rulePath = path.join(CURSOR_RULES_DIR, 'context-update.mdc');
  require('fs').writeFileSync(rulePath, rule);
}

console.log('Context loader running... Watching for changes.');
`;

export const CONTEXT_MENTION_HANDLER = `/**
 * MCP Resource Handler for @ mentions
 * Automatically exposes context files
 */

export function setupContextMentions(server: Server) {
  // Expose all context files as @ mentionable resources
  const contextFiles = glob.sync('agent-context/**/*.{md,yaml}');
  
  contextFiles.forEach(file => {
    const name = file.replace('agent-context/', '@context/');
    
    server.addResource({
      uri: \`file://\${file}\`,
      name: name,
      description: \`Context file: \${path.basename(file)}\`,
      mimeType: file.endsWith('.yaml') ? 'text/yaml' : 'text/markdown'
    });
  });

  // Add a master @context resource that loads all files
  server.addResource({
    uri: 'context://all',
    name: '@context',
    description: 'Load all project context files',
    handler: async () => {
      const allContext = await loadAllContextFiles();
      return { content: allContext };
    }
  });
}`;

export const DESKTOP_EXTENSION_MANIFEST = `{
  "name": "MCP Context Manager",
  "version": "1.2.0",
  "description": "Automated context loading for AI-assisted development",
  "main": "dist/server/index.js",
  "permissions": [
    "files.read",
    "mcp.expose_resources"
  ],
  "activation": {
    "onStartup": true,
    "onProjectOpen": ["agent-context/**"]
  },
  "contributes": {
    "resources": [
      {
        "pattern": "agent-context/**/*.md",
        "expose_as": "@context/*"
      }
    ],
    "commands": [
      {
        "command": "context.reload",
        "title": "Reload Project Context"
      }
    ]
  }
}`;

export const CURSOR_MCP_CONFIG_TEMPLATE = `{
  "context-manager": {
    "command": "npx",
    "args": ["mcp-context-manager", "serve"],
    "env": {},
    "autoStart": true,
    "description": "MCP Context Manager - Automated context loading for better AI code generation"
  }
}`;