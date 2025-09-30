'use client';

import { useState, useEffect } from 'react';
import {
  generateInterviewQuestions,
  type GenerateInterviewQuestionsOutput,
} from '@/ai/flows/generate-interview-questions';
import {
  InterviewSetup,
  type InterviewSetupData,
} from '@/app/components/interview-setup';
import { InterviewSession } from '@/app/components/interview-session';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/use-speech';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type InterviewState = 'setup' | 'generating' | 'session' | 'finished';

export default function NewInterviewPage() {
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [interviewData, setInterviewData] = useState<{
    settings: InterviewSetupData;
    questions: string[];
  } | null>(null);
  const { toast } = useToast();
  const { hasSpeechSupport } = useSpeech({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartInterview = async (data: InterviewSetupData) => {
    setInterviewState('generating');
    try {
      // Split topics and question bank into arrays
      const topics = data.topics ? data.topics.split(',').map(t => t.trim()).filter(t => t) : [];
      const questionBank = data.questionBank ? data.questionBank.split('\n').map(q => q.trim()).filter(q => q) : [];
      
      const result: GenerateInterviewQuestionsOutput =
        await generateInterviewQuestions({
          ...data,
          topics,
          questionBank
        });
        
      if (result && result.questions && result.questions.length > 0) {
        setInterviewData({ settings: data, questions: result.questions });
        setInterviewState('session');
      } else {
        throw new Error('No questions were generated or provided.');
      }
    } catch (error) {
      console.error('Failed to generate interview questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Failed to prepare interview questions. Please check your inputs or try again.',
      });
      setInterviewState('setup');
    }
  };

  const handleFinishInterview = () => {
    setInterviewState('finished');
  };

  const handleRestart = () => {
    setInterviewData(null);
    setInterviewState('setup');
  };

  const renderContent = () => {
    switch (interviewState) {
      case 'setup':
      case 'generating':
        return (
          <InterviewSetup
            onStartInterview={handleStartInterview}
            isGenerating={interviewState === 'generating'}
            hasSpeechSupport={isClient ? hasSpeechSupport : true}
          />
        );
      case 'session':
        if (interviewData) {
          // This is a temporary type assertion. In a real app, you'd want to make sure
          // the experienceLevel is correctly passed or handled.
          const sessionSettings = {
            ...interviewData.settings,
            experienceLevel: interviewData.settings.difficulty,
          };
          return (
            <InterviewSession
              settings={sessionSettings}
              questions={interviewData.questions}
              onFinish={handleFinishInterview}
            />
          );
        }
        // Fallback
        handleRestart();
        return null;
      case 'finished':
        return (
          <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Interview Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mt-4">
                You did a great job. Practice makes perfect!
              </p>
              <Button onClick={handleRestart} className="mt-8">
                Start New Interview
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full">{renderContent()}</div>
    </main>
  );
}
