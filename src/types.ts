export type BaseName = 'bin' | 'oct' | 'dec' | 'hex';
export type Radix = 2 | 8 | 10 | 16;
export type BaseInput = Radix | BaseName | number | string;

export interface GuessResult {
  readonly bulls: number;
  readonly cows: number;
}

export interface HistoryEntry {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
  readonly timestamp: number;
}

export type GameStatus = 'idle' | 'playing' | 'won';

export interface GameSettings {
  readonly length: number;
  readonly base: BaseName;
}

export interface GameState {
  readonly settings: GameSettings;
  readonly secret: string;
  readonly history: readonly HistoryEntry[];
  readonly status: GameStatus;
  readonly startTime: number | null;
  readonly endTime: number | null;
}

export interface GameRecord {
  readonly id: string;
  readonly base: BaseName;
  readonly length: number;
  readonly attempts: number;
  readonly durationMs: number;
  readonly date: string;
}
