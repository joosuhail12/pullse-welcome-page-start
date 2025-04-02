
import React from 'react';
import LazyImage from './LazyImage';

interface WelcomeImageProps {
  imageUrl?: string;
  typingComplete: boolean;
  onImageLoad: () => void;
}

const WelcomeImage = ({ imageUrl, typingComplete, onImageLoad }: WelcomeImageProps) => {
  if (!imageUrl) return null;
  
  return (
    <div 
      className={`my-4 flex justify-center overflow-hidden rounded-lg transition-all duration-700 ease-in-out`}
      style={{ 
        opacity: typingComplete ? 1 : 0,
        transform: typingComplete ? 'translateY(0)' : 'translateY(10px)',
        maxHeight: typingComplete ? '160px' : '0px',
      }}
    >
      <LazyImage 
        src={imageUrl} 
        alt="Welcome" 
        className="max-h-40 w-auto object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        onLoad={onImageLoad}
        placeholderColor="#f3f4f6"
      />
    </div>
  );
};

export default WelcomeImage;
