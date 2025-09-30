'use server';
/**
 * @fileOverview Scores an entire interview session based on all questions, responses, and feedback.
 *
 * - scoreInterview - A function that provides a final score and summary for the interview.
 * - ScoreInterviewInput - The input type for the scoreInterview function.
 * - ScoreInterviewOutput - The return type for the scoreInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewTurnSchema = z.object({
  question: z.string().describe('The interview question that was asked.'),
  response: z.string().describe("The user's response to the question."),
  feedback: z.string().describe("The AI's feedback on the user's response."),
});

export const ScoreInterviewInputSchema = z.object({
  role: z.string().describe('The role the user was interviewing for.'),
  difficulty: z.string().describe('The difficulty level of the interview.'),
  interview: z.array(InterviewTurnSchema).describe('The full transcript of the interview session, including all questions, responses, and feedback provided.'),
});
export type ScoreInterviewInput = z.infer<typeof ScoreInterviewInputSchema>;

const ScoreInterviewOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('An overall score for the interview on a scale of 0-100, based on the entire performance.'),
  summary: z.string().describe('A brief, encouraging summary of the performance, highlighting strengths and key areas for improvement.'),
});
export type ScoreInterviewOutput = z.infer<typeof ScoreInterviewOutputSchema>;


export async function scoreInterview(
  input: ScoreInterviewInput
): Promise<ScoreInterviewOutput> {
  return scoreInterviewFlow(input);
}


const scoreInterviewPrompt = ai.definePrompt(
  {
    name: 'scoreInterviewPrompt',
    input: {schema: ScoreInterviewInputSchema},
    output: {schema: ScoreInterviewOutputSchema},
  },
  `You are an expert career coach tasked with providing a final evaluation for a mock interview.

Analyze the entire interview transcript provided below, which includes the questions asked, the user's answers, and the initial feedback given for each response.

**Interview Context:**
- **Role:** {{role}}
- **Difficulty:** {{difficulty}}

**Interview Transcript:**
{{#each interview}}
---
**Question {{index + 1}}:** {{this.question}}
**User's Response:** {{this.response}}
**Initial Feedback:** {{this.feedback}}
{{/each}}
---

**Your Task:**
Based on the full context of the interview, provide a final, holistic evaluation.
1.  **Score:** Generate an overall score from 0 to 100. This score should reflect the user's technical knowledge, communication skills, and problem-solving abilities demonstrated across all answers, relative to the job role and difficulty.
2.  **Summary:** Write a concise (3-4 sentences) summary. Start with an encouraging tone, highlight one or two key strengths, and point out the most important area for improvement.

Address the user directly as "you." Be fair, constructive, and focus on the big picture.`
);


const scoreInterviewFlow = ai.defineFlow(
  {
    name: 'scoreInterviewFlow',
    inputSchema: ScoreInterviewInputSchema,
    outputSchema: ScoreInterviewOutputSchema,
  },
  async input => {
    const {output} = await scoreInterviewPrompt(input);
    return output!;
  }
);
