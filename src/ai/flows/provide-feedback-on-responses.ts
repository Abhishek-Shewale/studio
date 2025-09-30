'use server';
/**
 * @fileOverview Provides feedback on the user's spoken responses based on technical accuracy, clarity, and completeness.
 *
 * - provideFeedbackOnResponses - A function that provides feedback on user responses.
 * - ProvideFeedbackOnResponsesInput - The input type for the provideFeedbackOnResponses function.
 * - ProvideFeedbackOnResponsesOutput - The return type for the provideFeedbackOnResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideFeedbackOnResponsesInputSchema = z.object({
  question: z.string().describe('The interview question asked.'),
  response: z.string().describe('The user\'s spoken response to the question.'),
  role: z.string().describe('The role the user is interviewing for (e.g., SDLC, AI Engineer).'),
  experienceLevel: z.string().describe('The experience level of the user (e.g., Entry, Mid-level, Senior).'),
});

export type ProvideFeedbackOnResponsesInput = z.infer<typeof ProvideFeedbackOnResponsesInputSchema>;

const ProvideFeedbackOnResponsesOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the technical accuracy, clarity, and completeness of the response.'),
});

export type ProvideFeedbackOnResponsesOutput = z.infer<typeof ProvideFeedbackOnResponsesOutputSchema>;

export async function provideFeedbackOnResponses(input: ProvideFeedbackOnResponsesInput): Promise<ProvideFeedbackOnResponsesOutput> {
  return provideFeedbackOnResponsesFlow(input);
}

const provideFeedbackOnResponsesPrompt = ai.definePrompt({
  name: 'provideFeedbackOnResponsesPrompt',
  input: {schema: ProvideFeedbackOnResponsesInputSchema},
  output: {schema: ProvideFeedbackOnResponsesOutputSchema},
  prompt: `You are an expert interview feedback provider.

You will analyze the candidate's response to a question and provide feedback on its technical accuracy, clarity, and completeness.

Consider the role and experience level of the candidate when providing feedback.

Question: {{{question}}}
Response: {{{response}}}
Role: {{{role}}}
Experience Level: {{{experienceLevel}}}

Provide detailed feedback:
`,
});

const provideFeedbackOnResponsesFlow = ai.defineFlow(
  {
    name: 'provideFeedbackOnResponsesFlow',
    inputSchema: ProvideFeedbackOnResponsesInputSchema,
    outputSchema: ProvideFeedbackOnResponsesOutputSchema,
  },
  async input => {
    const {output} = await provideFeedbackOnResponsesPrompt(input);
    return output!;
  }
);
