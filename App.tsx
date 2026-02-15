
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Game } from './types';
import { INITIAL_BETTERMATH_GAMES, INITIAL_PLUGPLAY_GAMES, KONAMI_CODE } from './constants';
import GameCard from './components/GameCard';
import GamePlayer from './components/GamePlayer';
import AdminDialog from './components/AdminDialog';

const REMOTE_GAMES_URL = 'https://raw.githubusercontent.com/5jp1/gamescontansets/refs/heads/main/constants.tsx';

const App: React.FC = () => {
  const [activeLibrary, setActiveLibrary] = useState<'BetterMath' | 'PlugPlay'>('BetterMath');
  const [betterMathGames, setBetterMathGames] = useState<Game[]>(INITIAL_BETTERMATH_GAMES);
  const [plugPlayGames, setPlugPlayGames] = useState<Game[]>(INITIAL_PLUGPLAY_GAMES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);

  // Fetch Games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(REMOTE_GAMES_URL);
        if (!response.ok) throw new Error('Failed to fetch games');
        const text = await response.text();

        // Helper to parse the array from the TSX file content
        const parseGames = (variableName: string): Game[] => {
          // Matches: export const VAR_NAME: Game[] = [...];
          // We use a regex that matches the assignment and captures the array literal
          const regex = new RegExp(`export\\s+const\\s+${variableName}[^=]*=\\s*(\\[[\\s\\S]*?\\]);`);
          const match = text.match(regex);
          if (match && match[1]) {
            // Using new Function to evaluate the array literal string as JavaScript
            // This is safe-ish here only because we trust the source URL provided
            return new Function('return ' + match[1])();
          }
          return [];
        };

        const fetchedBetterMath = parseGames('INITIAL_BETTERMATH_GAMES');
        const fetchedPlugPlay = parseGames('INITIAL_PLUGPLAY_GAMES');

        if (fetchedBetterMath.length > 0) setBetterMathGames(fetchedBetterMath);
        if (fetchedPlugPlay.length > 0) setPlugPlayGames(fetchedPlugPlay);

      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Secret Admin Activation (Konami Code)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const expectedKey = KONAMI_CODE[konamiProgress];

      if (key.toLowerCase() === expectedKey.toLowerCase()) {
        const nextProgress = konamiProgress + 1;
        setKonamiProgress(nextProgress);
        if (nextProgress === KONAMI_CODE.length) {
          setIsAdmin(true);
          setKonamiProgress(0);
          alert('Admin Mode Activated!');
        }
      } else {
        setKonamiProgress(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress]);

  const displayedGames = useMemo(() => {
    const pool = activeLibrary === 'BetterMath' ? betterMathGames : plugPlayGames;
    return pool.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeLibrary, betterMathGames, plugPlayGames, searchQuery]);

  const handleAddGame = useCallback((newGame: Omit<Game, 'id' | 'source'>) => {
    const game: Game = {
      ...newGame,
      id: `custom-${Date.now()}`,
      source: 'BetterMath'
    };
    setBetterMathGames(prev => [game, ...prev]);
    setShowAdminDialog(false);
  }, []);

  if (selectedGame) {
    return (
      <GamePlayer 
        game={selectedGame} 
        onBack={() => setSelectedGame(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold gradient-text tracking-tighter">
            BetterMath
          </h1>
          
          <div className="flex flex-1 max-w-xl items-center bg-slate-800 rounded-full px-4 py-2 border border-slate-700 focus-within:border-blue-500 transition-colors">
            <i className="fa-solid fa-search text-slate-400 mr-2"></i>
            <input 
              type="text" 
              placeholder="Search for a game..." 
              className="bg-transparent border-none outline-none flex-1 text-slate-200 placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => setShowAdminDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i> Add Game
              </button>
            )}
            <div className="bg-slate-800 rounded-lg p-1 flex">
              <button 
                onClick={() => setActiveLibrary('BetterMath')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeLibrary === 'BetterMath' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                BetterMath
              </button>
              <button 
                onClick={() => setActiveLibrary('PlugPlay')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeLibrary === 'PlugPlay' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                PlugPlay
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-pulse">
            <i className="fa-solid fa-gamepad text-6xl mb-4"></i>
            <p className="text-xl font-medium">Loading Games Library...</p>
          </div>
        ) : displayedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {displayedGames.map(game => (
              <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <i className="fa-solid fa-ghost text-6xl mb-4 opacity-20"></i>
            <p className="text-xl">No games found matching "{searchQuery}"</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} BetterMath. Curated with ❤️ for students.</p>
        <p className="mt-1">Experience classic and modern web games in full speed.</p>
      </footer>

      {showAdminDialog && (
        <AdminDialog 
          onClose={() => setShowAdminDialog(false)} 
          onSubmit={handleAddGame} 
        />
      )}
    </div>
  );
};

export default App;
