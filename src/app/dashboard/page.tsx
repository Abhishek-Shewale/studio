'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowUp,
  BarChart,
  Clock,
  Briefcase,
  CheckCircle,
  BarChart2,
  List,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Interviews',
      value: '0',
      change: '+0 from last month',
      icon: <Briefcase className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Average Score',
      value: '0%',
      change: 'Up from last month',
      icon: <CheckCircle className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Average Duration',
      value: '0m',
      change: 'Compared to last month',
      icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Most Frequent Role',
      value: 'N/A',
      change: 'Based on your sessions',
      icon: <BarChart className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <p className="text-muted-foreground">
        Welcome back! Here's your interview performance at a glance.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-[300px] flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-secondary p-4">
                <BarChart2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">No data to display</p>
                <p className="text-sm text-muted-foreground">
                  Complete an interview to see your performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-secondary p-4">
                <List className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="font-semibold">No recent interviews.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
