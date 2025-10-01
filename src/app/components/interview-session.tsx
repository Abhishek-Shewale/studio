'use client';

import {useState, useEffect, useRef} from 'react';
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
} from 'lucide-react';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';

interface InterviewSessionProps {
  settings: InterviewSetupData;
  questions: string[];
  onFinish: (sessionData: any[]) => void;
}

// Introductory questions that will be asked at the start of every interview
const INTRODUCTORY_QUESTIONS = [
  "Please introduce yourself and tell us a bit about your background.",
  "Tell us about a recent project or assignment you worked on.",
  "How do you usually approach learning a new technology or tool?",
  "What motivates you in your career, and where do you see yourself in the next few years?",
  "What do you enjoy most about working in this field?"
];

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

type SessionRecord = {
  question: string;
  response: string;
  feedback: string;
}

export function InterviewSession({
  settings,
  questions,
  onFinish,
}: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [feedback, setFeedback] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  
  // Combine introductory questions with technical questions
  const allQuestions = [...INTRODUCTORY_QUESTIONS, ...questions];

  const {speak, startListening, stopListening, cancelSpeaking, isListening, isSpeaking} =
    useSpeech({
      onListenResult: (transcript, isFinal) => {
        setUserAnswer(transcript);
        if (isFinal) {
          stopListening();
          handleSubmit(transcript);
        }
      },
    });

  const currentQuestion = allQuestions[currentQuestionIndex];

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
        experienceLevel: settings.difficulty,
      });
      
      const newFeedback = result?.feedback || 'No feedback was generated.';
      setFeedback(newFeedback);
      setSessionHistory(prev => [...prev, {
        question: currentQuestion,
        response: transcript,
        feedback: newFeedback,
      }]);

    } catch (error: any) {
      console.error('Feedback error:', error);
      const errorMessage = `Sorry, there was an error getting feedback: ${error.message}`;
      setFeedback(errorMessage);
       setSessionHistory(prev => [...prev, {
        question: currentQuestion,
        response: transcript,
        feedback: errorMessage,
      }]);
    } finally {
      setStatus('IDLE'); // Ready for next action
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      speak('That was the last question. The interview is now complete. Great job!', () => onFinish(sessionHistory));
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
      speak(currentQuestion, () => {
        setStatus('IDLE');
        // Automatically start listening after AI finishes asking the question
        setUserAnswer('');
        startListening();
        setStatus('LISTENING');
      });
    }
  }, [status, currentQuestion, speak, startListening]);


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

  const handleEndInterview = () => {
    cancelSpeaking();
    stopListening();
    onFinish(sessionHistory);
  };
  
  const isLastQuestion = currentQuestionIndex >= allQuestions.length - 1;

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
                  className={`rounded-lg p-3 ${
                    message.sender === 'ai'
                      ? 'bg-secondary max-w-2xl'
                      : 'bg-primary text-primary-foreground max-w-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p>{message.text}</p>
                    {message.sender === 'ai' && isSpeaking && (
                      <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                    )}
                  </div>
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
      <div className="flex flex-col">
        <Card className="h-[526px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Real-time Feedback
            </CardTitle>
            <CardDescription>AI analysis of your latest response.</CardDescription>
          </CardHeader>
          <CardContent className="h-full overflow-y-auto">
            {status === 'PROCESSING' ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground h-full">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Analyzing...</span>
              </div>
            ) : feedback ? (
              <p className="leading-relaxed">{feedback}</p>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  Your feedback will appear here after you respond.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex mt-4 gap-4">
          <Button onClick={nextQuestion} disabled={status === 'PROCESSING' || isListening || isLastQuestion}>Next Question</Button>
          <Button variant="destructive" onClick={handleEndInterview}>End Interview</Button>
        </div>
      </div>
    </div>
  );
}
