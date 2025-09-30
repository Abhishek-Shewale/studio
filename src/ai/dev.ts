'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/provide-feedback-on-responses.ts';
import '@/ai/flows/score-interview.ts';
