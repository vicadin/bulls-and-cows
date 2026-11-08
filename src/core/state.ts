import { GameRecord, GameSettings, GameState, HistoryEntry } from '../types';
import { evaluateGuess } from './evaluator';
import { generateSecret } from './generator';
import { isValidGuess } from './validator';

export const INITIAL_SETTINGS: GameSettings = {
  length: 4,
  base: 'dec',
};

export const STORAGE_RECORDS_KEY = 'bulls_and_cows_records_v1';

/**
 * Creates the initial game state in 'idle' status.
 */
export const createInitialState = (settings: GameSettings = INITIAL_SETTINGS): GameState => ({
  settings,
  secret: '',
  history: [],
  status: 'idle',
  startTime: null,
  endTime: null,
});

/**
 * Starts a new game round immutably: generates a secret and records the start timestamp.
 */
export const startGame = (
  settings: GameSettings,
  random: () => number = Math.random,
  now: number = Date.now(),
): GameState => ({
  settings,
  secret: generateSecret(settings.length, settings.base, random),
  history: [],
  status: 'playing',
  startTime: now,
  endTime: null,
});

export interface SubmitGuessOutcome {
  readonly state: GameState;
  readonly duplicate: boolean;
  readonly error?: string;
}

export const submitGuess = (
  state: GameState,
  rawGuess: string,
  now: number = Date.now(),
): SubmitGuessOutcome => {
  if (state.status !== 'playing') {
    return {
      state,
      duplicate: false,
      error: 'Cannot submit guess when game is not active',
    };
  }

  const normalized = rawGuess.toLowerCase().trim();

  if (!isValidGuess(normalized, state.settings.length, state.settings.base)) {
    return {
      state,
      duplicate: false,
      error: 'Invalid guess for the current length and number base',
    };
  }

  const isDuplicate = state.history.some((entry) => entry.guess === normalized);
  if (isDuplicate) {
    return {
      state,
      duplicate: true,
    };
  }

  const { bulls, cows } = evaluateGuess(state.secret, normalized);
  const newEntry: HistoryEntry = {
    guess: normalized,
    bulls,
    cows,
    timestamp: now,
  };

  const isWon = bulls === state.settings.length;

  const nextState: GameState = {
    ...state,
    history: [...state.history, newEntry],
    status: isWon ? 'won' : 'playing',
    endTime: isWon ? now : null,
  };

  return {
    state: nextState,
    duplicate: false,
  };
};

export const addRecord = (
  records: readonly GameRecord[],
  newRecord: GameRecord,
  limit = 10,
): readonly GameRecord[] => {
  const combined = [...records, newRecord];
  const sorted = combined.sort((a, b) => {
    if (a.attempts !== b.attempts) {
      return a.attempts - b.attempts;
    }
    return a.durationMs - b.durationMs;
  });
  return sorted.slice(0, limit);
};

export const loadRecordsFromStorage = (): readonly GameRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRecordsToStorage = (records: readonly GameRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota/access errors
  }
};
