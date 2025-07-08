import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PerformanceMetrics {
  featureName: string;
  timestamp: string;
  metrics: {
    tokensUsed: number;
    timeElapsed: number; // in seconds
    validationScore: number; // 0-100
    securityScore: number; // 0-100
    testCoverage: number; // percentage
    hallucinations: {
      detected: number;
      prevented: number;
      examples: string[];
    };
    errors: {
      syntax: number;
      runtime: number;
      type: number;
    };
  };
  improvements?: {
    tokenReduction?: number;
    timeReduction?: number;
    qualityIncrease?: number;
  };
}

interface PerformanceReport {
  success: boolean;
  summary: {
    overallScore: number;
    efficiency: string;
    quality: string;
    security: string;
  };
  recommendations: string[];
  trends: {
    tokenUsage: 'improving' | 'stable' | 'degrading';
    quality: 'improving' | 'stable' | 'degrading';
    speed: 'improving' | 'stable' | 'degrading';
  };
  achievements: string[];
}

export async function trackAgentPerformance(
  metrics: PerformanceMetrics
): Promise<PerformanceReport> {
  const report: PerformanceReport = {
    success: false,
    summary: {
      overallScore: 0,
      efficiency: '',
      quality: '',
      security: '',
    },
    recommendations: [],
    trends: {
      tokenUsage: 'stable',
      quality: 'stable',
      speed: 'stable',
    },
    achievements: [],
  };

  try {
    // Calculate overall score
    const scores = {
      validation: metrics.metrics.validationScore,
      security: metrics.metrics.securityScore,
      coverage: metrics.metrics.testCoverage,
      efficiency: calculateEfficiencyScore(metrics),
      errorFree: calculateErrorScore(metrics),
    };

    const overallScore = Math.round(
      (scores.validation * 0.25 +
        scores.security * 0.25 +
        scores.coverage * 0.2 +
        scores.efficiency * 0.15 +
        scores.errorFree * 0.15)
    );

    // Update report summary
    report.summary.overallScore = overallScore;
    report.summary.efficiency = getEfficiencyRating(metrics);
    report.summary.quality = getQualityRating(scores.validation, scores.coverage);
    report.summary.security = getSecurityRating(scores.security);

    // Update agent memory with performance data
    updateAgentMemory(metrics, overallScore);

    // Analyze trends
    report.trends = analyzeTrends(metrics);

    // Generate recommendations
    report.recommendations = generateRecommendations(metrics, scores);

    // Check for achievements
    report.achievements = checkAchievements(metrics, overallScore);

    // Update context with current metrics
    updateAgentContext(metrics);

    report.success = true;

  } catch (error) {
    report.success = false;
    report.recommendations = [`Error tracking performance: ${error}`];
  }

  return report;
}

function calculateEfficiencyScore(metrics: PerformanceMetrics): number {
  const baselineTokens = 2000; // Average tokens for similar features
  const tokenEfficiency = Math.max(0, 100 - ((metrics.metrics.tokensUsed - baselineTokens) / baselineTokens) * 50);
  
  const baselineTime = 300; // 5 minutes in seconds
  const timeEfficiency = Math.max(0, 100 - ((metrics.metrics.timeElapsed - baselineTime) / baselineTime) * 50);
  
  return Math.round((tokenEfficiency + timeEfficiency) / 2);
}

function calculateErrorScore(metrics: PerformanceMetrics): number {
  const totalErrors = 
    metrics.metrics.errors.syntax +
    metrics.metrics.errors.runtime +
    metrics.metrics.errors.type;
  
  // Deduct 10 points per error, max 100
  return Math.max(0, 100 - (totalErrors * 10));
}

function getEfficiencyRating(metrics: PerformanceMetrics): string {
  const tokensPerMinute = metrics.metrics.tokensUsed / (metrics.metrics.timeElapsed / 60);
  
  if (tokensPerMinute < 300) return 'Excellent - Very efficient token usage';
  if (tokensPerMinute < 500) return 'Good - Reasonable token usage';
  if (tokensPerMinute < 800) return 'Fair - Could be more efficient';
  return 'Needs Improvement - High token consumption';
}

function getQualityRating(validation: number, coverage: number): string {
  const avgQuality = (validation + coverage) / 2;
  
  if (avgQuality >= 90) return 'Excellent - High quality code';
  if (avgQuality >= 80) return 'Good - Solid implementation';
  if (avgQuality >= 70) return 'Fair - Room for improvement';
  return 'Needs Improvement - Quality issues detected';
}

function getSecurityRating(score: number): string {
  if (score >= 95) return 'Excellent - No security issues';
  if (score >= 85) return 'Good - Minor security considerations';
  if (score >= 70) return 'Fair - Some security improvements needed';
  return 'Critical - Security vulnerabilities detected';
}

function updateAgentMemory(metrics: PerformanceMetrics, overallScore: number): void {
  const memoryPath = './AGENT-MEMORY.md';
  
  if (existsSync(memoryPath)) {
    let memory = readFileSync(memoryPath, 'utf-8');
    
    // Update performance history
    const performanceUpdate = `
- Feature: ${metrics.featureName}
  Score: ${overallScore}%
  Tokens: ${metrics.metrics.tokensUsed}
  Time: ${metrics.metrics.timeElapsed}s
  Coverage: ${metrics.metrics.testCoverage}%
  Date: ${metrics.timestamp}`;
    
    memory = memory.replace(
      'improvement_trend: []',
      `improvement_trend: [${overallScore}]`
    );
    
    // Update metrics
    memory = memory.replace(
      'current_average: 0',
      `current_average: ${metrics.metrics.tokensUsed}`
    );
    
    writeFileSync(memoryPath, memory);
  }
}

