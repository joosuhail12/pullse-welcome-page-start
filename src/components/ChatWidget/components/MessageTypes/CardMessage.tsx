
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';

interface CardButton {
  text: string;
  action: string;
}

interface CardData {
  title: string;
  description: string;
  imageUrl?: string;
  buttons?: CardButton[];
}

interface CardMessageProps {
  cardData?: CardData;
  metadata?: Record<string, any>;
}

const CardMessage = ({ cardData, metadata }: CardMessageProps) => {
  // Process either cardData or metadata
  const data = cardData || (metadata as unknown as CardData);
  
  if (!data) return null;
  
  // Sanitize card data
  const cardTitle = data.title ? sanitizeInput(data.title) : '';
  const cardDesc = data.description ? sanitizeInput(data.description) : '';
  
  return (
    <Card className="w-full max-w-xs mt-2 shadow-sm">
      {data.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={data.imageUrl} 
            alt={cardTitle} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold">{cardTitle}</h4>
        <p className="text-sm text-gray-600 mt-1">{cardDesc}</p>
        
        {data.buttons && data.buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {data.buttons.map((button, i) => (
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
