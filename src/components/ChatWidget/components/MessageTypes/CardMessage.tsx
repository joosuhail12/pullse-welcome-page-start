
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';

export interface CardMessageProps {
  metadata: Record<string, any>;
}

const CardMessage: React.FC<CardMessageProps> = ({ metadata }) => {
  if (!metadata || !metadata.title) return null;
  
  // Sanitize data
  const cardTitle = metadata.title ? sanitizeInput(metadata.title) : '';
  const cardDesc = metadata.description ? sanitizeInput(metadata.description) : '';
  
  return (
    <Card className="w-full max-w-xs mt-2 shadow-sm">
      {metadata.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={metadata.imageUrl} 
            alt={cardTitle} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold">{cardTitle}</h4>
        <p className="text-sm text-gray-600 mt-1">{cardDesc}</p>
        
        {metadata.buttons && metadata.buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {metadata.buttons.map((button: { text: string; action: string }, i: number) => (
              <Button 
                key={i} 
                size="sm" 
                variant="outline" 
                className="w-full"
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

export default CardMessage;
