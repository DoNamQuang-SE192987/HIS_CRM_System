"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores";

interface Result<T> {
  key: string;
  data?: T;
  error?: unknown;
}

/**
 * Loads data from the API on the client.
 * - waits until the saved role is restored (so the first call already sends the right X-User-Role)
 * - re-runs when `deps` or the role change, and on `reload()`
 * - keeps the previous `data` while a new request is in flight (no flicker when paging / filtering)
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: readonly unknown[]) {
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  const key = JSON.stringify([role, reloadCount, ...deps]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    fetcher().then(
      (data) => active && setResult({ key, data }),
      (error: unknown) => active && setResult({ key, error }),
    );
    return () => {
      active = false;
    };
    // `key` captures role + deps + reload; `fetcher` is a fresh closure every render on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hydrated]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const settled = result?.key === key;

  return {
    data: result?.data,
    error: settled ? result?.error : undefined,
    loading: !settled,
    reload,
  };
}
