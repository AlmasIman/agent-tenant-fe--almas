import { useRef, useCallback } from 'react';

interface UseApiCallOptions {
  deduplicate?: boolean;
  deduplicateTime?: number; // milliseconds
}

export function useApiCall<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  options: UseApiCallOptions = {}
): T {
  const { deduplicate = true, deduplicateTime = 1000 } = options;
  const callRef = useRef<{ promise: Promise<any> | null; timestamp: number }>({
    promise: null,
    timestamp: 0,
  });

  const deduplicatedApiCall = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      if (!deduplicate) {
        return apiFunction(...args);
      }

      const now = Date.now();
      
      // If there's an ongoing call and it's within the deduplicate time window
      if (callRef.current.promise && (now - callRef.current.timestamp) < deduplicateTime) {
        return callRef.current.promise as ReturnType<T>;
      }

      // Create new promise
      const promise = apiFunction(...args);
      callRef.current = {
        promise,
        timestamp: now,
      };

      try {
        const result = await promise;
        return result;
      } finally {
        // Clear the promise reference after completion
        if (callRef.current.promise === promise) {
          callRef.current.promise = null;
        }
      }
    },
    [apiFunction, deduplicate, deduplicateTime]
  ) as T;

  return deduplicatedApiCall;
}
