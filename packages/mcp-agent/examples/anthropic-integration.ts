/**
 * Example: Anthropic/Claude Integration
 * Shows how to integrate MCP with Claude in one line
 */

import Anthropic from '@anthropic-ai/sdk';
import { MCPAnthropic } from '../src/agents/mcp-anthropic';

// Initialize MCP for Anthropic
const mcp = new MCPAnthropic({
  apiKey: process.env.MCP_API_KEY,
  validateBefore: true,      // Validate before sending to Claude
  correctAfter: true,        // Auto-correct Claude's output
  streamValidation: true,    // Real-time validation for streaming
  minScore: 85,             // Minimum quality score
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ✨ One-line integration
const enhancedAnthropic = mcp.enhance(anthropic);

// Now use Claude as normal - MCP automatically validates!
async function generateComponent() {
  const response = await enhancedAnthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: 'Create a React component for a user profile card with TypeScript'
    }]
  });

  console.log(response.content);
  // Output will be automatically validated and corrected!
}

// Example with streaming
async function streamComponent() {
  const stream = await enhancedAnthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    stream: true,
    messages: [{
      role: 'user',
      content: 'Create a complex dashboard component with charts'
    }]
  });

  // MCP validates in real-time as Claude generates
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

// Get validation statistics
async function getStats() {
  const stats = await mcp.getStats();
  console.log('Validation Statistics:', stats);
}

// Configure on the fly
mcp.configure({
  minScore: 90,  // Increase quality threshold
  injectBestPractices: true,
});