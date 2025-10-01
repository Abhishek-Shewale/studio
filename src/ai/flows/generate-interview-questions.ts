'use server';

/**
 * @fileOverview A flow for generating interview questions based on role, experience level, and number of questions.
 *
 * - generateInterviewQuestions - A function that generates a list of interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

export interface GenerateInterviewQuestionsInput {
  role: string;
  difficulty: string;
  topics?: string[];
  questionBank?: string[];
}

export interface GenerateInterviewQuestionsOutput {
  questions: string[];
}

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  // If a question bank is provided, use those questions directly.
  if (input.questionBank && input.questionBank.length > 0) {
    return { questions: input.questionBank };
  }

  try {
    // Use direct Google GenAI API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const topicsText = input.topics && input.topics.length > 0 
      ? `\nFocus on the following topics:\n${input.topics.map(topic => `- ${topic}`).join('\n')}`
      : '';

    const prompt = `You are an expert interview question generator. Your task is to generate a list of 5 interview questions based on the provided criteria.

Job Role: ${input.role}
Difficulty: ${input.difficulty}${topicsText}

Please generate 5 insightful and relevant questions for this interview scenario. Return only the questions, one per line, without numbering or additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract questions
    const questions = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./))
      .slice(0, 5); // Ensure we only get 5 questions

    return { questions };
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
}
