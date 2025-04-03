
import React from 'react';
import { Button } from '@/components/ui/button';

interface CardMessageProps {
  title: string;
  description: string;
  imageUrl?: string;
  buttons?: Array<{ text: string; action: string }>;
  metadata?: Record<string, any>;
}

const CardMessage: React.FC<CardMessageProps> = ({
  title,
  description,
  imageUrl,
  buttons = [],
  metadata
}) => {
  return (
    <div className="card-message bg-white border border-gray-200 rounded-lg overflow-hidden">
      {imageUrl && (
        <div className="h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-3">
        <h4 className="font-medium text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-600 mb-3">{description}</p>
        
        {buttons.length > 0 && (
          <div className="flex flex-col gap-2">
            {buttons.map((button, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(button.action, '_blank')}
                className="text-xs justify-start"
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardMessage;
