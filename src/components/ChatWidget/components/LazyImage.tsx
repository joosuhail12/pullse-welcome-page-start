
import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholderColor?: string;
  className?: string;
}

const LazyImage = ({ 
  src, 
  alt, 
  fallback = '', 
  placeholderColor = '#f3f4f6',
  className = '', 
  ...props 
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Create a new image object
    const img = new Image();
    
    // Set up event handlers
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
      if (fallback) {
        setImageSrc(fallback);
      }
    };
    
    // Start loading the image
    img.src = src;
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  return (
    <>
      {!imageLoaded && !error && (
        <div 
          className={`${className} bg-gray-200 animate-pulse`}
          style={{ backgroundColor: placeholderColor }}
          aria-hidden="true"
        />
      )}
      
      {(imageLoaded || error) && (
        <img
          src={imageSrc || fallback}
          alt={alt}
          className={`${className} ${!imageLoaded ? 'hidden' : ''}`}
          {...props}
        />
      )}
    </>
  );
};

export default React.memo(LazyImage);
