import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import NotFound from '@/pages/not-found';

interface ProtectedRouteProps {
  children: ReactNode;
  moduleName: string;
}

export default function ProtectedRoute({ children, moduleName }: ProtectedRouteProps) {
  const { isModuleEnabled, isLoading } = useUserSettings();

  // Always allow access to dashboard and settings
  if (moduleName === 'dashboard' || moduleName === 'settings') {
    return <>{children}</>;
  }

  // While the settings are loading, render nothing
  if (isLoading) {
    return null;
  }

  // Check if the module is enabled for this user
  const isEnabled = isModuleEnabled(moduleName);
  
  if (!isEnabled) {
    // Redirect to not found page if the module is disabled
    return <NotFound />;
  }

  return <>{children}</>;
}