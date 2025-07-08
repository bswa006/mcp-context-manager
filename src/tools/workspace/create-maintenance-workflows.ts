import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface MaintenanceConfig {
  projectPath: string;
  analysisId?: string;
  teamSize: number;
  updateFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  includeChecklists?: boolean;
  includeMetrics?: boolean;
  includeTraining?: boolean;
}

interface MaintenanceResult {
  success: boolean;
  filesCreated: string[];
  message: string;
  workflows: {
    regular: string[];
    emergency: string[];
    onboarding: string[];
  };
}

export async function createMaintenanceWorkflows(
  config: MaintenanceConfig
): Promise<MaintenanceResult> {
  const result: MaintenanceResult = {
    success: false,
    filesCreated: [],
    message: '',
    workflows: {
      regular: [],
      emergency: [],
      onboarding: [],
    },
  };

  try {
    // Check if analysis has been completed
    const analysisId = config.analysisId || global.latestAnalysisId;
    if (!analysisId || !global.codebaseAnalysis?.[analysisId]) {
      throw new Error('Codebase analysis must be completed first. Run analyze_codebase_deeply tool.');
    }

    const analysis: DeepAnalysisResult = global.codebaseAnalysis[analysisId];
    
    // Create workflows directory
    const workflowsDir = join(config.projectPath, 'agent-context', 'workflows');
    if (!existsSync(workflowsDir)) {
      mkdirSync(workflowsDir, { recursive: true });
    }
    
    // Create maintenance handbook
    const handbook = createMaintenanceHandbook(config, analysis);
    const handbookPath = join(workflowsDir, 'MAINTENANCE-HANDBOOK.md');
    writeFileSync(handbookPath, handbook);
    result.filesCreated.push(handbookPath);
    result.workflows.regular.push('Maintenance Handbook');
    
    // Create update workflow
    const updateWorkflow = createUpdateWorkflow(config, analysis);
    const updatePath = join(workflowsDir, 'context-update-workflow.md');
    writeFileSync(updatePath, updateWorkflow);
    result.filesCreated.push(updatePath);
    result.workflows.regular.push('Context Update Workflow');
    
    // Create review checklist if requested
    if (config.includeChecklists) {
      const reviewChecklist = createReviewChecklist(config, analysis);
      const checklistPath = join(workflowsDir, 'context-review-checklist.md');
      writeFileSync(checklistPath, reviewChecklist);
      result.filesCreated.push(checklistPath);
      result.workflows.regular.push('Review Checklist');
      
      // Create quality checklist
      const qualityChecklist = createQualityChecklist(analysis);
      const qualityPath = join(workflowsDir, 'quality-checklist.md');
      writeFileSync(qualityPath, qualityChecklist);
      result.filesCreated.push(qualityPath);
      result.workflows.regular.push('Quality Checklist');
    }
    
    // Create emergency procedures
    const emergencyProcedures = createEmergencyProcedures(config, analysis);
    const emergencyPath = join(workflowsDir, 'emergency-procedures.md');
    writeFileSync(emergencyPath, emergencyProcedures);
    result.filesCreated.push(emergencyPath);
    result.workflows.emergency.push('Emergency Procedures');
    
    // Create team onboarding guide
    const onboardingGuide = createOnboardingGuide(config, analysis);
    const onboardingPath = join(workflowsDir, 'team-onboarding.md');
    writeFileSync(onboardingPath, onboardingGuide);
    result.filesCreated.push(onboardingPath);
    result.workflows.onboarding.push('Team Onboarding');
    
    // Create metrics dashboard if requested
    if (config.includeMetrics) {
      const metricsDashboard = createMetricsDashboard(config, analysis);
      const metricsPath = join(workflowsDir, 'metrics-dashboard.md');
      writeFileSync(metricsPath, metricsDashboard);
      result.filesCreated.push(metricsPath);
      result.workflows.regular.push('Metrics Dashboard');
    }
    
    // Create training materials if requested
    if (config.includeTraining) {
      const trainingMaterials = createTrainingMaterials(config, analysis);
      const trainingPath = join(workflowsDir, 'ai-context-training.md');
      writeFileSync(trainingPath, trainingMaterials);
      result.filesCreated.push(trainingPath);
      result.workflows.onboarding.push('Training Materials');
    }
    
    // Create workflow index
    const workflowIndex = createWorkflowIndex(result.workflows, config);
    const indexPath = join(workflowsDir, 'README.md');
    writeFileSync(indexPath, workflowIndex);
    result.filesCreated.push(indexPath);
    
    result.success = true;
    result.message = `Created ${result.filesCreated.length} maintenance workflows for ${config.teamSize}-person team`;
  } catch (error) {
    result.success = false;
    result.message = `Failed to create maintenance workflows: ${error}`;
  }

  return result;
}

