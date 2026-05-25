'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'gideonjackbara@gmail.com';

/**
 * Global component that ensures every authenticated user has a corresponding
 * document in the 'users' Firestore collection for management purposes.
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

      // Always force admin role for the super admin
      if (user.email === SUPER_ADMIN_EMAIL) {
        updates.role = 'admin';
      }

      // We use setDoc with merge: true to ensure the record exists 
      // without overwriting non-conflicting fields like custom roles.
      setDoc(userRef, updates, { merge: true }).catch(() => {
        // Silent catch for initial permission checks
      });
    }
  }, [user, loading, firestore]);

  return null;
}
