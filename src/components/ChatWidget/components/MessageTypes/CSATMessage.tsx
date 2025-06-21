
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Star, ThumbsUp, ThumbsDown, Meh, Smile, Frown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserActionData } from '../../hooks/useMessageActions';

interface CSATMessageProps {
  scale: '1-5' | '1-10' | 'emoji';
  question: string;
  onSubmit: (action: "csat" | "action_button" | "data_collection", data: Partial<UserActionData>, conversationId: string) => void;
  allowUserAction?: boolean;
  messageId: string;
}

const CSATMessage: React.FC<CSATMessageProps> = ({
  scale,
  question,
  onSubmit,
  allowUserAction = true,
  messageId
}) => {
  const [rating, setRating] = useState<number | string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const handleSubmit = () => {
    if (rating && allowUserAction) {
      onSubmit("csat", {
        csat: {
          value: Number(rating),
          ratingScale: scale
        }
      }, messageId);
      setIsSubmitDisabled(true);
    }
  };

  const renderRatingScale = () => {
    switch (scale) {
      case '1-5':
        return (
          <div className="flex gap-1 justify-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={24}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-110",
                  index < (hoveredRating || Number(rating))
                    ? "fill-amber-400 text-amber-500"
                    : "fill-gray-200 text-gray-300 hover:fill-amber-200"
                )}
                onMouseEnter={() => setHoveredRating(index + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(index + 1)}
              />
            ))}
          </div>
        );

      case '1-10':
        return (
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
            <div className="space-y-2">
              <Slider
                value={[Number(rating) || 1]}
                onValueChange={(value) => setRating(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-slate-600 px-1">
                <span>Poor</span>
                <span className="font-semibold text-indigo-600">{rating || '1'} / 10</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        );

      case 'emoji':
        const emojiOptions = [
          { icon: Frown, value: 'very-dissatisfied', label: 'Very Dissatisfied', color: 'text-red-500' },
          { icon: ThumbsDown, value: 'dissatisfied', label: 'Dissatisfied', color: 'text-orange-500' },
          { icon: Meh, value: 'neutral', label: 'Neutral', color: 'text-yellow-500' },
          { icon: Smile, value: 'satisfied', label: 'Satisfied', color: 'text-green-500' },
          { icon: ThumbsUp, value: 'very-satisfied', label: 'Very Satisfied', color: 'text-emerald-500' }
        ];

        return (
          <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
            <div className="flex gap-2 justify-center">
              {emojiOptions.map(({ icon: Icon, value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200 hover:scale-105",
                    rating === value
                      ? "bg-white border-indigo-300 shadow-md scale-105"
                      : "bg-white/70 border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setRating(value)}
                  title={label}
                >
                  <Icon size={20} className={color} />
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 max-w-xs">
      <div className="text-center mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
      </div>

      <div className="mb-3">
        {renderRatingScale()}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!rating || isSubmitDisabled || !allowUserAction}
        className="w-full h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        Submit
      </Button>
    </div>
  );
};

export default CSATMessage;
