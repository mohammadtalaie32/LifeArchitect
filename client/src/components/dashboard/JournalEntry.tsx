import { JournalEntry } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/dateUtils";

interface JournalEntryProps {
  entry: JournalEntry;
}

export default function JournalEntryComponent({ entry }: JournalEntryProps) {
  // Function to get badge colors based on tag
  const getBadgeColors = (tag: string) => {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes("reflection")) {
      return "bg-primary-100 text-primary-800";
    } else if (tagLower.includes("coding") || tagLower.includes("learning")) {
      return "bg-secondary-100 text-secondary-800";
    } else if (tagLower.includes("wellness")) {
      return "bg-slate-100 text-slate-800";
    } else if (tagLower.includes("achievement")) {
      return "bg-accent-100 text-accent-800";
    } else if (tagLower.includes("sobriety")) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-slate-800">{entry.title}</h3>
        <span className="text-xs text-slate-500">
          {formatRelativeTime(entry.createdAt!)}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-3">{entry.content}</p>
      <div className="flex flex-wrap items-center gap-2">
        {entry.tags && entry.tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className={getBadgeColors(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
