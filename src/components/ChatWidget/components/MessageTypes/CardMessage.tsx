
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';

interface CardButton {
  text: string;
  action: string;
}

interface CardMessageProps {
  cardData: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons?: CardButton[];
  };
}

const CardMessage = ({ cardData }: CardMessageProps) => {
  // Sanitize card data
  const cardTitle = cardData.title ? sanitizeInput(cardData.title) : '';
  const cardDesc = cardData.description ? sanitizeInput(cardData.description) : '';
  
  return (
    <Card className="w-full max-w-xs mt-2 shadow-sm">
      {cardData.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={cardData.imageUrl} 
            alt={cardTitle} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold">{cardTitle}</h4>
        <p className="text-sm text-gray-600 mt-1">{cardDesc}</p>
        
        {cardData.buttons && cardData.buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {cardData.buttons.map((button, i) => (
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
