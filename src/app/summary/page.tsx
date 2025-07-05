'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import WeeklySummary from '@/components/weekly-summary';
import Header from '@/components/header';
import { ArrowLeft } from 'lucide-react';

export default function SummaryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
              <CardDescription>Your calorie intake for the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklySummary />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
