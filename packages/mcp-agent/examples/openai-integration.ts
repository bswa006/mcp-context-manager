/**
 * Example: OpenAI/GPT Integration
 * Shows how to integrate MCP with GPT models
 */

import OpenAI from 'openai';
import { MCPOpenAI } from '../src/agents/mcp-openai';

// Initialize MCP for OpenAI
const mcp = new MCPOpenAI({
  apiKey: process.env.MCP_API_KEY,
  model: 'gpt-4-turbo',
  validateBefore: true,
  correctAfter: true,
  streamValidation: true,
  minScore: 85,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✨ One-line integration
const enhancedOpenAI = mcp.enhance(openai);

// Example: Generate validated React code
async function generateValidatedCode() {
  const completion = await enhancedOpenAI.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a React expert. Generate production-ready code.'
      },
      {
        role: 'user',
        content: 'Create a custom hook for managing form state with validation'
      }
    ]
  });

  console.log(completion.choices[0].message.content);
  // Output is automatically validated and corrected!
}

// Example: Streaming with real-time validation
async function streamWithValidation() {
  const stream = await enhancedOpenAI.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages: [
      {
        role: 'user',
        content: 'Build a complete authentication flow with React and TypeScript'
      }
    ]
  });

  // MCP validates each chunk as it arrives
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
}

// Example: Batch validation
async function validateMultipleComponents() {
  const components = [
    'Create a Button component',
    'Create a Modal component', 
    'Create a DataTable component'
  ];

  const results = await Promise.all(
    components.map(prompt => 
      enhancedOpenAI.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      })
    )
  );

  // All results are validated and quality-assured
  results.forEach((result, i) => {
    console.log(`Component ${i + 1}: Validated ✓`);
  });
}

// Example: Using middleware approach
import express from 'express';
const app = express();

app.use('/api/generate', mcp.middleware());

app.post('/api/generate', async (req, res) => {
  // Request is automatically validated by MCP middleware
  const completion = await openai.chat.completions.create(req.body);
  res.json(completion);
});