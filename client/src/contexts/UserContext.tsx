import { createContext, useCallback, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";

// Define the shape of our context
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  login: async () => { throw new Error("Not implemented"); },
  logout: async () => { throw new Error("Not implemented"); },
  checkAuth: async () => { throw new Error("Not implemented"); },
});

// Provider component
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return null;
      }

      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not valid JSON, use the default error message
        }
        throw new Error(errorMessage);
      }
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        let errorMessage = "Logout failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not valid JSON, use the default error message
        }
        throw new Error(errorMessage);
      }
      
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status when the context is initialized
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Define the value object with all context properties
  const value = {
    user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
