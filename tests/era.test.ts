import { describe, expect, it } from 'vitest';
import { gregorianToEra, eraYearNote } from '../src/era/eraConverter';
import { parseInput } from '../src/parser/inputParser';
import { fromISO } from '../src/utils/date';

describe('仕様書 A：西暦→和暦（01–20）', () => {
  const cases: [number, string, string][] = [
    [1, '2026', '令和8年'], [2, '2025', '令和7年'], [3, '2020', '令和2年'],
    [4, '2019-05-01', '令和元年5月1日'], [5, '2019-04-30', '平成31年4月30日'],
    [6, '1989-01-08', '平成元年1月8日'], [7, '1989-01-07', '昭和64年1月7日'],
    [8, '1926-12-25', '昭和元年12月25日'], [9, '1926-12-24', '大正15年12月24日'],
    [10, '1912-07-30', '大正元年7月30日'], [11, '1912-07-29', '明治45年7月29日'],
    [12, '2000', '平成12年'], [13, '1998', '平成10年'], [14, '1975', '昭和50年'],
    [15, '1964', '昭和39年'], [16, '1945', '昭和20年'], [17, '1930', '昭和5年'],
    [18, '1900', '明治33年'], [19, '1868-01-25', '明治元年1月25日'], [20, '1867', '和暦変換対象外'],
  ];
  it.each(cases)('#%i %s → %s', (_, input, expected) => {
    expect(gregorianToEra(input.includes('-') ? fromISO(input) : +input)).toBe(expected);
  });
});

describe('仕様書 B：和暦→西暦（21–36）', () => {
  it.each([
    [21, '令和8年', 2026], [22, '令和元年', 2019], [23, 'R1', 2019], [24, 'R5', 2023],
    [25, '平成31年', 2019], [26, '平成元年', 1989], [27, 'H10', 1998], [28, 'h10', 1998],
    [29, '昭和64年', 1989], [30, '昭和50年', 1975], [31, 'S50', 1975], [32, '昭和元年', 1926],
    [33, '大正15年', 1926], [34, 'T10', 1921], [35, '明治45年', 1912], [36, 'M40', 1907],
  ] as const)('#%i %s → %i', (_, input, year) => {
    expect(parseInput(input)).toMatchObject({ type: 'era-year', year });
  });
});

describe('仕様書 C：不正和暦（37–42）', () => {
  it.each([[37, '平成32年'], [38, '昭和65年'], [39, '大正16年'], [40, '明治46年'], [41, '令和0年'], [42, '平成0年']] as const)('#%i %s', (_, input) => {
    expect(parseInput(input)).toMatchObject({ type: 'error', code: 'invalid-era' });
  });
});

describe('仕様書 M：改元日詳細（94–99）', () => {
  it.each([[94, '平成元年1月7日'], [96, '令和元年4月30日'], [98, '昭和64年1月8日']] as const)('#%i %s は期間外', (_, input) => {
    expect(parseInput(input)).toMatchObject({ type: 'error', code: 'invalid-era' });
  });
  it.each([[95, '平成元年1月8日', '1989-01-08'], [97, '令和元年5月1日', '2019-05-01'], [99, '昭和64年1月7日', '1989-01-07']] as const)('#%i %s → %s', (_, input, expected) => {
    expect(parseInput(input)).toMatchObject({ type: 'date', ...fromISO(expected) });
  });
});

describe('追加：年だけの改元境界と期間注記', () => {
  it('2019年は両方の元号を表示する', () => expect(gregorianToEra(2019)).toBe('平成31年 / 令和元年'));
  it('1989年は両方の元号を表示する', () => expect(gregorianToEra(1989)).toBe('昭和64年 / 平成元年'));
  it('昭和64年の7日間を明示する', () => expect(eraYearNote('showa', 1989)).toBe('昭和64年は1989年1月1日～1月7日の7日間です。'));
  it('平成31年の120日間を明示する', () => expect(eraYearNote('heisei', 2019)).toContain('120日間'));
  it('明治開始日前を対象外にする', () => expect(gregorianToEra(fromISO('1868-01-24'))).toBe('和暦変換対象外'));
});
