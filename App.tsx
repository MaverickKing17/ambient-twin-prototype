import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PublicVerificationPage } from './components/PublicVerificationPage';

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
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      {renderContent()}
    </div>
  );
};

export default App;
