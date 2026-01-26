
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PublicVerificationPage } from './components/PublicVerificationPage';
import { HomeownerPortal } from './components/HomeownerPortal';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

    // PROTECTED ROUTES (Contractor Only)
    if (isAuthenticated) {
      return <Dashboard />;
    } else {
      return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
    }
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      {renderContent()}
    </div>
  );
};

export default App;
