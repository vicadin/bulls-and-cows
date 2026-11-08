import { GuessResult } from '../types';

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  const normSecret = secret.toLowerCase().split('');
  const normGuess = guess.toLowerCase().split('');

  return normGuess.reduce<GuessResult>(
    (acc, char, index) => {
      if (char === normSecret[index]) {
        return { ...acc, bulls: acc.bulls + 1 };
      }
      if (normSecret.includes(char)) {
        return { ...acc, cows: acc.cows + 1 };
      }
      return acc;
    },
    { bulls: 0, cows: 0 },
  );
};
