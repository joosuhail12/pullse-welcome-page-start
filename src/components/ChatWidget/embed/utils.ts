
import { EventCallback } from './types';
import { ChatPositionString } from '../types';
import { isValidChatPosition } from './core/optionsValidator';

/**
 * Debounce function for optimizing event callbacks
 */
export function debounce<F extends (...args: any[]) => void>(
  func: F, 
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get position styles based on placement
 * Ensures that position is a valid ChatPositionString
 */
export function getPositionStyles(
  position: string | undefined, 
  offsetX: number | undefined = 20, 
  offsetY: number | undefined = 20
): string {
  // Validate the position or use default
  const validPosition: ChatPositionString = (position && isValidChatPosition(position))
    ? position
    : 'bottom-right';
    
  // Apply appropriate CSS based on the position
  switch (validPosition) {
    case 'bottom-left':
      return `bottom: ${offsetY}px; left: ${offsetX}px;`;
    case 'top-right':
      return `top: ${offsetY}px; right: ${offsetX}px;`;
    case 'top-left':
      return `top: ${offsetY}px; left: ${offsetX}px;`;
    case 'bottom-right':
    default:
      return `bottom: ${offsetY}px; right: ${offsetX}px;`;
  }
}

/**
 * Load React and ReactDOM dependencies if not already loaded
 */
export function loadDependencies(): Promise<void> {
  return new Promise((resolve) => {
    // Check if React and ReactDOM are already loaded
    if (window.React && window.ReactDOM) {
      resolve();
      return;
    }

    // Load React and ReactDOM from CDN
    const reactScript = document.createElement('script');
    reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
    reactScript.crossOrigin = 'anonymous';
    
    const reactDomScript = document.createElement('script');
    reactDomScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
    reactDomScript.crossOrigin = 'anonymous';
    
    // Wait for both to load
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) resolve();
    };
    
    reactScript.onload = checkLoaded;
    reactDomScript.onload = checkLoaded;
    
    document.head.appendChild(reactScript);
    document.head.appendChild(reactDomScript);
  });
}
