'use client';

import { useState, useEffect } from 'react';

interface ProgressSpinnerProps {
  duration?: number; // Duration in seconds
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  onComplete?: () => void;
}

export function ProgressSpinner({ 
  duration = 3, 
  size = 'md', 
  message = 'Loading...',
  onComplete 
}: ProgressSpinnerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const totalDuration = duration * 1000; // Convert to milliseconds
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        onComplete?.();
      }
    };
    
    requestAnimationFrame(updateProgress);
  }, [duration, onComplete]);

  const sizeClasses = {
    sm: 'w-24 h-24 text-4xl',
    md: 'w-32 h-32 text-5xl',
    lg: 'w-40 h-40 text-6xl'
  };

  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = size === 'sm' ? 36 : size === 'md' ? 48 : 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg
          className={`${sizeClasses[size]} transform -rotate-90`}
          viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-100 ease-linear"
          />
        </svg>
        {/* Progress percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-black text-primary">
            {Math.round(progress)}
          </span>
        </div>
      </div>
      {message && (
        <p className="text-muted-foreground text-lg text-center font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}
