
import React from 'react';
import { Button } from '@/components/ui/button';

export interface QuickReplyMessageProps {
  data: Record<string, any>;
  onSelect: (text: string) => void;
}

const QuickReplyMessage: React.FC<QuickReplyMessageProps> = ({ data, onSelect }) => {
  const options = data.options || [];
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((option: any, index: number) => (
        <Button
          key={index}
          variant="secondary"
          size="sm"
          className="text-xs py-1 px-3 h-auto"
          onClick={() => onSelect(option.text || option.value || option)}
        >
          {option.text || option.value || option}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplyMessage;
