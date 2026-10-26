import { schoolYears } from '../age/schoolYearCalculator';
import { gregorianToEra } from '../era/eraConverter';
import type { BirthInput, CalendarDate } from '../parser/types';
import type { TimelineRow } from '../timeline/timelineGenerator';
import { japaneseDate, MAX_YEAR, today } from '../utils/date';
import { escapeHTML as e } from '../utils/format';
import { icon } from './icons';

export function renderTimeline(rows: TimelineRow[], current: CalendarDate = today()): string {
  return `<table><caption class="sr-only">出生から100歳までの年齢年表。節目はその年に迎える年齢です。「現在」は${japaneseDate(current)}の年齢です。</caption><thead><tr><th scope="col">西暦</th><th scope="col">和暦</th><th scope="col">年齢</th><th scope="col">節目</th></tr></thead><tbody>${rows.map(row => `<tr class="${row.current ? 'current-row' : ''} ${row.future ? 'future-row' : ''}"><th scope="row">${row.year}<small>年</small></th><td>${e(row.era)}</td><td>${e(row.age)}</td><td>${row.current ? `<span class="current-tag">現在</span><small class="current-date">${current.month}/${current.day}時点</small>` : e(row.label)}${row.future ? '<span class="future-tag">予定</span>' : ''}</td></tr>`).join('')}</tbody></table>`;
}

export function renderSchool(birth: BirthInput): string {
  if (birth.type !== 'date') return `<div class="school-empty">${icon('school')}<p><strong>生年月日を入力すると、入学・卒業の年がわかります。</strong><span>例：1998/04/12　日本の4月入学に対応しています。</span></p></div>`;
  const years = schoolYears(birth);
  return `<div class="school-grid">${[
    ['小学校入学', years.elementary, '4月'], ['中学校入学', years.juniorHigh, '4月'],
    ['高校入学', years.highSchool, '4月'], ['高校卒業の目安', years.graduation, '3月'],
  ].map(([label, year, month]) => `<div><span class="muted">${label}</span><strong>${year}<small>年${month}</small></strong><span class="school-era">${+year <= MAX_YEAR ? e(gregorianToEra({ year: +year, month: month === '4月' ? 4 : 3, day: 1 }).replace(/\d+月\d+日$/, '')) : '和暦換算の範囲外'}</span></div>`).join('')}</div><p class="section-note">${years.cohort}年度生（4月2日～翌年4月1日生まれの同学年）。通常の進級を前提とする目安です。歴史的な学制の変更・留年等は考慮していません。</p>`;
}
