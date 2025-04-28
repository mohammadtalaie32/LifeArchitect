import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState, createContext } from "react";
import { Loader2 } from "lucide-react";
import { login, checkAuth, logout } from "./utils/auth";
import { User } from "@shared/schema";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import CorePrinciples from "./pages/CorePrinciples";
import Goals from "./pages/Goals";
import PassionsProjects from "./pages/PassionsProjects";
import HabitsRituals from "./pages/HabitsRituals";
import ChallengesSolutions from "./pages/ChallengesSolutions";
import SelfAnalysis from "./pages/SelfAnalysis";
import Analytics from "./pages/Analytics";
import SocialInteractions from "./pages/SocialInteractions";
import Activities from "./pages/Activities";
import Settings from "./pages/Settings";
import NotFound from "./pages/not-found";

// Create a context for user data
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  login: async () => { throw new Error("Not implemented"); },
  logout: async () => { throw new Error("Not implemented"); },
  checkAuth: async () => { throw new Error("Not implemented"); },
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login function
  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await login(username, password);
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth function
  const handleCheckAuth = async () => {
    setIsLoading(true);
    try {
      const userData = await checkAuth();
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // For demo purposes, automatically log in with demo account
    const autoLogin = async () => {
      try {
        // First try to see if we're already logged in
        const existingUser = await handleCheckAuth();
        if (existingUser) {
          console.log("Already logged in as:", existingUser.username);
          return;
        }
        
        // If not logged in, try to login with demo account
        console.log("Not logged in, attempting demo login");
        try {
          const demoUser = await handleLogin("demo", "password");
          console.log("Successfully logged in as demo user:", demoUser.username);
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
        }
      } catch (error) {
        console.error("Authentication setup failed:", error);
      }
    };

    autoLogin();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Error</h1>
          <p className="text-slate-600">Unable to authenticate. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Create auth context value
  const contextValue: UserContextType = {
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    checkAuth: handleCheckAuth
  };

  return (
    <UserContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        <UserSettingsProvider>
          <TooltipProvider>
            <Layout user={user}>
              <Routes>
                <Route path="/" element={<ProtectedRoute moduleName="dashboard"><Dashboard /></ProtectedRoute>} />
                <Route path="/core-principles" element={<ProtectedRoute moduleName="principles"><CorePrinciples /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute moduleName="goals"><Goals /></ProtectedRoute>} />
                <Route path="/passions-projects" element={<ProtectedRoute moduleName="projects"><PassionsProjects /></ProtectedRoute>} />
                <Route path="/habits-rituals" element={<ProtectedRoute moduleName="habits"><HabitsRituals /></ProtectedRoute>} />
                <Route path="/challenges-solutions" element={<ProtectedRoute moduleName="challenges"><ChallengesSolutions /></ProtectedRoute>} />
                <Route path="/self-analysis" element={<ProtectedRoute moduleName="journal"><SelfAnalysis /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute moduleName="analytics"><Analytics /></ProtectedRoute>} />
                <Route path="/social-interactions" element={<ProtectedRoute moduleName="social"><SocialInteractions /></ProtectedRoute>} />
                <Route path="/activities" element={<ProtectedRoute moduleName="activities"><Activities /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute moduleName="settings"><Settings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster />
          </TooltipProvider>
        </UserSettingsProvider>
      </QueryClientProvider>
    </UserContext.Provider>
  );
}

export default App;
