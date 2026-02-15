
import React from 'react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(game)}
      className="group relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-slate-700"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={game.image} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
          {game.title}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1 block">
          {game.source}
        </span>
      </div>

      <div className="absolute top-2 right-2 bg-blue-600 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <i className="fa-solid fa-play text-white text-[10px] ml-0.5"></i>
      </div>
    </div>
  );
};

export default GameCard;
