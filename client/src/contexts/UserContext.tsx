import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { login as authLogin, logout as authLogout, checkAuth as authCheckAuth } from "../utils/auth";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authCheckAuth();
      setUser(userData);
      return userData;
    } catch (err) {
      setError("Session expired. Please log in again.");
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authLogin(username, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError("Invalid username or password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await authLogout();
      setUser(null);
    } catch (err) {
      setError("Failed to log out");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status periodically
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (user) {
        await checkAuth();
      }
    };

    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [user]);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error, login, logout, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }
  return context;
}