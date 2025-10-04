'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
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
  MicOff,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';
import {CountdownTimer} from '@/components/ui/countdown-timer';

interface InterviewSessionProps {
  settings: InterviewSetupData;
  questions: string[];
  onFinish: (sessionData: any[]) => void;
  resumeData?: any;
}

// Generate dynamic introductory questions based on resume data
const generateIntroductoryQuestions = (resumeData?: any): string[] => {
  if (!resumeData) {
    // Default questions if no resume data
    return [
      "Please introduce yourself and tell us a bit about your background.",
      "Tell us about a recent project or assignment you worked on.",
      "How do you usually approach learning a new technology or tool?",
      "What motivates you in your career, and where do you see yourself in the next few years?",
      "What do you enjoy most about working in this field?"
    ];
  }

  const { skills, experience, summary, jobRole } = resumeData;
  const questions: string[] = [];

  // Always start with introduction
  questions.push("Please introduce yourself and tell us a bit about your background.");

  // Question based on recent experience
  if (experience && experience.length > 0) {
    const recentJob = experience[0];
    questions.push(`Tell us about your role as ${recentJob.title} at ${recentJob.company}. What were your main responsibilities and achievements?`);
  } else {
    questions.push("Tell us about a recent project or assignment you worked on.");
  }

  // Question based on skills
  if (skills && skills.length > 0) {
    const primarySkills = skills.slice(0, 3).join(', ');
    questions.push(`I see you have experience with ${primarySkills}. Can you walk me through a project where you used these technologies?`);
  } else {
    questions.push("How do you usually approach learning a new technology or tool?");
  }

  // Question based on job role
  if (jobRole) {
    questions.push(`What drew you to the ${jobRole} field, and what aspects of this role excite you most?`);
  } else {
    questions.push("What motivates you in your career, and where do you see yourself in the next few years?");
  }

  // Question based on summary or general
  if (summary) {
    questions.push("Based on your experience, what do you think are the most important qualities for success in your field?");
  } else {
    questions.push("What do you enjoy most about working in this field?");
  }

  return questions;
};

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
  resumeData,
}: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [goodPoints, setGoodPoints] = useState<string[]>([]);
  const [confidentPoints, setConfidentPoints] = useState<string[]>([]);
  const [improvementPoints, setImprovementPoints] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAskedQuestionRef = useRef(false);
  const [showListeningIndicator, setShowListeningIndicator] = useState(false);
  
  // Auto-resize textarea function
  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height (min 60px, max 200px to prevent overlap)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);
  
  // Generate dynamic introductory questions based on resume data
  const introductoryQuestions = generateIntroductoryQuestions(resumeData);
  // Combine introductory questions with technical questions
  const allQuestions = [...introductoryQuestions, ...questions];

  const {speak, startListening, stopListening, cancelSpeaking, isListening, isSpeaking} =
    useSpeech({
      onListenResult: (transcript, isFinal) => {
        // Only update the answer if we're not processing feedback
        if (status !== 'PROCESSING') {
          setUserAnswer(transcript);
          // Auto-resize after speech recognition updates
          setTimeout(autoResizeTextarea, 0);
        }
        // Don't auto-submit on final - let user control when to submit
        // if (isFinal) {
        //   stopListening();
        //   handleSubmit(transcript);
        // }
      },
    });

  const currentQuestion = allQuestions[currentQuestionIndex];

  const getFeedback = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) {
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
      
      const newGoodPoints = result?.goodPoints || [];
      const newConfidentPoints = result?.confidentPoints || [];
      const newImprovementPoints = result?.improvementPoints || [];
      
      setGoodPoints(newGoodPoints);
      setConfidentPoints(newConfidentPoints);
      setImprovementPoints(newImprovementPoints);
      
      setSessionHistory(prev => [...prev, {
        question: currentQuestion,
        response: transcript,
        feedback: `Good Points: ${newGoodPoints.join(', ')} | Confident Points: ${newConfidentPoints.join(', ')} | Improvement Points: ${newImprovementPoints.join(', ')}`,
      }]);

    } catch (error: any) {
      console.error('Feedback error:', error);
      const errorMessage = `Sorry, there was an error getting feedback: ${error.message}`;
      setGoodPoints([]);
      setConfidentPoints([]);
      setImprovementPoints([]);
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
      // Stop any ongoing speech recognition and clear the input
      stopListening();
      cancelSpeaking(); // Also cancel any ongoing speech
      setUserAnswer('');
      
      // Clear previous feedback
      setGoodPoints([]);
      setConfidentPoints([]);
      setImprovementPoints([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '60px';
      }
      
      // If user has an answer but hasn't submitted it, save it as skipped
      if (userAnswer.trim()) {
        setSessionHistory(prev => [...prev, {
          question: currentQuestion,
          response: userAnswer.trim(),
          feedback: 'Question skipped by user',
        }]);
      }
      
      // Add a small delay to ensure speech recognition is properly stopped
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        hasAskedQuestionRef.current = false;
      }, 200);
    } else {
      speak('That was the last question. The interview is now complete. Great job!', () => onFinish(sessionHistory));
    }
  };
  
  useEffect(() => {
    if (currentQuestion && !hasAskedQuestionRef.current) {
      hasAskedQuestionRef.current = true;
      setMessages([{ sender: 'ai', text: currentQuestion }]);
      setUserAnswer('');
      // Clear previous feedback when new question starts
      setGoodPoints([]);
      setConfidentPoints([]);
      setImprovementPoints([]);
      setStatus('ASKING');
    }
  }, [currentQuestion]);
  
  useEffect(() => {
    if (status === 'ASKING') {
      speak(currentQuestion, () => {
        setStatus('IDLE');
        // Automatically start listening after AI finishes asking the question
        setUserAnswer('');
        // Add a small delay to ensure speech recognition is properly stopped
        setTimeout(() => {
          startListening();
          setStatus('LISTENING');
          // Show listening indicator after 5 seconds
          setTimeout(() => {
            setShowListeningIndicator(true);
          }, 5000);
        }, 100);
      });
    }
  }, [status, currentQuestion, speak, startListening]);

  // Reset listening indicator when question changes
  useEffect(() => {
    setShowListeningIndicator(false);
  }, [currentQuestion]);


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
      // Stop listening immediately when user submits
      stopListening();
      setStatus('PROCESSING');
      
      setMessages(prev => [...prev, {sender: 'user', text: trimmedAnswer}]);
      getFeedback(trimmedAnswer);
      setUserAnswer('');
      // Reset textarea height after clearing
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '60px';
        }
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserAnswer(e.target.value);
    // Auto-resize after state update
    setTimeout(autoResizeTextarea, 0);
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
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto animate-fade-in h-full">
      {/* Left Column: Interview Chat */}
      <div className="flex flex-col h-full">
        <header className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold capitalize">{settings.role} Mock Interview</h1>
            <CountdownTimer 
              duration={30} 
              onTimeUp={() => {
                // Auto-end interview when time is up
                handleEndInterview();
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Difficulty: {settings.difficulty}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {allQuestions.length}
              </span>
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ 
                    width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
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
             {isListening && showListeningIndicator && status !== 'ASKING' && status !== 'PROCESSING' && !isSpeaking && (
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
              ref={textareaRef}
              placeholder={status === 'ASKING' || isSpeaking ? "Please wait for the question to finish..." : "Type your answer here or speak (mic is active)..."}
              value={userAnswer}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className="pr-24 min-h-[60px] max-h-[200px] resize-none overflow-y-auto"
              disabled={status === 'ASKING' || status === 'PROCESSING' || isSpeaking}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleListen} 
                className={isListening ? 'text-red-500' : 'text-muted-foreground'}
                disabled={status === 'ASKING' || status === 'PROCESSING' || isSpeaking}
                title={status === 'ASKING' || isSpeaking ? 'Wait for question to finish' : isListening ? 'Click to stop recording' : 'Click to start recording'}
              >
                {isListening ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
              <Button size="sm" onClick={() => handleSubmit(userAnswer)} disabled={!userAnswer || status === 'ASKING' || isSpeaking}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            </div>
           </div>
        </div>
      </div>

      {/* Right Column: Feedback */}
      <div className="flex flex-col h-full">
        <Card className="h-[570px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="text-primary" /> Real-time Feedback
            </CardTitle>
            <CardDescription className="text-sm">AI analysis of your latest response.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-4 min-h-0">
            {status === 'PROCESSING' ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground h-full">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Analyzing...</span>
              </div>
            ) : (goodPoints.length > 0 || confidentPoints.length > 0 || improvementPoints.length > 0) ? (
              <div className="space-y-4 min-h-0">
                {/* Good Points Section */}
                {goodPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600">You are good at -</h4>
                    <ul className="space-y-1">
                      {goodPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confident Points Section */}
                {confidentPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-600">You are confident at -</h4>
                    <ul className="space-y-1">
                      {confidentPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Points Section */}
                {improvementPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-600">Improvement areas -</h4>
                    <ul className="space-y-1">
                      {improvementPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center text-sm">
                  Your feedback will appear here after you respond.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex mt-4 gap-4 flex-shrink-0">
          <Button onClick={nextQuestion} disabled={status === 'PROCESSING' || isSpeaking || isLastQuestion} size="sm">
            {isLastQuestion ? 'Complete Interview' : `Next Question`}
          </Button>
          <Button variant="destructive" onClick={handleEndInterview} size="sm">End Mock Interview</Button>
        </div>
      </div>
    </div>
  );
}
