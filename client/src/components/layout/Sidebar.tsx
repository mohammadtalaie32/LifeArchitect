import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BookOpen, 
  CheckCircle, 
  BarChart2, 
  Calendar, 
  Lightbulb, 
  Edit3, 
  PieChart, 
  Users,
  LayoutGrid,
  Settings
} from "lucide-react";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserSettings } from "@/contexts/UserSettingsContext";

interface SidebarProps {
  className?: string;
  user: User;
  onNavigate?: () => void;
}

export default function Sidebar({ className, user, onNavigate }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isModuleEnabled } = useUserSettings();

  const allNavItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="mr-3 h-5 w-5" />,
      moduleName: "dashboard"
    },
    {
      name: "Core Principles",
      path: "/core-principles",
      icon: <BookOpen className="mr-3 h-5 w-5" />,
      moduleName: "principles"
    },
    {
      name: "Goals",
      path: "/goals",
      icon: <CheckCircle className="mr-3 h-5 w-5" />,
      moduleName: "goals"
    },
    {
      name: "Passions & Projects",
      path: "/passions-projects",
      icon: <BarChart2 className="mr-3 h-5 w-5" />,
      moduleName: "projects"
    },
    {
      name: "Habits & Rituals",
      path: "/habits-rituals",
      icon: <Calendar className="mr-3 h-5 w-5" />,
      moduleName: "habits"
    },
    {
      name: "Activities",
      path: "/activities",
      icon: <LayoutGrid className="mr-3 h-5 w-5" />,
      moduleName: "activities"
    },
    {
      name: "Challenges & Solutions",
      path: "/challenges-solutions",
      icon: <Lightbulb className="mr-3 h-5 w-5" />,
      moduleName: "challenges"
    },
    {
      name: "Self-Analysis",
      path: "/self-analysis",
      icon: <Edit3 className="mr-3 h-5 w-5" />,
      moduleName: "journal"
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <PieChart className="mr-3 h-5 w-5" />,
      moduleName: "analytics"
    },
    {
      name: "Social Interactions",
      path: "/social-interactions",
      icon: <Users className="mr-3 h-5 w-5" />,
      moduleName: "social"
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
      moduleName: "settings"
    },
  ];
  
  // Always show Dashboard and Settings, filter other items based on user settings
  const navItems = allNavItems.filter(item => 
    item.moduleName === "dashboard" || 
    item.moduleName === "settings" || 
    isModuleEnabled(item.moduleName)
  );

  return (
    <aside 
      className={cn(
        "md:w-64 flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-10",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm13 9H7c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1zm-8-3h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1z"/>
            </svg>
            <h1 className="text-lg font-bold text-primary-600">Life Architect</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                currentPath === item.path
                  ? "bg-primary-50 text-primary-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary-100 text-primary-800">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{user.name || user.username}</p>
              <p className="text-xs text-slate-500">{user.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
