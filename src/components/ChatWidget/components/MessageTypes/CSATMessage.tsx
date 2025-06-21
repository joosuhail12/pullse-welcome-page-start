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
          <div className="p-6 bg-gradient-to-br from-slate-50/95 via-blue-50/60 to-indigo-50/80 rounded-3xl border border-slate-200/70 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap justify-center gap-2.5 max-w-xs mx-auto">
              {Array.from({ length: 10 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "relative h-11 w-11 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-110 active:scale-95",
                    "shadow-md hover:shadow-xl active:shadow-sm border-2",
                    "overflow-hidden group backdrop-blur-sm flex items-center justify-center",
                    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-transparent before:to-white/20 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
                    "after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.05)] after:pointer-events-none",
                    rating === index + 1
                      ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white border-blue-400/60 scale-110 shadow-2xl ring-2 ring-blue-300/40 ring-offset-2 ring-offset-blue-50"
                      : "bg-gradient-to-br from-white via-slate-50/80 to-gray-100/60 text-slate-700 border-slate-300/60 hover:border-blue-300/70 hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-indigo-50/60 hover:text-blue-700"
                  )}
                  onClick={() => setRating(index + 1)}
                >
                  <span className="relative z-10 font-bold tracking-tight">{index + 1}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-500 px-2">
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
        </Button>
      </div>
    </div>
  );
};

export default CSATMessage;
