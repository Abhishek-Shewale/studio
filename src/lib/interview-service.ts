'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export interface InterviewRecord {
  id?: string;
  userId: string;
  role: string;
  difficulty: string;
  date: Timestamp | Date;
  duration: number; // in minutes
  score: number; // as a percentage
  summary?: string;
  questions: {
    question: string;
    response: string;
    feedback: string;
  }[];
}

export async function saveInterview(interview: Omit<InterviewRecord, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'interviewSessions'), {
      ...interview,
      date: Timestamp.fromDate(interview.date instanceof Date ? interview.date : new Date()),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving interview:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('You do not have permission to save interview data.');
      } else if (error.message.includes('unavailable')) {
        throw new Error('Service temporarily unavailable. Please try again.');
      }
    }
    
    throw new Error('Could not save the interview session. Please try again.');
  }
}

export async function getPastInterviews(
  userId: string
): Promise<InterviewRecord[]> {
  try {
    // First, get all interviews for the user without ordering
    const q = query(
      collection(db, 'interviewSessions'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const interviews: InterviewRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convert Firestore Timestamp to Date for client components
      const interviewData = {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date
      } as InterviewRecord;
      interviews.push(interviewData);
    });
    
    // Sort by date in descending order on the client side
    interviews.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return interviews;
  } catch (error) {
    console.error('Error fetching past interviews:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('failed-precondition')) {
        throw new Error('Database configuration issue. Please try again later.');
      } else if (error.message.includes('permission-denied')) {
        throw new Error('You do not have permission to access this data.');
      } else if (error.message.includes('unavailable')) {
        throw new Error('Service temporarily unavailable. Please try again.');
      }
    }
    
    throw new Error('Could not fetch past interviews. Please try again.');
  }
}

export async function deleteInterview(interviewId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'interviewSessions', interviewId));
  } catch (error) {
    console.error('Error deleting interview:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('You do not have permission to delete this interview.');
      } else if (error.message.includes('not-found')) {
        throw new Error('Interview not found.');
      }
    }
    
    throw new Error('Could not delete the interview. Please try again.');
  }
}
