import { Bot } from 'lucide-react';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex items-center gap-2" aria-label="VoiceAssessAI Logo">
      <Bot className="h-8 w-8 text-primary" />
      <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
        VoiceAssess<span className="text-primary">AI</span>
      </h1>
    </div>
  );
};
