import { Principle } from "@shared/schema";

interface PrincipleItemProps {
  principle: Principle;
}

export default function PrincipleItem({ principle }: PrincipleItemProps) {
  return (
    <div>
      <div className="flex items-center mb-1">
        <div 
          className="h-3 w-3 rounded-full mr-2" 
          style={{ backgroundColor: principle.color }}
        ></div>
        <h3 className="text-sm font-medium text-slate-800">{principle.title}</h3>
      </div>
      <p className="text-xs text-slate-600 ml-5">{principle.description}</p>
    </div>
  );
}
