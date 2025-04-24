import { Progress } from "@/components/ui/progress";
import { formatDaysRemaining } from "@/lib/dateUtils";
import { Goal } from "@shared/schema";

interface GoalItemProps {
  goal: Goal;
}

export default function GoalItem({ goal }: GoalItemProps) {
  const progressPercentage = (goal.progress / goal.totalSteps) * 100;
  const progressLabel = `${progressPercentage.toFixed(0)}%`;
  const daysLeftText = goal.targetDate ? formatDaysRemaining(goal.targetDate) : "";
  
  let progressDetails = "";
  if (goal.progress !== undefined && goal.totalSteps !== undefined) {
    progressDetails = `${goal.progress} of ${goal.totalSteps} ${goal.totalSteps === 1 ? 'step' : 'steps'} completed`;
  }

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center mb-2">
        <div 
          className="h-4 w-4 rounded-full mr-2" 
          style={{ backgroundColor: goal.color || "#4F46E5" }}
        ></div>
        <h3 className="text-sm font-medium text-slate-800">{goal.title}</h3>
        <span className="ml-auto text-xs font-medium text-slate-500">{daysLeftText}</span>
      </div>
      <div className="ml-6">
        <div className="flex items-center mb-1">
          <Progress value={progressPercentage} className="w-full h-2 bg-slate-200" />
          <span className="ml-2 text-xs font-medium text-slate-600">{progressLabel}</span>
        </div>
        <p className="text-xs text-slate-500">{progressDetails}</p>
      </div>
    </div>
  );
}
