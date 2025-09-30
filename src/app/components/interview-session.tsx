'use client';

import {useState, useEffect, useMemo, useRef} from 'react';
import type {InterviewSetupData} from './interview-setup';
import {provideFeedbackOnResponses} from '@/ai/flows/provide-feedback-on-responses';
import {useSpeech} from '@/hooks/use-speech';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  Loader2,
  Mic,
  Send,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';
import {Textarea} from '../ui/textarea';
import {ScrollArea} from '../ui/scroll-area';

interface InterviewSessionProps {
  settings: InterviewSetupData;
  questions: string[];
  onFinish: () => void;
}

type SessionStatus =
  | 'IDLE'
  | 'ASKING'
  | 'LISTENING'
  | 'TYPING'
  | 'PROCESSING'
  | 'GIVING_FEEDBACK';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export function InterviewSession({
  settings,
  questions,
  onFinish,
}: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [feedback, setFeedback] = useState('');
  const [currentError, setCurrentError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState('');

  const {speak, startListening, stopListening, cancelSpeaking, isListening} =
    useSpeech({
      onListenResult: (transcript, isFinal) => {
        setUserAnswer(transcript);
        if (isFinal) {
          stopListening();
          handleSubmit(transcript);
        }
      },
    });

  const currentQuestion = questions[currentQuestionIndex];

  const getFeedback = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) {
      setFeedback('No response detected. Please try speaking or typing again.');
      setStatus('IDLE');
      return;
    }

    setStatus('PROCESSING');
    try {
      const result = await provideFeedbackOnResponses({
        question: currentQuestion,
        response: transcript,
        role: settings.role,
        experienceLevel: settings.experienceLevel,
      });

      if (result && result.feedback) {
        setFeedback(result.feedback);
        setCurrentError('');
      } else {
        throw new Error('No feedback was generated.');
      }
    } catch (error: any) {
      console.error('Feedback error:', error);
      setFeedback(
        `Sorry, there was an error getting feedback: ${error.message}`
      );
    } finally {
      setStatus('IDLE'); // Ready for next action
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      speak('That was the last question. The interview is now complete. Great job!', onFinish);
    }
  };
  
  useEffect(() => {
    if (currentQuestion) {
      setMessages([{ sender: 'ai', text: currentQuestion }]);
      setFeedback('');
      setUserAnswer('');
      setStatus('ASKING');
    }
  }, [currentQuestion]);
  
  useEffect(() => {
    if (status === 'ASKING') {
      speak(currentQuestion, () => setStatus('IDLE'));
    }
  }, [status, currentQuestion, speak]);

  const handleStop = () => {
    cancelSpeaking();
    stopListening();
    onFinish();
  };

  const handleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      setUserAnswer('');
      startListening();
      setStatus('LISTENING');
    }
  };

  const handleSubmit = (answer: string) => {
    const trimmedAnswer = answer.trim();
    if (trimmedAnswer) {
      setMessages(prev => [...prev, {sender: 'user', text: trimmedAnswer}]);
      getFeedback(trimmedAnswer);
      setUserAnswer('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(userAnswer);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto animate-fade-in">
      {/* Left Column: Interview Chat */}
      <div className="flex flex-col h-[85vh]">
        <header className="mb-4">
          <h1 className="text-3xl font-bold capitalize">{settings.role} Interview</h1>
          <p className="text-muted-foreground">Difficulty: {settings.difficulty}</p>
        </header>

        <ScrollArea className="flex-grow pr-4 -mr-4 mb-4">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.sender === 'ai' && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-sm ${
                    message.sender === 'ai'
                      ? 'bg-secondary'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
             {isListening && (
              <div className="flex justify-end">
                <div className="rounded-lg p-3 max-w-sm bg-secondary animate-pulse">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mic className="h-4 w-4" /> Please talk...
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-auto">
           <div className="relative">
            <Textarea
              placeholder="Type your answer here or use the microphone..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-24 min-h-[60px]"
              disabled={isListening || status === 'PROCESSING'}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => speak(userAnswer)} disabled={!userAnswer}>
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleListen} className={isListening ? 'text-red-500' : ''}>
                <Mic className="h-5 w-5" />
              </Button>
              <Button size="sm" onClick={() => handleSubmit(userAnswer)} disabled={!userAnswer || isListening}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            </div>
           </div>
        </div>
      </div>

      {/* Right Column: Feedback */}
      <div className="flex flex-col gap-4">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Real-time Feedback
            </CardTitle>
            <CardDescription>AI analysis of your latest response.</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'PROCESSING' ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Analyzing...</span>
              </div>
            ) : feedback ? (
              <p>{feedback}</p>
            ) : (
              <p className="text-muted-foreground">
                Your feedback will appear here after you respond.
              </p>
            )}
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button onClick={nextQuestion} disabled={status === 'PROCESSING' || isListening || currentQuestionIndex >= questions.length - 1}>Next Question</Button>
          <Button variant="destructive" onClick={onFinish}>End Interview</Button>
        </div>
      </div>
    </div>
  );
}
