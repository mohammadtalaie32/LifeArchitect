import { Link, useLocation } from "react-router-dom";
import { Home, CheckCircle, PlusCircle, Calendar, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-6 w-6" />,
    },
    {
      name: "Goals",
      path: "/goals",
      icon: <CheckCircle className="h-6 w-6" />,
    },
    {
      name: "Add",
      path: "/add",
      icon: <PlusCircle className="h-6 w-6" />,
      action: true,
    },
    {
      name: "Habits",
      path: "/habits-rituals",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart2 className="h-6 w-6" />,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex z-10 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2",
            currentPath === item.path
              ? "text-primary-600"
              : "text-slate-600"
          )}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
