'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to detect and warn about unsaved changes
 * @param hasChanges - Whether there are unsaved changes
 * @param onClose - Optional callback to execute before closing
 * @returns Object with confirmClose function
 */
export function useUnsavedChanges(hasChanges: boolean, onClose?: () => void) {
  const hasChangesRef = useRef(hasChanges);

  // Update ref when hasChanges changes
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  // Warn before closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault();
        // Modern browsers ignore the custom message, but setting returnValue is required
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Function to confirm before closing modal/form
  const confirmClose = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close this form?'
      );
      if (confirmed && onClose) {
        onClose();
      }
      return confirmed;
    }

    if (onClose) {
      onClose();
    }
    return true;
  }, [hasChanges, onClose]);

  return { confirmClose };
}
