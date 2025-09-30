import { BrainCircuit } from 'lucide-react';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex items-center gap-2" aria-label="ProPrep AI Logo">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
        ProPrep<span className="text-primary">AI</span>
      </h1>
    </div>
  );
};
