import { useState, useEffect } from "react";

type FetchCountFn = () => Promise<number>;

export const useBadgeCount = (fetchCount: FetchCountFn, intervalMs = 5000) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const value = await fetchCount();
      setCount(value);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch count");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalMs);

    return () => clearInterval(interval);
  }, [fetchCount, intervalMs]);

  return { count, loading, error, refresh: fetchData };
};
