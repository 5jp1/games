
import { Game } from './types';

// Games are now fetched dynamically from an external source.
// These exports serve as initial empty states or fallbacks.

export const INITIAL_BETTERMATH_GAMES: Game[] = [];

export const INITIAL_PLUGPLAY_GAMES: Game[] = [];

export const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a', 'Enter'
];
