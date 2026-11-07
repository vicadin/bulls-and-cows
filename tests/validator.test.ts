import { describe, it, expect } from 'vitest';
import { createDigitValidator } from '../../src/core/validator';

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
