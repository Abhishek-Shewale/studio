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
  goodPoints: string[];
  confidentPoints: string[];
  improvementPoints: string[];
}

export async function provideFeedbackOnResponses(input: ProvideFeedbackOnResponsesInput): Promise<ProvideFeedbackOnResponsesOutput> {
  try {
    // Use direct Google GenAI API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert interview coach. Analyze the response for the given question, role, and experience level.

    Provide structured feedback with exactly 3 points for each category:
    1. 3 sweet and short good points (honest) from their answer
    2. 3 sweet and short confident points (honest) from their answer
    3. 3 sweet and short improvement points (honest) from their answer
    
    Question: ${input.question}
    Your Response: ${input.response}
    Role: ${input.role}
    Experience Level: ${input.experienceLevel}
    
    Guidelines:
    - Be concise, specific, and kind. Each point must be 1 sentence or less.
    - Always return EXACTLY 3 items in each array (goodPoints, confidentPoints, improvementPoints).
    - For TECHNICAL questions, focus on:
      - Technical accuracy and depth
      - Problem-solving approach and trade-offs
      - Code quality, edge cases, complexity, and best practices
      - If the candidate's solution is incorrect, state the incorrect part clearly in an improvement point and — in one short phrase — indicate the correct concept or next step to fix it.
    - For BEHAVIORAL / OPEN-ENDED questions, focus on:
      - Structure (STAR method or clear flow), relevance to role, and storytelling
      - Professional tone, confidence, and conciseness
      - If the answer is off-topic or missing key details, say so plainly in an improvement point and suggest the one most important detail they should add.
    - If the response is IRRELEVANT, INCOMPLETE, or INCORRECT:
      - Explicitly call this out in at least one improvement point (use words like "off-topic", "didn't address", or "incorrect").
      - For incorrect technical answers, include a very brief corrective hint (a phrase or single concept) in an improvement point so the user knows what to study/fix.
      - For irrelevant answers, state which part of the question was missed and suggest the best pivot to make it relevant.
    - If the candidate explicitly REFUSES to answer (e.g., says "I will not tell", "I can't discuss", "I prefer not to say", "NDA"):
      1) In goodPoints: include AT MOST ONE brief, neutral acknowledgment of boundary (e.g., "Respects confidentiality") — do NOT overpraise refusal.
      2) In confidentPoints: include AT MOST ONE neutral point (e.g., "Delivered firmly") — the other slots can be neutral placeholders like "No confident signal about content".
      3) In improvementPoints: use at least TWO points to explain why refusal hurts assessment and suggest an NDA-safe pivot. Always include a short pivot phrase such as: "I can't share specifics due to an NDA, but I can describe my role, approach, and outcomes."
    
    - Avoid long explanations—feedback must remain short, actionable, and supportive.
    - Do NOT include any commentary, examples, or code beyond the 9 points requested.
    
    IMPORTANT: Return ONLY valid JSON in this exact format. Do not include any other text, explanations, or formatting outside the JSON:
    
    {
      "goodPoints": [
        "Sweet and short good point 1 from their answer",
        "Sweet and short good point 2 from their answer",
        "Sweet and short good point 3 from their answer"
      ],
      "confidentPoints": [
        "Sweet and short confident point 1 from their answer",
        "Sweet and short confident point 2 from their answer",
        "Sweet and short confident point 3 from their answer"
      ],
      "improvementPoints": [
        "Sweet and short improvement point 1 from their answer",
        "Sweet and short improvement point 2 from their answer",
        "Sweet and short improvement point 3 from their answer"
      ]
    }
    
    Make all points specific and grounded in the candidate's actual response. Be sweet and encouraging while being honest. Return ONLY the JSON object, nothing else.`;
    
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
        goodPoints: parsedFeedback.goodPoints || [],
        confidentPoints: parsedFeedback.confidentPoints || [],
        improvementPoints: parsedFeedback.improvementPoints || []
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.warn('Failed to parse JSON feedback, using fallback:', parseError);
      console.warn('Raw feedback text:', feedbackText);
      return {
        goodPoints: [],
        confidentPoints: [],
        improvementPoints: []
      };
    }
  } catch (error) {
    console.error('Error providing feedback:', error);
    throw new Error('Failed to provide feedback');
  }
}
