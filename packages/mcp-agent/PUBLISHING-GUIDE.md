# Publishing MCP Context Manager to NPM

## Prerequisites

1. **NPM Account**: Create one at https://www.npmjs.com/signup
2. **Login to NPM**:
   ```bash
   npm login
   ```

## Step 1: Update package.json

Replace `YOUR_USERNAME` with your GitHub username in package.json:
- repository.url
- homepage
- bugs.url

## Step 2: Build the Project

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Test the CLI locally
npm link
mcp-context init
```

## Step 3: Publish to NPM

```bash
# For first-time publishing
npm publish --access public

# For updates
npm version patch  # or minor/major
npm publish
```

## Step 4: Test Installation

```bash
# Unlink local version
npm unlink

# Test global install
npm install -g @mcp/context-manager

# Or test with npx (no install)
npx @mcp/context-manager init
```

## How Users Will Use It

### Option 1: Using npx (Recommended)
```bash
# No installation needed
npx @mcp/context-manager init
npx @mcp/context-manager serve
```

### Option 2: Global Install
```bash
# Install once
npm install -g @mcp/context-manager

# Use anywhere
mcp-context init
mcp-context serve
```

### Option 3: Project Dependency
```bash
# Add to project
npm install --save-dev @mcp/context-manager

# Add to package.json scripts
{
  "scripts": {
    "mcp": "mcp-context serve"
  }
}
```

## Claude Desktop Configuration

After publishing, users configure Claude Desktop:

```json
{
  "mcpServers": {
    "context-manager": {
      "command": "npx",
      "args": ["@mcp/context-manager", "serve"]
    }
  }
}
```

## Cursor Configuration

```json
{
  "mcp": {
    "servers": {
      "context-manager": {
        "command": "npx",
        "args": ["@mcp/context-manager", "serve"]
      }
    }
  }
}
```

## Marketing Your Package

### 1. Create a GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mcp-context-manager
git push -u origin main
```

### 2. Add Badges to README

```markdown
[![npm version](https://badge.fury.io/js/@mcp%2Fcontext-manager.svg)](https://www.npmjs.com/package/@mcp/context-manager)
[![Downloads](https://img.shields.io/npm/dt/@mcp/context-manager.svg)](https://www.npmjs.com/package/@mcp/context-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### 3. Announce on Social Media

Example tweet:
```
🚀 Just published MCP Context Manager!

Helps AI agents understand your codebase with:
✅ Deep code analysis
✅ Evidence-based documentation
✅ 53% better test coverage
✅ 30% fewer tokens needed

npx @mcp/context-manager init

#MCP #AI #Claude #Cursor
```

### 4. Submit to MCP Registries

- MCP Official Registry: https://github.com/modelcontextprotocol/registry
- Claude Extensions: https://claude.ai/extensions
- Cursor Marketplace: (when available)

## Alternative Distribution Methods

### 1. GitHub Packages

```json
// .npmrc
@YOUR_USERNAME:registry=https://npm.pkg.github.com
```

```bash
npm publish --registry https://npm.pkg.github.com
```

### 2. Desktop Extension (.dxt)

```bash
# Install extension toolkit
npm install -g @anthropic-ai/dxt

# Create extension
dxt init
dxt pack

# Creates mcp-context-manager.dxt for one-click install
```

### 3. Docker Hub

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
ENTRYPOINT ["node", "dist/cli.js", "serve"]
```

```bash
docker build -t YOUR_USERNAME/mcp-context-manager .
docker push YOUR_USERNAME/mcp-context-manager
```

## Maintenance

### Regular Updates

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# Publish patch version
npm version patch
npm publish
```

### Monitor Usage

- NPM Stats: https://npm-stat.com/charts.html?package=@mcp/context-manager
- GitHub Stars/Issues
- User feedback

## Troubleshooting

### Common Issues

1. **"E403 Forbidden"**
   - Make sure you're logged in: `npm login`
   - Package name might be taken
   - Use scoped package: `@yourscope/context-manager`

2. **"ENOENT: no such file"**
   - Run `npm run build` first
   - Check `dist/` folder exists

3. **"Cannot find module"**
   - Update imports to use `.js` extension
   - Check tsconfig.json module settings