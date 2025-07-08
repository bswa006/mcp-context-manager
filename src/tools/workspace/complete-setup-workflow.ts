import { analyzeCodebaseDeeply } from './analyze-codebase-deeply.js';
import { initializeAgentWorkspace } from './initialize-workspace.js';
import { createConversationStarters } from './create-conversation-starters.js';
import { createTokenOptimizer } from './create-token-optimizer.js';
import { createIDEConfigs } from './create-ide-configs.js';
import { setupPersistenceAutomation } from './setup-persistence-automation.js';
import { createMaintenanceWorkflows } from './create-maintenance-workflows.js';
import type { DeepAnalysisResult } from './analyze-codebase-deeply.js';

interface SetupConfig {
  projectPath: string;
  projectName: string;
  teamSize?: number;
  updateSchedule?: 'daily' | 'weekly' | 'on-change' | 'manual';
  ide?: 'cursor' | 'vscode' | 'intellij' | 'all';
  includeAll?: boolean;
}

interface SetupResult {
  success: boolean;
  message: string;
  steps: {
    analysis?: { success: boolean; analysisId?: string; message: string };
    initialization?: { success: boolean; message: string };
    conversationStarters?: { success: boolean; message: string };
    tokenOptimizer?: { success: boolean; message: string };
    ideConfigs?: { success: boolean; message: string };
    persistence?: { success: boolean; message: string };
    maintenance?: { success: boolean; message: string };
  };
  filesCreated: string[];
  recommendations: string[];
}

