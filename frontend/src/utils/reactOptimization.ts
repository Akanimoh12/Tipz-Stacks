/**
 * React Performance Optimization Utilities
 * Helper functions and HOCs for optimizing React components
 */

import React, { memo, useCallback, useRef, useEffect, type ComponentType, useState } from 'react';

/**
 * Deep comparison for React.memo
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow comparison for React.memo
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Create memoized component with custom comparison
 */
export function createMemoComponent<P extends object>(
  Component: ComponentType<P>,
  compareFn: (prevProps: P, nextProps: P) => boolean = shallowEqual
) {
  return memo(Component, compareFn);
}

/**
 * Hook for stable callback reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook for detecting if value changed
 */
export function useChanged(value: any): boolean {
  const prevValue = usePrevious(value);
  return prevValue !== value;
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Hook for component mount status
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * Hook for lazy computation
 */
export function useLazyMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ value: T; deps: any[] }>();

  if (!ref.current || !shallowEqual(ref.current.deps, deps)) {
    ref.current = {
      value: factory(),
      deps,
    };
  }

  return ref.current.value;
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return isIntersecting;
}

/**
 * Hook for window size
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    // Legacy browsers
    else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}

/**
 * Hook for idle callback
 */
export function useIdleCallback(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback);
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 1);
      return () => clearTimeout(id);
    }
  }, deps);
}

/**
 * Higher-order component for lazy rendering
 */
export function withLazyRender<P extends object>(
  Component: ComponentType<P>,
  placeholder: React.ReactNode = null
): ComponentType<P> {
  return (props: P) => {
    const [shouldRender, setShouldRender] = useState(false);

    useIdleCallback(() => {
      setShouldRender(true);
    });

    if (!shouldRender) {
      return placeholder as React.ReactElement;
    }

    return React.createElement(Component, props);
  };
}

export default {
  deepEqual,
  shallowEqual,
  createMemoComponent,
  useStableCallback,
  usePrevious,
  useChanged,
  useDebounce,
  useThrottle,
  useIsMounted,
  useLazyMemo,
  useIntersectionObserver,
  useWindowSize,
  useMediaQuery,
  useIdleCallback,
  withLazyRender,
};
