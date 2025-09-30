'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Code, BrainCircuit, Sparkles, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  role: z.enum(['SDLC Engineer', 'AI Engineer'], {
    required_error: 'Please select a role.',
  }),
  experienceLevel: z.enum(['Entry-level', 'Mid-level', 'Senior-level'], {
    required_error: 'Please select an experience level.',
  }),
  numberOfQuestions: z.number().min(10).max(20),
});

export type InterviewSetupData = z.infer<typeof formSchema>;

interface InterviewSetupProps {
  onStartInterview: (data: InterviewSetupData) => void;
  isGenerating: boolean;
  hasSpeechSupport: boolean;
}

export function InterviewSetup({
  onStartInterview,
  isGenerating,
  hasSpeechSupport,
}: InterviewSetupProps) {
  const form = useForm<InterviewSetupData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'SDLC Engineer',
      experienceLevel: 'Mid-level',
      numberOfQuestions: 10,
    },
  });

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          Interview Setup
        </CardTitle>
        <CardDescription className="text-center pt-2">
          Configure your mock interview session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasSpeechSupport && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>
              Your browser does not support the Web Speech API. Please use a
              recent version of Chrome for the full voice experience.
            </p>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onStartInterview)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isGenerating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SDLC Engineer">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <span>SDLC Engineer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="AI Engineer">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4" />
                          <span>AI Engineer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isGenerating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Entry-level">Entry-level</SelectItem>
                      <SelectItem value="Mid-level">Mid-level</SelectItem>
                      <SelectItem value="Senior-level">Senior-level</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of Questions: {field.value}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={10}
                      max={20}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      disabled={isGenerating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isGenerating || !hasSpeechSupport}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Interview
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
