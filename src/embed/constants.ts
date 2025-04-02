
// Constants for the embed script

// Helper function to get data-attribute with fallback
export const getDataAttribute = (script: HTMLScriptElement, name: string, fallback: string | undefined) => {
  const attr = script.getAttribute(`data-${name}`);
  return attr !== null ? attr : fallback;
};

// Event name prefix handling
export const getFullEventName = (eventName: string) => {
  const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
  return `${eventPrefix}${eventName}`;
};
