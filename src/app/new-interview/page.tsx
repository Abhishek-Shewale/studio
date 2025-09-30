'use client';

import { useState, useEffect } from 'react';
import {
  generateInterviewQuestions,
  type GenerateInterviewQuestionsOutput,
} from '@/ai/flows/generate-interview-questions';
import { scoreInterview } from '@/ai/flows/score-interview';
import {
  InterviewSetup,
  type InterviewSetupData,
} from '@/app/components/interview-setup';
import { InterviewSession } from '@/app/components/interview-session';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/use-speech';
import { useAuth } from '@/hooks/use-auth';
import { saveInterview } from '@/lib/interview-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

type InterviewState = 'setup' | 'generating' | 'session' | 'scoring' | 'finished';

type SessionRecord = {
  question: string;
  response: string;
  feedback: string;
}

export default function NewInterviewPage() {
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [interviewData, setInterviewData] = useState<{
    settings: InterviewSetupData;
    questions: string[];
  } | null>(null);
  const { toast } = useToast();
  const { hasSpeechSupport } = useSpeech({});
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  const startTimeRef = React.useRef<Date | null>(null);


  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!user && !loading) {
    router.push('/login');
    return null;
  }

  const handleStartInterview = async (data: InterviewSetupData) => {
    setInterviewState('generating');
    startTimeRef.current = new Date();
    try {
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

  const handleFinishInterview = async (sessionData: SessionRecord[]) => {
    if (!user || !interviewData || !startTimeRef.current) return;
    
    setInterviewState('scoring');
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 60000); // in minutes

    try {
      // Get AI-powered score and summary
      const { score, summary } = await scoreInterview({
        role: interviewData.settings.role,
        difficulty: interviewData.settings.difficulty,
        interview: sessionData,
      });

      await saveInterview({
        userId: user.uid,
        role: interviewData.settings.role,
        difficulty: interviewData.settings.difficulty,
        date: new Date(),
        duration,
        score: score,
        summary: summary,
        questions: sessionData.map((s:any) => ({
          question: s.question,
          response: s.response,
          feedback: s.feedback,
        })),
      });
       toast({
        title: 'Interview Saved',
        description: 'Your interview session has been saved successfully.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving your interview.',
      });
    }


    setInterviewState('finished');
  };

  const handleRestart = () => {
    setInterviewData(null);
    setInterviewState('setup');
  };
  
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  }

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
          return (
            <InterviewSession
              settings={interviewData.settings}
              questions={interviewData.questions}
              onFinish={handleFinishInterview}
            />
          );
        }
        handleRestart();
        return null;
       case 'scoring':
        return (
           <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Analyzing your performance...</CardTitle>
              <CardDescription className="pt-2">
                Our AI is calculating your score and generating a summary. Please wait a moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        )
      case 'finished':
        return (
          <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Interview Complete!</CardTitle>
              <CardDescription className="pt-2">
                You did a great job. Practice makes perfect! Your performance has been saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={handleRestart} size="lg">
                Start New Interview
              </Button>
               <Button onClick={handleGoToDashboard} size="lg" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
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
