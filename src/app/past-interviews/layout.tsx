import { SidebarLayout } from '@/app/components/sidebar-layout';

export default function PastInterviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
