'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/app/components/logo';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        router.push('/dashboard');
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  if (user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue your interview prep.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signInWithGoogle} className="w-full">
            Sign In with Google
          </Button>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Your journey to interview success starts here.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
