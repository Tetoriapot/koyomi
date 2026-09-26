import { describe, expect, it } from 'vitest';
import { parseInput } from '../src/parser/inputParser';

describe('仕様書 D：入力正規化（43–50）', () => {
  it.each([
    [43, '１９９８', 1998], [44, 'Ｈ１０', 1998], [45, 'ｒ５', 2023], [46, ' 昭和50年 ', 1975],
    [47, '昭和 50 年', 1975], [48, '1998年生まれ', 1998], [49, '1998年生', 1998], [50, 'H10年生まれ', 1998],
  ] as const)('#%i %s → %i', (_, input, year) => expect(parseInput(input)).toMatchObject({ year }));
});

describe('仕様書 K/L：日付（86–93）', () => {
  it.each([[86, '2000-02-29'], [88, '2004-02-29']] as const)('#%i %s は有効', (_, input) => {
    expect(parseInput(input)).toMatchObject({ type: 'date', month: 2, day: 29 });
  });
  it.each([[87, '1900-02-29'], [89, '2001-02-29'], [90, '2026-02-30'], [91, '2026-13-01'], [92, '2026-00-01'], [93, '2026-01-00']] as const)('#%i %s は無効', (_, input) => {
    expect(parseInput(input)).toMatchObject({ type: 'error', code: 'invalid-date' });
  });
});

it('仕様書 #100：不明な入力には入力例を示す', () => {
  expect(parseInput('あいうえお')).toEqual({ type: 'error', code: 'unknown', message: '入力内容を認識できませんでした。「1998」「昭和50年」「H10」などを入力してください。' });
});

describe('追加：入力の安全性と曖昧な数値', () => {
  it('空欄はエラーにしない', () => expect(parseInput('　 ')).toEqual({ type: 'empty' }));
  it('50を生年や年齢に自動確定しない', () => expect(parseInput('50', 2026)).toEqual({ type: 'ambiguous', value: 50, suggestions: ['50歳', '昭和50年'] }));
  it('0に無効な元号を提案しない', () => expect(parseInput('0', 2026)).toMatchObject({ suggestions: ['0歳'] }));
  it.each(['2201', '-1998', '999', '3000'])('範囲外：%s', input => expect(parseInput(input)).toMatchObject({ code: 'out-of-range' }));
  it.each(['-1歳', '151歳'])('年齢の範囲外：%s', input => expect(parseInput(input)).toMatchObject({ code: 'out-of-range' }));
  it.each(['へいせい10', 'H 10', '西暦1998年', '1998生'])('追加表記：%s', input => expect(parseInput(input)).toMatchObject({ year: 1998 }));
  it.each(['H10.4.12', '平成10年4月12日', '１９９８／０４／１２', '1998年4月12日生まれ'])('日付表記：%s', input => expect(parseInput(input)).toMatchObject({ type: 'date', year: 1998, month: 4, day: 12 }));
  it('現在50歳', () => expect(parseInput('現在50歳')).toEqual({ type: 'age', age: 50 }));
  it('末尾のごみを許容しない', () => expect(parseInput('1998abc')).toMatchObject({ type: 'error' }));
  it('区切り文字の混在を許容しない', () => expect(parseInput('1998/04-12')).toMatchObject({ type: 'error' }));
  it('巨大な入力を拒否する', () => expect(parseInput('1'.repeat(101))).toMatchObject({ code: 'out-of-range' }));
});
