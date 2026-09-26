import { calculateAge, formatAge, yearAtAge } from '../age/ageCalculator';
import { gregorianToEra } from '../era/eraConverter';
import type { BirthInput, CalendarDate } from '../parser/types';
import { MAX_YEAR, compareDates, toISO } from '../utils/date';

export interface TimelineRow { year: number; era: string; age: string; label: string; current: boolean; future: boolean }
const CELEBRATIONS: Record<number, string> = { 20: '二十歳', 60: '還暦', 70: '古希', 77: '喜寿', 80: '傘寿', 88: '米寿', 90: '卒寿', 99: '白寿', 100: '百寿' };

export function generateTimeline(birth: BirthInput, current: CalendarDate, step: 1 | 10 = 10): TimelineRow[] {
  const rows: TimelineRow[] = [];
  for (let age = 0; age <= 100; age += step) {
    const year = birth.year + age;
    if (year > MAX_YEAR) break;
    const reached = yearAtAge(birth.type === 'date' ? birth : birth.year, age);
    const future = typeof reached === 'number' ? year > current.year : compareDates(reached, current) > 0;
    rows.push({ year, era: gregorianToEra(reached), age: `${age}歳`, label: age === 0 ? '誕生' : CELEBRATIONS[age] ?? '―', current: false, future });
  }
  const ageNow = calculateAge(birth, current);
  if (ageNow.type !== 'unborn') {
    const duplicate = rows.find(row => row.year === current.year);
    const currentRow = { year: current.year, era: gregorianToEra(current.year), age: formatAge(ageNow), label: '現在', current: true, future: false };
    if (duplicate) Object.assign(duplicate, currentRow);
    else rows.push(currentRow);
  }
  return rows.sort((a, b) => a.year - b.year);
}

export function timelineText(rows: TimelineRow[], birth: BirthInput, current: CalendarDate): string {
  const header = `年齢年表（生年：${birth.type === 'date' ? toISO(birth) : birth.year}／現在：${toISO(current)}）`;
  return [header, ...rows.map(row => `${row.year}年（${row.era}）${row.label === '誕生' ? '誕生' : row.age}${row.current ? '［現在］' : ''}${row.future ? '［予定］' : ''}`), '※節目はその年に迎える年齢です。未来の和暦は将来の改元を考慮していません。'].join('\n');
}
