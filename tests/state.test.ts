import { describe, it, expect } from 'vitest';
import { createInitialState, startGame, submitGuess, addRecord } from '../src/core/state';
import { GameRecord, GameSettings } from '../src/types';

describe('Game state management', () => {
  const settings: GameSettings = { length: 4, base: 'dec' };

  it('creates an initial idle state with empty history', () => {
    const state = createInitialState(settings);
    expect(state.status).toBe('idle');
    expect(state.history).toHaveLength(0);
    expect(state.settings).toEqual(settings);
    expect(state.secret).toBe('');
  });

  it('starts a new game immutably with generated secret and active timer', () => {
    const fixedRandom = () => 0;
    const startTime = 1000;
    const state = startGame(settings, fixedRandom, startTime);

    expect(state.status).toBe('playing');
    expect(state.secret).toBe('0123');
    expect(state.history).toEqual([]);
    expect(state.startTime).toBe(1000);
    expect(state.endTime).toBeNull();
  });

  it('submits valid guess, creates new history entry immutably without mutating previous state', () => {
    const fixedRandom = () => 0;
    const state0 = startGame(settings, fixedRandom, 1000);

    const result1 = submitGuess(state0, '0124', 2000);
    expect(result1.error).toBeUndefined();
    expect(result1.duplicate).toBe(false);

    const state1 = result1.state;
    expect(state0.history).toHaveLength(0);
    expect(state1.history).toHaveLength(1);
    expect(state1.history[0]).toEqual({
      guess: '0124',
      bulls: 3,
      cows: 0,
      timestamp: 2000,
    });
    expect(state1.status).toBe('playing');
  });

  it('ignores duplicate guesses without duplicating history entries', () => {
    const fixedRandom = () => 0;
    const state0 = startGame(settings, fixedRandom, 1000);
    const { state: state1 } = submitGuess(state0, '0124', 2000);

    const result2 = submitGuess(state1, '0124', 3000);
    expect(result2.duplicate).toBe(true);
    expect(result2.state.history).toHaveLength(1);
    expect(result2.state.history).toBe(state1.history);
  });

  it('marks game as won when bulls equals secret length', () => {
    const fixedRandom = () => 0;
    const state0 = startGame(settings, fixedRandom, 1000);
    const result = submitGuess(state0, '0123', 5000);

    expect(result.state.status).toBe('won');
    expect(result.state.history).toHaveLength(1);
    expect(result.state.history[0].bulls).toBe(4);
    expect(result.state.endTime).toBe(5000);
  });

  it('orders game records by attempts ascending, then durationMs ascending', () => {
    const records: GameRecord[] = [
      { id: '1', base: 'dec', length: 4, attempts: 5, durationMs: 20000, date: '2026-01-01' },
      { id: '2', base: 'dec', length: 4, attempts: 3, durationMs: 15000, date: '2026-01-02' },
    ];

    const newRecord: GameRecord = {
      id: '3',
      base: 'dec',
      length: 4,
      attempts: 3,
      durationMs: 12000,
      date: '2026-01-03',
    };

    const updated = addRecord(records, newRecord, 5);
    expect(updated).toHaveLength(3);
    expect(updated[0].id).toBe('3');
    expect(updated[1].id).toBe('2');
    expect(updated[2].id).toBe('1');
  });
});
