# Changelog

## [1.5.0] - 2025-01-08

### Major Documentation Overhaul
- Complete rewrite of README to explain what MCP actually does
- Added CRITICAL WARNING about using MCP tools vs manual instructions
- Removed misleading manual instructions that bypass quality checks
- Added clear examples of right vs wrong usage

### Fixed
- Documentation now accurately describes enforcement mechanism
- Explains why manual instructions don't work
- Shows what actually happens during analysis
- Clear troubleshooting for common issues

### Added
- Real example showing actual tool execution
- Evidence requirements explanation
- Quality gates documentation
- Verification criteria for good vs bad results

## [1.4.2] - 2025-01-08

### Fixed
- Cursor now correctly uses native MCP support (v1.0+)
- Updated Cursor configuration to use `.cursor/mcp.json`
- Fixed instructions to use Cursor's Settings → MCP Tools
- Removed incorrect server-based approach for Cursor

### Added
- `CURSOR_MCP_CONFIG_TEMPLATE` for proper Cursor configuration
- Updated comparison table with accurate 2025 features
- Tool limit information (40 max for Cursor)

### Changed
- Cursor setup now matches native MCP integration
- Both Claude and Cursor use similar magic command
- Verification steps updated for both platforms

## [1.4.1] - 2025-01-08

### Documentation
- Added separate Quick Start sections for Claude Desktop and Cursor users
- Added comparison table between Claude Desktop and Cursor
- Added prerequisites section
- Clarified MCP server usage for Cursor
- Improved step-by-step instructions for both platforms

### Fixed
- Clear distinction between Claude Desktop (native MCP) and Cursor (server-based)
- Better explanation of auto-loading verification

## [1.4.0] - 2025-01-08

### Added
- New `complete_setup_workflow` tool for one-command full setup
- Automatic execution of `setup_auto_context_loading` after context creation
- Simplified magic prompt for complete workflow

### Changed
- Updated `create_project_template` to include auto-loading setup as final step
- Reorganized tool list in README into categories
- Improved examples to show one-command workflow

### Improved
- Workflow now automatically enables context auto-loading
- No need to manually run auto-loading setup separately
- Better user experience with single command setup

## [1.3.0] - 2025-01-08

### Added
- New `setup_auto_context_loading` tool for automatic context loading
- Cursor Project Rules templates (`.cursor/rules/*.mdc`)
- Claude Desktop project-scoped MCP configuration (`.mcp.json`)
- Global Claude context rules (`~/.claude/CLAUDE.md`)
- @ mention support for context files in Claude Desktop
- Context watcher script for real-time updates

### Features
- Automatic context loading without manual reminders
- Path-based rule attachment in Cursor
- Quality gates before code generation
- Resource exposure via @ mentions in Claude
- Auto-start MCP server when project opens

### Documentation
- Added "Automatic Context Loading" section to README
- Explained 2025 capabilities of Claude and Cursor
- Updated setup instructions with automation step

## [1.2.0] - 2025-01-08

### Added
- Comprehensive "How to Use" guide in README
- Clear step-by-step setup instructions
- Magic prompt: "Please use the MCP Context Manager to analyze this codebase and create all context files."
- Troubleshooting section for common issues
- Visual table showing what files get created
- Pro tips for effective usage

### Improved
- User-friendly README with emojis and clear sections
- Better explanation of Claude Desktop configuration
- Added specific MCP server configuration JSON
- Clear examples of expected outcomes

### Documentation
- Step-by-step guide for Claude Desktop setup
- Explanation of empty folders issue
- Advanced usage examples

## [1.1.0] - 2025-01-08

### Added
- New `create_initial_adrs` tool that creates 6 essential Architecture Decision Records
- ADRs now include:
  - 001-frontend-framework.md
  - 002-state-management.md
  - 003-api-patterns.md
  - 004-testing-strategy.md
  - 005-code-style.md
  - 006-security-patterns.md
- Updated `create_project_template` to automatically trigger ADR creation
- Added comprehensive workflow documentation
- Each ADR includes DO/DON'T sections specifically for AI code generation

### Fixed
- AI agents now create all required context files including ADRs
- Better evidence-based documentation requirements

### Changed
- PROJECT-TEMPLATE.md creation now includes step to create ADRs
- Updated README with new tools and complete example

## [1.0.0] - 2025-01-08

### Initial Release
- MCP Context Manager server for AI-assisted development
- Deep codebase analysis tool
- Template-based context generation
- Support for Claude Desktop and Cursor
- Hallucination prevention with Context7
- Automated maintenance scripts
- Token optimization features