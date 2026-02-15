
export interface Game {
  id: string;
  title: string;
  image: string;
  link: string;
  source: 'BetterMath' | 'PlugPlay';
}

export interface EmulatorKey {
  label: string;
  key: string;
  id: string;
}
