import { describe, expect, it } from 'vitest';
import { parseInput } from '../src/parser/inputParser';
import { renderResult } from '../src/ui/renderResult';
import { renderTimeline } from '../src/ui/renderTimeline';
import { generateTimeline } from '../src/timeline/timelineGenerator';

const reference = { year: 2020, month: 1, day: 1 };
const current = { year: 2026, month: 10, day: 26 };

describe('計算条件の表示', () => {
  it('生年だけの場合も基準日全体と年齢幅の理由を表示する', () => {
    const html = renderResult(parseInput('1998'), reference, current);
    expect(html).toContain('基準日：2020年1月1日');
    expect(html).toContain('21～22');
    expect(html).toContain('誕生日が不明なため、2020年の誕生日前～誕生日後の満年齢');
  });
  it('生年月日ありの場合は指定日の満年齢を表示する', () => {
    const html = renderResult(parseInput('1998/4/12'), reference, current);
    expect(html).toContain('data-copy="21歳"');
    expect(html).toContain('基準日時点の満年齢');
    expect(html).not.toContain('誕生日が不明');
  });
  it('出生前の表示に年齢幅の説明を付けない', () => {
    const html = renderResult(parseInput('2030'), reference, current);
    expect(html).toContain('基準日は生まれる前です。');
    expect(html).not.toContain('誕生日が不明');
  });
  it('年表の現在行は指定基準日ではなく今日の日付と年齢を示す', () => {
    const birth = { type: 'date' as const, year: 1998, month: 4, day: 12 };
    const html = renderTimeline(generateTimeline(birth, current, 10), current);
    expect(html).toContain('「現在」は2026年10月26日の年齢');
    expect(html).toContain('10/26時点');
    expect(html).toContain('28歳');
    expect(html).not.toContain('2020年1月1日');
  });
});
