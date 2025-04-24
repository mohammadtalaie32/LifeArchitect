import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  progress?: number;
  progressLabel?: string;
  additionalInfo?: string;
  iconClassName?: string;
  variant?: "primary" | "secondary" | "accent" | "neutral";
}

export default function StatCard({ 
  icon, 
  title, 
  value, 
  progress, 
  progressLabel, 
  additionalInfo,
  iconClassName,
  variant = "primary"
}: StatCardProps) {
  const getIconBgColor = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-100";
      case "secondary":
        return "bg-secondary-100";
      case "accent":
        return "bg-accent-100";
      case "neutral":
        return "bg-slate-100";
      default:
        return "bg-primary-100";
    }
  };

  const getIconTextColor = () => {
    switch (variant) {
      case "primary":
        return "text-primary-600";
      case "secondary":
        return "text-secondary-600";
      case "accent":
        return "text-accent-600";
      case "neutral":
        return "text-slate-600";
      default:
        return "text-primary-600";
    }
  };

  const getProgressColor = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-600";
      case "secondary":
        return "bg-secondary-600";
      case "accent":
        return "bg-accent-600";
      case "neutral":
        return "bg-slate-600";
      default:
        return "bg-primary-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
      <div className="flex items-center">
        <div className={cn("p-2 rounded-md", getIconBgColor(), iconClassName)}>
          <div className={cn("h-6 w-6", getIconTextColor())}>{icon}</div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="mt-2">
          <div className="flex items-center mb-1">
            <Progress value={progress} className="w-full h-2 bg-slate-200" indicatorClassName={getProgressColor()} />
            {progressLabel && <span className="ml-2 text-xs font-medium text-slate-600">{progressLabel}</span>}
          </div>
          {additionalInfo && <p className="text-xs text-slate-500">{additionalInfo}</p>}
        </div>
      )}
      
      {!progress && additionalInfo && (
        <div className="mt-3 text-xs text-secondary-600">
          {additionalInfo}
        </div>
      )}
    </div>
  );
}
