
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export interface CardMessageProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  metadata?: Record<string, any>;
}

const CardMessage: React.FC<CardMessageProps> = ({ 
  title, 
  description, 
  imageUrl, 
  buttonText, 
  buttonUrl,
  metadata
}) => {
  // Use provided values or extract from metadata if not directly provided
  const cardTitle = title || metadata?.title;
  const cardDescription = description || metadata?.description;
  const cardImageUrl = imageUrl || metadata?.imageUrl;
  const cardButtonText = buttonText || metadata?.buttonText || 'Learn More';
  const cardButtonUrl = buttonUrl || metadata?.buttonUrl || '#';

  return (
    <div className="rounded-md overflow-hidden border border-gray-200 w-full max-w-[300px]">
      {cardImageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={cardImageUrl} 
            alt={cardTitle || 'Card'} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-3">
        {cardTitle && (
          <h4 className="font-medium text-sm mb-1">{cardTitle}</h4>
        )}
        
        {cardDescription && (
          <p className="text-xs text-gray-600 mb-3">{cardDescription}</p>
        )}
        
        {cardButtonUrl && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8"
            onClick={() => window.open(cardButtonUrl, '_blank', 'noopener,noreferrer')}
          >
            {cardButtonText} <ExternalLink className="ml-1" size={12} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CardMessage;
