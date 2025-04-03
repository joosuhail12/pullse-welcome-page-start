
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface CardMessageProps {
  metadata?: Record<string, any>;
}

const CardMessage: React.FC<CardMessageProps> = ({ metadata }) => {
  if (!metadata) return null;
  
  const title = metadata.title || '';
  const description = metadata.description || '';
  const imageUrl = metadata.imageUrl || '';
  const buttons = metadata.buttons || [];

  return (
    <Card className="w-full max-w-xs mt-2 shadow-sm">
      {imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        
        {buttons && buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {buttons.map((button: {text: string, action: string}, i: number) => (
              <Button 
                key={i} 
                size="sm" 
                variant="outline" 
                className="w-full"
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardMessage;
