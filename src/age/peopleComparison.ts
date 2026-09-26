import { parseInput } from '../parser/inputParser';
import type { BirthInput, CalendarDate } from '../parser/types';
import { assertDate, japaneseDate } from '../utils/date';
import { calculateAge, formatAge, type AgeResult } from './ageCalculator';

export interface PersonInput { name: string; input: string }
export interface ComparedPerson {
  label: string;
  birth: BirthInput | null;
  age: AgeResult | null;
  message: string;
  invalid: boolean;
}
export type AgeDifference = { type: 'difference'; min: number; max: number } | { type: 'unavailable' };
export interface PeopleComparison {
  people: ComparedPerson[];
  ready: boolean;
  pairs: { first: string; second: string; difference: AgeDifference }[];
}

/** Difference between completed ages on the reference date, not the interval between birthdays. */
export function ageDifference(first: AgeResult, second: AgeResult): AgeDifference {
  if (first.type === 'unborn' || second.type === 'unborn') return { type: 'unavailable' };
  const a = first.type === 'exact' ? { min: first.age, max: first.age } : first;
  const b = second.type === 'exact' ? { min: second.age, max: second.age } : second;
  return {
    type: 'difference',
    min: Math.max(0, a.min - b.max, b.min - a.max),
    max: Math.max(Math.abs(a.min - b.max), Math.abs(a.max - b.min)),
  };
}

export function formatAgeDifference(difference: AgeDifference): string {
  if (difference.type === 'unavailable') return '出生前のため比較できません';
  return difference.min === difference.max ? `${difference.min}歳差` : `${difference.min}～${difference.max}歳差`;
}

export function comparePeople(entries: PersonInput[], reference: CalendarDate): PeopleComparison {
  if (entries.length < 2 || entries.length > 4) throw new Error('比較する人数は2～4人にしてください。');
  assertDate(reference);
  const people: ComparedPerson[] = entries.map((entry, index) => {
    const name = entry.name.trim();
    const label = `${index + 1}人目${name ? `：${name}` : ''}`;
    const parsed = parseInput(entry.input);
    if (parsed.type === 'gregorian-year' || parsed.type === 'era-year' || parsed.type === 'date') {
      return { label, birth: parsed, age: calculateAge(parsed, reference), message: '', invalid: false };
    }
    return {
      label, birth: null, age: null, invalid: parsed.type !== 'empty',
      message: parsed.type === 'empty' ? '生年・生年月日を入力してください。'
        : parsed.type === 'error' ? parsed.message
        : '西暦・和暦の生年、または生年月日を入力してください（例：1998年、H10、1998/4/12）。',
    };
  });
  const ready = people.every(person => person.birth !== null);
  const pairs: PeopleComparison['pairs'] = [];
  if (ready) {
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        pairs.push({ first: people[i].label, second: people[j].label, difference: ageDifference(people[i].age!, people[j].age!) });
      }
    }
  }
  return { people, ready, pairs };
}

export function comparisonText(comparison: PeopleComparison, reference: CalendarDate): string {
  if (!comparison.ready) throw new Error('全員の生年・生年月日を入力してください。');
  return [
    `年齢比較（${japaneseDate(reference)}時点）`,
    ...comparison.people.map(person => {
      const birth = person.birth!;
      return `${person.label}：${birth.type === 'date' ? japaneseDate(birth) : `${birth.year}年`}生まれ・${formatAge(person.age!)}`;
    }),
    '', '基準日の満年齢の差',
    ...comparison.pairs.map(pair => `${pair.first} × ${pair.second}：${formatAgeDifference(pair.difference)}`),
    '※ 生年のみの場合、年齢と年齢差に幅があります。誕生日の間隔を表すものではありません。',
  ].join('\n');
}
