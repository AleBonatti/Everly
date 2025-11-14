'use client';

import toast from 'react-hot-toast';

/**
 * Custom hook for displaying toast notifications
 * Wraps react-hot-toast with custom styling and options
 */
export function useToast() {
  return {
    success: (message: string) => {
      toast.success(message);
    },
    error: (message: string) => {
      toast.error(message);
    },
    loading: (message: string) => {
      return toast.loading(message);
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId);
    },
  };
}