function createMaintenanceHandbook(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  const projectName = analysis.projectPath.split('/').pop() || 'Project';
  
  return `# AI Context Maintenance Handbook

## 📋 Overview
This handbook guides the maintenance of AI context files for ${projectName}.

**Team Size**: ${config.teamSize} developers  
**Update Frequency**: ${config.updateFrequency}  
**Tech Stack**: ${analysis.summary.techStack.join(', ')}

## 🔄 Regular Maintenance Schedule

### ${config.updateFrequency === 'daily' ? 'Daily' : config.updateFrequency.charAt(0).toUpperCase() + config.updateFrequency.slice(1)} Tasks
1. **Quick Validation** (5 min)
   - Run \`npm run validate-context\`
   - Check for any warnings or errors
   - Review file timestamps

2. **Drift Check** (10 min)
   - Review recent commits for significant changes
   - Check if new patterns have emerged
   - Identify deprecated patterns

3. **Update Decision** (5 min)
   - Determine if full update is needed
   - Schedule update if drift > 20%
   - Document decision in log

### Weekly Deep Review
1. **Pattern Analysis** (30 min)
   - Review new components/features added
   - Check if patterns are being followed
   - Update pattern documentation

2. **Token Usage Review** (15 min)
   - Analyze token consumption metrics
   - Optimize high-usage contexts
   - Update tier recommendations

3. **Team Feedback** (15 min)
   - Collect feedback on context quality
   - Identify pain points
   - Plan improvements

## 👥 Role Responsibilities

### Context Owner (Primary)
- Owns update schedule adherence
- Reviews and approves major changes
- Coordinates with team members
- Maintains quality standards

### Developers
- Report context issues immediately
- Suggest improvements
- Follow update procedures
- Use context files correctly

### Team Lead
- Ensures process compliance
- Reviews metrics monthly
- Approves process changes
- Handles escalations

## 📊 Key Metrics to Track

### Context Health
- **Age**: Days since last update
- **Coverage**: % of codebase documented
- **Accuracy**: Validation pass rate
- **Usage**: Token consumption trends

### Team Efficiency
- **Time Saved**: Hours saved using AI
- **Error Reduction**: Bugs prevented
- **Onboarding Speed**: Time to productivity
- **Satisfaction**: Team feedback score

## 🚨 Warning Signs
- Context files > 30 days old
- Validation failures increasing
- Token usage spiking
- Team complaints about accuracy
- Frequent "hallucination" reports

## 📈 Continuous Improvement
1. **Monthly Review**
   - Analyze metrics
   - Gather team feedback
   - Identify improvement areas
   - Update processes

2. **Quarterly Planning**
   - Review tool updates
   - Plan major improvements
   - Update team training
   - Refine workflows

## 🔗 Quick Links
- Update Script: \`./scripts/update-context.sh\`
- Validation: \`./scripts/validate-context.sh\`
- Metrics: \`./workflows/metrics-dashboard.md\`
- Emergency: \`./workflows/emergency-procedures.md\`

---
Last Updated: ${new Date().toISOString()}`;
}

