
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WidgetLauncherProps {
  unreadCount: number;
  isOpen: boolean;
  onClick: () => void;
  buttonStyle?: React.CSSProperties;
  positionClass: string;
  buttonStyleClass: string;
}

const WidgetLauncher: React.FC<WidgetLauncherProps> = ({
  unreadCount,
  isOpen,
  onClick,
  buttonStyle,
  positionClass,
  buttonStyleClass,
}) => {
  return (
    <div className={`fixed ${positionClass} flex flex-col items-end`}>
      <Button
        className={`rounded-full w-14 h-14 flex items-center justify-center ${buttonStyleClass} relative`}
        style={buttonStyle}
        onClick={onClick}
      >
        <MessageSquare size={24} className="text-white" />
        {!isOpen && unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2" 
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default WidgetLauncher;
