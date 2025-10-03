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
  analysis: string;
  tips: string[];
}

export async function provideFeedbackOnResponses(input: ProvideFeedbackOnResponsesInput): Promise<ProvideFeedbackOnResponsesOutput> {
  try {
    // Use direct Google GenAI API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert interview coach. Analyze the response for the given question, role, and experience level.

Provide structured feedback with:
1. A brief analysis paragraph (2-3 sentences)
2. Specific actionable tips as bullet points (3-5 tips)

Question: ${input.question}
Your Response: ${input.response}
Role: ${input.role}
Experience Level: ${input.experienceLevel}

For TECHNICAL questions, focus on:
- Technical accuracy and depth
- Problem-solving approach
- Code quality and best practices

For BEHAVIORAL/OPEN-ENDED questions (like "tell me about yourself", "walk me through your experience", etc.), focus on:
- Structure and completeness of the answer
- Professional presentation and confidence
- Relevance to the role and company
- Communication clarity and storytelling

For ALL questions, consider:
- Communication clarity
- Completeness of the answer
- Areas for improvement

IMPORTANT: Return ONLY valid JSON in this exact format. Do not include any other text, explanations, or formatting:

{
  "analysis": "Brief 2-3 sentence analysis of the response, highlighting strengths and areas for improvement",
  "tips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2", 
    "Specific actionable tip 3",
    "Specific actionable tip 4"
  ]
}

Keep the analysis encouraging but honest. Make tips specific and actionable. Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedbackText = response.text();

    try {
      // Try to extract JSON from the response (in case AI adds extra text)
      let jsonText = feedbackText.trim();
      
      // Look for JSON object in the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const parsedFeedback = JSON.parse(jsonText);
     
      
      return {
        feedback: feedbackText, // Keep original for backward compatibility
        analysis: parsedFeedback.analysis || feedbackText,
        tips: parsedFeedback.tips || []
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.warn('Failed to parse JSON feedback, using fallback:', parseError);
      console.warn('Raw feedback text:', feedbackText);
      return {
        feedback: feedbackText,
        analysis: feedbackText,
        tips: []
      };
    }
  } catch (error) {
    console.error('Error providing feedback:', error);
    throw new Error('Failed to provide feedback');
  }
}