function createUpdateWorkflow(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  return `# Context Update Workflow

## 🎯 Purpose
Standardized process for updating AI context files to maintain accuracy and usefulness.

## 📋 Pre-Update Checklist
- [ ] All code changes committed
- [ ] Tests passing
- [ ] No active deployments
- [ ] Team notified of update
- [ ] Backup current context files

## 🔄 Update Process

### Step 1: Analyze Changes (10 min)
\`\`\`bash
# Check what changed since last update
git log --since="$(cat .last-context-update)" --oneline
git diff --stat $(cat .last-context-update)..HEAD
\`\`\`

### Step 2: Run Deep Analysis (5 min)
\`\`\`bash
# Use MCP tool to analyze codebase
npx mcp-context-manager analyze
\`\`\`

### Step 3: Update Context Files (15 min)
\`\`\`bash
# Run the update script
./scripts/update-context.sh

# Or force update all files
./scripts/update-context.sh --force
\`\`\`

### Step 4: Review Changes (10 min)
- [ ] Check git diff for context files
- [ ] Ensure no sensitive data exposed
- [ ] Verify patterns are accurate
- [ ] Confirm examples are current

### Step 5: Validate (5 min)
\`\`\`bash
# Run validation
./scripts/validate-context.sh

# Fix any issues found
# Re-run validation
\`\`\`

### Step 6: Test with AI (10 min)
- [ ] Load updated context in AI tool
- [ ] Test common tasks
- [ ] Verify responses are accurate
- [ ] Check for hallucinations

### Step 7: Commit & Document (5 min)
\`\`\`bash
# Commit changes
git add agent-context/
git commit -m "chore: update AI context files

- Updated patterns for [what changed]
- Added examples for [new features]
- Removed deprecated [old patterns]"

# Update timestamp
date -u +"%Y-%m-%dT%H:%M:%SZ" > .last-context-update
\`\`\`

### Step 8: Notify Team (5 min)
- [ ] Post in team channel
- [ ] Highlight major changes
- [ ] Share any new patterns
- [ ] Request feedback

## 🎉 Post-Update
1. Monitor AI usage for issues
2. Collect team feedback
3. Document lessons learned
4. Update this workflow if needed

## ⏱️ Total Time: ~60 minutes

## 🚨 Troubleshooting
- **Analysis fails**: Check MCP server is running
- **Validation errors**: See specific error messages
- **Git conflicts**: Resolve manually, re-run update
- **Team pushback**: Schedule training session

---
Last Updated: ${new Date().toISOString()}`;
}

function createReviewChecklist(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  return `# Context Review Checklist

## 📝 ${config.updateFrequency.charAt(0).toUpperCase() + config.updateFrequency.slice(1)} Review

### File Freshness
- [ ] CODEBASE-CONTEXT.md < ${config.updateFrequency === 'daily' ? '7' : '30'} days old
- [ ] PROJECT-TEMPLATE.md < 30 days old
- [ ] conversation-starters.md < 14 days old
- [ ] All YAML files valid

### Content Accuracy
- [ ] Tech stack versions current
- [ ] Dependencies up to date
- [ ] Patterns reflect actual usage
- [ ] Examples from real code
- [ ] No placeholder text

### Pattern Validation
- [ ] Component patterns accurate
- [ ] State management current
- [ ] Styling approach consistent
- [ ] Import conventions followed
- [ ] Testing patterns updated

### Documentation Quality
- [ ] Clear and concise
- [ ] No outdated information
- [ ] Examples are working
- [ ] Links are valid
- [ ] Formatting consistent

### Security Check
- [ ] No API keys exposed
- [ ] No passwords visible
- [ ] No internal URLs
- [ ] No sensitive data
- [ ] No security vulnerabilities

### Team Alignment
- [ ] Patterns match team decisions
- [ ] Conventions documented
- [ ] New features included
- [ ] Deprecated items removed
- [ ] Training needs identified

## 📊 Metrics Check
- [ ] Token usage reasonable
- [ ] File sizes optimized
- [ ] Coverage adequate
- [ ] Usage patterns analyzed
- [ ] ROI calculated

## 🔄 Action Items
List any issues found and actions needed:

1. _________________________________
2. _________________________________
3. _________________________________
4. _________________________________
5. _________________________________

## ✅ Sign-off
- Reviewer: _________________
- Date: _____________________
- Next Review: _______________

---
Template Version: 1.0`;
}

