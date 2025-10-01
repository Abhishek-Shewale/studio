'use server';
/**
 * @fileOverview Provides feedback on the user's spoken responses based on technical accuracy, clarity, and completeness.
 *
 * - provideFeedbackOnResponses - A function that provides feedback on user responses.
 * - ProvideFeedbackOnResponsesInput - The input type for the provideFeedbackOnResponses function.
 * - ProvideFeedbackOnResponsesOutput - The return type for the provideFeedbackOnResponses function.
 */

export interface ProvideFeedbackOnResponsesInput {
  question: string;
  response: string;
  role: string;
  experienceLevel: string;
}

export interface ProvideFeedbackOnResponsesOutput {
  feedback: string;
}

export async function provideFeedbackOnResponses(input: ProvideFeedbackOnResponsesInput): Promise<ProvideFeedbackOnResponsesOutput> {
  try {
    // Use direct Google GenAI API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert interview coach. Analyze the response for the given question, role, and experience level.

Provide brief, constructive feedback on its technical accuracy, clarity, and completeness. Address the user directly as "you".

Question: ${input.question}
Your Response: ${input.response}
Role: ${input.role}
Experience Level: ${input.experienceLevel}

Provide concise, actionable feedback that helps the candidate improve. Focus on:
1. Technical accuracy and depth
2. Communication clarity
3. Completeness of the answer
4. Areas for improvement

Keep feedback encouraging but honest, limited to 2-3 sentences.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    return { feedback };
  } catch (error) {
    console.error('Error providing feedback:', error);
    throw new Error('Failed to provide feedback');
  }
}
