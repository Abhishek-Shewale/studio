import { SidebarLayout } from '@/app/components/sidebar-layout';

export default function NewInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
