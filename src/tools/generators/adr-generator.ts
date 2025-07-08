export async function generateADR(
  title: string,
  context: string,
  decision: string,
  constraints?: string[]
): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const adrNumber = Date.now().toString().slice(-3); // Simple numbering
  
  return `# ADR-${adrNumber}: ${title}

## Status
Proposed

## Date
${date}

## Context
${context}

## Decision
${decision}

## Implementation Constraints for Code Generation
${constraints && constraints.length > 0 
  ? constraints.map(c => `- ${c}`).join('\n')
  : `- Follow the patterns defined in CODEBASE-CONTEXT.md
- Ensure backward compatibility
- Consider performance implications
- Maintain code consistency`}

## Consequences

### Positive
- [Add positive outcomes]
- Improved AI code generation accuracy
- Better team alignment

### Negative
- [Add any trade-offs]
- Potential learning curve
- Migration effort for existing code

### Neutral
- [Add neutral observations]
- Documentation needs updating
- Team training required

## References
- PROJECT-TEMPLATE.md
- CODEBASE-CONTEXT.md
- [Add relevant links or documentation]

## Notes for AI Code Generation
When implementing code based on this decision:
1. Always check this ADR before generating related code
2. Ensure generated code follows the constraints above
3. Include appropriate comments referencing this ADR
4. Update examples in documentation as needed
`;
}