
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
      
      const role = user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user';

      const data = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || "User",
        role: role,
        lastActive: serverTimestamp(),
      };

      // Set user document and merge
      setDoc(userRef, { ...data, createdAt: serverTimestamp() }, { merge: true }).catch((err) => {
        // Silent catch: Security rules for nimsaamsaelf@gmail.com should allow this
      });
    }
  }, [user, loading, firestore]);

  return null;
}
