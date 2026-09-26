import { InputError, type CalendarDate, type EraKey } from '../parser/types';
import { assertDate, assertYear, daysBetween, fromISO, japaneseDate, toISO } from '../utils/date';
import { ERAS, getEra, type Era } from './eras';

export function formatEraYear(era: Era, year: number): string {
  const n = year - era.startYear + 1;
  return `${era.name}${n === 1 ? '元' : n}年`;
}

export function erasForYear(year: number): Era[] {
  assertYear(year);
  return ERAS.filter(era => era.startYear <= year && (!era.end || +era.end.slice(0, 4) >= year));
}

export function gregorianToEra(value: number | CalendarDate): string {
  if (typeof value === 'number') return erasForYear(value).map(era => formatEraYear(era, value)).join(' / ') || '和暦変換対象外';
  assertDate(value);
  const iso = toISO(value);
  const era = ERAS.find(item => iso >= item.start && (!item.end || iso <= item.end));
  return era ? `${formatEraYear(era, value.year)}${value.month}月${value.day}日` : '和暦変換対象外';
}

export function eraToGregorian(key: EraKey, eraYear: number, month?: number, day?: number): number | CalendarDate {
  const era = getEra(key);
  const last = era.end ? +era.end.slice(0, 4) - era.startYear + 1 : null;
  if (!Number.isInteger(eraYear) || eraYear < 1 || (last !== null && eraYear > last)) {
    throw new InputError('invalid-era', `${era.name}${eraYear}年は存在しません。${last ? `${era.name}は${era.name}${last}年までです。` : '元年（1年）以降を入力してください。'}`);
  }
  const year = era.startYear + eraYear - 1;
  assertYear(year);
  if (month === undefined && day === undefined) return year;
  const date = { year, month: month ?? 0, day: day ?? 0 };
  assertDate(date);
  const iso = toISO(date);
  if (iso < era.start || (era.end && iso > era.end)) {
    throw new InputError('invalid-era', `${formatEraYear(era, year)}${date.month}月${date.day}日は${era.name}の期間外です。${japaneseDate(fromISO(era.start))}から${era.end ? japaneseDate(fromISO(era.end)) + 'まで' : 'の元号です'}。`);
  }
  return date;
}

export function eraYearNote(key: EraKey, year: number): string | null {
  const era = getEra(key);
  const start = era.startYear === year ? era.start : `${year}-01-01`;
  const end = era.end?.startsWith(`${year}-`) ? era.end : `${year}-12-31`;
  if (start === `${year}-01-01` && end === `${year}-12-31`) return null;
  const first = fromISO(start), last = fromISO(end);
  return `${formatEraYear(era, year)}は${japaneseDate(first)}～${last.month}月${last.day}日の${daysBetween(first, last) + 1}日間です。`;
}
