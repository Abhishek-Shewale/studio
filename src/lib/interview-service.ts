'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface InterviewRecord {
  id?: string;
  userId: string;
  role: string;
  difficulty: string;
  date: Timestamp | Date;
  duration: number; // in minutes
  score: number; // as a percentage
  questions: {
    question: string;
    response: string;
    feedback: string;
  }[];
}

export async function saveInterview(interview: InterviewRecord) {
  try {
    const docRef = await addDoc(collection(db, 'interviewSessions'), {
      ...interview,
      date: Timestamp.fromDate(new Date()),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving interview:', error);
    throw new Error('Could not save the interview session.');
  }
}

export async function getPastInterviews(
  userId: string
): Promise<InterviewRecord[]> {
  try {
    const q = query(
      collection(db, 'interviewSessions'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const interviews: InterviewRecord[] = [];
    querySnapshot.forEach((doc) => {
      interviews.push({ id: doc.id, ...doc.data() } as InterviewRecord);
    });
    return interviews;
  } catch (error) {
    console.error('Error fetching past interviews:', error);
    throw new Error('Could not fetch past interviews.');
  }
}
