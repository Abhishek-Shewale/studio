'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Clock,
  Briefcase,
  CheckCircle,
  List,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPastInterviews, deleteInterview, InterviewRecord } from '@/lib/interview-service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Eye, Trash2 } from 'lucide-react';
import { ProgressSpinner } from '@/components/ui/countdown-spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null);
  const [deleteInterviewId, setDeleteInterviewId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchInterviews() {
      if (!user) return;
      try {
        const pastInterviews = await getPastInterviews(user.uid);
        const formattedInterviews = pastInterviews.map((iv) => ({
          ...iv,
          date: (iv.date as any).toDate ? (iv.date as any).toDate() : new Date(iv.date as Date),
        }));
        setInterviews(formattedInterviews);
      } catch (error) {
        console.error('Failed to fetch interviews', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ProgressSpinner 
          duration={2} 
          size="lg" 
          message="Loading your dashboard..." 
        />
      </div>
    );
  }

  const totalInterviews = interviews.length;
  const averageScore =
    totalInterviews > 0
      ? Math.round(
          interviews.reduce((acc, iv) => acc + iv.score, 0) / totalInterviews
        )
      : 0;
  const averageDuration =
    totalInterviews > 0
      ? Math.round(
          interviews.reduce((acc, iv) => acc + iv.duration, 0) /
            totalInterviews
        )
      : 0;

  const roleCounts = interviews.reduce((acc, iv) => {
    acc[iv.role] = (acc[iv.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostFrequentRole = Object.keys(roleCounts).reduce(
    (a, b) => (roleCounts[a] > roleCounts[b] ? a : b),
    'N/A'
  );
  
  const recentInterviews = interviews.slice(0, 5);

  const handleDeleteInterview = async (interviewId: string) => {
    try {
      await deleteInterview(interviewId);
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
      setDeleteInterviewId(null);
      toast({
        title: 'Mock Interview Deleted',
        description: 'The interview has been successfully deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the mock interview. Please try again.',
      });
    }
  };


  const stats = [
    {
      title: 'Total Mock Interviews',
      value: totalInterviews,
      icon: <Briefcase className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Average Score',
      value: `${averageScore}%`,
      icon: <CheckCircle className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Average Duration',
      value: `${averageDuration}m`,
      icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Most Frequent Role',
      value: mostFrequentRole,
      icon: <BarChart className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {user?.displayName || 'user'}! Here's your mock interview performance at a glance.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="h-20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
            <div>
              <CardTitle className="text-lg">Recent Mock Interviews</CardTitle>
              <CardDescription className="text-xs">A summary of your last few sessions.</CardDescription>
            </div>
            {totalInterviews > 5 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/past-interviews">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-4 pb-4 h-[calc(100%-80px)] overflow-hidden">
            {recentInterviews.length > 0 ? (
              <div className="h-full overflow-y-auto">
                <ul className="space-y-0">
                  {recentInterviews.map((interview, index) => (
                    <li key={interview.id} className="flex items-center justify-between p-4 hover:bg-secondary border-b border-border last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{interview.role}</p>
                        <p className="text-xs text-muted-foreground">{(interview.date instanceof Date ? interview.date : new Date(interview.date as any)).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right mr-4 flex-shrink-0">
                        <p className="font-semibold text-sm">{interview.score}%</p>
                        <p className="text-xs text-muted-foreground">{interview.duration} min</p>
                      </div>
                      <div className="flex gap-4 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedInterview(interview)}
                          className="h-7 w-7 p-0"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDeleteInterviewId(interview.id!)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Mock Interview"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
                <div className="rounded-full bg-secondary p-3">
                  <List className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-sm">No recent mock interviews.</p>
                <Button asChild size="sm">
                  <Link href="/new-interview">Start Your First Mock Interview</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mock Interview Details</DialogTitle>
            <DialogDescription>
              {selectedInterview && (
                <>
                  {selectedInterview.role} Mock Interview - {(selectedInterview.date instanceof Date ? selectedInterview.date : new Date(selectedInterview.date as any)).toLocaleDateString()}
                  <br />
                  Score: {selectedInterview.score}% | Duration: {selectedInterview.duration} minutes
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-6">
              {selectedInterview.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{selectedInterview.summary}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-4">Q&A Session</h3>
                <div className="space-y-4">
                  {selectedInterview.questions.map((qa, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Question {index + 1}</h4>
                        <p className="text-sm">{qa.question}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Your Response</h4>
                        <p className="text-sm">{qa.response}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Feedback</h4>
                        <p className="text-sm">{qa.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteInterviewId} onOpenChange={() => setDeleteInterviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mock Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mock interview? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteInterviewId && handleDeleteInterview(deleteInterviewId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
