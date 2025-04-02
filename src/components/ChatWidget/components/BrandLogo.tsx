
import React from 'react';
import LazyImage from './LazyImage';

interface BrandLogoProps {
  logoUrl?: string;
}

const BrandLogo = ({ logoUrl }: BrandLogoProps) => {
  if (!logoUrl) return null;
  
  return (
    <div className="mb-5 flex justify-center">
      <LazyImage 
        src={logoUrl} 
        alt="Brand Logo" 
        className="h-12 object-contain transition-transform duration-500 hover:scale-105" 
      />
    </div>
  );
};

export default BrandLogo;
