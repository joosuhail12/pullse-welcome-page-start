
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationRatingProps {
  onSubmitRating: (rating: number) => void;
  className?: string;
}

const ConversationRating = ({ onSubmitRating, className }: ConversationRatingProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmitRating(rating);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col items-center p-4 bg-white/80 rounded-lg shadow-sm", className)}>
        <p className="text-sm text-gray-700 font-medium mb-2">Thank you for your feedback!</p>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={24}
              className={cn(
                "transition-all duration-200",
                index < rating 
                  ? "fill-vivid-purple text-vivid-purple" 
                  : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center p-4 bg-white/80 rounded-lg shadow-sm", className)}>
      <p className="text-sm text-gray-700 font-medium mb-2">How was your experience?</p>
      
      <div className="flex mb-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={24}
            className={cn(
              "cursor-pointer transition-all duration-200 transform hover:scale-110",
              index < (hoveredRating || rating) 
                ? "fill-vivid-purple text-vivid-purple" 
                : "fill-gray-200 text-gray-200"
            )}
            onMouseEnter={() => setHoveredRating(index + 1)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(index + 1)}
          />
        ))}
      </div>
      
      <Button
        size="sm"
        disabled={rating === 0}
        onClick={handleSubmit}
        className={cn(
          "px-4 py-1",
          rating === 0 
            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
            : "bg-vivid-purple hover:bg-vivid-purple/90"
        )}
      >
        Submit
      </Button>
    </div>
  );
};

export default ConversationRating;
