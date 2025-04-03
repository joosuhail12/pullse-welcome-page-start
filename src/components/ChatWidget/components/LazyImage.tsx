
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Use Intersection Observer to detect when image is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentImageRef = document.getElementById(`img-${src.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (currentImageRef) {
      observer.observe(currentImageRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <div id={`img-${src.replace(/[^a-zA-Z0-9]/g, '-')}`} className="relative">
      {!isLoaded && <Skeleton className={`${className} absolute inset-0`} />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