function updateAgentContext(metrics: PerformanceMetrics): void {
  const contextPath = './AGENT-CONTEXT.md';
  
  if (existsSync(contextPath)) {
    let context = readFileSync(contextPath, 'utf-8');
    
    // Update current metrics
    context = context.replace(
      'tokens_used: 0',
      `tokens_used: ${metrics.metrics.tokensUsed}`
    );
    
    context = context.replace(
      'validation_score: 0',
      `validation_score: ${metrics.metrics.validationScore}`
    );
    
    context = context.replace(
      'security_score: 0',
      `security_score: ${metrics.metrics.securityScore}`
    );
    
    context = context.replace(
      'coverage_achieved: 0%',
      `coverage_achieved: ${metrics.metrics.testCoverage}%`
    );
    
    writeFileSync(contextPath, context);
  }
}

function analyzeTrends(metrics: PerformanceMetrics): PerformanceReport['trends'] {
  // In a real implementation, this would compare with historical data
  // For now, we'll use the improvements field if provided
  
  const trends: PerformanceReport['trends'] = {
    tokenUsage: 'stable',
    quality: 'stable',
    speed: 'stable',
  };
  
  if (metrics.improvements) {
    if (metrics.improvements.tokenReduction && metrics.improvements.tokenReduction > 10) {
      trends.tokenUsage = 'improving';
    } else if (metrics.improvements.tokenReduction && metrics.improvements.tokenReduction < -10) {
      trends.tokenUsage = 'degrading';
    }
    
    if (metrics.improvements.qualityIncrease && metrics.improvements.qualityIncrease > 5) {
      trends.quality = 'improving';
    } else if (metrics.improvements.qualityIncrease && metrics.improvements.qualityIncrease < -5) {
      trends.quality = 'degrading';
    }
    
    if (metrics.improvements.timeReduction && metrics.improvements.timeReduction > 10) {
      trends.speed = 'improving';
    } else if (metrics.improvements.timeReduction && metrics.improvements.timeReduction < -10) {
      trends.speed = 'degrading';
    }
  }
  
  return trends;
}

function generateRecommendations(
  metrics: PerformanceMetrics,
  scores: Record<string, number>
): string[] {
  const recommendations: string[] = [];
  
  // Token usage recommendations
  if (metrics.metrics.tokensUsed > 3000) {
    recommendations.push(
      'Consider breaking down the feature into smaller components to reduce token usage'
    );
  }
  
  // Test coverage recommendations
  if (scores.coverage < 80) {
    recommendations.push(
      `Increase test coverage from ${scores.coverage}% to at least 80% for better reliability`
    );
  }
  
  // Security recommendations
  if (scores.security < 90) {
    recommendations.push(
      'Review security checklist and address potential vulnerabilities'
    );
  }
  
  // Error handling recommendations
  if (metrics.metrics.errors.runtime > 0) {
    recommendations.push(
      'Add proper error handling to prevent runtime errors'
    );
  }
  
  if (metrics.metrics.errors.type > 0) {
    recommendations.push(
      'Fix TypeScript type errors for better type safety'
    );
  }
  
  // Hallucination prevention
  if (metrics.metrics.hallucinations.detected > 0) {
    recommendations.push(
      `${metrics.metrics.hallucinations.detected} hallucinations detected. Always verify imports and APIs before use.`
    );
  }
  
  // Performance recommendations
  if (metrics.metrics.timeElapsed > 600) {
    recommendations.push(
      'Feature took over 10 minutes. Consider using more specific prompts or breaking into smaller tasks.'
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Excellent work! Continue following best practices.');
  }
  
  return recommendations;
}

function checkAchievements(
  metrics: PerformanceMetrics,
  overallScore: number
): string[] {
  const achievements: string[] = [];
  
  // Perfect score achievement
  if (overallScore === 100) {
    achievements.push('🏆 Perfect Score! Flawless implementation.');
  }
  
  // Zero hallucination achievement
  if (metrics.metrics.hallucinations.detected === 0 && metrics.metrics.tokensUsed > 1000) {
    achievements.push('🎯 Zero Hallucinations! All code verified.');
  }
  
  // High coverage achievement
  if (metrics.metrics.testCoverage >= 90) {
    achievements.push('🧪 Test Master! 90%+ coverage achieved.');
  }
  
  // Security achievement
  if (metrics.metrics.securityScore === 100) {
    achievements.push('🛡️ Security Champion! No vulnerabilities detected.');
  }
  
  // Efficiency achievement
  if (metrics.metrics.tokensUsed < 1500 && overallScore > 85) {
    achievements.push('⚡ Efficiency Expert! High quality with low token usage.');
  }
  
  // Speed achievement
  if (metrics.metrics.timeElapsed < 180 && overallScore > 85) {
    achievements.push('🚀 Speed Demon! Feature completed in under 3 minutes.');
  }
  
  // Error-free achievement
  const totalErrors = 
    metrics.metrics.errors.syntax +
    metrics.metrics.errors.runtime +
    metrics.metrics.errors.type;
  
  if (totalErrors === 0 && metrics.metrics.tokensUsed > 500) {
    achievements.push('✨ Error-Free! Perfect code on first try.');
  }
  
  return achievements;
}