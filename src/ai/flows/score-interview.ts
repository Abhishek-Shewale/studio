'use server';
/**
 * @fileOverview Scores an entire interview session based on all questions, responses, and feedback.
 *
 * - scoreInterview - A function that provides a final score and summary for the interview.
 * - ScoreInterviewInput - The input type for the scoreInterview function.
 * - ScoreInterviewOutput - The return type for the scoreInterview function.
 */

export interface InterviewTurn {
  question: string;
  response: string;
  feedback: string;
}

export interface ScoreInterviewInput {
  role: string;
  difficulty: string;
  interview: InterviewTurn[];
}

export interface ScoreInterviewOutput {
  score: number;
  summary: string;
}

export async function scoreInterview(
  input: ScoreInterviewInput
): Promise<ScoreInterviewOutput> {
  try {
    // Use direct Google GenAI API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const interviewTranscript = input.interview
      .map((turn, index) => 
        `---\n**Question ${index + 1}:** ${turn.question}\n**User's Response:** ${turn.response}\n**Initial Feedback:** ${turn.feedback}`
      )
      .join('\n');

    const prompt = `You are an expert career coach tasked with providing a final evaluation for a mock interview.

Analyze the entire interview transcript provided below, which includes the questions asked, the user's answers, and the initial feedback given for each response.

**Interview Context:**
- **Role:** ${input.role}
- **Difficulty:** ${input.difficulty}

**Interview Transcript:**
${interviewTranscript}
---

**Your Task:**
Based on the full context of the interview, provide a final, holistic evaluation.
1. **Score:** Generate an overall score from 0 to 100. This score should reflect the user's technical knowledge, communication skills, and problem-solving abilities demonstrated across all answers, relative to the job role and difficulty.
2. **Summary:** Write a concise (3-4 sentences) summary. Start with an encouraging tone, highlight one or two key strengths, and point out the most important area for improvement.

Address the user directly as "you." Be fair, constructive, and focus on the big picture.

Please respond in the following JSON format:
{
  "score": <number between 0 and 100>,
  "summary": "<your summary here>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 0)),
          summary: parsed.summary || 'No summary provided.'
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback');
    }

    // Fallback: extract score and summary from text
    const scoreMatch = text.match(/(\d+)/);
    const score = scoreMatch ? Math.max(0, Math.min(100, parseInt(scoreMatch[1]))) : 75;
    
    return {
      score,
      summary: text.replace(/\d+/g, '').trim() || 'Good performance overall. Keep practicing to improve your interview skills.'
    };
  } catch (error) {
    console.error('Error scoring interview:', error);
    throw new Error('Failed to score interview');
  }
}
