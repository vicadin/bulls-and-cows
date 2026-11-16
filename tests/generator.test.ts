import { describe, it, expect } from 'vitest';
import { generateSecret } from '../src/core/generator';
import { isValidGuess } from '../src/core/validator';

const createSequenceRandom = (sequence: number[]): (() => number) => {
  let index = 0;
  return () => {
    const val = sequence[index % sequence.length];
    index += 1;
    return val;
  };
};

describe('generateSecret', () => {
  it('generates a valid secret string of the requested length', () => {
    const secret = generateSecret(4, 'dec');
    expect(secret).toHaveLength(4);
    expect(isValidGuess(secret, 4, 'dec')).toBe(true);
  });

  it('produces predictable, deterministic results when injected with a custom random function', () => {
    const zeroRandom = () => 0;
    const secret1 = generateSecret(4, 'dec', zeroRandom);
    const secret2 = generateSecret(4, 'dec', zeroRandom);

    expect(secret1).toBe('0123');
    expect(secret2).toBe('0123');
  });

  it('can generate secrets with leading zeroes (e.g. 0123)', () => {
    const sequence = [0, 0, 0, 0];
    const secret = generateSecret(4, 10, createSequenceRandom(sequence));
    expect(secret.startsWith('0')).toBe(true);
    expect(secret).toBe('0123');
  });

  it('generates binary secret of length 2 correctly', () => {
    const secretBin = generateSecret(2, 'bin', () => 0.6);
    expect(secretBin).toHaveLength(2);
    expect(isValidGuess(secretBin, 2, 'bin')).toBe(true);
  });

  it('generates hex secret with valid hex characters in lowercase', () => {
    const secretHex = generateSecret(4, 'hex');
    expect(secretHex).toHaveLength(4);
    expect(isValidGuess(secretHex, 4, 'hex')).toBe(true);
    expect(secretHex).toBe(secretHex.toLowerCase());
  });

  it('throws an error if length exceeds available digits in base', () => {
    expect(() => generateSecret(3, 'bin')).toThrow();
  });
});
