export interface CalendarDate { year: number; month: number; day: number }
export type EraKey = 'meiji' | 'taisho' | 'showa' | 'heisei' | 'reiwa';
export type ErrorCode = 'unknown' | 'invalid-date' | 'invalid-era' | 'out-of-range';
export type ParsedInput =
  | { type: 'gregorian-year'; year: number }
  | ({ type: 'date'; era?: EraKey } & CalendarDate)
  | { type: 'era-year'; year: number; era: EraKey; eraYear: number }
  | { type: 'age'; age: number }
  | { type: 'ambiguous'; value: number; suggestions: string[] }
  | { type: 'empty' }
  | { type: 'error'; code: ErrorCode; message: string };
export type BirthInput = Extract<ParsedInput, { type: 'gregorian-year' | 'date' | 'era-year' }>;

export class InputError extends Error {
  constructor(public code: ErrorCode, message: string) { super(message); }
}
