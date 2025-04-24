import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { User } from "@shared/schema";
import { login as authLogin, logout as authLogout, checkAuth as authCheckAuth } from "@/utils/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

// Default context values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize by checking if user is already authenticated
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authCheckAuth();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await authLogin(username, password);
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication function
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userData = await authCheckAuth();
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}