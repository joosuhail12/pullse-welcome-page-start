
import { WidgetConfig } from './types';

export function createLauncherButton(config: WidgetConfig, loadWidgetCallback: () => void): HTMLButtonElement {
  const launcherButton = document.createElement('button');
  launcherButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  launcherButton.className = 'chat-widget-launcher';
  
  // Create button style
  const buttonStyle = `
    position: fixed;
    ${config.position === 'bottom-left' || config.position === 'top-left' ? 'left: 20px;' : 'right: 20px;'}
    ${config.position === 'top-left' || config.position === 'top-right' ? 'top: 20px;' : 'bottom: 20px;'}
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: ${config.branding.primaryColor || '#6366f1'};
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  `;
  
  launcherButton.setAttribute('style', buttonStyle);
  
  // Add hover effect
  launcherButton.addEventListener('mouseover', () => {
    launcherButton.setAttribute('style', buttonStyle + 'transform: scale(1.05);');
  });
  
  launcherButton.addEventListener('mouseout', () => {
    launcherButton.setAttribute('style', buttonStyle);
  });
  
  // Add click handler to load the widget
  launcherButton.addEventListener('click', () => {
    loadWidgetCallback();
    document.body.removeChild(launcherButton);
  });
  
  return launcherButton;
}
