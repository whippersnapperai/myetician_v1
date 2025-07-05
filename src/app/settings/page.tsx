'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { ArrowLeft } from 'lucide-react';
import SettingsForm from '@/components/settings-form';

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <SettingsForm />
        </div>
      </main>
    </div>
  );
}
