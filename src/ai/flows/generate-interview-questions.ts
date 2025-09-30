'use server';

/**
 * @fileOverview A flow for generating interview questions based on role, experience level, and number of questions.
 *
 * - generateInterviewQuestions - A function that generates a list of interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  role: z.string().describe('The job role the user is applying for.'),
  difficulty: z.string().describe('The difficulty level of the questions.'),
  topics: z.array(z.string()).optional().describe('Optional list of specific topics to focus on.'),
  questionBank: z.array(z.string()).optional().describe('Optional list of custom questions provided by the user.'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated interview questions.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const generateInterviewQuestionsPrompt = ai.definePrompt(
  {
    name: 'generateInterviewQuestionsPrompt',
    input: {schema: GenerateInterviewQuestionsInputSchema},
    output: {schema: GenerateInterviewQuestionsOutputSchema},
  },
  `You are an expert interview question generator. Your task is to generate a list of 5 interview questions based on the provided criteria.

Job Role: {{role}}
Difficulty: {{difficulty}}

{{#if topics}}
Focus on the following topics:
{{#each topics}}
- {{this}}
{{/each}}
{{/if}}

Please generate 5 insightful and relevant questions for this interview scenario.
`
);

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    // If a question bank is provided, use those questions directly.
    if (input.questionBank && input.questionBank.length > 0) {
      return { questions: input.questionBank };
    }

    const {output} = await generateInterviewQuestionsPrompt(input);
    return output!;
  }
);
