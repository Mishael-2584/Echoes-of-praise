import { useEffect, useRef, useState } from "react";
import { getCached, setCached } from "./dataCache";

export function useCachedResource<T>(key: string, fetcher: () => Promise<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const initial = getCached<T>(key);
  const [data, setData] = useState<T | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const cached = getCached<T>(key);
    if (cached !== null) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    fetcherRef
      .current()
      .then((result) => {
        if (!alive) return;
        setCached(key, result);
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Unable to load data.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [key]);

  return { data, loading, error };
}
