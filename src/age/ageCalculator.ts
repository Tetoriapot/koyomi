import { InputError, type BirthInput, type CalendarDate } from '../parser/types';
import { assertDate, assertYear, compareDates, isLeapYear } from '../utils/date';

export type AgeResult = { type: 'exact'; age: number } | { type: 'range'; min: number; max: number } | { type: 'unborn' };

export function ageFromYear(birthYear: number, referenceYear: number): AgeResult {
  assertYear(birthYear); assertYear(referenceYear);
  const max = referenceYear - birthYear;
  return max < 0 ? { type: 'unborn' } : { type: 'range', min: Math.max(0, max - 1), max };
}

export function exactAge(birth: CalendarDate, reference: CalendarDate): AgeResult {
  assertDate(birth); assertDate(reference);
  if (compareDates(reference, birth) < 0) return { type: 'unborn' };
  const beforeBirthday = reference.month < birth.month || (reference.month === birth.month && reference.day < birth.day);
  return { type: 'exact', age: reference.year - birth.year - (beforeBirthday ? 1 : 0) };
}

export function calculateAge(birth: BirthInput, reference: CalendarDate): AgeResult {
  return birth.type === 'date' ? exactAge(birth, reference) : ageFromYear(birth.year, reference.year);
}

export function ageDuringYear(birth: BirthInput, year: number): AgeResult {
  if (birth.type !== 'date') return ageFromYear(birth.year, year);
  const end = exactAge(birth, { year, month: 12, day: 31 });
  if (end.type !== 'exact') return end;
  const start = exactAge(birth, { year, month: 1, day: 1 });
  const min = start.type === 'exact' ? start.age : 0;
  return min === end.age ? { type: 'exact', age: min } : { type: 'range', min, max: end.age };
}

export function formatAge(result: AgeResult): string {
  if (result.type === 'unborn') return '出生前';
  if (result.type === 'exact') return `${result.age}歳`;
  return result.min === result.max ? `${result.max}歳` : `${result.min}～${result.max}歳`;
}

export function assertAge(age: number): void {
  if (!Number.isInteger(age) || age < 0 || age > 150) throw new InputError('out-of-range', '年齢は0～150歳の整数で入力してください。');
}

export function yearAtAge(birth: number | CalendarDate, age: number): number | CalendarDate {
  assertAge(age);
  const year = (typeof birth === 'number' ? birth : birth.year) + age;
  assertYear(year);
  if (typeof birth === 'number') return year;
  assertDate(birth);
  // A February 29 birthday is reached on March 1 in a common year, matching exactAge.
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) return { year, month: 3, day: 1 };
  return { year, month: birth.month, day: birth.day };
}
