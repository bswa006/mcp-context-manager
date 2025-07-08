export async function generateDirectoryReadme(
  directoryPath: string,
  purpose: string,
  aiNotes?: string[]
): Promise<string> {
  const dirName = directoryPath.split('/').pop() || 'Directory';
  
  return `# ${directoryPath}

## Purpose
${purpose}

## Structure
\`\`\`
${dirName}/
├── README.md (this file)
├── index.ts (public exports)
└── [Add your files here]
\`\`\`

## Public API
Describe the public interface of this directory - what components, functions, or utilities it exports.

## AI Generation Notes
${aiNotes && aiNotes.length > 0 ? aiNotes.map(note => `- ${note}`).join('\n') : '- Follow the patterns established in CODEBASE-CONTEXT.md\n- Maintain consistency with existing code in this directory'}

## Component/Module Conventions
- All exports should go through index.ts
- Keep implementation details private
- Document complex logic with comments
- Include unit tests for business logic

## Dependencies
- Only import from parent or sibling directories
- Avoid circular dependencies
- Use dependency injection where appropriate

## Testing
- Unit tests should be colocated in __tests__ directory
- Integration tests go in /tests/integration
- Aim for >80% coverage of business logic
`;
}