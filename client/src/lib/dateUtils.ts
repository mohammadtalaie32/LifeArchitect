import { format, formatDistance, isToday, isTomorrow, isYesterday, addDays, isWithinInterval } from "date-fns";

// Format date to display in various formats
export const formatDate = (date: Date | string | number): string => {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy");
};

// Format time to display in 12-hour format
export const formatTime = (date: Date | string | number): string => {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(dateObj, "h:mm a");
};

// Format date and time together
export const formatDateTime = (date: Date | string | number): string => {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy 'at' h:mm a");
};

// Format relative time (e.g., "2 days ago", "in 3 hours")
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "h:mm a")}`;
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

// Get days remaining until a target date
export const getDaysRemaining = (targetDate: Date | string | number): number => {
  const target = typeof targetDate === "string" || typeof targetDate === "number" 
    ? new Date(targetDate) 
    : targetDate;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = target.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

// Format days remaining in a human-readable way
export const formatDaysRemaining = (targetDate: Date | string | number): string => {
  const daysRemaining = getDaysRemaining(targetDate);
  
  if (daysRemaining === 0) {
    return "Today";
  } else if (daysRemaining === 1) {
    return "Tomorrow";
  } else if (daysRemaining < 0) {
    return `${Math.abs(daysRemaining)} days overdue`;
  } else {
    return `${daysRemaining} days left`;
  }
};

// Check if a date is within the current week
export const isCurrentWeek = (date: Date | string | number): boolean => {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const today = new Date();
  
  // Set to beginning of today
  today.setHours(0, 0, 0, 0);
  
  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Calculate the end of the week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return isWithinInterval(dateObj, { start: startOfWeek, end: endOfWeek });
};

// Get the next occurrence of a day of the week
export const getNextDayOfWeek = (dayIndex: number): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = new Date(today);
  const currentDay = today.getDay();
  
  // Days until next occurrence
  const daysToAdd = (dayIndex + 7 - currentDay) % 7;
  
  // If today is the target day and we want the next occurrence, add 7 days
  result.setDate(today.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
  
  return result;
};

// Format a date range for display
export const formatDateRange = (startDate: Date | string | number, endDate: Date | string | number): string => {
  const start = typeof startDate === "string" || typeof startDate === "number" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" || typeof endDate === "number" ? new Date(endDate) : endDate;
  
  // If same day
  if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
    return `${format(start, "MMMM d, yyyy")} ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  }
  
  // Different days
  return `${format(start, "MMMM d, yyyy")} - ${format(end, "MMMM d, yyyy")}`;
};
