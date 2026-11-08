import { GameRecord, GameSettings, GameState } from '../types';

export const INITIAL_SETTINGS: GameSettings = {
  length: 4,
  base: 'dec',
};

export const createInitialState = (_settings: GameSettings = INITIAL_SETTINGS): GameState => {
  return null as unknown as GameState;
};

export const startGame = (
  _settings: GameSettings,
  _random?: () => number,
  _now?: number,
): GameState => {
  return null as unknown as GameState;
};

export const submitGuess = (
  _state: GameState,
  _rawGuess: string,
  _now?: number,
): { state: GameState; duplicate: boolean; error?: string } => {
  return { state: _state, duplicate: false };
};

export const addRecord = (
  records: readonly GameRecord[],
  _record: GameRecord,
  _limit = 10,
): readonly GameRecord[] => {
  return records;
};
