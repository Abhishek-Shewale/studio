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
import { getPastInterviews, InterviewRecord } from '@/lib/interview-service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchInterviews() {
      try {
        const pastInterviews = await getPastInterviews(user.uid);
        const formattedInterviews = pastInterviews.map((iv) => ({
          ...iv,
          date: (iv.date as any).toDate ? (iv.date as any).toDate() : iv.date,
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
      <div className="flex h-screen items-center justify-center">Loading...</div>
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


  const stats = [
    {
      title: 'Total Interviews',
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
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <p className="text-muted-foreground">
        Welcome back, {user?.displayName || 'user'}! Here's your interview
        performance at a glance.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <Card className="col-span-4 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>A summary of your last few sessions.</CardDescription>
            </div>
             <Button asChild variant="outline">
                <Link href="/past-interviews">View All</Link>
              </Button>
          </CardHeader>
          <CardContent>
            {recentInterviews.length > 0 ? (
              <ul className="space-y-4">
                {recentInterviews.map((interview) => (
                  <li key={interview.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
                    <div>
                      <p className="font-semibold">{interview.role}</p>
                      <p className="text-sm text-muted-foreground">{new Date(interview.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold">{interview.score}%</p>
                       <p className="text-sm text-muted-foreground">{interview.duration} min</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
            <div className="flex h-[200px] flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-secondary p-4">
                <List className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="font-semibold">No recent interviews.</p>
              <Button asChild>
                <Link href="/new-interview">Start Your First Interview</Link>
              </Button>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
