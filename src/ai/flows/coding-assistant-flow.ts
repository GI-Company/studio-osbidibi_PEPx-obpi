
'use server';
/**
 * @fileOverview An AI-powered coding assistant.
 *
 * - assistWithCode - A function that provides coding assistance.
 * - CodingAssistantInput - The input type for the assistWithCode function.
 * - CodingAssistantOutput - The return type for the assistWithCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodingAssistantInputSchema = z.object({
  query: z.string().describe('The user PII-redacted coding question or problem description.'),
  programmingLanguage: z.string().optional().describe('The programming language relevant to the query, if any.'),
  context: z.string().optional().describe('Any additional context or code snippets provided by the user. User PII-redacted.'),
});
export type CodingAssistantInput = z.infer<typeof CodingAssistantInputSchema>;

const CodingAssistantOutputSchema = z.object({
  explanation: z.string().describe('A clear, step-by-step explanation or answer to the coding query.'),
  codeSuggestions: z.array(z.string()).optional().describe('Relevant code snippets or examples, if applicable.'),
  potentialIssues: z.array(z.string()).optional().describe('Potential issues or considerations related to the query or suggested code.'),
});
export type CodingAssistantOutput = z.infer<typeof CodingAssistantOutputSchema>;

export async function assistWithCode(input: CodingAssistantInput): Promise<CodingAssistantOutput> {
  return codingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codingAssistantPrompt',
  input: {schema: CodingAssistantInputSchema},
  output: {schema: CodingAssistantOutputSchema},
  prompt: `You are an unbiased, highly skilled, and helpful AI coding assistant. Your goal is to provide clear, accurate, and actionable advice to developers.
Focus on understanding the user's query and providing relevant explanations, code examples, and potential considerations.
Be concise but thorough. If the user provides code, analyze it constructively.
Avoid expressing personal opinions or biases. Stick to factual information and best practices.

User Query:
{{{query}}}

{{#if programmingLanguage}}
Programming Language: {{{programmingLanguage}}}
{{/if}}

{{#if context}}
Additional Context/Code:
\`\`\`
{{{context}}}
\`\`\`
{{/if}}

Please provide:
1. A detailed explanation addressing the user's query.
2. If applicable, provide relevant code suggestions. Ensure code is well-formatted.
3. If applicable, list any potential issues or important considerations.
`,
  config: {
    temperature: 0.3, // Lower temperature for more factual and less creative responses
     safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ]
  }
});

const codingAssistantFlow = ai.defineFlow(
  {
    name: 'codingAssistantFlow',
    inputSchema: CodingAssistantInputSchema,
    outputSchema: CodingAssistantOutputSchema,
  },
  async input => {
    // Sanitize inputs (concept - actual sanitization might be more complex)
    const sanitizedInput = {
      query: input.query.replace(/<script.*?>.*?<\/script>/gi, ''), // Basic script tag removal
      programmingLanguage: input.programmingLanguage?.replace(/<script.*?>.*?<\/script>/gi, ''),
      context: input.context?.replace(/<script.*?>.*?<\/script>/gi, ''),
    };

    const {output} = await prompt(sanitizedInput);
    
    if (!output) {
        // Handle cases where the LLM might not return valid structured output
        // or if the content is blocked by safety settings.
        return {
            explanation: "I apologize, but I couldn't generate a response for that query. This might be due to safety filters or an inability to process the request. Please try rephrasing your query or ensure it aligns with safe usage guidelines.",
            codeSuggestions: [],
            potentialIssues: ["Response generation failed or content was filtered."]
        };
    }
    return output;
  }
);
