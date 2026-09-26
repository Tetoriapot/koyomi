import { describe, expect, it } from 'vitest';
import { ageDifference, comparePeople, comparisonText, formatAgeDifference, type PersonInput } from '../src/age/peopleComparison';
import { fromISO } from '../src/utils/date';

const reference = fromISO('2026-09-25');
const person = (input: string, name = ''): PersonInput => ({ input, name });

describe('2～4人の年齢比較', () => {
  it('2人の生年月日から基準日の満年齢と差を計算', () => {
    const result = comparePeople([person('1998/04/12', '兄'), person('2000/12/12', '妹')], reference);
    expect(result.people.map(p => p.age)).toEqual([{ type: 'exact', age: 28 }, { type: 'exact', age: 25 }]);
    expect(result.pairs).toEqual([{ first: '1人目：兄', second: '2人目：妹', difference: { type: 'difference', min: 3, max: 3 } }]);
  });
  it('4人では重複なく6組を比較', () => {
    const result = comparePeople(['1967', '1975', '1998', '2000'].map(input => person(input)), reference);
    expect(result.ready).toBe(true);
    expect(result.pairs.map(p => `${p.first}/${p.second}`)).toEqual(['1人目/2人目', '1人目/3人目', '1人目/4人目', '2人目/3人目', '2人目/4人目', '3人目/4人目']);
  });
  it('3人は3組', () => expect(comparePeople(['1967', '1975', '1998'].map(input => person(input)), reference).pairs).toHaveLength(3));
  it.each([0, 1, 5])('%i人では比較しない', count => expect(() => comparePeople(Array.from({ length: count }, () => person('1998')), reference)).toThrow('2～4人'));
  it('生年のみ同士の差にも不確実性を残す', () => {
    const result = comparePeople([person('昭和42年'), person('昭和50年')], reference);
    expect(formatAgeDifference(result.pairs[0].difference)).toBe('7～9歳差');
  });
  it('生年と生年月日の混在', () => {
    const result = comparePeople([person('1998'), person('2000/04/01')], reference);
    expect(formatAgeDifference(result.pairs[0].difference)).toBe('1～2歳差');
  });
  it('同じ生年は0～1歳差', () => expect(formatAgeDifference(comparePeople([person('1998'), person('H10')], reference).pairs[0].difference)).toBe('0～1歳差'));
  it('同じ生年月日は0歳差', () => expect(formatAgeDifference(comparePeople([person('2000-02-29'), person('2000-02-29')], reference).pairs[0].difference)).toBe('0歳差'));
  it('順序を入れ替えても差は同じ', () => {
    const a = { type: 'range', min: 25, max: 26 } as const;
    const b = { type: 'exact', age: 58 } as const;
    expect(ageDifference(a, b)).toEqual(ageDifference(b, a));
  });
  it('基準日が誕生日をまたぐと差が更新される', () => {
    const people = [person('1998-09-26'), person('2000-01-01')];
    expect(formatAgeDifference(comparePeople(people, reference).pairs[0].difference)).toBe('1歳差');
    expect(formatAgeDifference(comparePeople(people, fromISO('2026-09-26')).pairs[0].difference)).toBe('2歳差');
  });
  it('出生前の人を含む組の差は計算しない', () => {
    const result = comparePeople([person('2000'), person('2027-04-01'), person('1998')], reference);
    expect(result.people[1].age).toEqual({ type: 'unborn' });
    expect(result.pairs.map(p => p.difference.type)).toEqual(['unavailable', 'difference', 'unavailable']);
  });
  it('空欄がある間は不完全な比較結果を出さない', () => {
    const result = comparePeople([person('1998'), person('')], reference);
    expect(result.ready).toBe(false); expect(result.pairs).toEqual([]);
    expect(result.people[1].invalid).toBe(false);
  });
  it.each(['平成32年', '2026-02-30', '50', '50歳', 'あいうえお'])('無効または曖昧な入力：%s', input => {
    const result = comparePeople([person('1998'), person(input)], reference);
    expect(result.ready).toBe(false); expect(result.people[1].invalid).toBe(true); expect(result.pairs).toEqual([]);
  });
  it('全角・和暦の日付を既存パーサーで認識', () => expect(comparePeople([person('Ｈ１０'), person('令和元年5月1日')], reference).ready).toBe(true));
  it('不正な基準日は拒否', () => expect(() => comparePeople([person('1998'), person('2000')], { year: 2026, month: 2, day: 30 })).toThrow());
  it('同じ呼び名も番号で区別する', () => {
    const result = comparePeople([person('1998', 'A'), person('2000', 'A')], reference);
    expect(result.people.map(p => p.label)).toEqual(['1人目：A', '2人目：A']);
  });
  it('コピーには基準日・生年・全組の差と注記を含む', () => {
    const result = comparePeople([person('1998', '兄'), person('2000-04-02')], reference);
    const text = comparisonText(result, reference);
    expect(text).toContain('2026年9月25日'); expect(text).toContain('1人目：兄：1998年生まれ・27～28歳');
    expect(text).toContain('2000年4月2日生まれ・26歳'); expect(text).toContain('1～2歳差'); expect(text).toContain('幅があります');
  });
  it('未入力の比較はコピーできない', () => expect(() => comparisonText(comparePeople([person('1998'), person('')], reference), reference)).toThrow());
});
