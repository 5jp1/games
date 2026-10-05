import React, { useState, useEffect, useRef } from 'react';
import { EmulatorKey } from '../types';

interface KeyEmulatorProps {
  onClose: () => void;
  iframe: HTMLIFrameElement | null;
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

// Named keys -> [code, keyCode]. Many games only read `code` or the legacy `keyCode`.
const SPECIAL_KEYS: Record<string, [string, number]> = {
  ' ': ['Space', 32],
  Enter: ['Enter', 13],
  Escape: ['Escape', 27],
  Tab: ['Tab', 9],
  Backspace: ['Backspace', 8],
  Shift: ['ShiftLeft', 16],
  Control: ['ControlLeft', 17],
  Alt: ['AltLeft', 18],
  ArrowLeft: ['ArrowLeft', 37],
  ArrowUp: ['ArrowUp', 38],
  ArrowRight: ['ArrowRight', 39],
  ArrowDown: ['ArrowDown', 40],
};

const normalizeKey = (raw: string): string => {
  const aliases: Record<string, string> = {
    space: ' ', enter: 'Enter', esc: 'Escape', escape: 'Escape', tab: 'Tab',
    shift: 'Shift', ctrl: 'Control', control: 'Control', alt: 'Alt', backspace: 'Backspace',
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
  };
  return aliases[raw.toLowerCase()] ?? raw;
};

const describeKey = (key: string): { code: string; keyCode: number } => {
  if (SPECIAL_KEYS[key]) {
    const [code, keyCode] = SPECIAL_KEYS[key];
    return { code, keyCode };
  }
  if (/^[a-z]$/i.test(key)) {
    const upper = key.toUpperCase();
    return { code: `Key${upper}`, keyCode: upper.charCodeAt(0) };
  }
  if (/^[0-9]$/.test(key)) {
    return { code: `Digit${key}`, keyCode: key.charCodeAt(0) };
  }
  return { code: key, keyCode: key.length === 1 ? key.toUpperCase().charCodeAt(0) : 0 };
};

// Returns the iframe's window/document only when we are allowed to touch them (same origin).
const getFrame = (iframe: HTMLIFrameElement | null) => {
  try {
    const win = iframe?.contentWindow as (Window & typeof globalThis) | null;
    const doc = win?.document;
    if (!win || !doc) return null;
    return { win, doc };
  } catch {
    return null;
  }
};

const KeyEmulator: React.FC<KeyEmulatorProps> = ({ onClose, iframe }) => {
  const [keys, setKeys] = useState<EmulatorKey[]>(DEFAULT_KEYS);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [supported, setSupported] = useState(true);
  const pressedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => setSupported(!!getFrame(iframe));
    check();
    iframe?.addEventListener('load', check);
    return () => iframe?.removeEventListener('load', check);
  }, [iframe]);

  const dispatchKey = (type: 'keydown' | 'keyup', key: string) => {
    const frame = getFrame(iframe);
    if (!frame) {
      setSupported(false);
      return;
    }
    const { win, doc } = frame;
    const { code, keyCode } = describeKey(key);

    // Build the event with the iframe's own constructor so it belongs to the game's realm.
    const event = new win.KeyboardEvent(type, {
      key,
      code,
      bubbles: true,
      cancelable: true,
      composed: true,
      view: win,
    });
    // keyCode/which can't be set through the constructor, so define them explicitly.
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    Object.defineProperty(event, 'which', { get: () => keyCode });
    Object.defineProperty(event, 'charCode', { get: () => 0 });

    // Target what a real key press would hit: the focused element, else the game canvas, else the document.
    // The event bubbles up to document and window, where most games listen.
    const active = doc.activeElement;
    const target =
      active && active !== doc.body && active !== doc.documentElement
        ? active
        : doc.querySelector('canvas') || doc.body || doc;
    target.dispatchEvent(event);

    if (type === 'keydown' && key.length === 1) {
      const press = new win.KeyboardEvent('keypress', {
        key, code, bubbles: true, cancelable: true, view: win,
      });
      Object.defineProperty(press, 'keyCode', { get: () => key.charCodeAt(0) });
      Object.defineProperty(press, 'which', { get: () => key.charCodeAt(0) });
      Object.defineProperty(press, 'charCode', { get: () => key.charCodeAt(0) });
      target.dispatchEvent(press);
    }
  };

  const press = (k: EmulatorKey) => {
    if (pressedRef.current.has(k.id)) return;
    pressedRef.current.add(k.id);
    setPressed(new Set(pressedRef.current));
    dispatchKey('keydown', k.key);
  };

  const release = (k: EmulatorKey) => {
    if (!pressedRef.current.has(k.id)) return;
    pressedRef.current.delete(k.id);
    setPressed(new Set(pressedRef.current));
    dispatchKey('keyup', k.key);
  };

  // Release anything still held when the emulator closes.
  useEffect(() => {
    return () => {
      pressedRef.current.forEach(id => {
        const k = keys.find(key => key.id === id);
        if (k) dispatchKey('keyup', k.key);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addKey = () => {
    if (!newKeyLabel || !newKeyValue) return;
    const newKey: EmulatorKey = {
      id: `custom-${Date.now()}`,
      label: newKeyLabel,
      key: normalizeKey(newKeyValue)
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
                placeholder="Key (e.g. z, space, enter)" 
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
                // preventDefault keeps focus inside the game frame instead of moving it to this button
                onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); press(k); }}
                onPointerUp={(e) => { e.preventDefault(); release(k); }}
                onPointerCancel={() => release(k)}
                onLostPointerCapture={() => release(k)}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'none' }}
                className={`w-full aspect-square flex items-center justify-center border rounded-lg font-bold transition-all shadow-md select-none ${
                  pressed.has(k.id)
                    ? 'bg-blue-600 border-blue-400 text-white scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
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
          {supported
            ? 'Hold a button to hold the key.'
            : "This game is hosted on another site, so its browser security blocks emulated keys."}
        </p>
      </div>
    </div>
  );
};

export default KeyEmulator;
