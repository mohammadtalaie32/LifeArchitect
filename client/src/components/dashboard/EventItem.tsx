import { Event } from "@shared/schema";
import { formatRelativeTime } from "@/lib/dateUtils";
import { Calendar, Users, Building } from "lucide-react";

interface EventItemProps {
  event: Event;
}

export default function EventItem({ event }: EventItemProps) {
  // Determine the icon based on the event category or specified icon
  const getIcon = () => {
    if (event.icon === 'calendar') return <Calendar className="h-5 w-5" />;
    if (event.icon === 'users') return <Users className="h-5 w-5" />;
    if (event.icon === 'building') return <Building className="h-5 w-5" />;
    
    // Default based on category
    if (event.category?.toLowerCase() === 'learning') {
      return <Calendar className="h-5 w-5" />;
    } else if (event.category?.toLowerCase() === 'wellness') {
      return <Building className="h-5 w-5" />;
    } else {
      return <Users className="h-5 w-5" />;
    }
  };

  // Determine background color of icon container
  const getIconBgClass = () => {
    if (event.category?.toLowerCase() === 'learning') {
      return "bg-primary-100";
    } else if (event.category?.toLowerCase() === 'wellness') {
      return "bg-secondary-100";
    } else {
      return "bg-accent-100";
    }
  };

  // Determine text color of icon
  const getIconTextClass = () => {
    if (event.category?.toLowerCase() === 'learning') {
      return "text-primary-600";
    } else if (event.category?.toLowerCase() === 'wellness') {
      return "text-secondary-600";
    } else {
      return "text-accent-600";
    }
  };

  // Format the event time
  const getEventTime = () => {
    const startDate = new Date(event.startTime);
    const endDate = event.endTime ? new Date(event.endTime) : null;
    
    const startDisplay = formatRelativeTime(startDate);
    
    if (endDate) {
      const endTimeStr = endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      return `${startDisplay} - ${endTimeStr}`;
    }
    
    return startDisplay;
  };

  return (
    <div className="p-4 flex items-start">
      <div className={`flex-shrink-0 rounded-md p-2 mr-3 ${getIconBgClass()}`}>
        <div className={getIconTextClass()}>
          {getIcon()}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-800">{event.title}</h3>
        <p className="text-xs text-slate-500 mt-1">{getEventTime()}</p>
        <div className="mt-2 flex items-center">
          <span className="text-xs text-primary-600">
            <svg className="inline-block h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location || "No location specified"}
          </span>
        </div>
      </div>
    </div>
  );
}
