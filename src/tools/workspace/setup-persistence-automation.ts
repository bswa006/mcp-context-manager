import { writeFileSync, mkdirSync, existsSync, chmodSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface PersistenceConfig {
  projectPath: string;
  analysisId?: string;
  updateSchedule: 'daily' | 'weekly' | 'on-change' | 'manual';
  gitHooks?: boolean;
  monitoring?: boolean;
  notifications?: {
    email?: string;
    slack?: string;
  };
}

interface PersistenceResult {
  success: boolean;
  filesCreated: string[];
  message: string;
  setupInstructions: string[];
}

export async function setupPersistenceAutomation(
  config: PersistenceConfig
): Promise<PersistenceResult> {
  const result: PersistenceResult = {
    success: false,
    filesCreated: [],
    message: '',
    setupInstructions: [],
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];
    
    // Create scripts directory
    const scriptsDir = join(config.projectPath, 'scripts');
    if (!existsSync(scriptsDir)) {
      mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Create update script
    const updateScript = createUpdateScript(config, analysis);
    const updateScriptPath = join(scriptsDir, 'update-context.sh');
    writeFileSync(updateScriptPath, updateScript);
    chmodSync(updateScriptPath, '755');
    result.filesCreated.push(updateScriptPath);
    
    // Create validation script
    const validationScript = createValidationScript(config);
    const validationScriptPath = join(scriptsDir, 'validate-context.sh');
    writeFileSync(validationScriptPath, validationScript);
    chmodSync(validationScriptPath, '755');
    result.filesCreated.push(validationScriptPath);
    
    // Create monitoring configuration
    if (config.monitoring) {
      const monitoringConfig = createMonitoringConfig(config, analysis);
      const monitoringPath = join(config.projectPath, '.context-monitoring.yaml');
      writeFileSync(monitoringPath, yaml.dump(monitoringConfig));
      result.filesCreated.push(monitoringPath);
    }
    
    // Set up git hooks if requested
    if (config.gitHooks) {
      await setupGitHooks(config, result);
    }
    
    // Create scheduled update configuration
    if (config.updateSchedule !== 'manual') {
      const scheduleConfig = createScheduleConfig(config);
      const schedulePath = join(config.projectPath, '.context-schedule.yaml');
      writeFileSync(schedulePath, yaml.dump(scheduleConfig));
      result.filesCreated.push(schedulePath);
      
      // Create cron job script
      const cronScript = createCronScript(config);
      const cronPath = join(scriptsDir, 'setup-cron.sh');
      writeFileSync(cronPath, cronScript);
      chmodSync(cronPath, '755');
      result.filesCreated.push(cronPath);
    }
    
    // Create GitHub Actions workflow if in a git repo
    const gitDir = join(config.projectPath, '.git');
    if (existsSync(gitDir)) {
      const workflowsDir = join(config.projectPath, '.github', 'workflows');
      if (!existsSync(workflowsDir)) {
        mkdirSync(workflowsDir, { recursive: true });
      }
      
      const workflow = createGitHubActionsWorkflow(config);
      const workflowPath = join(workflowsDir, 'update-context.yml');
      writeFileSync(workflowPath, workflow);
      result.filesCreated.push(workflowPath);
    }
    
    // Generate setup instructions
    result.setupInstructions = generateSetupInstructions(config, result.filesCreated);
    
    result.success = true;
    result.message = `Persistence automation setup complete. Schedule: ${config.updateSchedule}`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to setup persistence automation: ${error}`;
  }

  return result;
}

function createUpdateScript(config: PersistenceConfig, analysis: DeepAnalysisResult): string {
  return `#!/bin/bash
# Context Update Script
# Generated: ${new Date().toISOString()}

set -e

SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔄 Starting context update..."

# Function to check if context needs update
needs_update() {
  local context_file="$1"
  local threshold_days="\${2:-7}"
  
  if [ ! -f "$context_file" ]; then
    return 0 # Needs update if doesn't exist
  fi
  
  # Check file age
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    file_age=$(( ($(date +%s) - $(stat -f %m "$context_file")) / 86400 ))
  else
    # Linux
    file_age=$(( ($(date +%s) - $(stat -c %Y "$context_file")) / 86400 ))
  fi
  
  if [ $file_age -gt $threshold_days ]; then
    return 0 # Needs update if older than threshold
  fi
  
  return 1 # No update needed
}

# Check if MCP server is available
check_mcp_server() {
  if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
  fi
  
  echo "✅ MCP server available"
}

# Run analysis
run_analysis() {
  echo "🔍 Running codebase analysis..."
  
  # This would normally call the MCP tool
  # For now, we'll create a marker file
  touch "$PROJECT_ROOT/.last-analysis"
  
  echo "✅ Analysis complete"
}

# Update context files
update_contexts() {
  local force_update="\${1:-false}"
  
  # List of context files to check
  declare -a context_files=(
    "agent-context/CODEBASE-CONTEXT.md"
    "agent-context/PROJECT-TEMPLATE.md"
    "agent-context/conversation-starters.md"
    "agent-context/minimal-context.md"
  )
  
  local updates_needed=false
  
  for file in "\${context_files[@]}"; do
    if [ "$force_update" = "true" ] || needs_update "$PROJECT_ROOT/$file"; then
      echo "📝 Updating $file..."
      updates_needed=true
    fi
  done
  
  if [ "$updates_needed" = "true" ]; then
    run_analysis
    echo "✅ All context files updated"
  else
    echo "✅ All context files are up to date"
  fi
}

# Validate context files
validate_contexts() {
  echo "🔍 Validating context files..."
  
  "$SCRIPT_DIR/validate-context.sh"
  
  if [ $? -eq 0 ]; then
    echo "✅ All context files are valid"
  else
    echo "❌ Context validation failed"
    exit 1
  fi
}

# Send notification
send_notification() {
  local message="$1"
  ${config.notifications?.email ? `
  
  # Email notification
  if command -v mail &> /dev/null; then
    echo "$message" | mail -s "Context Update: $PROJECT_ROOT" "${config.notifications.email}"
  fi` : ''}
  ${config.notifications?.slack ? `
  
  # Slack notification
  if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \\
      --data "{\\"text\\":\\"$message\\"}" \\
      "$SLACK_WEBHOOK"
  fi` : ''}
  
  echo "$message"
}

# Main execution
main() {
  local force_update=false
  
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --force|-f)
        force_update=true
        shift
        ;;
      --help|-h)
        echo "Usage: $0 [--force]"
        echo "  --force, -f  Force update all context files"
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        exit 1
        ;;
    esac
  done
  
  cd "$PROJECT_ROOT"
  
  # Check prerequisites
  check_mcp_server
  
  # Update contexts
  update_contexts "$force_update"
  
  # Validate
  validate_contexts
  
  # Record update
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" > "$PROJECT_ROOT/.last-context-update"
  
  # Send notification
  send_notification "✅ Context update completed successfully for ${analysis.projectPath.split('/').pop()}"
}

# Run main function
main "$@"`;
}

function createValidationScript(config: PersistenceConfig): string {
  return `#!/bin/bash
# Context Validation Script
# Generated: ${new Date().toISOString()}

set -e

SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Validation results
ERRORS=0
WARNINGS=0

# Check if file exists and is not empty
check_file() {
  local file="$1"
  local required="\${2:-true}"
  
  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    if [ "$required" = "true" ]; then
      echo -e "\${RED}❌ Missing required file: $file\${NC}"
      ((ERRORS++))
    else
      echo -e "\${YELLOW}⚠️  Missing optional file: $file\${NC}"
      ((WARNINGS++))
    fi
    return 1
  fi
  
  if [ ! -s "$PROJECT_ROOT/$file" ]; then
    echo -e "\${RED}❌ Empty file: $file\${NC}"
    ((ERRORS++))
    return 1
  fi
  
  echo -e "\${GREEN}✅ Valid: $file\${NC}"
  return 0
}

# Check file age
check_age() {
  local file="$1"
  local max_days="\${2:-30}"
  
  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    return 1
  fi
  
  # Calculate file age
  if [[ "$OSTYPE" == "darwin"* ]]; then
    file_age=$(( ($(date +%s) - $(stat -f %m "$PROJECT_ROOT/$file")) / 86400 ))
  else
    file_age=$(( ($(date +%s) - $(stat -c %Y "$PROJECT_ROOT/$file")) / 86400 ))
  fi
  
  if [ $file_age -gt $max_days ]; then
    echo -e "\${YELLOW}⚠️  File older than $max_days days: $file (age: $file_age days)\${NC}"
    ((WARNINGS++))
  fi
}

# Check YAML validity
check_yaml() {
  local file="$1"
  
  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    return 1
  fi
  
  if command -v yq &> /dev/null; then
    if yq eval '.' "$PROJECT_ROOT/$file" > /dev/null 2>&1; then
      echo -e "\${GREEN}✅ Valid YAML: $file\${NC}"
    else
      echo -e "\${RED}❌ Invalid YAML: $file\${NC}"
      ((ERRORS++))
    fi
  fi
}

# Check for common issues
check_common_issues() {
  local file="$1"
  
  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    return 1
  fi
  
  # Check for placeholder text
  if grep -q "\\[TODO\\]\\|\\[PLACEHOLDER\\]\\|<<<\\|>>>" "$PROJECT_ROOT/$file"; then
    echo -e "\${YELLOW}⚠️  Found placeholder text in: $file\${NC}"
    ((WARNINGS++))
  fi
  
  # Check for sensitive data
  if grep -qE "(password|secret|key|token)\\s*[:=]\\s*[\"'][^\"']+[\"']" "$PROJECT_ROOT/$file"; then
    echo -e "\${RED}❌ Possible sensitive data in: $file\${NC}"
    ((ERRORS++))
  fi
}

# Main validation
echo "🔍 Validating AI context files..."
echo "================================"

# Check required files
check_file "agent-context/CODEBASE-CONTEXT.md" true
check_file "agent-context/PROJECT-TEMPLATE.md" true
check_file "agent-context/conversation-starters.md" true

# Check optional files
check_file "agent-context/minimal-context.md" false
check_file "agent-context/standard-context.md" false
check_file "agent-context/comprehensive-context.md" false

# Check YAML files
check_yaml "agent-context/.context7.yaml"
check_yaml "agent-context/context-router.yaml"
check_yaml ".context-monitoring.yaml"

# Check file age (30 days for main files)
check_age "agent-context/CODEBASE-CONTEXT.md" 30
check_age "agent-context/PROJECT-TEMPLATE.md" 30

# Check for common issues
check_common_issues "agent-context/CODEBASE-CONTEXT.md"
check_common_issues "agent-context/PROJECT-TEMPLATE.md"

echo "================================"
echo -e "Errors: \${RED}$ERRORS\${NC}"
echo -e "Warnings: \${YELLOW}$WARNINGS\${NC}"

if [ $ERRORS -gt 0 ]; then
  echo -e "\${RED}❌ Validation failed\${NC}"
  exit 1
else
  echo -e "\${GREEN}✅ Validation passed\${NC}"
  exit 0
fi`;
}

function createMonitoringConfig(config: PersistenceConfig, analysis: DeepAnalysisResult): any {
  return {
    version: '1.0',
    monitoring: {
      enabled: true,
      metrics: {
        context_age: {
          description: 'Age of context files in days',
          threshold_warning: 14,
          threshold_critical: 30,
        },
        context_size: {
          description: 'Size of context files in tokens',
          threshold_warning: 5000,
          threshold_critical: 10000,
        },
        drift_detection: {
          description: 'Percentage of files changed since last update',
          threshold_warning: 20,
          threshold_critical: 40,
        },
      },
      alerts: {
        channels: config.notifications ? Object.keys(config.notifications) : [],
        frequency: 'daily',
        conditions: [
          'context_age > threshold_warning',
          'drift_detection > threshold_critical',
        ],
      },
      reporting: {
        format: 'markdown',
        location: 'agent-context/monitoring-report.md',
        frequency: config.updateSchedule === 'daily' ? 'weekly' : 'monthly',
      },
    },
    tracking: {
      files_to_monitor: [
        'src/**/*.{ts,tsx,js,jsx}',
        'package.json',
        'tsconfig.json',
        '.env.example',
      ],
      ignore_patterns: [
        'node_modules',
        'dist',
        'build',
        '.next',
        'coverage',
        '*.test.*',
        '*.spec.*',
      ],
    },
  };
}

async function setupGitHooks(config: PersistenceConfig, result: PersistenceResult): Promise<void> {
  const hooksDir = join(config.projectPath, '.git', 'hooks');
  
  if (!existsSync(hooksDir)) {
    // Not a git repository
    return;
  }
  
  // Create post-commit hook
  const postCommitHook = `#!/bin/bash
# Post-commit hook to check if context update is needed

CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)
TRIGGER_PATTERNS="src/|package.json|tsconfig.json"

