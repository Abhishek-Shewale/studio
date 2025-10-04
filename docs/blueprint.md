# **App Name**: InterviewBabu

## Core Features:

- Interview Setup: Allow users to select interview parameters such as role (SDLC, AI Engineer), experience level, and number of questions (10-20).
- Question Generation: Use Gemini via Generative API to generate interview questions tailored to the selected role and experience level.
- Voice Prompts: Utilize pre-generated and cached audio prompts via Amazon Polly (Indian voice) for questions.
- Voice Recording & Transcription: Record user's voice responses using the browser's SpeechRecognition API and convert speech to text for analysis.
- Feedback Generation: Use Gemini via Generative API as a tool to assess user responses and provide feedback on technical accuracy, clarity, and completeness.
- Audio Feedback Delivery: Generate feedback audio using Amazon Polly (Indian voice) based on the assessment, and play for the user.
- Optional Audio Upload: Allow users to upload recorded audio for server-side re-processing and potentially more accurate transcription.

## Style Guidelines:

- Primary color: Sky blue (#87CEEB) for a calm and professional feel.
- Background color: Light gray (#F0F0F0) for a clean and modern interface.
- Accent color: Teal (#008080) to highlight important information and actions.
- Body and headline font: 'Inter', a sans-serif font for readability and a modern feel.
- Use simple, professional icons to represent different roles, settings, and features.
- Clean, structured layout for easy navigation and readability, even with voice-only interaction.
- Subtle animations for feedback and progress updates, ensuring clarity without being distracting.