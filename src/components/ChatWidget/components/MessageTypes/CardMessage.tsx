
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';
import LazyImage from '../LazyImage';
import { CardMessageData } from '../../types';

interface CardMessageProps {
  title: string;
  description: string;
  imageUrl?: string;
  buttons?: Array<{ text: string; action?: string }>;
  onClick?: (action: string) => void;
}

const CardMessage = ({ title, description, imageUrl, buttons, onClick }: CardMessageProps) => {
  // Sanitize content
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedDesc = sanitizeInput(description);
  
  return (
    <Card className="w-full max-w-xs mt-2 shadow-sm overflow-hidden">
      {imageUrl && (
        <div className="aspect-video overflow-hidden">
          <LazyImage 
            src={imageUrl}
            alt={sanitizedTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold">{sanitizedTitle}</h4>
        <p className="text-sm text-gray-600 mt-1">{sanitizedDesc}</p>
        
        {buttons && buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {buttons.map((button, i) => (
              <Button 
                key={i} 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => onClick && button.action && onClick(button.action)}
              >
                {sanitizeInput(button.text)}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(CardMessage);
