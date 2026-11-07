import { BaseInput } from '../types';
import { normalizeBase } from './math';

export const ALPHABET = '0123456789abcdef';

export const getBaseAlphabet = (base: BaseInput): string => {
  const radix = normalizeBase(base);
  return ALPHABET.slice(0, Math.min(radix, ALPHABET.length));
};

export const createDigitValidator = (base: BaseInput): ((char: string) => boolean) => {
  const allowed = getBaseAlphabet(base);
  const allowedSet = new Set(allowed);

  return (char: string): boolean => {
    if (typeof char !== 'string' || char.length !== 1) {
      return false;
    }
    return allowedSet.has(char.toLowerCase());
  };
};
