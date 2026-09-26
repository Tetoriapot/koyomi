import { calculateAge, formatAge } from '../age/ageCalculator';
import { birthYearsFromAge } from '../age/birthYearCalculator';
import { eraYearNote, erasForYear, formatEraYear, gregorianToEra } from '../era/eraConverter';
import { getEra } from '../era/eras';
import type { BirthInput, CalendarDate, ParsedInput } from '../parser/types';
import { compareDates, japaneseDate } from '../utils/date';
import { escapeHTML as e, zodiac } from '../utils/format';
import { icon } from './icons';

export function copyButton(value: string, label: string): string {
  return `<button type="button" class="icon-button copy-button" data-copy="${e(value)}" aria-label="${e(label)}" title="${e(label)}">${icon('copy')}</button>`;
}

export function birthEra(birth: BirthInput): string {
  return birth.type === 'era-year' ? formatEraYear(getEra(birth.era), birth.year) : gregorianToEra(birth.type === 'date' ? birth : birth.year);
}

export function renderResult(parsed: ParsedInput, reference: CalendarDate, current: CalendarDate): string {
  if (parsed.type === 'empty') return `<div class="empty-state">${icon('calendar')}<h2>年と年齢を、ひとつの入力で。</h2><p>生年・生年月日・和暦・年齢を入力すると、ここに結果が表示されます。</p></div>`;
  if (parsed.type === 'error') return `<div class="notice error" role="alert">${icon('info')}<div><strong>入力を確認してください</strong><p>${e(parsed.message)}</p></div></div>`;
  if (parsed.type === 'ambiguous') return `<div class="notice">${icon('info')}<div><strong>「${parsed.value}」はどの意味ですか？</strong><p>年齢か和暦を選んでください。</p><div class="chips">${parsed.suggestions.map(s => `<button type="button" class="chip" data-example="${e(s)}">${e(s)} ${icon('arrow')}</button>`).join('')}</div></div></div>`;
  if (parsed.type === 'age') {
    const years = birthYearsFromAge(parsed.age, reference.year);
    const text = `${years.min}～${years.max}年生まれ`;
    return `<div class="result-card"><div class="result-topline"><span class="eyebrow">生年の候補</span><span class="result-badge">年齢から計算</span></div><div class="birth-range"><span class="muted">${japaneseDate(reference)}時点で ${parsed.age}歳</span><div class="range-value">${years.min}<span>～</span>${years.max}<small>年生まれ</small>${copyButton(text, '生年の候補をコピー')}</div><p>${e(gregorianToEra(years.min))} ～ ${e(gregorianToEra(years.max))}</p></div><div class="result-note">${icon('info')}誕生日によって生年が異なります。候補を選ぶと年表も確認できます。</div><div class="chips result-choices">${[years.min, years.max].map(y => `<button class="chip" type="button" data-example="${y}年生まれ">${y}年生まれ ${icon('arrow')}</button>`).join('')}</div></div>`;
  }
  const gregorian = parsed.type === 'date' ? japaneseDate(parsed) : `${parsed.year}年`;
  const era = birthEra(parsed);
  const age = formatAge(calculateAge(parsed, reference));
  const currentLabel = parsed.type === 'date' ? `${japaneseDate(reference)}時点` : `${reference.year}年時点`;
  const future = parsed.type === 'date' ? compareDates(parsed, current) > 0 : parsed.year > current.year;
  const notes: string[] = [];
  if (parsed.type !== 'date') {
    const keys = parsed.type === 'era-year' ? [parsed.era] : erasForYear(parsed.year).map(item => item.key);
    keys.forEach(key => { const note = eraYearNote(key, parsed.year); if (note) notes.push(note); });
  }
  if (future) notes.push('未来の日付です。和暦は令和が続くと仮定しています。将来の改元は考慮していません。');
  if (parsed.year < 1873) notes.push('旧暦には対応していません。明治初期の日付は仕様上の西暦による簡易換算です。');
  return `<div class="result-card">
    <div class="year-pair"><div class="year-block"><div class="label-row"><span class="muted">西暦</span>${copyButton(gregorian, '西暦をコピー')}</div><div class="gregorian-value">${parsed.year}<span>年</span></div>${parsed.type === 'date' ? `<p class="date-detail">${parsed.month}月${parsed.day}日 生まれ</p>` : '<p class="date-detail">生まれ</p>'}</div>
    <div class="year-block era-block"><div class="label-row"><span class="muted">和暦</span>${copyButton(era, '和暦をコピー')}</div><div class="era-value">${e(era)}</div></div></div>
    <div class="age-band"><div><div class="age-reference">${currentLabel}</div><div class="age-value">${e(age.replace(/歳$/, ''))}${age.endsWith('歳') ? '<span>歳</span>' : ''}${copyButton(age, '年齢をコピー')}</div><p>${parsed.type === 'date' ? '満年齢' : '誕生日前～誕生日後'}</p></div></div>
    <details class="result-details"><summary>干支を見る</summary><p>生まれ年の干支：<strong>${zodiac(parsed.year)}</strong>（${({ 子: 'ねずみ', 丑: 'うし', 寅: 'とら', 卯: 'うさぎ', 辰: 'たつ', 巳: 'へび', 午: 'うま', 未: 'ひつじ', 申: 'さる', 酉: 'とり', 戌: 'いぬ', 亥: 'いのしし' } as Record<string, string>)[zodiac(parsed.year)]}）</p></details>
    ${notes.length ? `<div class="result-notes">${notes.map(note => `<p>${icon('info')}<span>${e(note)}</span></p>`).join('')}</div>` : ''}
  </div>`;
}
