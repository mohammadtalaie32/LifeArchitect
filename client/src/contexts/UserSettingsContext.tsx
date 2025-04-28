import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserSettings } from '@shared/schema';

interface UserSettingsContextType {
  userSettings: UserSettings[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isModuleEnabled: (moduleName: string) => boolean;
  getModuleSetting: (moduleName: string, settingKey: string) => any;
}

const UserSettingsContext = createContext<UserSettingsContextType>({
  userSettings: undefined,
  isLoading: false,
  isError: false,
  error: null,
  isModuleEnabled: () => false,
  getModuleSetting: () => null,
});

export const useUserSettings = () => useContext(UserSettingsContext);

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider = ({ children }: UserSettingsProviderProps) => {
  const { data, isLoading, isError, error } = useQuery<UserSettings[]>({
    queryKey: ['/api/user/settings'],
  });

  const isModuleEnabled = (moduleName: string): boolean => {
    if (!data) return true; // If settings haven't loaded yet, default to showing everything
    
    const moduleSetting = data.find(setting => setting.moduleName === moduleName);
    return moduleSetting ? moduleSetting.enabled : false;
  };

  const getModuleSetting = (moduleName: string, settingKey: string): any => {
    if (!data) return null;
    
    const moduleSetting = data.find(setting => setting.moduleName === moduleName);
    if (!moduleSetting || !moduleSetting.settings) return null;
    
    const settings = moduleSetting.settings as Record<string, any>;
    return settings[settingKey];
  };

  const value = {
    userSettings: data,
    isLoading,
    isError,
    error,
    isModuleEnabled,
    getModuleSetting,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};