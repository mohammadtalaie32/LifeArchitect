import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodTrackerProps {
  userId: number;
}

export default function MoodTracker({ userId }: MoodTrackerProps) {
  // Get mood entries for the last 7 days
  const { data: moodEntries } = useQuery({
    queryKey: ['/api/mood-entries'],
    refetchInterval: false,
  });

  // Create days of week for display
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date,
      dayName: format(date, 'EEE'),
      mood: 'neutral', // Default mood
      intensity: 3, // Default intensity
    };
  });

  // If we have mood data, map it to our days
  if (moodEntries) {
    moodEntries.forEach((entry: any) => {
      const entryDate = new Date(entry.createdAt);
      const dayIndex = last7Days.findIndex(day => 
        format(day.date, 'yyyy-MM-dd') === format(entryDate, 'yyyy-MM-dd')
      );
      
      if (dayIndex !== -1) {
        last7Days[dayIndex].mood = entry.mood;
        last7Days[dayIndex].intensity = entry.intensityLevel;
      }
    });
  }

  // Function to get mood icon and color based on mood and intensity
  const getMoodDisplay = (mood: string, intensity: number) => {
    let bgColor = 'bg-yellow-400'; // Default - neutral mood
    let icon = (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v5a1 1 0 11-2 0V7zm0 8a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd"></path>
      </svg>
    );
    
    if (mood === 'positive') {
      bgColor = intensity >= 4 ? 'bg-green-500' : 'bg-green-400';
      icon = (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      );
    } else if (mood === 'negative') {
      bgColor = intensity >= 4 ? 'bg-red-500' : 'bg-red-400';
      icon = (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
        </svg>
      );
    }
    
    return { bgColor, icon };
  };

  // Sample mood factors
  const moodFactors = [
    { name: "Exercise", rating: 3 },
    { name: "Sleep Quality", rating: 4 },
    { name: "Social Interaction", rating: 2 }
  ];

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs text-slate-500">Last 7 days</div>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">Log Mood</button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {last7Days.map((day, index) => {
          const { bgColor, icon } = getMoodDisplay(day.mood, day.intensity);
          return (
            <div key={index} className="text-center">
              <div className="mb-1 text-xs text-slate-500">{day.dayName}</div>
              <div className={cn("mx-auto w-8 h-8 rounded-full flex items-center justify-center", bgColor)}>
                {icon}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <div>Mood Factors:</div>
        <div>Impact</div>
      </div>
      
      <div className="space-y-2">
        {moodFactors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="text-xs text-slate-700">{factor.name}</div>
            <div className="flex">
              {Array.from({ length: factor.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-secondary-500" fill="currentColor" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
