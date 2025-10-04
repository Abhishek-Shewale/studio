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
import { ResumeUpload } from '@/app/components/resume-upload';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/use-speech';
import { useAuth } from '@/hooks/use-auth';
import { saveInterview } from '@/lib/interview-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { ProgressSpinner } from '@/components/ui/countdown-spinner';

type InterviewState = 'setup' | 'generating' | 'session' | 'scoring' | 'score-display' | 'finished';

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
  const [pendingSessionData, setPendingSessionData] = useState<SessionRecord[] | null>(null);
  const [interviewScore, setInterviewScore] = useState<{score: number, summary: string} | null>(null);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const { toast } = useToast();
  const { hasSpeechSupport } = useSpeech({});
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  const startTimeRef = React.useRef<Date | null>(null);


  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-trigger scoring when state changes to 'scoring'
  useEffect(() => {
    if (interviewState === 'scoring' && pendingSessionData && interviewData) {
      handleScoreInterview();
    }
  }, [interviewState, pendingSessionData, interviewData]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ProgressSpinner 
          duration={2} 
          size="lg" 
          message="Loading..." 
        />
      </div>
    );
  }
  
  if (!user && !loading) {
    router.push('/login');
    return null;
  }

  const handleResumeUpload = (file: File) => {
    setUploadedResume(file);
  };

  const handleResumeRemove = () => {
    setUploadedResume(null);
  };

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
          questionBank,
          resumeFile: uploadedResume || undefined
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

  const handleFinishInterview = (sessionData: SessionRecord[]) => {
    setPendingSessionData(sessionData);
    setInterviewState('scoring');
  };

  const handleScoreInterview = async () => {
    if (!interviewData || !pendingSessionData) return;
    
    try {
      // Get AI-powered score and summary
      const { score, summary } = await scoreInterview({
        role: interviewData.settings.role,
        difficulty: interviewData.settings.difficulty,
        interview: pendingSessionData,
      });

      setInterviewScore({ score, summary });
      setInterviewState('score-display');
    } catch (error) {
      console.error('Error scoring interview:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem scoring your mock interview.',
      });
      setInterviewState('finished');
    }
  };

  const handleSaveInterview = async () => {
    if (!user || !interviewData || !startTimeRef.current || !pendingSessionData || !interviewScore) return;
    
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 60000); // in minutes

    try {
      await saveInterview({
        userId: user.uid,
        role: interviewData.settings.role,
        difficulty: interviewData.settings.difficulty,
        date: new Date(),
        duration,
        score: interviewScore.score,
        summary: interviewScore.summary,
        questions: pendingSessionData.map((s:any) => ({
          question: s.question,
          response: s.response,
          feedback: s.feedback,
        })),
      });
       toast({
        title: 'Mock Interview Saved',
        description: 'Your mock interview session has been saved successfully.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving your mock interview.',
      });
    }

    setPendingSessionData(null);
    setInterviewScore(null);
    setInterviewState('finished');
  };

  const handleSkipSave = () => {
    setPendingSessionData(null);
    setInterviewScore(null);
    setInterviewState('finished');
  };

  const handleRestart = () => {
    setInterviewData(null);
    setInterviewState('setup');
  };

  const getScoreCategory = (score: number) => {
    if (score >= 90) return { category: 'Outstanding', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 80) return { category: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 70) return { category: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    if (score >= 60) return { category: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    if (score >= 50) return { category: 'Developing', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    if (score >= 40) return { category: 'Needs Improvement', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    if (score >= 30) return { category: 'Room for Growth', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    if (score >= 20) return { category: 'More Practice Needed', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    if (score >= 10) return { category: 'Significant Improvement Needed', color: 'text-red-400', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    return { category: 'Major Improvement Required', color: 'text-red-400', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };
  
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  }

  const renderContent = () => {
    switch (interviewState) {
      case 'setup':
      case 'generating':
        return (
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto h-full">
            <div className="order-2 md:order-1">
              <InterviewSetup
                onStartInterview={handleStartInterview}
                isGenerating={interviewState === 'generating'}
                hasSpeechSupport={isClient ? hasSpeechSupport : true}
              />
            </div>
            <div className="order-1 md:order-2">
              <ResumeUpload
                onResumeUpload={handleResumeUpload}
                onResumeRemove={handleResumeRemove}
                uploadedResume={uploadedResume}
              />
            </div>
          </div>
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
              <ProgressSpinner 
                duration={3} 
                size="lg" 
                message="Processing your responses..." 
              />
            </CardContent>
          </Card>
        );
      case 'score-display':
        if (!interviewScore) {
          handleRestart();
          return null;
        }
        const scoreCategory = getScoreCategory(interviewScore.score);
        return (
          <Card className="w-full max-w-2xl mx-auto text-center p-8 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Mock Interview Complete!
              </CardTitle>
              <CardDescription className="pt-2 text-lg">
                Here's how you performed in your {interviewData?.settings.role} mock interview
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Score Display */}
              <div className={`rounded-lg border-2 ${scoreCategory.borderColor} ${scoreCategory.bgColor} p-6`}>
                <div className="text-6xl font-bold mb-2">{interviewScore.score}%</div>
                <div className={`text-xl font-semibold ${scoreCategory.color}`}>
                  {scoreCategory.category}
                </div>
              </div>
              
              {/* Summary */}
              <div className="text-left bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-center">Performance Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interviewScore.summary}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveInterview} size="lg" className="flex-1">
                  Save Mock Interview
                </Button>
                <Button onClick={handleSkipSave} size="lg" variant="outline" className="flex-1">
                  Skip Saving
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'finished':
        return (
          <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Mock Interview Complete!</CardTitle>
              <CardDescription className="pt-2">
                You did a great job. Practice makes perfect! {pendingSessionData ? 'Your performance has been saved.' : 'Your session was not saved.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={handleRestart} size="lg">
                Start New Mock Interview
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
    <main className="h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full h-full flex items-center justify-center">{renderContent()}</div>
    </main>
  );
}
