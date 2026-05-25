'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
      
      // Perform a check first to avoid unnecessary writes if everything is up to date
      getDoc(userRef).then((docSnap) => {
        const data = docSnap.data();
        
        // Prepare updates
        const updates: any = {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          lastActive: serverTimestamp(),
        };

        // If the document doesn't exist or doesn't have a role, assign 'user' by default
        if (!docSnap.exists() || !data?.role) {
          updates.role = user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user';
        }

        // Always force admin role for the super admin
        if (user.email === SUPER_ADMIN_EMAIL) {
          updates.role = 'admin';
        }

        // Apply changes
        setDoc(userRef, updates, { merge: true });
      }).catch((err) => {
        // Silent catch for initial permission checks during sync
      });
    }
  }, [user, loading, firestore]);

  return null;
}