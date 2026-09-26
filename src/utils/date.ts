import { InputError, type CalendarDate } from '../parser/types';

export const MIN_YEAR = 1000;
export const MAX_YEAR = 2200;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

export function assertYear(year: number): void {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new InputError('out-of-range', `西暦は${MIN_YEAR}～${MAX_YEAR}年の範囲で入力してください。和暦は明治以降に対応しています。`);
  }
}

export function assertDate(date: CalendarDate): void {
  assertYear(date.year);
  if (!Number.isInteger(date.month) || !Number.isInteger(date.day) || date.month < 1 || date.month > 12 || date.day < 1 || date.day > daysInMonth(date.year, date.month)) {
    throw new InputError('invalid-date', `${date.year}年${date.month}月${date.day}日は存在しない日付です。`);
  }
}

export function toISO(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function fromISO(value: string): CalendarDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new InputError('invalid-date', '正しい年月日を入力してください。');
  const date = { year: +match[1], month: +match[2], day: +match[3] };
  assertDate(date);
  return date;
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function today(now = new Date()): CalendarDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export function japaneseDate(date: CalendarDate): string {
  return `${date.year}年${date.month}月${date.day}日`;
}

export function daysBetween(start: CalendarDate, end: CalendarDate): number {
  return (Date.UTC(end.year, end.month - 1, end.day) - Date.UTC(start.year, start.month - 1, start.day)) / 86400000;
}
