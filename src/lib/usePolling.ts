// src/lib/usePolling.ts
// Yeh hook har X seconds mein automatically data reload karta hai
// Isse teacher aur student ke beech real-time sync hoti hai

import { useEffect, useRef } from 'react';

/**
 * @param callback  - async function jo data load karti hai
 * @param interval  - kitne milliseconds mein reload (default: 5000 = 5 sec)
 * @param enabled   - polling on/off karo (default: true)
 */
export function usePolling(
  callback: () => Promise<void> | void,
  interval: number = 5000,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);

  // Latest callback save karo (stale closure se bachne ke liye)
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Turant pehli baar load karo
    callbackRef.current();

    // Phir har X seconds mein
    const timer = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, enabled]);
}