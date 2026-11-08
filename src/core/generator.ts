import { BaseInput } from '../types';

export const generateSecret = (
  _length: number,
  _base: BaseInput,
  _random: () => number = Math.random,
): string => {
  return ''; // todo
};
