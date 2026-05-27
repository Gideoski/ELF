'use client';

import { useState, useEffect } from 'react';

export type ToastVariant = 'default' | 'destructive';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

type ToastListener = (toasts: ToastProps[]) => void;

let toasts: ToastProps[] = [];
let listeners: ToastListener[] = [];

/**
 * Notifies all active hook instances of a state change.
 */
function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

/**
 * Global toast function to trigger notifications from anywhere in the application.
 * Accepts { title, description, variant }.
 */
export const toast = ({ title, description, variant = 'default' }: Omit<ToastProps, 'id'>) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastProps = { id, title, description, variant };
  
  toasts = [...toasts, newToast];
  notify();

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 5000);

  return id;
};

/**
 * Hook to subscribe to the module-level toast state.
 * Returns the current list of toasts and the toast trigger function.
 */
export function useToast() {
  const [activeToasts, setActiveToasts] = useState<ToastProps[]>(toasts);

  useEffect(() => {
    listeners.push(setActiveToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setActiveToasts);
    };
  }, []);

  return {
    toasts: activeToasts,
    toast,
  };
}
