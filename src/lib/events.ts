import { useEffect } from 'react';

export const EVENTS = {
  HOMEWORK_CHANGE: 'homework-storage-change',
  SUBMISSION_CHANGE: 'submission-storage-change',
  USER_CHANGE: 'user-storage-change',
  CLASS_CHANGE: 'class-storage-change',
  ANNOUNCEMENT_CHANGE: 'announcement-storage-change',
  FEE_CHANGE: 'fee-storage-change',
  ATTENDANCE_CHANGE: 'attendance-storage-change',
  ADMISSION_CHANGE: 'admission-storage-change',
  INQUIRY_CHANGE: 'inquiry-storage-change',
  NEWS_CHANGE: 'news-storage-change',
  EXPENSE_CHANGE: 'expense-storage-change',
  INVENTORY_CHANGE: 'inventory-storage-change',
};

// BroadcastChannel for cross-tab real-time communication
const channel = typeof window !== 'undefined' ? new BroadcastChannel('bls_lms_events') : null;

export function dispatchCustomEvent(eventName: string) {
  // Fire in current tab
  window.dispatchEvent(new Event(eventName));
  // Fire in all other open tabs too
  channel?.postMessage({ eventName });
}

export function useEventListener(eventName: string, callback: () => void) {
  useEffect(() => {
    // Listen in current tab
    window.addEventListener(eventName, callback);

    // Listen from other tabs via BroadcastChannel
    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.eventName === eventName) {
        callback();
      }
    };
    channel?.addEventListener('message', handleBroadcast);

    return () => {
      window.removeEventListener(eventName, callback);
      channel?.removeEventListener('message', handleBroadcast);
    };
  }, [eventName, callback]);
}