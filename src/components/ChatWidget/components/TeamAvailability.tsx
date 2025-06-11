
import React from 'react';
import { Clock, Users, Calendar, Dot } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamAvailabilityProps {
  config: {
    colors?: {
      primaryColor?: string;
      textColor?: string;
    };
    teamAvailability?: {
      dailySchedule?: Array<{
        day: string;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }>;
      holidays?: Array<{
        date: string;
        name: string;
        type: 'holiday' | 'break' | 'maintenance';
      }>;
      timezone?: string;
      currentStatus?: 'online' | 'offline' | 'limited';
    };
  };
}

// Fallback mock data for testing
const mockTeamAvailability = {
  dailySchedule: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isActive: true },
    { day: 'Saturday', startTime: '', endTime: '', isActive: false },
    { day: 'Sunday', startTime: '', endTime: '', isActive: false }
  ],
  holidays: [
    { date: '2024-12-25', name: 'Christmas Day', type: 'holiday' as const }
  ],
  timezone: 'EST',
  currentStatus: 'online' as const
};

const TeamAvailability: React.FC<TeamAvailabilityProps> = ({ config }) => {
  const isMobile = useIsMobile();
  
  // Use provided config or fallback to mock data
  const teamAvailability = config.teamAvailability || mockTeamAvailability;
  
  const { dailySchedule = [], holidays = [], timezone = 'EST', currentStatus = 'online' } = teamAvailability;
  
  // Get current day
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = dailySchedule.find(schedule => schedule.day === today);
  
  // Check if today is a holiday
  const todayDate = new Date().toISOString().split('T')[0];
  const todayHoliday = holidays.find(holiday => holiday.date === todayDate);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Available';
      case 'limited': return 'Limited';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-700';
      case 'limited': return 'text-yellow-700';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const iconSize = isMobile ? 16 : 18;
  const textSize = isMobile ? "text-xs" : "text-sm";
  const smallTextSize = isMobile ? "text-xs" : "text-xs";

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/95">
      {/* Header with status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-2 rounded-xl">
            <Users size={iconSize} className="text-purple-600" />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-800 ${textSize}`}>Team Status</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(currentStatus)} animate-pulse`}></div>
              <span className={`${smallTextSize} font-medium ${getStatusTextColor(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Hours */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50/70 rounded-xl">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-500" />
            <span className={`text-gray-600 font-medium ${smallTextSize}`}>Today's Hours</span>
          </div>
          <span className={`text-gray-800 font-semibold ${smallTextSize}`}>
            {todaySchedule?.isActive ? 
              `${todaySchedule.startTime} - ${todaySchedule.endTime}` : 
              'Closed'
            }
          </span>
        </div>

        {/* Holiday Notice */}
        {todayHoliday && (
          <div className="flex items-center justify-between py-2.5 px-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200/50">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-orange-600" />
              <span className={`text-orange-700 font-medium ${smallTextSize}`}>Holiday</span>
            </div>
            <span className={`text-orange-600 font-semibold ${smallTextSize}`}>{todayHoliday.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAvailability;
