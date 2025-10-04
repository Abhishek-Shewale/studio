'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  duration: number; // in minutes
  onTimeUp?: () => void;
  className?: string;
}

export function CountdownTimer({ duration, onTimeUp, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const minutesLeft = Math.floor(timeLeft / 60);
    if (minutesLeft <= 5) return 'text-destructive';
    if (minutesLeft <= 10) return 'text-orange-500';
    return 'text-primary';
  };

  const getBackgroundColor = () => {
    const minutesLeft = Math.floor(timeLeft / 60);
    if (minutesLeft <= 5) return 'bg-destructive/10 border-destructive/20';
    if (minutesLeft <= 10) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-primary/10 border-primary/20';
  };

  const isLowTime = Math.floor(timeLeft / 60) <= 5;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300',
        getBackgroundColor(),
        className
      )}
    >
      <Clock className={cn('h-5 w-5', getTimeColor())} />
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-mono font-bold', getTimeColor())}>
            {formatTime(timeLeft)}
          </span>
          {isLowTime && (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {isLowTime ? 'Time running low!' : 'Interview in progress'}
        </span>
      </div>
    </div>
  );
}
