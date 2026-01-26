
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PublicVerificationPage } from './components/PublicVerificationPage';
import { HomeownerPortal } from './components/HomeownerPortal';
import { LoginScreen } from './components/LoginScreen';
import { supabase } from './services/supabaseService';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Check current session on load
    const checkUser = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      }
      setIsInitializing(false);
    };
    checkUser();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    }) || { data: { subscription: null } };

    // 3. Handle routing
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription?.unsubscribe();
    };
  }, []);

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

    if (isInitializing) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    // PROTECTED ROUTES (Contractor Only)
    if (isAuthenticated) {
      return <Dashboard />;
    } else {
      return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
    }
  };

  return (
    <div className="min-h-screen w-full p-0 md:p-0">
      {renderContent()}
    </div>
  );
};

export default App;
