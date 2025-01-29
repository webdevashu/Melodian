import React, { useState } from 'react';
import MusicPlayer from './components/MusicPlayer';
import { Music2, Search } from 'lucide-react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the search query to MusicPlayer component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <header className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Music2 className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Melodian</h1>
          </div>
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="relative flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by song, artist, album, or lyrics..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white/90 backdrop-blur-sm rounded-l-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-r-0"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-r-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-l-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <MusicPlayer searchQuery={searchQuery} />
      </main>
    </div>
  );
}

export default App;