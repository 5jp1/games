
import React, { useState } from 'react';
import { Game } from '../types';

interface AdminDialogProps {
  onClose: () => void;
  onSubmit: (game: Omit<Game, 'id' | 'source'>) => void;
}

const AdminDialog: React.FC<AdminDialogProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image || !link) return;
    onSubmit({ title, image, link });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-plus-circle text-blue-500"></i>
            Add New Game
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Game Title</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
              placeholder="e.g. Awesome New Game"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
            <input 
              required
              type="url" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
              placeholder="https://example.com/image.png"
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Embed/Game Link</label>
            <input 
              required
              type="url" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-colors"
              placeholder="https://example.com/game/"
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Add to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDialog;
