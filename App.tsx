
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PublicVerificationPage } from './components/PublicVerificationPage';
import { HomeownerPortal } from './components/HomeownerPortal';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    if (route.startsWith('#verify/')) {
      const hash = route.split('/')[1];
      return <PublicVerificationPage hash={hash} />;
    }
    if (route.startsWith('#portal/')) {
      const homeId = route.split('/')[1];
      return <HomeownerPortal homeId={homeId} />;
    }
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      {renderContent()}
    </div>
  );
};

export default App;
