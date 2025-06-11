
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
          <div className="flex gap-2 justify-center p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-2xl border border-yellow-200/50">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={36}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-out transform hover:scale-125 hover:rotate-12",
                  "drop-shadow-lg hover:drop-shadow-2xl",
                  index < (hoveredRating || Number(rating))
                    ? "fill-gradient-to-br from-yellow-400 to-orange-500 text-yellow-400 animate-pulse"
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
          <div className="p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-200/50">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "h-12 w-full rounded-xl border-2 font-bold text-lg transition-all duration-300 transform hover:scale-110",
                    "shadow-lg hover:shadow-xl backdrop-blur-sm",
                    rating === index + 1
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400 shadow-purple-500/50 scale-105"
                      : "bg-white/80 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700"
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
          <div className="p-6 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 rounded-2xl border border-gray-200/50">
            <div className="flex gap-3 justify-center">
              {emojiOptions.map(({ icon: Icon, value, label, color, bg, border }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 group",
                    "shadow-lg hover:shadow-xl backdrop-blur-sm relative overflow-hidden",
                    rating === value
                      ? `bg-gradient-to-br ${bg} ${border} scale-105 shadow-lg`
                      : "bg-white/80 border-gray-200 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-300"
                  )}
                  onClick={() => setRating(value)}
                  title={label}
                >
                  <Icon size={32} className={cn(color, "transition-all duration-300 group-hover:scale-110")} />
                  {rating === value && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  )}
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
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-3xl border border-gray-200/60 shadow-2xl p-8 max-w-md backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-purple-300/30 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Thank you for your feedback!
          </h3>
          <p className="text-sm text-gray-600 font-medium">{config.question}</p>
        </div>

        <div className="relative z-10 mb-6">
          <div className="text-center p-4 bg-white/70 rounded-2xl border border-gray-200/50 shadow-inner">
            {config.ratingScale === '1-5 Stars' && (
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={28}
                    className={index < Number(submittedData.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                  />
                ))}
              </div>
            )}
            {config.ratingScale === '1-10 Scale' && (
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {submittedData.rating}/10
              </div>
            )}
            {config.ratingScale === 'Emoji Scale' && (
              <div className="text-3xl flex justify-center">
                {submittedData.rating === 'very-dissatisfied' && <Frown className="text-red-500" size={40} />}
                {submittedData.rating === 'dissatisfied' && <ThumbsDown className="text-orange-500" size={40} />}
                {submittedData.rating === 'neutral' && <Meh className="text-yellow-500" size={40} />}
                {submittedData.rating === 'satisfied' && <Smile className="text-green-500" size={40} />}
                {submittedData.rating === 'very-satisfied' && <ThumbsUp className="text-emerald-600" size={40} />}
              </div>
            )}
          </div>
        </div>

        {submittedData.followUp && (
          <div className="relative z-10 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200/50 shadow-inner">
            <p className="text-sm text-gray-700 italic leading-relaxed">{submittedData.followUp}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-3xl border border-gray-200/60 shadow-2xl p-8 max-w-md backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-indigo-300/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-cyan-300/30 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg">
            <Star size={24} className="text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {config.title || 'Rate Your Experience'}
        </h3>
        <p className="text-sm text-gray-600 font-medium leading-relaxed">{config.question}</p>
      </div>

      <div className="relative z-10 mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
          Rating Scale
        </label>
        {renderRatingScale()}
      </div>

      {config.followUpQuestion && (
        <div className="relative z-10 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {config.followUpQuestion}
            {config.followUpOptional && (
              <span className="text-gray-400 ml-2 font-normal">(Optional)</span>
            )}
          </label>
          <Textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Please share your thoughts..."
            className="min-h-24 resize-none border-2 border-gray-200/60 rounded-2xl bg-white/70 backdrop-blur-sm shadow-inner focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
          />
        </div>
      )}

      <div className="relative z-10">
        <Button
          onClick={handleSubmit}
          disabled={!rating}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
};

export default CSATMessage;
