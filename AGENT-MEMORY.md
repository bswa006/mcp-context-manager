# AGENT-MEMORY.md

## 🧠 Persistent Agent Memory

This file stores learnings, patterns, and experiences across sessions. It helps you improve over time.

---

## 📚 Knowledge Base

### **Verified Patterns**
```yaml
patterns:
  - id: PATTERN_001
    type: component
    name: "Functional Component with Error Boundaries"
    success_rate: 100%
    usage_count: 0
    last_used: null
    code: |
      // Pattern template stored here
    
  - id: PATTERN_002
    type: service
    name: "API Service with Retry Logic"
    success_rate: 98%
    usage_count: 0
    last_used: null
    code: |
      // Pattern template stored here
```

### **Framework-Specific Knowledge**
```yaml
react:
  version_tested: "19.0.0"
  known_apis: []
  deprecated_apis: []
  best_practices: []
  
typescript:
  version_tested: "5.3.0"
  compiler_options: {}
  type_patterns: []
  
nextjs:
  version_tested: "15.0.0"
  app_router_patterns: []
  server_components: []
```

---

## 🎯 Success Patterns

### **High-Performance Patterns**
```yaml
top_patterns:
  - pattern: "Error-First Handling"
    category: error_handling
    success_metrics:
      validation_score: 95
      security_score: 100
      test_coverage: 90%
    usage_tips: |
      Always wrap async operations
      Return standardized error format
      Include user-friendly messages
    
  - pattern: "Component State Management"
    category: state_management
    success_metrics:
      validation_score: 92
      reusability: high
      performance: optimized
    usage_tips: |
      Prefer local state when possible
      Use context for cross-component state
      Implement proper memoization
```

### **Testing Strategies**
```yaml
test_strategies:
  - name: "Component Testing Blueprint"
    coverage_achieved: 85%
    categories:
      - rendering
      - user_interaction
      - edge_cases
      - accessibility
    template: |
      // Stored test template
  
  - name: "API Testing Blueprint"
    coverage_achieved: 90%
    categories:
      - success_paths
      - error_handling
      - edge_cases
      - performance
    template: |
      // Stored test template
```

---

## ❌ Failure Patterns

### **Common Mistakes**
```yaml
mistakes:
  - id: MISTAKE_001
    description: "Using Array.prototype.findLast"
    occurrences: 0
    last_seen: null
    prevention: "Use .slice().reverse().find() or polyfill"
    
  - id: MISTAKE_002
    description: "Hardcoding environment variables"
    occurrences: 0
    last_seen: null
    prevention: "Always use process.env"
    
  - id: MISTAKE_003
    description: "Missing error boundaries"
    occurrences: 0
    last_seen: null
    prevention: "Wrap components in error boundaries"
```

### **Hallucination Log**
```yaml
hallucinations:
  - api: "React.useSyncExternalStore"
    context: "React 17 project"
    caught_by: "version check"
    prevention_added: true
    
  - api: "String.prototype.replaceAll"
    context: "Node 14 environment"
    caught_by: "compatibility check"
    prevention_added: true
```

---

## 📊 Performance History

### **Efficiency Metrics**
```yaml
token_usage:
  baseline: 2000
  current_average: 0
  best_performance: null
  improvement_trend: []
  
validation_scores:
  all_time_average: 0
  last_30_days: 0
  trending: stable
  
test_coverage:
  all_time_average: 0%
  last_30_days: 0%
  features_above_80: 0
```

### **Time Savings**
```yaml
development_speed:
  baseline_hours_per_feature: 8
  current_average: 0
  best_time: null
  total_hours_saved: 0
```

---

## 🔐 Security Insights

### **Vulnerability Patterns**
```yaml
security_patterns:
  - type: "SQL Injection"
    prevented_count: 0
    common_scenarios: []
    prevention_template: |
      // Parameterized query example
    
  - type: "XSS"
    prevented_count: 0
    common_scenarios: []
    prevention_template: |
      // Sanitization example
    
  - type: "Hardcoded Secrets"
    prevented_count: 0
    detection_pattern: "regex patterns"
    prevention_template: |
      // Environment variable usage
```

### **Security Best Practices**
```yaml
enforced_practices:
  - name: "Input Validation"
    implementation_rate: 0%
    template: "Zod schema validation"
    
  - name: "Authentication"
    implementation_rate: 0%
    template: "JWT with httpOnly cookies"
    
  - name: "Authorization"
    implementation_rate: 0%
    template: "Role-based access control"
```

---

## 🏆 Achievements

### **Milestones**
```yaml
milestones:
  - name: "First Zero-Hallucination Feature"
    achieved: false
    date: null
    
  - name: "10 Features with 80%+ Coverage"
    achieved: false
    progress: 0/10
    
  - name: "100 Security Issues Prevented"
    achieved: false
    progress: 0/100
    
  - name: "50% Token Reduction"
    achieved: false
    current: 0%
```

### **Streaks**
```yaml
current_streaks:
  zero_hallucinations: 0
  security_issues_prevented: 0
  tests_above_80_percent: 0
  
best_streaks:
  zero_hallucinations: 0
  security_issues_prevented: 0
  tests_above_80_percent: 0
```

---

## 🔄 Learning Evolution

### **Pattern Improvements**
```yaml
improvements:
  - original: "Basic error handling"
    improved: "Error boundaries with retry"
    improvement_percentage: 0%
    reason: "Better UX and reliability"
    
  - original: "Direct API calls"
    improved: "Service layer pattern"
    improvement_percentage: 0%
    reason: "Separation of concerns"
```

### **Adaptive Learning**
```yaml
adaptations:
  - trigger: "New React version"
    adaptation: "Updated hook patterns"
    success: true
    
  - trigger: "Security audit findings"
    adaptation: "Enhanced validation"
    success: true
```

---

## 🎓 Training Data

### **Code Review Learnings**
```yaml
review_feedback:
  - pattern: null
    feedback: null
    improvement: null
    integrated: false
```

### **User Preferences**
```yaml
preferences:
  code_style: null
  naming_convention: null
  comment_style: null
  test_approach: null
```

---

## 🔮 Predictive Insights

### **Likely Issues**
```yaml
predictions:
  - scenario: "Large form component"
    likely_issues:
      - "Complex validation"
      - "Performance with many fields"
    preventive_patterns:
      - "Use react-hook-form"
      - "Implement field-level validation"
```

### **Optimization Opportunities**
```yaml
optimizations:
  - context: "List rendering"
    suggestion: "Implement virtualization"
    threshold: "100+ items"
    
  - context: "Frequent re-renders"
    suggestion: "Add memoization"
    threshold: "3+ props"
```

---

## 📈 Continuous Improvement

### **Weekly Analysis**
```yaml
week_of: [CURRENT_WEEK]
patterns_refined: 0
new_learnings: 0
efficiency_gain: 0%
```

### **Monthly Goals**
```yaml
current_month: [MONTH]
goals:
  - reduce_tokens_by: 10%
  - increase_coverage_to: 85%
  - prevent_issues: 50
progress:
  tokens: 0%
  coverage: 0%
  issues: 0/50
```

---

**Memory Version**: 1.0.0 | **Entries**: 0 | **Last Learning**: Never | **Status**: Active

*This memory makes you smarter with every interaction. Preserve and grow it.*