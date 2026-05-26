'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'nimsaamsaelf@gmail.com';

/**
 * Global component that ensures the admin user has a corresponding
 * document in the 'users' Firestore collection.
 */
export function UserSync() {
  const { user, loading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!loading && user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      
      const updates: any = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        lastActive: serverTimestamp(),
      };

      // Always force admin role for the designated admin email
      if (user.email === SUPER_ADMIN_EMAIL) {
        updates.role = 'admin';
      }

      setDoc(userRef, updates, { merge: true }).catch(() => {
        // Silent catch for initial permission checks
      });
    }
  }, [user, loading, firestore]);

  return null;
}