function createQualityChecklist(analysis: DeepAnalysisResult): string {
  return `# Context Quality Checklist

## 🎯 Code Examples
- [ ] Examples compile without errors
- [ ] Examples follow current patterns
- [ ] Examples are from actual codebase
- [ ] Examples are well-commented
- [ ] Examples cover common scenarios

## 📐 Pattern Consistency
- [ ] Naming conventions consistent
- [ ] Import styles uniform
- [ ] Component structure standard
- [ ] Error handling patterns clear
- [ ] Testing patterns documented

## 🔍 Completeness
- [ ] All major features documented
- [ ] Common tasks covered
- [ ] Edge cases mentioned
- [ ] Troubleshooting included
- [ ] FAQs answered

## 💡 Clarity
- [ ] Language is clear and simple
- [ ] Technical terms explained
- [ ] Acronyms defined
- [ ] Structure is logical
- [ ] Navigation is easy

## 🚀 Usability
- [ ] Quick reference available
- [ ] Common tasks highlighted
- [ ] Search-friendly headings
- [ ] Copy-paste ready code
- [ ] Token-optimized versions

## 🛡️ Reliability
- [ ] Information is accurate
- [ ] Sources are credible
- [ ] Claims are verified
- [ ] Updates are tracked
- [ ] Feedback incorporated

## 📊 Effectiveness Metrics
Rate each aspect (1-5):
- Accuracy: ___
- Completeness: ___
- Clarity: ___
- Usefulness: ___
- Efficiency: ___

**Total Score**: ___/25

## 🎬 Action Plan
Issues to address:
1. _________________________________
2. _________________________________
3. _________________________________

---
Reviewed by: _________________
Date: _______________________`;
}

function createEmergencyProcedures(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  return `# 🚨 Emergency Procedures

## Critical Situations

### 1. AI Generating Wrong Code
**Symptoms**: Consistent errors, wrong patterns, outdated syntax

**Immediate Actions**:
1. **STOP** all AI-assisted development
2. Run validation: \`./scripts/validate-context.sh\`
3. Check last update date
4. Review recent codebase changes

**Fix Process**:
\`\`\`bash
# Force update all context files
./scripts/update-context.sh --force

# Validate the update
./scripts/validate-context.sh

# Test with simple task
# If still broken, rollback
git checkout HEAD~1 -- agent-context/
\`\`\`

### 2. Sensitive Data Exposed
**Symptoms**: Keys, passwords, or internal data in context

**Immediate Actions**:
1. **DELETE** affected files immediately
2. Rotate any exposed credentials
3. Audit all context files
4. Notify security team

**Fix Process**:
\`\`\`bash
# Remove from git history
git filter-branch --force --index-filter \\
  "git rm --cached --ignore-unmatch agent-context/[affected-file]" \\
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team)
git push --force --all
\`\`\`

### 3. Complete Context Corruption
**Symptoms**: Files corrupted, MCP tools failing

**Recovery Process**:
1. Check backups in \`.context-backup/\`
2. Restore from git history
3. Re-run analysis from scratch
4. Rebuild all context files

\`\`\`bash
# Restore from git
git checkout main -- agent-context/

# Or restore from backup
cp .context-backup/* agent-context/

# Rebuild everything
npx mcp-context-manager complete-setup
\`\`\`

### 4. Team Revolt Against AI
**Symptoms**: Complaints, refusal to use, productivity drop

**Actions**:
1. **PAUSE** mandatory AI usage
2. Schedule emergency meeting
3. Collect specific feedback
4. Address concerns immediately
5. Provide additional training

## 📞 Escalation Chain

### Level 1: Context Owner
- First responder for all issues
- Can approve emergency updates
- Handles rollbacks

### Level 2: Tech Lead
- Major pattern changes
- Security incidents
- Team conflicts

### Level 3: Engineering Manager
- Process failures
- Resource allocation
- Policy decisions

## 🛠️ Emergency Toolkit

### Scripts
\`\`\`bash
# Quick health check
./scripts/emergency-check.sh

# Rollback to last known good
./scripts/rollback-context.sh

# Disable AI context temporarily
./scripts/disable-context.sh
\`\`\`

### Commands
\`\`\`bash
# Find recent changes
git log -p --since="1 week ago" -- agent-context/

# Check file integrity
find agent-context -type f -exec md5sum {} \\; > checksums.txt

# Validate all YAML files
find agent-context -name "*.yaml" -exec yq eval '.' {} \\;
\`\`\`

## 📋 Post-Incident

### Required Actions
1. Document what happened
2. Identify root cause
3. Update procedures
4. Train team on fixes
5. Test recovery process

### Report Template
\`\`\`markdown
## Incident Report

**Date**: [DATE]
**Severity**: [Critical/High/Medium]
**Duration**: [TIME]

### What Happened
[Description]

### Root Cause
[Analysis]

### Resolution
[Steps taken]

### Prevention
[Future measures]

### Lessons Learned
[Key takeaways]
\`\`\`

---
**Emergency Hotline**: ${config.teamSize > 5 ? 'Create Slack channel #ai-context-emergency' : 'Direct message context owner'}
**Last Drill**: Never (Schedule one!)`;
}

