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

**SCORING CRITERIA (Be VERY Strict and Realistic):**

**IMPORTANT: This interview has 10 total questions (5 introductory + 5 technical). Score based on completion and accuracy.**

- **90-100**: Exceptional - Answered 8+ questions correctly with excellent detail and accuracy
- **80-89**: Strong - Answered 7+ questions correctly with good detail and mostly accurate
- **70-79**: Good - Answered 6+ questions correctly with adequate detail
- **60-69**: Adequate - Answered 5+ questions correctly with basic understanding
- **50-59**: Below average - Answered 4+ questions but with significant gaps or errors
- **40-49**: Poor - Answered 3+ questions but mostly wrong or incomplete
- **30-39**: Very poor - Answered 2+ questions but mostly wrong
- **20-29**: Extremely poor - Answered 1-2 questions and they were wrong
- **10-19**: Terrible - Answered 1 question and it was completely wrong
- **0-9**: No meaningful response - No attempt or completely irrelevant answers

**CRITICAL SCORING RULES:**
1. **Completion matters**: If user only answered 1 out of 10 questions, MAX score should be 5%
2. **Accuracy matters**: Wrong answers get very low scores (0-10%)
3. **Incomplete answers**: Get low scores (5-15%) only if partially correct
4. **No meaningful response**: Gets 0-5% regardless of question count
5. **High scores (80+)**: Only for answering 7+ questions correctly with good detail
6. **Be brutally honest**: Don't inflate scores - this is for learning and improvement

**SPECIFIC EXAMPLES:**
- Answer "hi" to introduction question → 2-3% (not a real answer)
- Answer "I don't know" → 1-2% (no attempt)
- Answer partially correct but incomplete → 5-10%
- Answer completely wrong → 0-5%
- Answer correctly but very brief → 8-15%

1. **Score:** Generate an overall score from 0 to 100 based on the strict criteria above.
2. **Summary:** Write a concise (3-4 sentences) summary. Be honest about performance - if it was poor, say so constructively. If it was good, highlight strengths.

Address the user directly as "you." Be honest, constructive, and realistic.

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
    const score = scoreMatch ? Math.max(0, Math.min(100, parseInt(scoreMatch[1]))) : 5; // Default to 5 for very poor performance
    
    return {
      score,
      summary: text.replace(/\d+/g, '').trim() || 'Your performance was very poor. You need to provide complete, meaningful answers to interview questions. Simply saying "hi" or giving one-word responses is not acceptable in a professional interview.'
    };
  } catch (error) {
    console.error('Error scoring interview:', error);
    throw new Error('Failed to score interview');
  }
}