export async function completeSetupWorkflow(config: SetupConfig): Promise<SetupResult> {
  const result: SetupResult = {
    success: false,
    message: '',
    steps: {},
    filesCreated: [],
    recommendations: [],
  };

  try {
    console.log('🚀 Starting Complete Setup Workflow...');
    
    // Step 1: Deep Analysis
    console.log('\n📊 Step 1/7: Analyzing codebase deeply...');
    const analysisResult = await analyzeCodebaseDeeply({ projectPath: config.projectPath });
    result.steps.analysis = {
      success: analysisResult.success,
      analysisId: analysisResult.analysisId,
      message: analysisResult.success 
        ? `Analyzed ${analysisResult.summary.totalFiles} files` 
        : 'Analysis failed',
    };
    
    if (!analysisResult.success || !analysisResult.analysisId) {
      throw new Error('Deep analysis failed. Cannot proceed with setup.');
    }
    
    const analysisId = analysisResult.analysisId;
    
    // Step 2: Initialize Workspace
    console.log('\n🎯 Step 2/7: Initializing agent workspace...');
    const initResult = await initializeAgentWorkspace({
      projectPath: config.projectPath,
      projectName: config.projectName,
      techStack: {
        language: analysisResult.summary.primaryLanguage,
        framework: analysisResult.summary.frameworks[0],
        uiLibrary: analysisResult.summary.frameworks.find(f => 
          ['React', 'Vue', 'Angular', 'Svelte'].includes(f)
        ),
        testFramework: analysisResult.summary.testingFrameworks[0],
      },
    });
    result.steps.initialization = {
      success: initResult.success,
      message: initResult.message,
    };
    result.filesCreated.push(...initResult.filesCreated);
    
    // Step 3: Create Conversation Starters
    console.log('\n💬 Step 3/7: Creating conversation starters...');
    const conversationResult = await createConversationStarters({
      projectPath: config.projectPath,
      analysisId,
      includeQuickTasks: true,
      includeCurrentWork: true,
    });
    result.steps.conversationStarters = {
      success: conversationResult.success,
      message: conversationResult.message,
    };
    result.filesCreated.push(...conversationResult.filesCreated);
    
    // Step 4: Create Token Optimizer
    console.log('\n💎 Step 4/7: Creating token optimization tiers...');
    const tokenResult = await createTokenOptimizer({
      projectPath: config.projectPath,
      analysisId,
      tiers: ['minimal', 'standard', 'comprehensive'],
      trackUsage: true,
      generateMetrics: true,
    });
    result.steps.tokenOptimizer = {
      success: tokenResult.success,
      message: tokenResult.message,
    };
    result.filesCreated.push(...tokenResult.filesCreated);
    
    // Step 5: Create IDE Configurations
    console.log('\n🛠️ Step 5/7: Creating IDE configurations...');
    const ideResult = await createIDEConfigs({
      projectPath: config.projectPath,
      analysisId,
      ide: config.ide || 'all',
      autoLoadContext: true,
      includeDebugConfigs: true,
    });
    result.steps.ideConfigs = {
      success: ideResult.success,
      message: ideResult.message,
    };
    result.filesCreated.push(...ideResult.filesCreated);
    
    // Step 6: Setup Persistence Automation
    console.log('\n🔄 Step 6/7: Setting up persistence automation...');
    const persistenceResult = await setupPersistenceAutomation({
      projectPath: config.projectPath,
      analysisId,
      updateSchedule: config.updateSchedule || 'weekly',
      gitHooks: true,
      monitoring: true,
    });
    result.steps.persistence = {
      success: persistenceResult.success,
      message: persistenceResult.message,
    };
    result.filesCreated.push(...persistenceResult.filesCreated);
    
    // Step 7: Create Maintenance Workflows
    console.log('\n📋 Step 7/7: Creating maintenance workflows...');
    const maintenanceResult = await createMaintenanceWorkflows({
      projectPath: config.projectPath,
      analysisId,
      teamSize: config.teamSize || 1,
      updateFrequency: config.updateSchedule === 'daily' ? 'daily' : 'weekly',
      includeChecklists: true,
      includeMetrics: true,
      includeTraining: !!(config.teamSize && config.teamSize > 1),
    });
    result.steps.maintenance = {
      success: maintenanceResult.success,
      message: maintenanceResult.message,
    };
    result.filesCreated.push(...maintenanceResult.filesCreated);
    
    // Generate recommendations
    result.recommendations = generateSetupRecommendations(
      analysisResult,
      config,
      result.steps
    );
    
    // Final summary
    const successfulSteps = Object.values(result.steps).filter(s => s.success).length;
    result.success = successfulSteps === 7;
    result.message = result.success
      ? `✅ Complete setup successful! Created ${result.filesCreated.length} files.`
      : `⚠️ Setup completed with issues. ${successfulSteps}/7 steps successful.`;
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SETUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '⚠️ PARTIAL SUCCESS'}`);
    console.log(`Files Created: ${result.filesCreated.length}`);
    console.log('\nSteps:');
    Object.entries(result.steps).forEach(([step, status]) => {
      console.log(`  ${status.success ? '✅' : '❌'} ${step}: ${status.message}`);
    });
    
    if (result.recommendations.length > 0) {
      console.log('\n📌 Recommendations:');
      result.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n🎉 Setup workflow complete!');
    
  } catch (error) {
    result.success = false;
    result.message = `Setup failed: ${error}`;
    console.error('\n❌ Setup failed:', error);
  }
  
  return result;
}

function generateSetupRecommendations(
  analysis: DeepAnalysisResult,
  config: SetupConfig,
  steps: SetupResult['steps']
): string[] {
  const recommendations: string[] = [];
  
  // Testing recommendations
  if (!analysis.summary.testingFrameworks.length) {
    recommendations.push('Configure a testing framework (Jest, Vitest, or Mocha) for better code quality');
  }
  
  // Documentation recommendations
  if (steps.conversationStarters?.success) {
    recommendations.push('Review conversation-starters.md and customize for your workflow');
  }
  
  // Token optimization recommendations
  if (steps.tokenOptimizer?.success) {
    recommendations.push('Monitor token usage with the metrics dashboard in token-optimization-report.md');
  }
  
  // IDE recommendations
  if (config.ide === 'cursor' || config.ide === 'all') {
    recommendations.push('Open .cursorrules in Cursor to enable auto-loading of context files');
  }
  
  // Persistence recommendations
  if (steps.persistence?.success) {
    recommendations.push('Run ./scripts/setup-cron.sh to enable automated updates');
  }
  
  // Team recommendations
  if (config.teamSize && config.teamSize > 1) {
    recommendations.push('Share agent-context/workflows/ with your team for consistent practices');
  }
  
  // Git recommendations
  recommendations.push('Commit all generated files to version control for team access');
  
  // Next steps
  recommendations.push('Use "npm run update-context" to refresh context files when codebase changes');
  
  return recommendations;
}