import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ResumeData {
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
}

export interface ParsedResumeResponse {
  success: boolean;
  data?: ResumeData;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ParsedResumeResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No resume file provided'
      }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Only PDF files are supported'
      }, { status: 400 });
    }

    // Initialize Gemini with optimized settings
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1000, // Limit output for faster response
        temperature: 0.1, // Lower temperature for more consistent, faster responses
      }
    });

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const prompt = `Extract resume data as JSON. Be concise and fast.

Return ONLY this JSON structure:
{
  "name": "Full name if found",
  "email": "Email if found", 
  "phone": "Phone if found",
  "jobRole": "Most recent job title",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name", 
      "duration": "Duration/date range",
      "description": "Brief description"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name",
      "year": "Graduation year"
    }
  ],
  "summary": "Professional summary if found"
}

Rules:
- Extract only explicitly stated information
- Focus on recent experience (max 3 positions)
- Include technical skills, languages, frameworks, tools
- Be specific with technology names (e.g., "React", "Python", "AWS", not generic terms)
- Use null/empty arrays for missing data
- Return ONLY the JSON, no other text
- Ensure all extracted data is complete and usable`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove any markdown formatting if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse the JSON response
    const resumeData: ResumeData = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      data: resumeData
    });

  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to parse resume. Please ensure the PDF is readable and try again.'
    }, { status: 500 });
  }
}
