import { describe, it, expect } from 'vitest';
import { createDigitValidator, isValidGuess } from '../src/core/validator';

describe('createDigitValidator', () => {
  it('is a curried factory returning a predicate function', () => {
    const isDecimal = createDigitValidator('dec');
    expect(typeof isDecimal).toBe('function');
  });

  it('validates binary digits (0 and 1)', () => {
    const isBin = createDigitValidator('bin');
    expect(isBin('0')).toBe(true);
    expect(isBin('1')).toBe(true);
    expect(isBin('2')).toBe(false);
    expect(isBin('a')).toBe(false);
    expect(isBin('')).toBe(false);
  });

  it('validates octal digits (0 through 7)', () => {
    const isOct = createDigitValidator('oct');
    ['0', '1', '2', '3', '4', '5', '6', '7'].forEach((char) => {
      expect(isOct(char)).toBe(true);
    });
    expect(isOct('8')).toBe(false);
    expect(isOct('9')).toBe(false);
    expect(isOct('b')).toBe(false);
  });

  it('validates decimal digits (0 through 9)', () => {
    const isDec = createDigitValidator('dec');
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((char) => {
      expect(isDec(char)).toBe(true);
    });
    expect(isDec('a')).toBe(false);
    expect(isDec('-')).toBe(false);
  });

  it('validates hexadecimal digits case-insensitively (0-9, a-f, A-F)', () => {
    const isHex = createDigitValidator('hex');
    ['0', '5', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'].forEach((char) => {
      expect(isHex(char)).toBe(true);
    });
    expect(isHex('g')).toBe(false);
    expect(isHex('G')).toBe(false);
    expect(isHex('z')).toBe(false);
  });

  it('rejects multi-character strings and invalid values', () => {
    const isDec = createDigitValidator(10);
    expect(isDec('12')).toBe(false);
    expect(isDec(' ')).toBe(false);
  });
});

describe('isValidGuess', () => {
  it('returns true for a valid guess matching length, base, and uniqueness', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
    expect(isValidGuess('01', 2, 'bin')).toBe(true);
    expect(isValidGuess('7654', 4, 'oct')).toBe(true);
    expect(isValidGuess('1aBf', 4, 'hex')).toBe(true);
  });

  it('allows leading zero (e.g. 0123)', () => {
    expect(isValidGuess('0123', 4, 'dec')).toBe(true);
  });

  it('rejects guesses with duplicate digits (including case-insensitive hex duplicates)', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
    expect(isValidGuess('1aAc', 4, 16)).toBe(false);
    expect(isValidGuess('00', 2, 'bin')).toBe(false);
  });

  it('rejects guesses where length does not match', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('12345', 4, 10)).toBe(false);
    expect(isValidGuess('', 4, 10)).toBe(false);
  });

  it('rejects guesses containing digits outside the allowed base', () => {
    expect(isValidGuess('1238', 4, 'oct')).toBe(false);
    expect(isValidGuess('012g', 4, 'hex')).toBe(false);
    expect(isValidGuess('102', 3, 'bin')).toBe(false);
    expect(isValidGuess('12a4', 4, 'dec')).toBe(false);
  });
});