function createOnboardingGuide(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  return `# 🎓 Team Onboarding Guide

## Welcome to AI-Assisted Development!

### 🎯 Goal
Get new team members productive with AI context in <2 hours.

## 📚 Module 1: Understanding AI Context (30 min)

### What is AI Context?
AI context files help AI assistants understand our codebase, patterns, and conventions.

### Why It Matters
- 🚀 **5-10x faster** development
- 🐛 **75% fewer** bugs
- 📚 **90% less** documentation lookup
- 💡 **Consistent** code patterns

### Key Files
1. **CODEBASE-CONTEXT.md**: Your coding rulebook
2. **PROJECT-TEMPLATE.md**: Architecture overview  
3. **conversation-starters.md**: How to talk to AI
4. **.context7.yaml**: API reference

## 🛠️ Module 2: Practical Usage (45 min)

### Exercise 1: First AI Conversation
\`\`\`
1. Open your AI tool (Cursor/Copilot/etc)
2. Copy from conversation-starters.md
3. Paste the quick start template
4. Ask AI to create a simple component
\`\`\`

### Exercise 2: Loading Context
\`\`\`
Task: Create a new feature
1. Load standard-context.md
2. Describe your feature
3. Let AI guide implementation
4. Compare with manual approach
\`\`\`

### Exercise 3: Debugging with AI
\`\`\`
Task: Fix a bug
1. Load minimal-context.md
2. Paste error message
3. Follow AI suggestions
4. Validate the fix
\`\`\`

## 🎨 Module 3: Our Patterns (30 min)

### Component Pattern
\`\`\`typescript
${generateTeamComponentExample(analysis)}
\`\`\`

### State Management
- We use: ${analysis.patterns.stateManagement[0] || 'Local state'}
- When: ${getStateGuidelines(analysis)}
- Example: [Link to example]

### Testing Approach
- Framework: ${analysis.summary.testingFrameworks[0] || 'Not configured'}
- Coverage: 80% minimum
- Pattern: [Test pattern example]

## 🚦 Module 4: Do's and Don'ts (15 min)

### ✅ DO
- Always load context first
- Verify AI suggestions
- Update context when patterns change
- Share improvements with team
- Ask questions

### ❌ DON'T
- Blindly copy AI code
- Skip testing
- Ignore team patterns
- Work without context
- Hide AI mistakes

## 🎯 Practical Exercises

### Day 1 Challenge
Create a complete feature using AI:
1. New component with props
2. State management
3. API integration
4. Tests
5. Documentation

**Goal**: Complete in <2 hours

### Week 1 Goals
- [ ] Use AI for 5 different tasks
- [ ] Identify 1 context improvement
- [ ] Share 1 tip with team
- [ ] Complete code review with AI
- [ ] Update personal workflow

## 📊 Success Metrics

Track your progress:
- Time saved: _____ hours
- Tasks completed: _____
- Bugs prevented: _____
- Patterns learned: _____

## 🤝 Getting Help

### Resources
- Team Channel: #ai-development
- Context Owner: @${config.teamSize > 1 ? 'context-owner' : 'team-lead'}
- Office Hours: Thursdays 2-3 PM
- Wiki: [Internal docs link]

### Common Issues
1. **Context not loading**: Check file paths
2. **Wrong patterns**: Update context files
3. **Slow responses**: Use minimal context
4. **Confusing output**: Add examples

## 🎉 Graduation Checklist
- [ ] Completed all exercises
- [ ] Used AI for real task
- [ ] Contributed improvement
- [ ] Helped another developer
- [ ] Feels confident

## 🚀 Next Steps
1. Join #ai-power-users channel
2. Explore advanced patterns
3. Contribute to context files
4. Share your learnings
5. Mentor next person

---
**Onboarding Version**: 1.0
**Time to Productivity**: 2 hours
**Success Rate**: Track yours!`;
}

