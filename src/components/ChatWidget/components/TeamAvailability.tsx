
import React from 'react';
import { Clock, Users, Calendar } from 'lucide-react';
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
      case 'online': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
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

  const iconSize = isMobile ? 14 : 16;
  const textSize = isMobile ? "text-2xs" : "text-xs";

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-soft-purple-100 p-1.5 rounded-full">
          <Users size={iconSize} className="text-vivid-purple-600" />
        </div>
        <span className={`font-medium text-gray-700 ${textSize}`}>Team Availability</span>
        <div className={`ml-auto px-2 py-1 rounded-full text-2xs font-medium ${
          currentStatus === 'online' ? 'bg-green-100 text-green-700' :
          currentStatus === 'limited' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {getStatusText(currentStatus)}
        </div>
      </div>

      <div className="space-y-2">
        {/* Today's Hours */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-gray-500" />
            <span className={`text-gray-600 ${textSize}`}>Today</span>
          </div>
          <span className={`text-gray-700 font-medium ${textSize}`}>
            {todaySchedule?.isActive ? 
              `${todaySchedule.startTime} - ${todaySchedule.endTime} ${timezone}` : 
              'Closed'
            }
          </span>
        </div>

        {/* Holiday Notice */}
        {todayHoliday && (
          <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2 border border-orange-100">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-orange-600" />
              <span className={`text-orange-700 font-medium ${textSize}`}>Holiday Today</span>
            </div>
            <span className={`text-orange-600 ${textSize}`}>{todayHoliday.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAvailability;
