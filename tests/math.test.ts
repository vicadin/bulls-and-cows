import { describe, it, expect } from 'vitest';
import { countPossibleSecrets, normalizeBase } from '../src/core/math';

describe('normalizeBase', () => {
  it('converts string base names and numeric values to radix numbers', () => {
    expect(normalizeBase('bin')).toBe(2);
    expect(normalizeBase('oct')).toBe(8);
    expect(normalizeBase('dec')).toBe(10);
    expect(normalizeBase('hex')).toBe(16);
    expect(normalizeBase(10)).toBe(10);
    expect(normalizeBase('16')).toBe(16);
  });
});

describe('countPossibleSecrets', () => {
  it('calculates permutations correctly for binary base length 2', () => {
    expect(countPossibleSecrets(2, 'bin')).toBe(2);
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('calculates permutations correctly for decimal base length 4', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(4, 'dec')).toBe(5040);
  });

  it('calculates permutations correctly for octal base length 3', () => {
    expect(countPossibleSecrets(3, 'oct')).toBe(336);
  });

  it('calculates permutations correctly for hex base length 4', () => {
    expect(countPossibleSecrets(4, 'hex')).toBe(43680);
  });

  it('returns 1 for length 0', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns 0 when length exceeds base', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
    expect(countPossibleSecrets(11, 10)).toBe(0);
  });

  it('consistently returns identical results and leverages memoization', () => {
    const firstCall = countPossibleSecrets(5, 10);
    const secondCall = countPossibleSecrets(5, 10);
    expect(firstCall).toBe(30240);
    expect(secondCall).toBe(firstCall);
  });
});