function createMetricsDashboard(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  const today = new Date();
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return `# 📊 AI Context Metrics Dashboard

## 📈 Executive Summary
*Period: ${lastMonth.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}*

### Key Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|---------|
| Context Age | ___ days | <30 days | ⚪ |
| Token Usage | ___ / month | <500k | ⚪ |
| Accuracy Rate | ___% | >95% | ⚪ |
| Team Adoption | ___% | 100% | ⚪ |
| ROI | ___% | >500% | ⚪ |

## 📊 Detailed Metrics

### Context Health
\`\`\`
Last Updated: ____________
Files Valid: ___/___
Avg File Age: ___ days
Coverage: ___%
\`\`\`

### Usage Analytics
\`\`\`
Daily Sessions: ___
Avg Tokens/Session: ___
Most Used Context: ____________
Peak Usage Time: ___:___
\`\`\`

### Cost Analysis
| Model | Tokens Used | Cost | % of Total |
|-------|-------------|------|------------|
| GPT-4 | ___ | $___ | ___% |
| Claude | ___ | $___ | ___% |
| Other | ___ | $___ | ___% |
| **Total** | ___ | **$___** | **100%** |

### Efficiency Gains
- **Time Saved**: ___ hours/month
- **Bugs Prevented**: ___ issues
- **Code Reviews**: ___% faster
- **Onboarding**: ___ days → ___ days

## 📉 Trend Analysis

### Token Usage Trend
\`\`\`
Week 1: ████████████ 120k
Week 2: ██████████████ 140k  
Week 3: ████████████████ 160k
Week 4: ██████████████████ 180k
\`\`\`

### Adoption Trend
\`\`\`
Week 1: ████████ 40%
Week 2: ████████████ 60%
Week 3: ████████████████ 80%
Week 4: ████████████████████ 100%
\`\`\`

## 🎯 Goals vs Actual

### Q${Math.ceil((today.getMonth() + 1) / 3)} Progress
- [ ] 100% team adoption (Current: __%)
- [ ] <2% error rate (Current: __%)  
- [ ] 500% ROI (Current: __%)
- [ ] <24hr context updates (Current: __ hrs)

## 💡 Insights

### What's Working
1. _________________________________
2. _________________________________
3. _________________________________

### Areas for Improvement  
1. _________________________________
2. _________________________________
3. _________________________________

### Recommendations
1. _________________________________
2. _________________________________
3. _________________________________

## 📅 Upcoming

### This Week
- [ ] Update context files
- [ ] Team training session
- [ ] Review token usage
- [ ] Collect feedback

### This Month
- [ ] Quarterly review
- [ ] Process optimization
- [ ] Tool evaluation
- [ ] Budget planning

## 🏆 Team Leaderboard

| Developer | AI Usage | Time Saved | Quality Score |
|-----------|----------|------------|---------------|
| Dev 1 | ___% | ___ hrs | ___/10 |
| Dev 2 | ___% | ___ hrs | ___/10 |
| Dev 3 | ___% | ___ hrs | ___/10 |

---
**Dashboard Updated**: ${today.toISOString()}
**Next Update**: ${new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
**Data Sources**: MCP Analytics, Git Stats, Team Surveys`;
}

