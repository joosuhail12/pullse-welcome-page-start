
import { useMemo, useCallback, useRef, DependencyList } from 'react';

/**
 * Hook to memoize a value with deep comparison
 * @param value The value to memoize
 * @returns The memoized value
 */
export function useMemoizedValue<T>(value: T): T {
  const ref = useRef<T>(value);
  
  // Only update the ref if the value has changed
  // This provides a more efficient comparison than useMemo for complex objects
  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return useMemo(() => ref.current, [ref.current]);
}

/**
 * Hook to memoize callback functions with dependency array
 * @param callback The callback function to memoize
 * @param deps The dependencies array
 * @returns The memoized callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  // Use useCallback for function memoization
  return useCallback(callback, deps);
}

/**
 * Hook to create a stable reference that only changes when deep content changes
 * Useful for objects that should maintain reference equality
 * @param value The object to stabilize
 * @returns A stable reference to the object
 */
export function useStableObject<T extends object>(value: T): T {
  const stringified = JSON.stringify(value);
  return useMemo(() => JSON.parse(stringified), [stringified]);
}

export default {
  useMemoizedValue,
  useMemoizedCallback,
  useStableObject
};
