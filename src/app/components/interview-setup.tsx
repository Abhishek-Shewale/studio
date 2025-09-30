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
    <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Start a New Interview
        </CardTitle>
        <CardDescription>
          Customize your mock interview session to fit your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasSpeechSupport && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive-foreground">
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
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Software Engineer"
                      {...field}
                      disabled={isGenerating}
                    />
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isGenerating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
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
                  <FormLabel>Specific Topics (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., React, System Design"
                      {...field}
                      disabled={isGenerating}
                    />
                  </FormControl>
                  <FormDescription>
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
                <FormItem>
                  <FormLabel>Question Bank (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your custom questions here, one per line."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isGenerating}
                    />

                  </FormControl>
                  <FormDescription>
                    Provide your own questions for the AI to use.
                  </FormDescription>
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
                'Start Interview'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