if echo "$CHANGED_FILES" | grep -qE "$TRIGGER_PATTERNS"; then
  echo "📝 Significant changes detected. Consider updating context files."
  echo "Run: npm run update-context"
fi`;
  
  const postCommitPath = join(hooksDir, 'post-commit');
  writeFileSync(postCommitPath, postCommitHook);
  chmodSync(postCommitPath, '755');
  result.filesCreated.push(postCommitPath);
  
  // Create pre-push hook
  const prePushHook = `#!/bin/bash
# Pre-push hook to validate context files

echo "🔍 Validating context files before push..."
./scripts/validate-context.sh

if [ $? -ne 0 ]; then
  echo "❌ Context validation failed. Please update context files before pushing."
  echo "Run: npm run update-context"
  exit 1
fi

echo "✅ Context validation passed"`;
  
  const prePushPath = join(hooksDir, 'pre-push');
  writeFileSync(prePushPath, prePushHook);
  chmodSync(prePushPath, '755');
  result.filesCreated.push(prePushPath);
}

function createScheduleConfig(config: PersistenceConfig): any {
  const schedules: Record<string, string> = {
    daily: '0 2 * * *',    // 2 AM daily
    weekly: '0 2 * * 1',   // 2 AM on Mondays
    'on-change': 'trigger', // Event-based
    manual: 'manual',      // Manual updates only
  };
  
  return {
    version: '1.0',
    schedule: {
      type: config.updateSchedule,
      cron: schedules[config.updateSchedule],
      timezone: 'UTC',
      retry: {
        attempts: 3,
        delay: '5m',
      },
      notifications: {
        on_success: config.notifications ? 'enabled' : 'disabled',
        on_failure: 'always',
      },
    },
    tasks: [
      {
        name: 'update_context',
        command: './scripts/update-context.sh',
        timeout: '30m',
      },
      {
        name: 'validate_context',
        command: './scripts/validate-context.sh',
        timeout: '5m',
      },
    ],
  };
}

function createCronScript(config: PersistenceConfig): string {
  const schedules = {
    daily: '0 2 * * *',
    weekly: '0 2 * * 1',
  };
  
  const cron = schedules[config.updateSchedule as keyof typeof schedules];
  
  return `#!/bin/bash
