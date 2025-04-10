
import { createLauncherButton } from './ui-components';
import { getPositionStyles } from './utils';

/**
 * Initialize lazy loading via scroll with Intersection Observer
 */
export function initLazyLoadViaScroll(
  options: any,
  loadFullWidget: (config: any) => void,
  createContainer: () => void
): IntersectionObserver {
  // Create the launcher button first for immediate interaction
  const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = options;
  const launcherElement = createLauncherButton(options, position, offsetX, offsetY);

  // Add click handler to load full widget
  const button = launcherElement.querySelector('.pullse-chat-button');
  if (button) {
    button.addEventListener('click', () => {
      createContainer();
      const config = prepareWidgetConfig(options, position, offsetX, offsetY);
      loadFullWidget(config);
      launcherElement.style.display = 'none';
    });
  }

  document.body.appendChild(launcherElement);

  // Create a sentinel element for the observer
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  sentinel.style.width = '1px';
  sentinel.style.position = 'absolute';
  sentinel.style.visibility = 'hidden';

  // Position the sentinel near the bottom of the page
  const scrollThreshold = options.scrollThreshold || 0.7; // Default 70% down the page
  sentinel.style.top = (window.innerHeight * scrollThreshold) + 'px';

  document.body.appendChild(sentinel);

  // Use Intersection Observer to detect when user scrolls to the sentinel
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // User has scrolled to the threshold, load the widget
      createContainer();
      const config = prepareWidgetConfig(options, position, offsetX, offsetY);
      loadFullWidget(config);

      // Stop observing
      observer.disconnect();

      // Remove sentinel
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }

      // Hide launcher button
      if (launcherElement) {
        launcherElement.style.display = 'none';
      }
    }
  }, {
    threshold: 0.1 // Trigger when 10% visible
  });

  // Start observing
  observer.observe(sentinel);

  return observer;
}

/**
 * Prepare widget configuration from options
 */
export function prepareWidgetConfig(
  options: any,
  position: string = 'bottom-right',
  offsetX: number = 20,
  offsetY: number = 20
): any {
  // Create position configuration from options
  const positionConfig = {
    placement: position,
    offsetX: offsetX / 16, // Convert px to rem
    offsetY: offsetY / 16  // Convert px to rem
  };

  // Create branding configuration
  const branding = {
    primaryColor: options.primaryColor,
    logoUrl: options.logoUrl,
    avatarUrl: options.avatarUrl,
    widgetTitle: options.widgetTitle,
    showBrandingBar: !options.hideBranding
  };

  // Create full config object with version for cache busting
  return {
    workspaceId: options.workspaceId,
    welcomeMessage: options.labels.welcomeTitle,
    branding: branding,
    position: positionConfig,
    autoOpen: options.autoOpen,
    eventHandlers: options.eventHandlers,
    version: `1.0.${Date.now()}` // Add version stamp for cache busting
  };
}
