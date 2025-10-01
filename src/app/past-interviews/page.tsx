'use client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPastInterviews, deleteInterview, InterviewRecord } from '@/lib/interview-service';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type SortField = 'role' | 'date' | 'score';
type SortDirection = 'asc' | 'desc';

export default function PastInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null);
  const [deleteInterviewId, setDeleteInterviewId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
        const formattedInterviews = pastInterviews.map(iv => ({
          ...iv,
          // Firestore Timestamps need to be converted to JS Date objects.
          date: (iv.date as any).toDate ? (iv.date as any).toDate() : new Date(iv.date),
        }));
        setInterviews(formattedInterviews);
        setFilteredInterviews(formattedInterviews);
      } catch (error) {
        console.error("Failed to fetch interviews", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, [user, authLoading, router]);

  // Sort and filter interviews
  useEffect(() => {
    const sorted = [...interviews].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredInterviews(sorted);
  }, [interviews, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    try {
      await deleteInterview(interviewId);
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
      setDeleteInterviewId(null);
      toast({
        title: 'Interview Deleted',
        description: 'The interview has been successfully deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the interview. Please try again.',
      });
    }
  };

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('role')}>
              Role
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('date')}>
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>
             <Button variant="ghost" onClick={() => handleSort('score')}>
              Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : filteredInterviews.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No interviews found.
            </TableCell>
          </TableRow>
        ) : (
          filteredInterviews.map((interview) => (
            <TableRow key={interview.id}>
              <TableCell>{interview.role}</TableCell>
              <TableCell>{new Date(interview.date).toLocaleDateString()}</TableCell>
              <TableCell>{interview.duration} min</TableCell>
              <TableCell>{interview.score}%</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedInterview(interview)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteInterviewId(interview.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Past Interviews
          </h2>
          <p className="text-muted-foreground">
            Review your previous sessions to track your progress.
          </p>
        </div>
      </div>
      <div className="border rounded-lg">
        {renderTable()}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              {selectedInterview && (
                <>
                  {selectedInterview.role} Interview - {new Date(selectedInterview.date).toLocaleDateString()}
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
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
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
