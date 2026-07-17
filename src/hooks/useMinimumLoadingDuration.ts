import { useEffect, useRef, useState } from "react";

export function useMinimumLoadingDuration(isLoading: boolean, minMs = 750): boolean {
  const [visible, setVisible] = useState(isLoading);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      shownAt.current = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    if (shownAt.current === null) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - shownAt.current;
    const remaining = Math.max(minMs - elapsed, 0);

    const timer = setTimeout(() => {
      setVisible(false);
      shownAt.current = null;
    }, remaining);

    return () => clearTimeout(timer);
  }, [isLoading, minMs]);

  return visible;
}