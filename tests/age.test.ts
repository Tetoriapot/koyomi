import { describe, expect, it } from 'vitest';
import { ageDuringYear, ageFromYear, exactAge, formatAge, yearAtAge } from '../src/age/ageCalculator';
import { birthYearsFromAge } from '../src/age/birthYearCalculator';
import { gregorianToEra } from '../src/era/eraConverter';
import { fromISO, today } from '../src/utils/date';
import { zodiac } from '../src/utils/format';
import { generateTimeline, timelineText } from '../src/timeline/timelineGenerator';

const reference = fromISO('2026-09-25');

describe('仕様書 E：年齢計算（51–60）', () => {
  it.each([[51, 1998, '27～28歳'], [52, 2000, '25～26歳'], [53, 1980, '45～46歳'], [54, 1975, '50～51歳'], [55, 1960, '65～66歳']] as const)('#%i %i → %s', (_, year, expected) => expect(formatAge(ageFromYear(year, 2026))).toBe(expected));
  it.each([[56, '1998-04-12', 28], [57, '1998-12-12', 27], [58, '2026-09-25', 0], [59, '2025-09-25', 1], [60, '2025-09-26', 0]] as const)('#%i %s → %i歳', (_, birth, age) => expect(exactAge(fromISO(birth), reference)).toEqual({ type: 'exact', age }));
});

describe('仕様書 F：指定年（61–65）', () => {
  it.each([[61, 1990, 2000, '9～10歳'], [62, 1990, 2020, '29～30歳'], [63, 1967, 2000, '32～33歳'], [64, 1945, 1964, '18～19歳'], [65, 2000, 2026, '25～26歳']] as const)('#%i %i年生まれ・%i年 → %s', (_, birth, year, expected) => expect(formatAge(ageFromYear(birth, year))).toBe(expected));
});

describe('仕様書 G：年齢→生年（66–70）', () => {
  it.each([[66, 20, 2005, 2006], [67, 30, 1995, 1996], [68, 40, 1985, 1986], [69, 50, 1975, 1976], [70, 60, 1965, 1966]] as const)('#%i %i歳 → %i～%i年', (_, age, min, max) => expect(birthYearsFromAge(age, 2026)).toEqual({ min, max }));
});

describe('仕様書 H：年齢到達年（71–75）', () => {
  it.each([[71, 2000, 20, 2020, '令和2年'], [72, 1990, 30, 2020, '令和2年'], [73, 1960, 60, 2020, '令和2年'], [74, 1989, 20, 2009, '平成21年'], [75, 1975, 50, 2025, '令和7年']] as const)('#%i %i年生まれ・%i歳 → %i年', (_, birth, age, expected, era) => {
    const year = yearAtAge(birth, age);
    expect(year).toBe(expected); expect(gregorianToEra(year)).toBe(era);
  });
});

describe('仕様書 I：年齢到達日（76–78）', () => {
  it.each([[76, '1998-04-12', 20, '2018-04-12'], [77, '2000-01-01', 20, '2020-01-01'], [78, '1960-12-31', 60, '2020-12-31']] as const)('#%i %s・%i歳 → %s', (_, birth, age, expected) => expect(yearAtAge(fromISO(birth), age)).toEqual(fromISO(expected)));
});

describe('追加：年齢と年表の境界', () => {
  it('1月1日生まれの指定年齢には不要な幅を付けない', () => expect(formatAge(ageDuringYear({ type: 'date', ...fromISO('2000-01-01') }, 2026))).toBe('26歳'));
  it('生年月日がある場合も指定年内の幅を計算する', () => expect(formatAge(ageDuringYear({ type: 'date', ...fromISO('2000-04-02') }, 2026))).toBe('25～26歳'));
  it('出生年の年内年齢は0歳', () => expect(formatAge(ageDuringYear({ type: 'date', ...fromISO('2000-04-02') }, 2000))).toBe('0歳'));
  it('未来の生年は出生前', () => expect(formatAge(ageFromYear(2027, 2026))).toBe('出生前'));
  it('未来の生年月日は出生前', () => expect(formatAge(exactAge(fromISO('2026-09-26'), reference))).toBe('出生前'));
  it('同じ出生年に負の年齢を表示しない', () => expect(formatAge(ageFromYear(2026, 2026))).toBe('0歳'));
  it('2月29日生まれは平年2月28日にまだ誕生日前', () => expect(formatAge(exactAge(fromISO('2000-02-29'), fromISO('2025-02-28')))).toBe('24歳'));
  it('2月29日生まれは平年3月1日に到達', () => expect(yearAtAge(fromISO('2000-02-29'), 25)).toEqual(fromISO('2025-03-01')));
  it('2月29日生まれの到達日と満年齢が一致', () => expect(formatAge(exactAge(fromISO('2000-02-29'), fromISO('2025-03-01')))).toBe('25歳'));
  it('2000年の干支は辰', () => expect(zodiac(2000)).toBe('辰'));
  it('1967年の干支は未', () => expect(zodiac(1967)).toBe('未'));
  it('時計は引数で固定できる', () => expect(today(new Date(2026, 8, 25, 12))).toEqual(reference));
  it('年表は出生・100歳・現在を含み昇順', () => {
    const rows = generateTimeline({ type: 'gregorian-year', year: 1967 }, reference);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toMatchObject({ year: 1967, label: '誕生' });
    expect(rows.at(-1)).toMatchObject({ year: 2067, age: '100歳', future: true });
    expect(rows.find(row => row.current)).toMatchObject({ year: 2026, age: '58～59歳' });
    expect(rows.map(row => row.year)).toEqual([...rows.map(row => row.year)].sort((a, b) => a - b));
  });
  it('現在行と節目年を重複させない', () => expect(generateTimeline({ type: 'gregorian-year', year: 1966 }, reference).filter(row => row.year === 2026)).toHaveLength(1));
  it('1年ごとは101年分で現在の範囲表示を保つ', () => {
    const rows = generateTimeline({ type: 'gregorian-year', year: 1967 }, reference, 1);
    expect(rows).toHaveLength(101); expect(rows.find(row => row.current)?.age).toBe('58～59歳');
  });
  it('2200年を超える年表行を出さない', () => expect(generateTimeline({ type: 'gregorian-year', year: 2195 }, reference, 1)).toHaveLength(6));
  it('コピーにも将来の改元注記を含める', () => {
    const birth = { type: 'gregorian-year', year: 1967 } as const;
    expect(timelineText(generateTimeline(birth, reference), birth, reference)).toContain('将来の改元');
  });
});
