
import React from 'react';

const PoweredByBar: React.FC = () => {
  return (
    <div className="border-t border-gray-100 py-2 px-3 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-1 text-xs text-gray-500">
      <span>Powered by</span>
      <img 
        src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" 
        alt="Pullse Logo" 
        className="h-4 w-auto"
      />
      <span className="font-medium">Pullse</span>
    </div>
  );
};

export default PoweredByBar;
