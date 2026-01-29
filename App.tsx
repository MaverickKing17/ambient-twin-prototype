import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PublicVerificationPage } from './components/PublicVerificationPage';
import { HomeownerPortal } from './components/HomeownerPortal';
import { LoginScreen } from './components/LoginScreen';
import PricingSection from './components/PricingSection'; // IMPORT THE NEW SECTION
import { supabase } from './services/supabaseService';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Check current session on load
    const checkUser = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) setIsAuthenticated(true);
        } catch (e) {
          console.warn("Supabase Auth unreachable.");
        }
      }
      setIsInitializing(false);
    };
    checkUser();

    // 2. Listen for auth changes
    const authSubscription = supabase?.auth?.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    // 3. Handle routing
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      authSubscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const renderContent = () => {
    // PUBLIC ROUTES (No Login Required)
    if (route.startsWith('#verify/')) {
      const hash = route.split('/')[1];
      return <PublicVerificationPage hash={hash} />;
    }
    if (route.startsWith('#portal/')) {
      const homeId = route.split('/')[1];
      return <HomeownerPortal homeId={homeId} />;
    }
    
    // Dedicated Pricing Route (for sending direct links: your-app.com/#pricing)
    if (route === '#pricing') {
       return <PricingSection />;
    }

    if (isInitializing) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    // PROTECTED ROUTES
    if (isAuthenticated) {
      return <Dashboard />;
    } else {
      // LANDING PAGE STRATEGY: Show Login, then show Pricing below it!
      return (
        <div className="flex flex-col">
          <LoginScreen onLogin={handleLoginSuccess} />
          <div id="pricing-section">
            <PricingSection />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0b1120]">
      {renderContent()}
    </div>
  );
};

export default App;
