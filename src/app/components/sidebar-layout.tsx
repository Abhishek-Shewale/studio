'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  ClipboardPlus,
  History,
  LogOut,
} from 'lucide-react';
import { Logo } from './logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      href: '/new-interview',
      label: 'New Interview',
      icon: ClipboardPlus,
    },
    {
      href: '/past-interviews',
      label: 'Past Interviews',
      icon: History,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can go here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User'}/>
                  ) : (
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  )}
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="invert-colors">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
