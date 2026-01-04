/**
 * Intersection Observer Hook
 * Для lazy rendering та visibility detection
 */

import { useEffect, useState, RefObject, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    onChange,
  }: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = useCallback(
    (entries: IntersectionObserverEntry[]): void => {
      const [nextEntry] = entries;
      setEntry(nextEntry);

      if (onChange) {
        onChange(nextEntry.isIntersecting, nextEntry);
      }
    },
    [onChange]
  );

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen, updateEntry]);

  return entry;
}

/**
 * Lazy Load Hook
 * Wrapper for easier lazy loading
 */
export function useLazyLoad(
  elementRef: RefObject<Element>,
  options?: UseIntersectionObserverOptions
) {
  const entry = useIntersectionObserver(elementRef, {
    ...options,
    freezeOnceVisible: true,
  });

  return entry?.isIntersecting ?? false;
}
