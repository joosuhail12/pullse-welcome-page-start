
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown, Meh, Smile, Frown } from 'lucide-react';
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
          <div className="flex gap-1 justify-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={28}
                className={cn(
                  "cursor-pointer transition-all duration-200 transform hover:scale-110",
                  index < (hoveredRating || Number(rating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
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
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-10 w-full rounded-lg border-2 font-medium transition-all duration-200",
                  rating === index + 1
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                )}
                onClick={() => setRating(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        );

      case 'Emoji Scale':
        const emojiOptions = [
          { icon: Frown, value: 'very-dissatisfied', label: 'Very Dissatisfied', color: 'text-red-500' },
          { icon: ThumbsDown, value: 'dissatisfied', label: 'Dissatisfied', color: 'text-orange-500' },
          { icon: Meh, value: 'neutral', label: 'Neutral', color: 'text-yellow-500' },
          { icon: Smile, value: 'satisfied', label: 'Satisfied', color: 'text-green-500' },
          { icon: ThumbsUp, value: 'very-satisfied', label: 'Very Satisfied', color: 'text-green-600' }
        ];

        return (
          <div className="flex gap-2 justify-center">
            {emojiOptions.map(({ icon: Icon, value, label, color }) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "p-3 rounded-full border-2 transition-all duration-200 transform hover:scale-110",
                  rating === value
                    ? "bg-purple-100 border-purple-600"
                    : "bg-white border-gray-200 hover:border-purple-300"
                )}
                onClick={() => setRating(value)}
                title={label}
              >
                <Icon size={24} className={cn(color)} />
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-sm text-gray-600">{config.question}</p>
        </div>

        <div className="mb-4">
          <div className="text-center">
            {config.ratingScale === '1-5 Stars' && (
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={24}
                    className={index < Number(submittedData.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                  />
                ))}
              </div>
            )}
            {config.ratingScale === '1-10 Scale' && (
              <div className="text-2xl font-bold text-purple-600">
                {submittedData.rating}/10
              </div>
            )}
            {config.ratingScale === 'Emoji Scale' && (
              <div className="text-2xl">
                {submittedData.rating === 'very-dissatisfied' && <Frown className="text-red-500 mx-auto" size={32} />}
                {submittedData.rating === 'dissatisfied' && <ThumbsDown className="text-orange-500 mx-auto" size={32} />}
                {submittedData.rating === 'neutral' && <Meh className="text-yellow-500 mx-auto" size={32} />}
                {submittedData.rating === 'satisfied' && <Smile className="text-green-500 mx-auto" size={32} />}
                {submittedData.rating === 'very-satisfied' && <ThumbsUp className="text-green-600 mx-auto" size={32} />}
              </div>
            )}
          </div>
        </div>

        {submittedData.followUp && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{submittedData.followUp}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {config.title || 'Rate Your Experience'}
        </h3>
        <p className="text-sm text-gray-600">{config.question}</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Rating Scale
        </label>
        {renderRatingScale()}
      </div>

      {config.followUpQuestion && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.followUpQuestion}
            {config.followUpOptional && (
              <span className="text-gray-400 ml-1">(Optional)</span>
            )}
          </label>
          <Textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Please share your thoughts..."
            className="min-h-20 resize-none"
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!rating}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
      >
        Save
      </Button>
    </div>
  );
};

export default CSATMessage;
