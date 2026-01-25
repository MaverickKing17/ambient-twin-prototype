import React from 'react';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <Dashboard />
    </div>
  );
};

export default App;