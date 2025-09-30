'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { InterviewSetupData } from './interview-setup';
import { provideFeedbackOnResponses } from '@/ai/flows/provide-feedback-on-responses';
import { useSpeech } from '@/hooks/use-speech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Mic, Sparkles, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InterviewSessionProps {
  settings: InterviewSetupData;
  questions: string[];
  onFinish: () => void;
}

type SessionStatus =
  | 'IDLE'
  | 'ASKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'GIVING_FEEDBACK';

export function InterviewSession({
  settings,
  questions,
  onFinish,
}: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [feedback, setFeedback] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [currentError, setCurrentError] = useState('');
  const latestTranscript = useRef('');
  const processingRef = useRef(false);

  const handleTranscriptResult = (transcript: string, isFinal: boolean) => {
    latestTranscript.current = transcript;
    if (isFinal && status === 'LISTENING' && !processingRef.current) {
      processingRef.current = true;
      stopListeningAndProcess();
    }
  };

  const {
    speak,
    startListening,
    stopListening,
    cancelSpeaking,
  } = useSpeech({ onListenResult: handleTranscriptResult });

  const stopListeningAndProcess = () => {
    if (status !== 'LISTENING') return;
    
    stopListening();
    
    const transcript = latestTranscript.current.trim();
    
    console.log('=== STOP LISTENING ===');
    console.log('Raw transcript:', latestTranscript.current);
    console.log('Trimmed transcript:', transcript);
    console.log('Transcript length:', transcript.length);
    
    if (transcript && transcript.length > 0) {
      setLastTranscript(transcript);
      setStatus('PROCESSING');
    } else {
      console.warn('No transcript captured, restarting listening');
      processingRef.current = false;
      // Don't show error immediately, just restart
      latestTranscript.current = '';
      setTimeout(() => {
        startListening();
      }, 500);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getFeedback = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) {
      setCurrentError('No response detected. Please try speaking again.');
      setStatus('GIVING_FEEDBACK');
      return;
    }

    try {
      console.log('=== FEEDBACK REQUEST START ===');
      console.log('Question:', currentQuestion);
      console.log('Transcript:', transcript);
      console.log('Role:', settings.role);
      console.log('Experience:', settings.experienceLevel);
      
      const result = await provideFeedbackOnResponses({
        question: currentQuestion,
        response: transcript,
        role: settings.role,
        experienceLevel: settings.experienceLevel,
      });
      
      console.log('=== FEEDBACK RESULT ===');
      console.log('Result:', result);
      
      if (result && result.feedback) {
        setFeedback(result.feedback);
        setCurrentError('');
        console.log('Feedback set successfully');
      } else {
        console.error('No feedback in result:', result);
        setCurrentError('Unable to generate feedback at this time.');
      }
      setStatus('GIVING_FEEDBACK');
    } catch (error: any) {
      console.error('=== FEEDBACK ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error:', error);
      
      // More specific error message
      const errorMessage = error?.message || 'Unknown error occurred';
      setCurrentError(`Error: ${errorMessage}. Let's move on to the next question.`);
      setStatus('GIVING_FEEDBACK');
    } finally {
      processingRef.current = false;
    }
  };

  const nextStep = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStatus('IDLE');
      speak(
        'That was the last question. The interview is now complete. Great job!',
        onFinish
      );
    }
  };

  useEffect(() => {
    switch (status) {
      case 'IDLE':
        if (currentQuestion) {
          setStatus('ASKING');
        }
        break;
      case 'ASKING':
        speak(currentQuestion, () => {
          latestTranscript.current = '';
          processingRef.current = false;
          setStatus('LISTENING');
        });
        break;
      case 'LISTENING':
        if (!processingRef.current) {
          latestTranscript.current = '';
          startListening();
        }
        break;
      case 'PROCESSING':
        if (lastTranscript) {
          getFeedback(lastTranscript);
        }
        break;
      case 'GIVING_FEEDBACK':
        const feedbackMessage = currentError || `Here's some feedback: ${feedback}`;
        speak(feedbackMessage, () => {
          setFeedback('');
          setCurrentError('');
          nextStep();
        });
        break;
    }
  }, [status]);
  
  useEffect(() => {
    if (currentQuestionIndex > 0) {
      setFeedback('');
      setLastTranscript('');
      setCurrentError('');
      latestTranscript.current = '';
      processingRef.current = false;
      setStatus('ASKING');
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    setStatus('ASKING');
    
    return () => {
      cancelSpeaking();
      stopListening();
    };
  }, []);

  const handleStop = () => {
    cancelSpeaking();
    stopListening();
    onFinish();
  };

  const handleManualStop = () => {
    if (status === 'LISTENING') {
      stopListeningAndProcess();
    }
  };

  const StatusDisplay = useMemo(() => {
    switch (status) {
      case 'ASKING':
        return { icon: <Bot className="h-5 w-5 animate-pulse" />, text: "I'm asking a question..." };
      case 'LISTENING':
        return { 
          icon: <Mic className="h-5 w-5 animate-pulse text-red-500" />, 
          text: latestTranscript.current ? "Keep going, I'm listening..." : "Your turn, I'm listening..." 
        };
      case 'PROCESSING':
        return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Analyzing your response...' };
      case 'GIVING_FEEDBACK':
        return { icon: <Sparkles className="h-5 w-5 text-accent animate-pulse" />, text: 'Providing feedback...' };
      default:
        return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Preparing...' };
    }
  }, [status, latestTranscript.current]);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl flex flex-col min-h-[75vh] animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleStop}>
            End Interview
          </Button>
        </div>
        <Progress value={progress} className="w-full mt-4" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-6 md:p-8 gap-8">
        <p className="text-2xl md:text-3xl font-semibold">{currentQuestion}</p>
        
        {status === 'LISTENING' && (
          <div className="flex flex-col items-center gap-4">
            <Button onClick={handleManualStop} variant="destructive" size="lg">
              <Square className="mr-2 h-5 w-5" />
              Stop & Submit Answer
            </Button>
            {latestTranscript.current && (
              <div className="text-sm text-muted-foreground italic max-w-md">
                "{latestTranscript.current}"
              </div>
            )}
          </div>
        )}

        {lastTranscript && status !== 'LISTENING' && (
          <div className="mt-4 p-4 bg-secondary rounded-lg w-full text-left max-h-48 overflow-y-auto">
            <h3 className="font-bold mb-2">Your Answer:</h3>
            <p className="text-muted-foreground italic">"{lastTranscript}"</p>
          </div>
        )}
        
        {feedback && (
          <div className="mt-2 p-4 bg-accent/10 border border-accent/20 rounded-lg w-full text-left max-h-48 overflow-y-auto">
            <h3 className="font-bold mb-2 text-accent">Feedback:</h3>
            <p className="text-foreground">{feedback}</p>
          </div>
        )}
        
        {currentError && status !== 'GIVING_FEEDBACK' && (
          <div className="mt-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg w-full text-left">
            <p className="text-destructive">{currentError}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center items-center p-4 bg-secondary/50 border-t">
        <div className="flex items-center gap-3 text-muted-foreground">
          {StatusDisplay.icon}
          <span className="font-medium">{StatusDisplay.text}</span>
        </div>
      </CardFooter>
    </Card>
  );
}