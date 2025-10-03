'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Sparkles } from 'lucide-react';

const formSchema = z.object({
  role: z.string().min(2, {
    message: 'Job role must be at least 2 characters.',
  }),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    required_error: 'Please select a difficulty level.',
  }),
  topics: z.string().optional(),
  questionBank: z.string().optional(),
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
      role: '',
      difficulty: 'Medium',
      topics: '',
      questionBank: '',
    },
  });

  return (
    <Card className="w-full shadow-none border-0 md:border md:shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2 pt-4">
        <CardTitle className="text-xl font-bold">
          Start a New Mock Interview
        </CardTitle>
        <CardDescription className="text-sm">
          Customize your mock interview session to fit your needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-2">
        {!hasSpeechSupport && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive-foreground">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p>
              Your browser does not support the Web Speech API. Please use a
              recent version of Chrome for the full voice experience.
            </p>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onStartInterview)}
            className="space-y-3 flex-1 flex flex-col"
          >
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Job Role</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Software Engineer"
                        {...field}
                        disabled={isGenerating}
                        className="h-8"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      The position you&apos;re practicing for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Difficulty Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isGenerating}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Adjust the complexity of the questions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Specific Topics (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., React, System Design"
                        {...field}
                        disabled={isGenerating}
                        className="h-8"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Comma-separated list of topics to focus on.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionBank"
                render={({ field }) => (
                  <FormItem className="flex-1 min-h-0 flex flex-col">
                    <FormLabel className="text-sm">Question Bank (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your custom questions here, one per line."
                        className="min-h-[60px] flex-1 resize-none"
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Provide your own questions for the AI to use.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full flex-shrink-0 h-9"
              disabled={isGenerating || !hasSpeechSupport}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Starting Mock Interview...
                </>
              ) : (
                'Start Mock Interview'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
