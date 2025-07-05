'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

export default function SupabaseWarning() {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
        <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Supabase Not Configured</AlertTitle>
            <AlertDescription>
                Your app is in offline mode. Please set up your Supabase environment variables to enable database features.
            </AlertDescription>
        </Alert>
    </div>
  );
}