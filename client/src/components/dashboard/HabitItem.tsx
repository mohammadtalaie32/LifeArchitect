import { useState } from "react";
import { Habit } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HabitItemProps {
  habit: Habit;
  isChecked: boolean;
  completedTime?: string;
  onToggle?: (habitId: number, checked: boolean) => void;
}

export default function HabitItem({ habit, isChecked, completedTime, onToggle }: HabitItemProps) {
  const [checked, setChecked] = useState(isChecked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (value: boolean) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setChecked(value);
    
    try {
      if (value) {
        // Complete habit
        await apiRequest("POST", "/api/habit-entries", {
          habitId: habit.id,
          completed: true,
          notes: ""
        });
        
        toast({
          title: "Habit completed",
          description: `You've completed "${habit.title}"`,
        });
      } else {
        // Uncomplete habit - would need appropriate API endpoint
        toast({
          title: "Habit marked incomplete",
          description: `You've marked "${habit.title}" as incomplete`,
        });
      }
      
      // Refresh habit entries data
      queryClient.invalidateQueries({ queryKey: ["/api/habit-entries"] });
      
      if (onToggle) {
        onToggle(habit.id, value);
      }
    } catch (error) {
      // Revert state if there's an error
      setChecked(!value);
      toast({
        title: "Error updating habit",
        description: "There was a problem updating your habit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate streak display
  const streakDisplay = [];
  const maxStreakToShow = 5;
  
  for (let i = 0; i < maxStreakToShow; i++) {
    if (i < (habit.streak || 0)) {
      streakDisplay.push(
        <div key={i} className="w-4 h-4 bg-primary-600 rounded-sm"></div>
      );
    } else {
      streakDisplay.push(
        <div key={i} className="w-4 h-4 bg-slate-200 rounded-sm"></div>
      );
    }
  }

  return (
    <div className="flex items-center p-2 hover:bg-slate-50 rounded-md">
      <div className="flex-shrink-0">
        <Checkbox 
          checked={checked} 
          onCheckedChange={handleToggle}
          disabled={isSubmitting}
          className="h-5 w-5"
        />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-slate-800">{habit.title}</p>
        <p className="text-xs text-slate-500">
          {isChecked && completedTime 
            ? `Completed at ${completedTime}` 
            : habit.timeOfDay 
              ? `Due by ${habit.timeOfDay === 'morning' ? 'morning' : habit.timeOfDay === 'evening' ? 'evening' : habit.timeOfDay}` 
              : 'Pending completion'}
        </p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        <div className="flex space-x-1">
          {streakDisplay}
        </div>
      </div>
    </div>
  );
}
