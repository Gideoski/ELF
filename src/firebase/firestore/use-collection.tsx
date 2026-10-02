'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // Reset state if query is null
    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...(doc.data() as any),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        // Detailed error logging for developers
        console.error("Firestore useCollection Hook Error:", err);
        
        // Emit rich error for permission issues
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'collection', // SDK query objects don't always expose path easily
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }

        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
