
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown, Meh, Smile, Frown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CSATConfig {
  title?: string;
  question: string;
  ratingScale: '1-5 Stars' | '1-10 Scale' | 'Emoji Scale';
  followUpQuestion?: string;
  followUpOptional?: boolean;
}

interface CSATMessageProps {
  config: CSATConfig;
  onSubmit: (rating: number | string, followUp?: string) => void;
  isSubmitted?: boolean;
  submittedData?: {
    rating: number | string;
    followUp?: string;
  };
}

const CSATMessage: React.FC<CSATMessageProps> = ({
  config,
  onSubmit,
  isSubmitted = false,
  submittedData
}) => {
  const [rating, setRating] = useState<number | string>('');
  const [followUp, setFollowUp] = useState('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleSubmit = () => {
    if (rating) {
      onSubmit(rating, followUp || undefined);
    }
  };

  const renderRatingScale = () => {
    switch (config.ratingScale) {
      case '1-5 Stars':
        return (
          <div className="flex gap-1 justify-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/40">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={28}
                className={cn(
                  "cursor-pointer transition-all duration-200 ease-out transform hover:scale-110",
                  "drop-shadow-sm hover:drop-shadow-md",
                  index < (hoveredRating || Number(rating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-300 hover:fill-yellow-200 hover:text-yellow-300"
                )}
                onMouseEnter={() => setHoveredRating(index + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(index + 1)}
              />
            ))}
          </div>
        );

      case '1-10 Scale':
        return (
          <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200/40">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "h-8 w-full rounded-lg border font-semibold text-sm transition-all duration-200 transform hover:scale-105",
                    "shadow-sm hover:shadow-md",
                    rating === index + 1
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400 scale-105"
                      : "bg-white/80 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  )}
                  onClick={() => setRating(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        );

      case 'Emoji Scale':
        const emojiOptions = [
          { icon: Frown, value: 'very-dissatisfied', label: 'Very Dissatisfied', color: 'text-red-500', bg: 'from-red-50 to-pink-50', border: 'border-red-200' },
          { icon: ThumbsDown, value: 'dissatisfied', label: 'Dissatisfied', color: 'text-orange-500', bg: 'from-orange-50 to-yellow-50', border: 'border-orange-200' },
          { icon: Meh, value: 'neutral', label: 'Neutral', color: 'text-yellow-500', bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200' },
          { icon: Smile, value: 'satisfied', label: 'Satisfied', color: 'text-green-500', bg: 'from-green-50 to-emerald-50', border: 'border-green-200' },
          { icon: ThumbsUp, value: 'very-satisfied', label: 'Very Satisfied', color: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200' }
        ];

        return (
          <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/40">
            <div className="flex gap-2 justify-center">
              {emojiOptions.map(({ icon: Icon, value, label, color, bg, border }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "p-2 rounded-xl border transition-all duration-200 transform hover:scale-105 group",
                    "shadow-sm hover:shadow-md relative overflow-hidden",
                    rating === value
                      ? `bg-gradient-to-br ${bg} ${border} scale-105`
                      : "bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  )}
                  onClick={() => setRating(value)}
                  title={label}
                >
                  <Icon size={24} className={cn(color, "transition-all duration-200 group-hover:scale-110")} />
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-lg p-5 max-w-sm backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full -translate-y-10 translate-x-10"></div>
        
        <div className="relative z-10 text-center mb-4">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-md">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Thank you!
          </h3>
          <p className="text-xs text-gray-600">{config.question}</p>
        </div>

        <div className="relative z-10 mb-4">
          <div className="text-center p-3 bg-white/70 rounded-xl border border-gray-200/50 shadow-inner">
            {config.ratingScale === '1-5 Stars' && (
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={20}
                    className={index < Number(submittedData.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                  />
                ))}
              </div>
            )}
            {config.ratingScale === '1-10 Scale' && (
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {submittedData.rating}/10
              </div>
            )}
            {config.ratingScale === 'Emoji Scale' && (
              <div className="flex justify-center">
                {submittedData.rating === 'very-dissatisfied' && <Frown className="text-red-500" size={28} />}
                {submittedData.rating === 'dissatisfied' && <ThumbsDown className="text-orange-500" size={28} />}
                {submittedData.rating === 'neutral' && <Meh className="text-yellow-500" size={28} />}
                {submittedData.rating === 'satisfied' && <Smile className="text-green-500" size={28} />}
                {submittedData.rating === 'very-satisfied' && <ThumbsUp className="text-emerald-600" size={28} />}
              </div>
            )}
          </div>
        </div>

        {submittedData.followUp && (
          <div className="relative z-10 p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/50 shadow-inner">
            <p className="text-xs text-gray-700 italic leading-relaxed">{submittedData.followUp}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-lg p-5 max-w-sm backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-indigo-300/20 rounded-full -translate-y-10 translate-x-10"></div>
      
      <div className="relative z-10 text-center mb-5">
        <div className="flex items-center justify-center mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-md">
            <Star size={16} className="text-white" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {config.title || 'Rate Your Experience'}
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">{config.question}</p>
      </div>

      <div className="relative z-10 mb-5">
        <label className="block text-xs font-semibold text-gray-700 mb-3 text-center">
          Rating Scale
        </label>
        {renderRatingScale()}
      </div>

      {config.followUpQuestion && (
        <div className="relative z-10 mb-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            {config.followUpQuestion}
            {config.followUpOptional && (
              <span className="text-gray-400 ml-1 font-normal">(Optional)</span>
            )}
          </label>
          <Textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Please share your thoughts..."
            className="min-h-16 resize-none border border-gray-200/60 rounded-xl bg-white/70 backdrop-blur-sm shadow-inner focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-xs"
          />
        </div>
      )}

      <div className="relative z-10">
        <Button
          onClick={handleSubmit}
          disabled={!rating}
          className="w-full h-9 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
};

export default CSATMessage;
