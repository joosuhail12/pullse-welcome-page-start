
import React from 'react';

interface WidgetFooterProps {
  showBrandingBar?: boolean;
}

const WidgetFooter: React.FC<WidgetFooterProps> = ({ showBrandingBar }) => {
  if (!showBrandingBar) return null;
  
  return (
    <div className="mt-auto border-t border-gray-100 p-2 flex items-center justify-center gap-1 text-xs text-gray-400">
      <span>Powered by</span>
      <img 
        src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" 
        alt="Pullse Logo" 
        className="h-4 w-auto"
      />
      <span>Pullse</span>
    </div>
  );
};

export default WidgetFooter;
