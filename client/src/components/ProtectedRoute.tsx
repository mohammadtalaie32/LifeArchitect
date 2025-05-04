import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  moduleName: string;
}

export default function ProtectedRoute({ children, moduleName }: ProtectedRouteProps) {
  const { user, isLoading, error } = useUserContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Error</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has access to the module
  const hasModuleAccess = true; // TODO: Implement module access check based on user settings

  if (!hasModuleAccess) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You don't have access to this module.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}