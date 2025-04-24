import { useState, useEffect } from "react";
import { login as authLogin, logout as authLogout, checkAuth as authCheckAuth } from "@/utils/auth";
import { User } from "@shared/schema";

export function useUser() {
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

  return {
    user,
    isLoading,
    login,
    logout,
    checkAuth
  };
}
