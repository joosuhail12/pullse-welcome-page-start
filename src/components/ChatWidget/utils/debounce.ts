
// Create a debounced function that delays invoking the provided function
// until after wait milliseconds have elapsed since the last time it was invoked
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: number | undefined;
  
  const debounced = function(...args: Parameters<T>) {
    const later = () => {
      timeout = undefined;
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
  
  debounced.cancel = function() {
    clearTimeout(timeout);
  };
  
  return debounced;
}
