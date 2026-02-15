
import React, { useState } from 'react';
import { EmulatorKey } from '../types';

interface KeyEmulatorProps {
  onClose: () => void;
  targetWindow: Window | null;
}

const DEFAULT_KEYS: EmulatorKey[] = [
  { id: 'w', label: 'W', key: 'w' },
  { id: 'a', label: 'A', key: 'a' },
  { id: 's', label: 'S', key: 's' },
  { id: 'd', label: 'D', key: 'd' },
  { id: 'space', label: '⎵', key: ' ' },
  { id: 'up', label: '↑', key: 'ArrowUp' },
  { id: 'down', label: '↓', key: 'ArrowDown' },
  { id: 'left', label: '←', key: 'ArrowLeft' },
  { id: 'right', label: '→', key: 'ArrowRight' },
];

const KeyEmulator: React.FC<KeyEmulatorProps> = ({ onClose, targetWindow }) => {
  const [keys, setKeys] = useState<EmulatorKey[]>(DEFAULT_KEYS);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  const simulateKeyEvent = (type: 'keydown' | 'keyup', keyStr: string) => {
    if (!targetWindow) return;
    
    const event = new KeyboardEvent(type, {
      key: keyStr,
      bubbles: true,
      cancelable: true,
      view: targetWindow,
    });
    
    // Note: Due to cross-origin policies, this might be ignored by some games
    targetWindow.dispatchEvent(event);
    // Also try to dispatch on the window object as some listeners attach there
    window.dispatchEvent(event);
  };

  const addKey = () => {
    if (!newKeyLabel || !newKeyValue) return;
    const newKey: EmulatorKey = {
      id: `custom-${Date.now()}`,
      label: newKeyLabel,
      key: newKeyValue
    };
    setKeys([...keys, newKey]);
    setNewKeyLabel('');
    setNewKeyValue('');
    setShowAddKey(false);
  };

  const removeKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  return (
    <div className="absolute bottom-8 right-8 z-[200] pointer-events-none w-full max-w-xs sm:max-w-md flex flex-col items-end">
      <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-slate-700 pointer-events-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-gamepad text-blue-500"></i>
            Key Emulator
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddKey(!showAddKey)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className={`fa-solid ${showAddKey ? 'fa-minus' : 'fa-plus'}`}></i>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {showAddKey && (
          <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700 flex flex-col gap-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Label (e.g. Z)" 
                className="bg-slate-900 border-none rounded px-2 py-1 text-xs text-white flex-1"
                value={newKeyLabel}
                onChange={e => setNewKeyLabel(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Key (e.g. z)" 
                className="bg-slate-900 border-none rounded px-2 py-1 text-xs text-white flex-1"
                value={newKeyValue}
                onChange={e => setNewKeyValue(e.target.value)}
              />
            </div>
            <button 
              onClick={addKey}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 rounded transition-colors"
            >
              ADD BUTTON
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {keys.map(k => (
            <div key={k.id} className="relative group/key">
              <button
                onMouseDown={() => simulateKeyEvent('keydown', k.key)}
                onMouseUp={() => simulateKeyEvent('keyup', k.key)}
                onTouchStart={(e) => { e.preventDefault(); simulateKeyEvent('keydown', k.key); }}
                onTouchEnd={(e) => { e.preventDefault(); simulateKeyEvent('keyup', k.key); }}
                className="w-full aspect-square flex items-center justify-center bg-slate-800 hover:bg-blue-600 active:scale-95 border border-slate-700 rounded-lg text-slate-200 font-bold transition-all shadow-md select-none"
              >
                {k.label}
              </button>
              <button 
                onClick={() => removeKey(k.id)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover/key:opacity-100 transition-opacity"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[10px] text-slate-500 italic text-center">
          Note: This feature is experimental and may be limited by frame security policies.
        </p>
      </div>
    </div>
  );
};

export default KeyEmulator;
