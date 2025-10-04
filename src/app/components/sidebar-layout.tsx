'use client';

import * as React from 'react';
import { useState } from 'react';
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
  Loader2,
} from 'lucide-react';
import { Logo } from './logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';

// Extend Window interface for Google accounts
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          disableAutoSelect?: () => void;
        };
      };
    };
  }
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debug user data
  React.useEffect(() => {
    if (user) {
      console.log('User data:', {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        providerData: user.providerData
      });
    }
  }, [user]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Show loading for 3 seconds, then logout
    setTimeout(async () => {
      try {
        // Sign out from Firebase
        await auth.signOut();
        
        // Clear any cached authentication data
        if (typeof window !== 'undefined') {
          // Clear localStorage and sessionStorage
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear any cached Google credentials
          if (window.google && window.google.accounts && window.google.accounts.id && window.google.accounts.id.disableAutoSelect) {
            try {
              window.google.accounts.id.disableAutoSelect();
            } catch (error) {
              console.warn('Could not disable Google auto-select:', error);
            }
          }
        }
        
        // Redirect to login
        router.push('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there's an error
        router.push('/login');
      }
    }, 3000);
  };

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      href: '/new-interview',
      label: 'New Mock Interview',
      icon: ClipboardPlus,
    },
    {
      href: '/past-interviews',
      label: 'Past Mock Interviews',
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
        <SidebarFooter className="mb-5">
          <div className="flex items-center gap-3 w-full p-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {user?.photoURL ? (
                <AvatarImage 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'}
                  onError={(e) => {
                    console.log('Avatar image failed to load:', user.photoURL);
                    // Hide the image and show fallback
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.displayName?.split(' ')[0] || 'User'}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="h-6 w-6 flex-shrink-0 hover:bg-red-500/10 hover:text-red-500 active:bg-red-500/20 active:scale-95 transition-all duration-150 disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isLoggingOut ? 'Logging out...' : 'Logout'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto invert-colors">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
