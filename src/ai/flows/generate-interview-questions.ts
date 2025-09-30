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
  role: z.string().describe('The role for which interview questions should be generated (e.g., SDLC, AI Engineer).'),
  experienceLevel: z.string().describe('The experience level of the candidate (e.g., Entry-level, Mid-level, Senior-level).'),
  numberOfQuestions: z.number().int().min(1).max(20).describe('The number of interview questions to generate (between 1 and 20).'),
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
    model: 'googleai/gemini-2.0-flash-exp',
    input: {schema: GenerateInterviewQuestionsInputSchema},
    output: {schema: GenerateInterviewQuestionsOutputSchema},
  },
  `You are an expert interview question generator. Given the role, experience level, and number of questions, generate a unique list of interview questions tailored to the candidate for each session. Do not repeat questions across sessions for the same role and experience level.

Role: {{role}}
Experience Level: {{experienceLevel}}
Number of Questions: {{numberOfQuestions}}

Generate a fresh set of questions that are relevant, challenging, and appropriate for the specified experience level.`
);

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewQuestionsPrompt(input);
    return output!;
  }
);