
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
    <div className={`flex items-center justify-center my-6 ${className} animate-subtle-fade-in`}>
      <Separator className="flex-grow bg-gray-200" />
      <div className="mx-2 px-3 py-1.5 bg-gray-100 rounded-full flex items-center text-xs font-medium text-gray-700 shadow-sm border border-gray-200">
        <Calendar size={12} className="mr-1.5 text-vivid-purple" />
        {getDateText(date)}
      </div>
      <Separator className="flex-grow bg-gray-200" />
    </div>
  );
};

export default DateSeparator;
