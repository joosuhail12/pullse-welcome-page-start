
/**
 * Create a launcher button element
 */
export function createLauncherButton(
  options: any,
  position: string,
  offsetX: number,
  offsetY: number
): HTMLDivElement {
  // Create launcher container
  const launcherElement = document.createElement('div');
  launcherElement.id = 'pullse-chat-launcher';
  launcherElement.style.position = 'fixed';
  launcherElement.style.zIndex = '9998';
  launcherElement.style.cursor = 'pointer';
  
  // Apply position
  switch (position) {
    case 'bottom-left':
      launcherElement.style.bottom = `${offsetY}px`;
      launcherElement.style.left = `${offsetX}px`;
      break;
    case 'top-right':
      launcherElement.style.top = `${offsetY}px`;
      launcherElement.style.right = `${offsetX}px`;
      break;
    case 'top-left':
      launcherElement.style.top = `${offsetY}px`;
      launcherElement.style.left = `${offsetX}px`;
      break;
    case 'bottom-right':
    default:
      launcherElement.style.bottom = `${offsetY}px`;
      launcherElement.style.right = `${offsetX}px`;
  }
  
  // Create the button
  const button = document.createElement('div');
  button.className = 'pullse-chat-button';
  button.style.width = '50px';
  button.style.height = '50px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = options.primaryColor || '#6366f1';
  button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'all 0.2s ease';
  
  // Create the icon
  const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  button.innerHTML = svgIcon;
  
  // Add hover effect
  button.onmouseover = () => {
    button.style.transform = 'scale(1.05)';
  };
  button.onmouseout = () => {
    button.style.transform = 'scale(1)';
  };
  
  launcherElement.appendChild(button);
  
  return launcherElement;
}

/**
 * Create widget container with appropriate styling
 */
export function createWidgetContainer(): HTMLDivElement {
  const containerElement = document.createElement('div');
  containerElement.id = 'pullse-chat-widget-container';
  return containerElement;
}

/**
 * Inject widget styles into document head
 */
export function injectWidgetStyles(positionStyles: string): HTMLStyleElement {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    #pullse-chat-widget-container {
      position: fixed;
      z-index: 9999;
      ${positionStyles}
    }
  `;
  document.head.appendChild(styleElement);
  return styleElement;
}
