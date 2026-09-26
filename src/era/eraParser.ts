import { InputError, type ParsedInput } from '../parser/types';
import { ERAS } from './eras';
import { eraToGregorian } from './eraConverter';

export function parseEra(input: string): ParsedInput | null {
  const era = ERAS.find(item => [item.name, item.short, item.reading].some(prefix => input.startsWith(prefix)));
  if (!era) return null;
  const prefix = [era.name, era.short, era.reading].find(item => input.startsWith(item))!;
  const rest = input.slice(prefix.length);
  const yearOnly = /^(元|\d+)年?$/.exec(rest);
  const dateMatch = /^(元|\d+)年(\d{1,2})月(\d{1,2})日?$/.exec(rest) ?? /^(元|\d+)([/.\-])(\d{1,2})\2(\d{1,2})$/.exec(rest);
  if (yearOnly) {
    const eraYear = yearOnly[1] === '元' ? 1 : +yearOnly[1];
    return { type: 'era-year', era: era.key, eraYear, year: eraToGregorian(era.key, eraYear) as number };
  }
  if (dateMatch) {
    const eraYear = dateMatch[1] === '元' ? 1 : +dateMatch[1];
    const hasSeparator = /^[/.\-]$/.test(dateMatch[2]);
    const month = +(hasSeparator ? dateMatch[3] : dateMatch[2]);
    const day = +(hasSeparator ? dateMatch[4] : dateMatch[3]);
    const date = eraToGregorian(era.key, eraYear, month, day);
    if (typeof date !== 'number') return { type: 'date', ...date, era: era.key };
  }
  throw new InputError('unknown', '和暦は「平成10年」「H10」「平成10年4月12日」のように入力してください。');
}
