
import React from 'react';
import { Button } from '@/components/ui/button';

export interface CardMessageProps {
  data: Record<string, any>;
}

const CardMessage: React.FC<CardMessageProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {data.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={data.imageUrl} 
            alt={data.title || "Card"} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        {data.title && <h4 className="font-medium text-gray-900">{data.title}</h4>}
        {data.description && <p className="text-sm text-gray-600 mt-1">{data.description}</p>}
        
        {data.buttons && data.buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {data.buttons.map((button: any, i: number) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                className="w-full justify-center"
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
