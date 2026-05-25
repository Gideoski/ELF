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
      
      // Sync basic profile info without overwriting existing roles
      setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        lastActive: serverTimestamp(),
      }, { merge: true }).then(() => {
        // Explicitly ensure the super admin always retains the admin role
        if (user.email === SUPER_ADMIN_EMAIL) {
          setDoc(userRef, { role: 'admin' }, { merge: true });
        }
      });
    }
  }, [user, loading, firestore]);

  return null;
}