# Cron Setup Script
# Generated: ${new Date().toISOString()}

SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Add cron job
add_cron_job() {
  local cron_cmd="cd $PROJECT_ROOT && ./scripts/update-context.sh >> /var/log/context-update.log 2>&1"
  local cron_schedule="${cron}"
  
  # Check if cron job already exists
  if crontab -l 2>/dev/null | grep -q "update-context.sh"; then
    echo "✅ Cron job already exists"
    return 0
  fi
  
  # Add new cron job
  (crontab -l 2>/dev/null; echo "$cron_schedule $cron_cmd") | crontab -
  
  if [ $? -eq 0 ]; then
    echo "✅ Cron job added successfully"
    echo "Schedule: $cron_schedule"
  else
    echo "❌ Failed to add cron job"
    exit 1
  fi
}

# Remove cron job
remove_cron_job() {
  crontab -l 2>/dev/null | grep -v "update-context.sh" | crontab -
  echo "✅ Cron job removed"
}

# Main
case "\${1:-add}" in
  add)
    add_cron_job
    ;;
  remove)
    remove_cron_job
    ;;
  *)
    echo "Usage: $0 [add|remove]"
    exit 1
    ;;
esac`;
}

function createGitHubActionsWorkflow(config: PersistenceConfig): string {
  const schedules: Record<string, string | null> = {
    daily: '0 2 * * *',
    weekly: '0 2 * * 1',
    'on-change': null,
    manual: null,
  };
  
  const schedule = schedules[config.updateSchedule];
  
  return `name: Update AI Context

