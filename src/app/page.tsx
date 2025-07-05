'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/use-user-data';
import Dashboard from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';

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
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-[250px] w-full rounded-lg" />
                <Skeleton className="h-[280px] w-full rounded-lg" />
              </div>
              <div className="space-y-8">
                <Skeleton className="h-[160px] w-full rounded-lg" />
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <Dashboard />;
}
