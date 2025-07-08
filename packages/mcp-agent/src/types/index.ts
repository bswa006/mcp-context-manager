/**
 * Core types for MCP Context Manager
 */

export interface ProjectContext {
  // Basic info
  name: string;
  version: string;
  description: string;
  stage: 'prototype' | 'mvp' | 'production';
  
  // Organization
  organization: {
    company: string;
    team: string;
    domain: string;
  };
  
  // Tech stack
  techStack: {
    language: string;
    framework: string;
    uiLibrary: string;
    database?: string;
    deployment?: string;
  };
  
  // Architecture
  architecture: {
    style: 'monolith' | 'microservices' | 'serverless';
    api: 'rest' | 'graphql' | 'grpc';
    auth?: string;
  };
  
  // AI assistance
  aiAssistance: {
    primaryTool: string;
    contextFiles: boolean;
    securityScanning: boolean;
  };
}

export interface CodebaseContext {
  // Project structure
  projectRoot: string;
  directories: DirectoryInfo[];
  
  // Patterns detected
  patterns: {
    components: ComponentPatterns;
    state: StatePatterns;
    api: ApiPatterns;
    testing: TestingPatterns;
    naming: NamingConventions;
  };
  
  // Dependencies
  dependencies: {
    [key: string]: string;
  };
  
  // Configuration
  config: {
    typescript?: boolean;
    eslint?: boolean;
    prettier?: boolean;
    testing?: string;
  };
}

export interface DirectoryInfo {
  path: string;
  purpose: string;
  patterns: string[];
  publicApi?: string[];
  aiNotes?: string[];
}

export interface ComponentPatterns {
  structure: 'functional' | 'class' | 'mixed';
  naming: 'PascalCase' | 'camelCase';
  exports: 'default' | 'named' | 'mixed';
  propsInterface: 'required' | 'optional' | 'none';
  stateManagement: string;
}

export interface StatePatterns {
  global: string; // e.g., 'redux', 'zustand', 'context'
  local: string; // e.g., 'useState', 'useReducer'
  async: string; // e.g., 'react-query', 'swr'
}

export interface ApiPatterns {
  structure: string;
  errorHandling: string;
  authentication: string;
  naming: string;
}

export interface TestingPatterns {
  framework: string;
  structure: string;
  coverage: number;
  conventions: string[];
}

export interface NamingConventions {
  components: string;
  hooks: string;
  files: string;
  variables: string;
  functions: string;
}

export interface TemplateSection {
  title: string;
  content: string;
  order: number;
}

export interface GeneratedFiles {
  'PROJECT-TEMPLATE.md': string;
  'CODEBASE-CONTEXT.md': string;
  directories: {
    [path: string]: string; // README.md for each directory
  };
  adrs?: {
    [filename: string]: string;
  };
}

export interface ContextMonitor {
  watch(paths: string[]): void;
  onUpdate(callback: (event: UpdateEvent) => void): void;
  getContext(): Promise<CodebaseContext>;
}

export interface UpdateEvent {
  type: 'file' | 'directory' | 'dependency';
  path: string;
  change: 'added' | 'modified' | 'deleted';
}