function createTrainingMaterials(config: MaintenanceConfig, analysis: DeepAnalysisResult): string {
  return `# 🎯 AI Context Training Materials

## 📚 Course Overview
**Duration**: 2 hours  
**Format**: Self-paced with exercises  
**Audience**: ${config.teamSize} developers

## Module 1: Foundation (30 min)

### Lesson 1.1: What is AI Context?
**Objective**: Understand purpose and value

**Key Concepts**:
- Context as "project knowledge"
- Token economics
- ROI calculation
- Quality vs Quantity

**Exercise**: Calculate token savings for your last feature

### Lesson 1.2: Context Architecture
**Objective**: Learn file structure and purpose

**Components**:
1. Core Context Files
2. Token-Optimized Tiers  
3. Task-Specific Bundles
4. Auto-Loading Configs

**Exercise**: Navigate and identify each file type

## Module 2: Practical Usage (45 min)

### Lesson 2.1: Loading Context
**Objective**: Master context loading strategies

**Strategies**:
- Minimal: Quick fixes (300 tokens)
- Standard: Features (1500 tokens)
- Comprehensive: Architecture (3000 tokens)

**Lab**: Complete 3 tasks with different tiers

### Lesson 2.2: Effective Prompting
**Objective**: Write clear, context-aware prompts

**Best Practices**:
\`\`\`
1. Reference specific patterns
2. Include examples from context
3. Specify constraints clearly
4. Ask for tests
\`\`\`

**Workshop**: Rewrite 5 prompts using context

### Lesson 2.3: Validation & Testing
**Objective**: Verify AI outputs

**Checklist**:
- [ ] Matches our patterns
- [ ] Includes error handling
- [ ] Has proper types
- [ ] Follows conventions
- [ ] Tests included

**Practice**: Review and fix AI-generated code

## Module 3: Advanced Topics (30 min)

### Lesson 3.1: Context Maintenance
**Objective**: Keep context fresh and accurate

**Responsibilities**:
- Monitor drift
- Update patterns
- Remove outdated info
- Add new examples

**Project**: Update one section of context

### Lesson 3.2: Team Collaboration
**Objective**: Work effectively with AI in teams

**Guidelines**:
- Share context improvements
- Document AI quirks
- Standardize prompts
- Review AI code together

**Activity**: Pair program with AI

### Lesson 3.3: Troubleshooting
**Objective**: Solve common problems

**Common Issues**:
1. Hallucinations → Check imports
2. Wrong patterns → Update context
3. Slow responses → Optimize tokens
4. Inconsistency → Add examples

**Debug Challenge**: Fix 3 AI mistakes

## Module 4: Certification (15 min)

### Final Project
Create a complete feature using AI:
- Load appropriate context
- Write effective prompts
- Validate outputs
- Document learnings

### Knowledge Check
1. When to use minimal vs comprehensive context?
2. How to identify hallucinations?
3. What triggers context updates?
4. How to optimize token usage?
5. Where to get help?

## 📖 Reference Materials

### Quick Reference Card
\`\`\`
Context Loading Cheatsheet
========================
Quick Fix:      minimal-context.md (300 tokens)
New Feature:    standard-context.md (1500 tokens)  
Architecture:   comprehensive-context.md (3000 tokens)
Debug:          .context7.yaml + minimal
\`\`\`

### Prompt Templates
\`\`\`
Component: "Create a [type] component that [purpose] following our [pattern] pattern"
API: "Add [method] endpoint to [service] using our service pattern"
Test: "Write tests for [component] covering [scenarios] using [framework]"
Fix: "Debug [error] in [file] considering our error handling patterns"
\`\`\`

### Emergency Contacts
- Context Issues: @context-owner
- AI Problems: #ai-help channel
- Training: Schedule with lead

## 🎓 Certification

Upon completion, you'll be able to:
- ✅ Load context efficiently
- ✅ Write effective prompts
- ✅ Validate AI outputs
- ✅ Maintain context quality
- ✅ Collaborate with team

### Certificate Template
\`\`\`
🏆 AI Context Certification

This certifies that ________________
has completed AI Context Training

Skills Demonstrated:
- Context Management ✓
- Prompt Engineering ✓
- Quality Validation ✓
- Team Collaboration ✓

Date: _____________
Trainer: ___________
\`\`\`

## 🚀 Continuous Learning

### Next Steps
1. Complete advanced prompt course
2. Contribute to context files
3. Mentor new team members
4. Share tips in team wiki
5. Experiment with new patterns

### Resources
- [Internal Wiki]
- [AI Best Practices]
- [Context Repository]
- [Team Playbooks]
- [External Courses]

---
**Training Version**: 1.0  
**Last Updated**: ${new Date().toISOString()}  
**Feedback**: training-feedback@team`;
}

