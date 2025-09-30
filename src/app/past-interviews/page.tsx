'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { List } from 'lucide-react';
import Link from 'next/link';

export default function PastInterviewsPage() {
  const interviews = []; // Empty for now

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Past Interviews
          </h2>
          <p className="text-muted-foreground">
            Review your previous interview sessions.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Data will be mapped here */}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-secondary p-4">
                <List className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">No interviews yet</p>
                <p className="text-sm text-muted-foreground">
                  Your past interviews will appear here.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/new-interview">Start Your First Interview</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
