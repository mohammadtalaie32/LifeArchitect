import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";

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
import NotFound from "./pages/not-found";

function AuthenticatedRoutes() {
  const { user } = useAuth();
  
  return (
    <Layout user={user!}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/core-principles" element={<CorePrinciples />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/passions-projects" element={<PassionsProjects />} />
        <Route path="/habits-rituals" element={<HabitsRituals />} />
        <Route path="/challenges-solutions" element={<ChallengesSolutions />} />
        <Route path="/self-analysis" element={<SelfAnalysis />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/social-interactions" element={<SocialInteractions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const { user, isLoading, login, checkAuth } = useAuth();

  useEffect(() => {
    // For demo purposes, automatically log in with demo account
    const autoLogin = async () => {
      try {
        // First try to see if we're already logged in
        const existingUser = await checkAuth();
        if (existingUser) {
          console.log("Already logged in as:", existingUser.username);
          return;
        }
        
        // If not logged in, try to login with demo account
        console.log("Not logged in, attempting demo login");
        try {
          const demoUser = await login("demo", "password");
          console.log("Successfully logged in as demo user:", demoUser.username);
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
        }
      } catch (error) {
        console.error("Authentication setup failed:", error);
      }
    };

    autoLogin();
  }, [login, checkAuth]);

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedRoutes />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
