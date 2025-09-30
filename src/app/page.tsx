'use client';

import { useState } from 'react';
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
import { Logo } from '@/app/components/logo';
import { useSpeech } from '@/hooks/use-speech';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type InterviewState = 'setup' | 'generating' | 'session' | 'finished';

export default function Home() {
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [interviewData, setInterviewData] = useState<{
    settings: InterviewSetupData;
    questions: string[];
  } | null>(null);
  const { toast } = useToast();
  const { hasSpeechSupport } = useSpeech({});

  const handleStartInterview = async (data: InterviewSetupData) => {
    setInterviewState('generating');
    try {
      const result: GenerateInterviewQuestionsOutput =
        await generateInterviewQuestions(data);
      if (result && result.questions && result.questions.length > 0) {
        setInterviewData({ settings: data, questions: result.questions });
        setInterviewState('session');
      } else {
        throw new Error('No questions were generated.');
      }
    } catch (error) {
      console.error('Failed to generate interview questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate interview questions. Please try again.',
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
            hasSpeechSupport={hasSpeechSupport}
          />
        );
      case 'session':
        if (interviewData) {
          return (
            <InterviewSession
              settings={interviewData.settings}
              questions={interviewData.questions}
              onFinish={handleFinishInterview}
            />
          );
        }
        // Should not happen, but as a fallback:
        handleRestart();
        return null;
      case 'finished':
        return (
          <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-2xl">
            <h2 className="text-3xl font-bold">Interview Complete!</h2>
            <p className="text-muted-foreground mt-4">
              You did a great job. Practice makes perfect!
            </p>
            <Button onClick={handleRestart} className="mt-8">
              Start New Interview
            </Button>
          </Card>
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-background">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Logo />
      </div>
      <div className="w-full">{renderContent()}</div>
    </main>
  );
}
