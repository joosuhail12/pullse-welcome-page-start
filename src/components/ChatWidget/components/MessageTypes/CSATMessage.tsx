import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
          <div className="flex gap-2 justify-center p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200/60 shadow-inner">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={32}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-out transform hover:scale-125 active:scale-110",
                  "drop-shadow-sm hover:drop-shadow-lg",
                  "hover:rotate-12 active:rotate-0",
                  index < (hoveredRating || Number(rating))
                    ? "fill-amber-400 text-amber-500 animate-pulse"
                    : "fill-gray-200 text-gray-300 hover:fill-amber-200 hover:text-amber-400"
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
          <div className="p-3 bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-purple-50/60 rounded-xl border border-indigo-200/60 shadow-md backdrop-blur-sm">
            <div className="relative">
              {/* Slider Track */}
              <div className="relative h-2 bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-emerald-300 rounded-full shadow-inner">
                <div 
                  className="absolute h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${(Number(rating) || 0) * 10}%` }}
                />
              </div>
              
              {/* Slider Handle */}
              <input
                type="range"
                min="1"
                max="10"
                value={rating || 1}
                onChange={(e) => setRating(Number(e.target.value))}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
              />
              
              {/* Custom Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-md transition-all duration-200 cursor-pointer hover:scale-110"
                style={{ left: `calc(${((Number(rating) || 1) - 1) * 10}% + ${4 - ((Number(rating) || 1) - 1) * 0.8}px)` }}
              >
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full scale-50" />
              </div>
            </div>
            
            {/* Scale Labels */}
            <div className="flex justify-between mt-2 px-0.5">
              {Array.from({ length: 10 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index + 1)}
                  className={cn(
                    "text-xs font-medium transition-all duration-200 hover:scale-110 px-0.5 py-0.5 rounded cursor-pointer",
                    rating === index + 1
                      ? "text-indigo-600 font-bold bg-indigo-100/60"
                      : "text-slate-500 hover:text-indigo-500"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {/* Value Display */}
            <div className="text-center mt-1">
              <span className="text-sm font-bold text-indigo-600">{rating || '1'}</span>
              <span className="text-xs text-slate-500 ml-1">/ 10</span>
            </div>
            
            {/* Labels */}
            <div className="flex justify-between text-xs text-slate-500 mt-1 px-0.5">
              <span className="font-medium">Poor</span>
              <span className="font-medium">Excellent</span>
            </div>
          </div>
        );

      case 'emoji':
        const emojiOptions = [
          {
            icon: Frown,
            value: 'very-dissatisfied',
            label: 'Very Dissatisfied',
            color: 'text-red-500',
            bg: 'from-red-50 to-pink-50',
            border: 'border-red-200',
            hoverBg: 'hover:from-red-100 hover:to-pink-100',
            shadowColor: 'shadow-red-200/50'
          },
          {
            icon: ThumbsDown,
            value: 'dissatisfied',
            label: 'Dissatisfied',
            color: 'text-orange-500',
            bg: 'from-orange-50 to-amber-50',
            border: 'border-orange-200',
            hoverBg: 'hover:from-orange-100 hover:to-amber-100',
            shadowColor: 'shadow-orange-200/50'
          },
          {
            icon: Meh,
            value: 'neutral',
            label: 'Neutral',
            color: 'text-yellow-500',
            bg: 'from-yellow-50 to-amber-50',
            border: 'border-yellow-200',
            hoverBg: 'hover:from-yellow-100 hover:to-amber-100',
            shadowColor: 'shadow-yellow-200/50'
          },
          {
            icon: Smile,
            value: 'satisfied',
            label: 'Satisfied',
            color: 'text-emerald-500',
            bg: 'from-emerald-50 to-green-50',
            border: 'border-emerald-200',
            hoverBg: 'hover:from-emerald-100 hover:to-green-100',
            shadowColor: 'shadow-emerald-200/50'
          },
          {
            icon: ThumbsUp,
            value: 'very-satisfied',
            label: 'Very Satisfied',
            color: 'text-green-600',
            bg: 'from-green-50 to-teal-50',
            border: 'border-green-200',
            hoverBg: 'hover:from-green-100 hover:to-teal-100',
            shadowColor: 'shadow-green-200/50'
          }
        ];

        return (
          <div className="p-4 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl border border-slate-200/60 shadow-inner">
            <div className="flex gap-3 justify-center">
              {emojiOptions.map(({ icon: Icon, value, label, color, bg, border, hoverBg, shadowColor }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 group relative overflow-hidden",
                    "shadow-lg hover:shadow-xl active:shadow-md",
                    rating === value
                      ? `bg-gradient-to-br ${bg} ${border} scale-110 ${shadowColor} shadow-xl animate-pulse`
                      : `bg-white/90 border-gray-200 hover:${border} ${hoverBg}`
                  )}
                  onClick={() => setRating(value)}
                  title={label}
                >
                  <Icon
                    size={28}
                    className={cn(
                      color,
                      "transition-all duration-300 group-hover:scale-110 relative z-10",
                      rating === value ? "animate-pulse" : ""
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-lg p-5 max-w-sm backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-indigo-300/20 rounded-full -translate-y-10 translate-x-10"></div>

      <div className="relative z-10 text-center mb-4">
        <p className="text-xs text-gray-600 leading-relaxed">{question}</p>
      </div>

      <div className="relative z-10 mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-3 text-center">
          Rating Scale
        </label>
        {renderRatingScale()}
      </div>

      <div className="relative z-10">
        <Button
          onClick={handleSubmit}
          disabled={!rating || isSubmitDisabled || !allowUserAction}
          className="w-full h-9 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default CSATMessage;
