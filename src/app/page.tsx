'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/use-user-data';
import Dashboard from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { userData, loading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userData?.user_caloric_goal) {
      router.push('/onboarding');
    }
  }, [userData, loading, router]);

  if (loading || !userData?.user_caloric_goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