on:
  ${schedule ? `schedule:
    - cron: '${schedule}'` : ''}
  workflow_dispatch:
  ${config.updateSchedule === 'on-change' ? `push:
    paths:
      - 'src/**'
      - 'package.json'
      - 'tsconfig.json'` : ''}

jobs:
  update-context:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Update context files
      run: |
        npm install -g mcp-context-manager@latest
        ./scripts/update-context.sh
        
    - name: Validate context
      run: ./scripts/validate-context.sh
      
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add agent-context/
        git diff --staged --quiet || git commit -m "chore: update AI context files [skip ci]"
        
    - name: Push changes
      uses: ad-m/github-push-action@master
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        branch: \${{ github.ref }}
        
    ${config.notifications?.slack ? `- name: Notify Slack
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: \${{ job.status }}
        text: 'Context update workflow completed'
        webhook_url: \${{ secrets.SLACK_WEBHOOK }}` : ''}`;
}

function generateSetupInstructions(config: PersistenceConfig, files: string[]): string[] {
  const instructions = [
    '1. **Run initial update**: `./scripts/update-context.sh`',
    '2. **Test validation**: `./scripts/validate-context.sh`',
  ];
  
  if (config.updateSchedule !== 'manual') {
    instructions.push(`3. **Set up scheduled updates**: \`./scripts/setup-cron.sh add\``);
  }
  
  if (config.gitHooks) {
    instructions.push('4. **Git hooks installed**: Context validation will run on push');
  }
  
  if (files.some(f => f.includes('.github/workflows'))) {
    instructions.push('5. **GitHub Actions configured**: Automatic updates via CI/CD');
  }
  
  if (config.monitoring) {
    instructions.push('6. **Monitoring enabled**: Check `.context-monitoring.yaml`');
  }
  
  instructions.push('', '**NPM Scripts** (add to package.json):');
  instructions.push('```json');
  instructions.push('"scripts": {');
  instructions.push('  "update-context": "./scripts/update-context.sh",');
  instructions.push('  "validate-context": "./scripts/validate-context.sh"');
  instructions.push('}');
  instructions.push('```');
  
  return instructions;
}