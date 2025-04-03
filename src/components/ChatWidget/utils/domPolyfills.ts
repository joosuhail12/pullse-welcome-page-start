
/**
 * DOM Polyfills and type extensions
 * 
 * This file adds type compatibility for various DOM operations
 * that might not be fully supported in TypeScript's DOM types.
 */

// Extend Document interface with additional types
declare global {
  interface ShadowRoot extends DocumentOrShadowRoot, DocumentFragment {
    // Add missing properties from Element
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    getElementById(elementId: string): HTMLElement | null;
  }
  
  // Add extensions as needed for other interfaces if required
}

/**
 * Safe querySelector for shadow DOM or regular DOM
 * Works with both Element, Document and ShadowRoot
 */
export function safeQuerySelector<T extends Element>(
  root: Element | Document | DocumentFragment | null,
  selector: string
): T | null {
  if (!root) return null;
  return root.querySelector<T>(selector);
}

/**
 * Safe querySelectorAll for shadow DOM or regular DOM
 * Works with both Element, Document and ShadowRoot
 */
export function safeQuerySelectorAll<T extends Element>(
  root: Element | Document | DocumentFragment | null,
  selector: string
): NodeListOf<T> | T[] {
  if (!root) return [] as unknown as NodeListOf<T>;
  return root.querySelectorAll<T>(selector);
}

export default {
  safeQuerySelector,
  safeQuerySelectorAll
};
