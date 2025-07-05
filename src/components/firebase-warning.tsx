'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

export default function FirebaseWarning() {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
        <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Firebase Not Configured</AlertTitle>
            <AlertDescription>
                Your app is in offline mode. Please add your Firebase credentials to the <code>src/lib/firebase.ts</code> file to enable database features.
            </AlertDescription>
        </Alert>
    </div>
  );
}
