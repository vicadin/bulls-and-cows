import { BaseInput } from '../types';
import { getBaseAlphabet } from './validator';

const pickUniqueRecursive = (
  pool: readonly string[],
  count: number,
  acc: readonly string[],
  random: () => number,
): readonly string[] => {
  if (count <= 0 || pool.length === 0) {
    return acc;
  }
  const rawRand = random();
  const clampedRand = Math.max(0, Math.min(0.9999999999999999, rawRand));
  const chosenIndex = Math.floor(clampedRand * pool.length);
  const chosenItem = pool[chosenIndex];
  const nextPool = pool.filter((_, index) => index !== chosenIndex);

  return pickUniqueRecursive(nextPool, count - 1, [...acc, chosenItem], random);
};

export const generateSecret = (
  length: number,
  base: BaseInput,
  random: () => number = Math.random,
): string => {
  const alphabet = getBaseAlphabet(base).split('');

  if (length <= 0 || length > alphabet.length) {
    throw new Error(
      `Cannot generate secret of length ${length} for base with ${alphabet.length} digits`,
    );
  }

  const selectedDigits = pickUniqueRecursive(alphabet, length, [], random);
  return selectedDigits.join('').toLowerCase();
};
