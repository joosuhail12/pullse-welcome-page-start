
/**
 * React Integration Example for Pullse Chat Widget
 * 
 * This example demonstrates how to integrate the Pullse Chat Widget
 * into a React application.
 */

import React, { useEffect, useRef } from 'react';

/**
 * PullseChat component for React applications
 */
function PullseChat({
  workspaceId,
  primaryColor,
  position = 'bottom-right',
  offsetX,
  offsetY,
  welcomeMessage,
  autoOpen,
  hideBranding,
  onReady,
  onMessageSent,
  onMessageReceived,
  onOpen,
  onClose,
  userData
}) {
  const initialized = useRef(false);
  
  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    
    // Load the Pullse script
    const script = document.createElement('script');
    script.src = "https://cdn.pullse.io/embed.js";
    script.async = true;
    script.onload = () => {
      if (!window.Pullse) {
        console.error('Failed to load Pullse Chat Widget');
        return;
      }
      
      // Initialize the widget
      window.Pullse.chat('init', {
        workspaceId,
        primaryColor,
        position,
        offsetX,
        offsetY,
        welcomeMessage,
        autoOpen,
        hideBranding
      });
      
      // Set user data if provided
      if (userData) {
        window.Pullse.chat('setUser', userData);
      }
      
      // Register event handlers
      if (onReady) {
        window.Pullse.chat('on', 'ready', onReady);
      }
      
      if (onMessageSent) {
        window.Pullse.chat('on', 'chat:messageSent', onMessageSent);
      }
      
      if (onMessageReceived) {
        window.Pullse.chat('on', 'chat:messageReceived', onMessageReceived);
      }
      
      if (onOpen) {
        window.Pullse.chat('on', 'chat:open', onOpen);
      }
      
      if (onClose) {
        window.Pullse.chat('on', 'chat:close', onClose);
      }
      
      initialized.current = true;
    };
    
    document.body.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      // Clean up event handlers
      if (window.Pullse && window.Pullse.chat) {
        if (onReady) window.Pullse.chat('off', 'ready', onReady);
        if (onMessageSent) window.Pullse.chat('off', 'chat:messageSent', onMessageSent);
        if (onMessageReceived) window.Pullse.chat('off', 'chat:messageReceived', onMessageReceived);
        if (onOpen) window.Pullse.chat('off', 'chat:open', onOpen);
        if (onClose) window.Pullse.chat('off', 'chat:close', onClose);
      }
    };
  }, [workspaceId]); // Only re-run if workspaceId changes
  
  // Update user data when it changes
  useEffect(() => {
    if (initialized.current && userData && window.Pullse) {
      window.Pullse.chat('setUser', userData);
    }
  }, [userData]);
  
  // This component doesn't render anything
  return null;
}

export default PullseChat;

// Usage example:
// 
// import PullseChat from './PullseChat';
// 
// function App() {
//   return (
//     <div className="App">
//       <h1>My React App</h1>
//       <PullseChat
//         workspaceId="your-workspace-id"
//         primaryColor="#4F46E5"
//         autoOpen={false}
//         userData={{
//           name: "John Doe",
//           email: "john@example.com",
//           id: "user-123"
//         }}
//         onMessageSent={(event) => console.log('Message sent:', event)}
//       />
//     </div>
//   );
// }
