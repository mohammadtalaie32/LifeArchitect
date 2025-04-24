import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import { User } from "@shared/schema";

interface LayoutProps {
  children: ReactNode;
  user: User;
}

export default function Layout({ children, user }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-800">
      {/* Sidebar - Desktop */}
      <Sidebar user={user} className="hidden md:flex" />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm13 9H7c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1zm-8-3h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1z"/>
            </svg>
            <h1 className="text-lg font-bold text-primary-600">Life Architect</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="text-slate-700"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-slate-800 bg-opacity-75">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-900">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="text-slate-700"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar user={user} className="flex-1" onNavigate={closeMobileMenu} />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
