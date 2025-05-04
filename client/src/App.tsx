import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { UserProvider, useUserContext } from "./contexts/UserContext";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
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

function AppRoutes() {
  const { user, isLoading } = useUserContext();

  return (

    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Layout />}>
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
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <UserSettingsProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </UserSettingsProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;
