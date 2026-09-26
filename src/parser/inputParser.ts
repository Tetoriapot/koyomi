import { eraToGregorian } from '../era/eraConverter';
import { ERAS } from '../era/eras';
import { parseEra } from '../era/eraParser';
import { assertDate, assertYear, today } from '../utils/date';
import { normalize } from './normalize';
import { InputError, type ParsedInput } from './types';

export function parseInput(raw: string, currentYear = today().year): ParsedInput {
  if (!raw.trim()) return { type: 'empty' };
  if (raw.length > 100) return { type: 'error', code: 'out-of-range', message: '入力は100文字以内にしてください。' };
  const input = normalize(raw).replace(/^西暦/, '').replace(/(?:生まれ|生)$/, '');
  try {
    const ageMatch = /^(?:現在)?(-?\d+)歳$/.exec(input);
    if (ageMatch) {
      const age = +ageMatch[1];
      if (age < 0 || age > 150) throw new InputError('out-of-range', '年齢は0～150歳の範囲で入力してください。');
      return { type: 'age', age };
    }
    const eraResult = parseEra(input);
    if (eraResult) return eraResult;
    const dateMatch = /^(\d{4})年(\d{1,2})月(\d{1,2})日?$/.exec(input) ?? /^(\d{4})([/.\-])(\d{1,2})\2(\d{1,2})$/.exec(input);
    if (dateMatch) {
      const separated = /^[/.\-]$/.test(dateMatch[2]);
      const date = { year: +dateMatch[1], month: +(separated ? dateMatch[3] : dateMatch[2]), day: +(separated ? dateMatch[4] : dateMatch[3]) };
      assertDate(date);
      return { type: 'date', ...date };
    }
    if (/^\d{1,3}$/.test(input) && +input <= 150) {
      const value = +input;
      const suggestions = [`${value}歳`];
      for (const era of ERAS) {
        try {
          const year = eraToGregorian(era.key, value) as number;
          if (year <= currentYear) suggestions.push(`${era.name}${value === 1 ? '元' : value}年`);
        } catch { /* An impossible era year is never suggested. */ }
      }
      return { type: 'ambiguous', value, suggestions };
    }
    if (/^-?\d+年?$/.test(input)) {
      const year = +input.replace(/年$/, '');
      assertYear(year);
      return { type: 'gregorian-year', year };
    }
    throw new InputError('unknown', '入力内容を認識できませんでした。「1998」「昭和50年」「H10」などを入力してください。');
  } catch (error) {
    if (error instanceof InputError) return { type: 'error', code: error.code, message: error.message };
    throw error;
  }
}
