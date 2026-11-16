import { BaseInput } from '../types';

/**
 * Higher-order function for memoizing pure function results.
 */
export const memoize = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyResolver: (...args: TArgs) => string = (...args) => JSON.stringify(args),
): ((...args: TArgs) => TReturn) => {
  const cache = new Map<string, TReturn>();
  return (...args: TArgs): TReturn => {
    const key = keyResolver(...args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Normalizes base input ('bin', 'oct', 'dec', 'hex' or number) to numeric radix.
 */
export const normalizeBase = (base: BaseInput): number => {
  if (typeof base === 'number') return base;
  const normalized = String(base).toLowerCase().trim();
  switch (normalized) {
    case 'bin':
    case '2':
      return 2;
    case 'oct':
    case '8':
      return 8;
    case 'dec':
    case '10':
      return 10;
    case 'hex':
    case '16':
      return 16;
    default: {
      const parsed = parseInt(normalized, 10);
      return Number.isNaN(parsed) ? 10 : parsed;
    }
  }
};

/**
 * Pure recursive permutation helper: P(radix, length) = radix * P(radix - 1, length - 1)
 */
const recursivePermutations = (length: number, radix: number): number => {
  if (length === 0) return 1;
  if (length < 0 || length > radix || radix <= 0) return 0;
  return radix * recursivePermutations(length - 1, radix - 1);
};

/**
 * Memoized version of permutation calculation for numeric values.
 */
const memoizedPermutations = memoize(
  (length: number, radix: number) => recursivePermutations(length, radix),
  (length, radix) => `${length}:${radix}`,
);

/**
 * Calculates how many distinct secret numbers exist for given length and base.
 * Implemented recursively and memoized.
 *
 * P(base, length) = base! / (base - length)!
 *
 * @param length Number of digits in secret (2-6)
 * @param base Number system (2, 8, 10, 16 or 'bin', 'oct', 'dec', 'hex')
 */
export const countPossibleSecrets = (length: number, base: BaseInput): number => {
  const radix = normalizeBase(base);
  return memoizedPermutations(length, radix);
};
