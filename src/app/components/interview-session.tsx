'use client';

import { useState, useEffect, useMemo } from 'react';
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
  // We'll use a ref to store the latest transcript from interim results
  const latestTranscript = useRef('');

  const handleTranscriptResult = (transcript: string, isFinal: boolean) => {
    latestTranscript.current = transcript;
    if (isFinal && status === 'LISTENING') {
      stopListeningAndProcess();
    }
  };

  const {
    speak,
    startListening,
    stopListening,
    cancelSpeaking,
  } = useSpeech({ onListenResult: handleTranscriptResult });

  // This function will be called either by the final result or manual stop
  const stopListeningAndProcess = () => {
    if (status !== 'LISTENING') return;
    
    stopListening();
    
    // Use the latest transcript we've stored
    if (latestTranscript.current) {
      setLastTranscript(latestTranscript.current);
      setStatus('PROCESSING');
    } else {
      // If there's no transcript, maybe just go to the next question
      // Or show a message. For now, we'll just go back to listening.
      setStatus('LISTENING');
    }
  };


  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getFeedback = async (transcript: string) => {
    try {
      const result = await provideFeedbackOnResponses({
        question: currentQuestion,
        response: transcript,
        role: settings.role,
        experienceLevel: settings.experienceLevel,
      });
      setFeedback(result.feedback);
      setStatus('GIVING_FEEDBACK');
    } catch (error) {
      console.error('Error getting feedback:', error);
      setCurrentError('Sorry, I had trouble processing your response.');
      setStatus('GIVING_FEEDBACK'); // Still go to feedback state to announce error
    }
  };

  const nextStep = () => {
    // After feedback is given, move to next question or finish
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
    // State machine management
    switch (status) {
      case 'IDLE':
        // On first question, ask. On subsequent, this is hit after state reset.
        if (currentQuestion) {
          setStatus('ASKING');
        }
        break;
      case 'ASKING':
        speak(currentQuestion, () => setStatus('LISTENING'));
        break;
      case 'LISTENING':
        latestTranscript.current = '';
        startListening();
        break;
      case 'PROCESSING':
        getFeedback(lastTranscript);
        break;
      case 'GIVING_FEEDBACK':
        speak(currentError || `Here's some feedback. ${feedback}`, nextStep);
        break;
    }
  }, [status]);
  
  useEffect(() => {
    // Trigger state change for next question
    if (currentQuestionIndex > 0) {
      setFeedback('');
      setLastTranscript('');
      setCurrentError('');
      setStatus('ASKING');
    }
  }, [currentQuestionIndex]);


  useEffect(() => {
    // Component mount: Start the process
    setStatus('ASKING');
    
    // Cleanup on unmount
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

  const StatusDisplay = useMemo(() => {
    switch (status) {
      case 'ASKING':
        return { icon: <Bot className="h-5 w-5 animate-pulse" />, text: "I'm asking a question..." };
      case 'LISTENING':
        return { icon: <Mic className="h-5 w-5 animate-pulse text-red-500" />, text: "Your turn, I'm listening..." };
      case 'PROCESSING':
        return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Analyzing your response...' };
      case 'GIVING_FEEDBACK':
        return { icon: <Sparkles className="h-5 w-5 text-accent animate-pulse" />, text: 'Providing feedback...' };
      default:
        return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Preparing...' };
    }
  }, [status]);

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
          <Button onClick={stopListeningAndProcess} variant="destructive" size="lg">
            <Square className="mr-2 h-5 w-5" />
            Stop Listening
          </Button>
        )}

        {lastTranscript && (
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
