import { useEffect, useRef } from 'react';

export const useResizeObserver = (
  target: HTMLElement | null | React.RefObject<HTMLElement | null>,
  callback: ResizeObserverCallback
) => {
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const element = target && 'current' in target ? target.current : target;

    if (!element || !(element instanceof HTMLElement)) return;

    observerRef.current = new ResizeObserver(callback);
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [target, callback]);
};