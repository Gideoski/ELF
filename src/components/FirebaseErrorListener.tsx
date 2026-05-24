'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-mapping';

export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      toast({
        variant: "destructive",
        title: "Access Restricted",
        description: getErrorMessage(error) || "You don't have permission to perform this action.",
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
