import { describe, it, expect } from 'vitest';
import { evaluateGuess } from '../src/core/evaluator';

describe('evaluateGuess', () => {
  it('identifies all bulls when the guess perfectly matches the secret', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess('01', '01')).toEqual({ bulls: 2, cows: 0 });
  });

  it('identifies all cows when all digits are present but in wrong positions', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
    expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
  });

  it('calculates mixed bulls and cows accurately', () => {
    expect(evaluateGuess('1234', '1325')).toEqual({ bulls: 1, cows: 2 });
  });

  it('handles secrets and guesses with leading zeroes', () => {
    expect(evaluateGuess('0123', '0321')).toEqual({ bulls: 2, cows: 2 });
  });

  it('handles hexadecimal case-insensitively for both bulls and cows', () => {
    expect(evaluateGuess('1aBc', '1AbC')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess('1a2b', 'B2A1')).toEqual({ bulls: 0, cows: 4 });
  });

  it('returns zeroes when there are no shared digits', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });
});
