import React from 'react';
import SearchEngine from './components/SearchEngine';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <SearchEngine />
      </div>
    </div>
  );
};

export default App; 