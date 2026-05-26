
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'nimsaamsaelf@gmail.com';

/**
 * Ensures the admin user has a correctly structured document in 'users' collection.
 */
export function UserSync() {
  const { user, loading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!loading && user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      
      const updates: any = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || "Administrator",
        lastActive: serverTimestamp(),
      };

      // Always enforce admin role for the designated email
      if (user.email === SUPER_ADMIN_EMAIL) {
        updates.role = 'admin';
      } else {
        updates.role = 'user';
      }

      // Add createdAt only if it doesn't exist
      setDoc(userRef, { ...updates, createdAt: serverTimestamp() }, { merge: true }).catch((err) => {
        // Silent catch: Permissions will handle it if not logged in
      });
    }
  }, [user, loading, firestore]);

  return null;
}
