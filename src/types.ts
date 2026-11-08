export type BaseName = 'bin' | 'oct' | 'dec' | 'hex';
export type Radix = 2 | 8 | 10 | 16;
export type BaseInput = Radix | BaseName | number | string;

export interface GuessResult {
  readonly bulls: number;
  readonly cows: number;
}
