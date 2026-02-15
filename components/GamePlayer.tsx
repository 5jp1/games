
import React, { useState, useRef, useEffect } from 'react';
import { Game } from '../types';
import KeyEmulator from './KeyEmulator';

interface GamePlayerProps {
  game: Game;
  onBack: () => void;
}

const GamePlayer: React.FC<GamePlayerProps> = ({ game, onBack }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmulator, setShowEmulator] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-[100]">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-6 w-px bg-slate-700"></div>
          <h2 className="font-bold text-slate-200 truncate max-w-[200px] md:max-w-md">
            {game.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowEmulator(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2"
            title="Experimental Key Emulator"
          >
            <i className="fa-solid fa-keyboard"></i>
            <span className="hidden sm:inline">Key Emulator</span>
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg transition-colors flex items-center gap-2"
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Game Iframe Container */}
      <div ref={playerContainerRef} className="flex-1 relative bg-[#111] overflow-hidden">
        <iframe
          ref={iframeRef}
          src={game.link}
          title={game.title}
          className="w-full h-full border-none"
          allow="fullscreen; autoplay; encrypted-media; camera; microphone"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-same-origin"
        />
        
        {/* On-screen Emulator Overlay */}
        {showEmulator && (
          <KeyEmulator 
            onClose={() => setShowEmulator(false)} 
            targetWindow={iframeRef.current?.contentWindow || null}
          />
        )}
      </div>

      {/* Info Bar (Optional, only visible when not fullscreen) */}
      {!isFullscreen && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 text-xs text-slate-500 flex justify-between items-center">
          <p>Running from: <span className="text-slate-400">{game.source}</span></p>
          <p className="flex items-center gap-1">
            <i className="fa-solid fa-circle-info"></i>
            Experimental emulator may not work with all frames
          </p>
        </div>
      )}
    </div>
  );
};

export default GamePlayer;
