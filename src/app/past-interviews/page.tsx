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
import { ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPastInterviews, InterviewRecord } from '@/lib/interview-service';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function PastInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchInterviews() {
      try {
        const pastInterviews = await getPastInterviews(user.uid);
        // Ensure date is a JS Date object for formatting
        const formattedInterviews = pastInterviews.map(iv => ({
          ...iv,
          date: (iv.date as any).toDate ? (iv.date as any).toDate() : iv.date,
        }));
        setInterviews(formattedInterviews);
      } catch (error) {
        console.error("Failed to fetch interviews", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, [user, authLoading, router]);

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost">
              Role
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost">
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>
             <Button variant="ghost">
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
        ) : interviews.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No interviews found.
            </TableCell>
          </TableRow>
        ) : (
          interviews.map((interview) => (
            <TableRow key={interview.id}>
              <TableCell>{interview.role}</TableCell>
              <TableCell>{new Date(interview.date).toLocaleDateString()}</TableCell>
              <TableCell>{interview.duration} min</TableCell>
              <TableCell>{interview.score}%</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View Details</Button>
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
    </div>
  );
}