function createWorkflowIndex(workflows: any, config: MaintenanceConfig): string {
  return `# 📋 Maintenance Workflows Index

## Overview
Complete maintenance system for AI context files.

**Team Size**: ${config.teamSize}  
**Update Schedule**: ${config.updateFrequency}

## 📚 Available Workflows

### 🔄 Regular Maintenance
${workflows.regular.map((w: string) => `- [${w}](#)`).join('\n')}

### 🚨 Emergency Procedures  
${workflows.emergency.map((w: string) => `- [${w}](#)`).join('\n')}

### 🎓 Onboarding & Training
${workflows.onboarding.map((w: string) => `- [${w}](#)`).join('\n')}

## 🗓️ Recommended Schedule

### Daily
- Quick validation check (5 min)
- Token usage review (2 min)

### ${config.updateFrequency.charAt(0).toUpperCase() + config.updateFrequency.slice(1)}
- Full context update (1 hour)
- Pattern review (30 min)
- Team sync (15 min)

### Monthly
- Metrics review (30 min)
- Process improvement (1 hour)
- Training refresh (30 min)

### Quarterly
- Complete audit (2 hours)
- Tool evaluation (1 hour)
- Strategy planning (2 hours)

## 🎯 Quick Actions

### Need to update context?
→ See \`context-update-workflow.md\`

### Found an issue?
→ See \`emergency-procedures.md\`

### New team member?
→ See \`team-onboarding.md\`

### Tracking metrics?
→ See \`metrics-dashboard.md\`

## 📞 Support

- **Slack**: #ai-context-help
- **Wiki**: [Internal documentation]
- **Owner**: @context-owner

---
Generated: ${new Date().toISOString()}`;
}

// Helper functions
function generateTeamComponentExample(analysis: DeepAnalysisResult): string {
  const { patterns } = analysis;
  return `// Our standard component pattern
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

${patterns.components.style === 'React.FC' ? 
`export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {` : 
`export function Component({ 
  title, 
  onAction 
}: ComponentProps) {`}
  // Always handle loading/error states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="${patterns.styling === 'tailwind' ? 'component-container' : 'styles.container'}">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
${patterns.components.style === 'React.FC' ? '};' : '}'}`;
}

function getStateGuidelines(analysis: DeepAnalysisResult): string {
  const primary = analysis.patterns.stateManagement[0];
  
  if (!primary || primary === 'useState') {
    return 'Simple component state only';
  } else if (primary === 'Context API') {
    return 'Shared state across components';
  } else if (primary === 'Redux' || primary === 'Zustand') {
    return 'Global application state';
  }
  return 'Follow established patterns';
}