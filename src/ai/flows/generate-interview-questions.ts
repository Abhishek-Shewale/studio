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
  resumeFile?: File;
  resumeData?: {
    name?: string;
    email?: string;
    phone?: string;
    jobRole?: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year?: string;
    }>;
    summary?: string;
  };
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

    // Build comprehensive resume context
    let resumeContext = '';
    if (input.resumeData) {
      const { skills, experience, education, summary, jobRole } = input.resumeData;
      
      // Only include resume context if we have meaningful data
      const hasValidSkills = skills && skills.length > 0;
      const hasValidExperience = experience && experience.length > 0;
      const hasValidEducation = education && education.length > 0;
      
      if (hasValidSkills || hasValidExperience || hasValidEducation) {
        resumeContext = `\n\nCANDIDATE RESUME INFORMATION:
Job Role: ${jobRole || input.role}
${hasValidSkills ? `Skills: ${skills.join(', ')}` : ''}
${summary ? `Professional Summary: ${summary}` : ''}

${hasValidExperience ? `Experience:
${experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.duration})${exp.description ? ` - ${exp.description}` : ''}`).join('\n')}` : ''}

${hasValidEducation ? `Education:
${education.map(edu => `- ${edu.degree} from ${edu.institution}${edu.year ? ` (${edu.year})` : ''}`).join('\n')}` : ''}

IMPORTANT: Generate questions based on the candidate's actual resume information. Use specific technologies, companies, and experiences mentioned above. If specific details are missing, ask general but relevant questions for the role. NEVER use placeholder text like "[Specific Technology]" - use actual information or ask general questions.`;
      } else {
        // No meaningful resume data, generate general questions
        resumeContext = `\n\nNo detailed resume information available. Generate general but relevant questions for the ${input.role} role.`;
      }
    } else if (input.resumeFile) {
      resumeContext = `\n\nA resume has been provided for this candidate. Please analyze the resume content and tailor the questions to their specific background, experience, and skills. If specific details are unclear, ask general but relevant questions for the role.`;
    }

    const prompt = `You are an expert interview question generator. Your task is to generate a list of 5 interview questions based on the provided criteria.

Job Role: ${input.role}
Difficulty: ${input.difficulty}${topicsText}${resumeContext}

CRITICAL RULES:
1. Generate 5 insightful and relevant questions for this interview scenario
2. If resume information is provided, use the ACTUAL technologies, companies, and experiences mentioned
3. NEVER use placeholder text like "[Specific Technology]" or "[Specific Application]" 
4. If specific details are missing, ask general but relevant questions for the role
5. Each question should be complete and ready to ask
6. Return only the questions, one per line, without numbering or additional text

Examples of GOOD questions:
- "How would you approach evaluating the performance of a machine learning model for fraud detection?"
- "Tell me about your experience with React and how you would optimize a slow component."

Examples of BAD questions (DO NOT USE):
- "How would you approach evaluating the performance of a novel AI model for [Specific application mentioned in resume]?"
- "Considering your experience with [Specific AI Tool/Technology mentioned in resume]..."`;

    let result;
    if (input.resumeFile) {
      // Convert file to base64 for Gemini
      const arrayBuffer = await input.resumeFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: input.resumeFile.type,
          },
        },
      ]);
    } else {
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract questions
    let questions = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./))
      .slice(0, 5); // Ensure we only get 5 questions

    // Check for placeholder text and regenerate if needed
    const hasPlaceholders = questions.some(q => 
      q.includes('[') && q.includes(']') || 
      q.includes('Specific') || 
      q.includes('mentioned in resume')
    );

    if (hasPlaceholders) {
      console.log('Detected placeholder text in questions, regenerating...');
      
      // Regenerate with a simpler, more direct prompt
      const fallbackPrompt = `Generate 5 direct interview questions for a ${input.role} position at ${input.difficulty} difficulty level.

${input.topics && input.topics.length > 0 ? `Focus on these topics: ${input.topics.join(', ')}` : ''}

Requirements:
- Ask direct, specific questions
- No placeholder text or brackets
- Questions should be complete and ready to ask
- Make them relevant to the role and difficulty level

Return only the questions, one per line, without numbering.`;

      const fallbackResult = await model.generateContent(fallbackPrompt);
      const fallbackText = await fallbackResult.response.text();
      
      questions = fallbackText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+\./))
        .slice(0, 5);
    }

    return { questions };
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
}
