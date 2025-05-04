import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import { useUserContext } from "@/contexts/UserContext";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const { user } = useUserContext();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNavigation user={user} />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
