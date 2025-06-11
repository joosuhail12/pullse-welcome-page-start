
import React from 'react';
import { Clock, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const TeamAvailability: React.FC<TeamAvailabilityProps> = ({ config }) => {
  const isMobile = useIsMobile();
  const teamAvailability = config.teamAvailability;
  
  if (!teamAvailability) {
    return null;
  }

  const { dailySchedule = [], holidays = [], timezone = 'EST', currentStatus = 'online' } = teamAvailability;
  
  // Get current day
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = dailySchedule.find(schedule => schedule.day === today);
  
  // Get upcoming holidays (next 3)
  const upcomingHolidays = holidays
    .filter(holiday => new Date(holiday.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Available Now';
      case 'limited': return 'Limited Availability';
      case 'offline': return 'Currently Offline';
      default: return 'Unknown Status';
    }
  };

  const cardSize = isMobile ? "text-xs" : "text-sm";
  const iconSize = isMobile ? 14 : 16;

  return (
    <div className="space-y-3 animate-subtle-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-3xs sm:text-xs uppercase tracking-wide font-semibold text-gray-500">Team Availability</h3>
        <div className="h-px flex-grow bg-gray-100"></div>
      </div>

      {/* Current Status Card */}
      <Card className="bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:bg-white/80">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-soft-purple-100 p-1.5 sm:p-2 rounded-full">
                <Users size={iconSize} className="text-vivid-purple-600" />
              </div>
              <div>
                <p className={`font-medium text-gray-700 ${cardSize}`}>Support Team</p>
                <Badge className={`${getStatusColor(currentStatus)} text-3xs sm:text-2xs px-1.5 py-0.5`}>
                  {getStatusText(currentStatus)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule Card */}
      {todaySchedule && (
        <Card className="bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:bg-white/80">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-soft-purple-100 p-1.5 sm:p-2 rounded-full">
                <Clock size={iconSize} className="text-vivid-purple-600" />
              </div>
              <span className={`font-medium text-gray-700 ${cardSize}`}>Today's Hours</span>
            </div>
            {todaySchedule.isActive ? (
              <p className={`text-gray-600 pl-6 sm:pl-8 ${cardSize}`}>
                {todaySchedule.startTime} - {todaySchedule.endTime} {timezone}
              </p>
            ) : (
              <p className={`text-gray-500 pl-6 sm:pl-8 ${cardSize}`}>Closed today</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule Card */}
      {dailySchedule.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center gap-2 ${cardSize}`}>
              <div className="bg-soft-purple-100 p-1.5 sm:p-2 rounded-full">
                <Calendar size={iconSize} className="text-vivid-purple-600" />
              </div>
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {dailySchedule.map((schedule, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className={`text-gray-600 ${cardSize} ${schedule.day === today ? 'font-medium' : ''}`}>
                  {schedule.day}
                </span>
                <span className={`text-gray-700 ${cardSize} ${schedule.day === today ? 'font-medium' : ''}`}>
                  {schedule.isActive ? `${schedule.startTime} - ${schedule.endTime}` : 'Closed'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Holidays Card */}
      {upcomingHolidays.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center gap-2 ${cardSize}`}>
              <div className="bg-orange-100 p-1.5 sm:p-2 rounded-full">
                <Calendar size={iconSize} className="text-orange-600" />
              </div>
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {upcomingHolidays.map((holiday, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className={`text-gray-700 font-medium ${cardSize}`}>{holiday.name}</p>
                  <p className={`text-gray-500 text-3xs sm:text-2xs`}>
                    {new Date(holiday.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-3xs sm:text-2xs">
                  {holiday.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamAvailability;
