'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export default function PastInterviewsPage() {
  const interviews = []; // Empty for now

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
        <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No interviews found.
            </TableCell>
          </TableRow>
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
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
           <CardDescription>
            All your recorded mock interviews will be listed below.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {renderTable()}
        </CardContent>
      </Card>
    </div>
  );
}
