
import { useMemo, useCallback } from 'react';

/**
 * Hook to help with component memoization
 * @param value The value to memoize
 * @returns The memoized value
 */
export function useMemoizedValue<T>(value: T): T {
  return useMemo(() => value, [value]);
}

/**
 * Hook to memoize callback functions
 * @param callback The callback function to memoize
 * @param deps The dependencies array
 * @returns The memoized callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

export default {
  useMemoizedValue,
  useMemoizedCallback
};
