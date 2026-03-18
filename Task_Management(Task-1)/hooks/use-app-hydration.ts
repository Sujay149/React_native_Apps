import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/use-app-store';

export function useAppHydration() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist v4+ exposes onFinishHydration and hasHydrated
    let unsub: (() => void) | undefined;
    const store = useAppStore;
    // Try onFinishHydration if available
    if (store.persist && typeof store.persist.onFinishHydration === 'function') {
      unsub = store.persist.onFinishHydration(() => setHasHydrated(true));
      // If already hydrated, set immediately
      if (typeof store.persist.hasHydrated === 'function' && store.persist.hasHydrated()) {
        setHasHydrated(true);
      }
    } else {
      // Fallback: subscribe to a hydration flag if present
      unsub = store.subscribe(
        (state) => (state as any)._hasHydrated,
        (hydrated) => {
          if (hydrated) setHasHydrated(true);
        }
      );
      if ((store.getState() as any)._hasHydrated) {
        setHasHydrated(true);
      }
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { hasHydrated };
}
