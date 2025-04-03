
import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';

interface DateSeparatorProps {
  date: Date;
  className?: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date, className = '' }) => {
  const getDateText = (date: Date): string => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
    <div className={`flex items-center justify-center my-6 ${className}`}>
      <Separator className="flex-grow bg-gray-200" />
      <div className="mx-2 px-3 py-1 bg-gray-50 rounded-full flex items-center text-xs text-gray-600 shadow-sm border border-gray-100">
        <Calendar size={12} className="mr-1.5 text-vivid-purple/70" />
        {getDateText(date)}
      </div>
      <Separator className="flex-grow bg-gray-200" />
    </div>
  );
};

export default DateSeparator;
