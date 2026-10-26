import './style.css';
import { ageDuringYear, calculateAge, formatAge, yearAtAge } from './age/ageCalculator';
import { gregorianToEra } from './era/eraConverter';
import { parseInput } from './parser/inputParser';
import { normalize } from './parser/normalize';
import type { BirthInput, CalendarDate, ParsedInput } from './parser/types';
import { generateTimeline, timelineText, type TimelineRow } from './timeline/timelineGenerator';
import { birthEra, renderResult } from './ui/renderResult';
import { renderSchool, renderTimeline } from './ui/renderTimeline';
import { copyText, toast } from './ui/toast';
import { icon } from './ui/icons';
import { mountPeopleComparison } from './ui/peopleComparison';
import { renderLayout } from './ui/layout';
import { mountTabs } from './ui/tabs';
import { mountInformation } from './ui/information';
import { fromISO, japaneseDate, MAX_YEAR, MIN_YEAR, today, toISO } from './utils/date';
import { escapeHTML as e } from './utils/format';

function readSetting(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function saveSetting(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* The app also works without browser storage. */ }
}

type Theme = 'system' | 'light' | 'dark';
const storedTheme = readSetting('koyomi.theme');
let theme: Theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system';
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let step: 1 | 10 = readSetting('koyomi.timelineMode') === '1' ? 1 : 10;
let referenceIsToday = true;
let birth: BirthInput | null = null;
let rows: TimelineRow[] = [];
let parsed: ParsedInput = { type: 'empty' };

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderLayout();

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = $<HTMLInputElement>('main-input');
const referenceInput = $<HTMLInputElement>('reference-date');
const targetYear = $<HTMLInputElement>('target-year');
const targetAge = $<HTMLInputElement>('target-age');
const share = $<HTMLButtonElement>('share-button');
const peopleComparison = mountPeopleComparison($('people-comparison'), {
  getMainInput: () => input.value,
  onReferenceChange: value => {
    referenceInput.value = value;
    referenceIsToday = value === toISO(today());
    update();
  },
});
const tabs = mountTabs($('main'), tab => {
  $('single-input').hidden = tab === 'people';
});
document.querySelector('.skip-link')!.addEventListener('click', () => tabs.select('convert'));
mountInformation($('app'));

function applyTheme(): void {
  document.documentElement.dataset.theme = theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme;
  const labels = { system: '自動', light: 'ライト', dark: 'ダーク' };
  $('theme-toggle').innerHTML = icon(theme === 'system' ? 'monitor' : theme === 'light' ? 'sun' : 'moon');
  $('theme-toggle').setAttribute('aria-label', `テーマ：${labels[theme]}。クリックして切り替え`);
  $('theme-toggle').title = `テーマ：${labels[theme]}`;
}
applyTheme();
systemTheme.addEventListener('change', applyTheme);
$('theme-toggle').addEventListener('click', () => {
  theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
  saveSetting('koyomi.theme', theme); applyTheme();
  toast(`テーマを${({ system: '自動', light: 'ライト', dark: 'ダーク' })[theme]}にしました`);
});

function renderComparisons(): void {
  if (!birth) return;
  const target = parseInput(targetYear.value);
  const targetValid = target.type === 'gregorian-year' || target.type === 'era-year' || target.type === 'date';
  targetYear.setAttribute('aria-invalid', String(!targetValid && target.type !== 'empty'));
  if (targetValid) {
    const age = target.type === 'date' ? calculateAge(birth, target) : ageDuringYear(birth, target.year);
    const when = target.type === 'date' ? japaneseDate(target) : `${target.year}年`;
    $('target-year-result').innerHTML = `<strong>${formatAge(age)}</strong><span>${when}・${e(birthEra(target))}</span><small>${target.type !== 'date' ? 'その年の満年齢' : '指定日時点の満年齢'}${target.year > today().year ? '（将来の改元は未考慮）' : ''}</small>`;
  } else {
    $('target-year-result').innerHTML = `<p class="${target.type === 'empty' ? 'muted' : 'field-error'}">${e(target.type === 'error' ? target.message : target.type === 'empty' ? '調べたい年を入力してください' : '西暦・和暦または日付を入力してください')}</p>`;
  }
  const ageText = normalize(targetAge.value).replace(/歳$/, '');
  try {
    if (!ageText) { targetAge.setAttribute('aria-invalid', 'false'); $('target-age-result').innerHTML = '<p class="muted">調べたい年齢を入力してください</p>'; return; }
    if (!/^\d+$/.test(ageText)) throw new Error('年齢は0～150歳の整数で入力してください。');
    const reached = yearAtAge(birth.type === 'date' ? birth : birth.year, +ageText);
    const year = typeof reached === 'number' ? reached : reached.year;
    $('target-age-result').innerHTML = `<strong>${year}<small>年${typeof reached !== 'number' ? `${reached.month}月${reached.day}日` : ''}</small></strong><span>${e(gregorianToEra(reached))}</span><small>${typeof reached === 'number' ? `この年の誕生日に満${+ageText}歳` : `この日に満${+ageText}歳`}${year > today().year ? '（将来の改元は未考慮）' : ''}</small>`;
    targetAge.setAttribute('aria-invalid', 'false');
  } catch (error) {
    targetAge.setAttribute('aria-invalid', 'true');
    $('target-age-result').innerHTML = `<p class="field-error">${e((error as Error).message)}</p>`;
  }
}

function updateTimeline(): void {
  if (!birth) return;
  rows = generateTimeline(birth, today(), step);
  $('timeline').innerHTML = renderTimeline(rows, today());
  $('timeline-description').textContent = `${birth.type === 'date' ? japaneseDate(birth) : `${birth.year}年`}生まれの年齢年表`;
  $('timeline-reference').textContent = `「現在」は今日（${japaneseDate(today())}）の年齢です。上の基準日を変更しても変わりません。`;
  $('step-10').setAttribute('aria-pressed', String(step === 10));
  $('step-1').setAttribute('aria-pressed', String(step === 1));
}

function update(): void {
  peopleComparison.setReference(referenceInput.value);
  birth = null;
  setBirthToolsVisible(false);
  share.disabled = true;
  $('share-description').hidden = true;
  $('sample-result-note').hidden = $('sample-indicator').hidden;
  $('clear-input').hidden = !input.value;
  $('reference-error').hidden = true;
  $('input-error').hidden = true;
  referenceInput.setAttribute('aria-invalid', 'false');
  let reference: CalendarDate;
  try { reference = fromISO(referenceInput.value); }
  catch {
    $('reference-error').textContent = `基準日は${MIN_YEAR}～${MAX_YEAR}年の有効な年月日を入力してください。`;
    $('reference-error').hidden = false;
    referenceInput.setAttribute('aria-invalid', 'true');
    $<HTMLDetailsElement>('reference-options').open = true;
    $('reference-summary').textContent = '基準日を確認';
    $('result').innerHTML = '';
    return;
  }
  $('reference-summary').textContent = `${reference.year}/${reference.month}/${reference.day}${toISO(reference) === toISO(today()) ? '（今日）' : ''}`;
  parsed = parseInput(input.value);
  input.setAttribute('aria-invalid', String(parsed.type === 'error'));
  if (parsed.type === 'error') {
    $('input-error').textContent = parsed.message;
    $('input-error').hidden = false;
  }
  try { $('result').innerHTML = parsed.type === 'error' ? '' : renderResult(parsed, reference, today()); }
  catch (error) { $('result').innerHTML = `<div class="notice error" role="alert">${e((error as Error).message)}</div>`; return; }
  if (parsed.type === 'gregorian-year' || parsed.type === 'era-year' || parsed.type === 'date') {
    birth = parsed;
    setBirthToolsVisible(true);
    renderComparisons(); updateTimeline();
    $('school').innerHTML = renderSchool(birth);
  }
  share.disabled = !(birth || parsed.type === 'age');
  if (!share.disabled) {
    $('share-description').textContent = `入力「${input.value}」と基準日（${japaneseDate(reference)}）をURLに含めます。複数人の比較は含みません。`;
    $('share-description').hidden = false;
  }
}

function setBirthToolsVisible(visible: boolean): void {
  document.querySelectorAll<HTMLElement>('[data-requires-birth]').forEach(element => { element.hidden = !visible; });
  document.querySelectorAll<HTMLElement>('.needs-birth').forEach(element => { element.hidden = visible; });
}

const params = new URLSearchParams(location.search);
const sharedInput = params.get('birth');
input.value = sharedInput?.slice(0, 100) ?? '昭和42年生まれ';
referenceInput.value = toISO(today());
if (params.has('ref')) {
  try { referenceInput.value = toISO(fromISO(params.get('ref')!)); referenceIsToday = false; }
  catch { toast('共有URLの基準日が無効なため、今日を使います'); }
}
$('sample-indicator').hidden = sharedInput !== null;
update();

input.addEventListener('input', event => { if ((event as InputEvent).isComposing) return; $('sample-indicator').hidden = true; update(); });
input.addEventListener('compositionend', () => { $('sample-indicator').hidden = true; update(); });
referenceInput.addEventListener('input', () => { referenceIsToday = false; update(); });
targetYear.addEventListener('input', event => { if (!(event as InputEvent).isComposing) renderComparisons(); });
targetYear.addEventListener('compositionend', renderComparisons);
targetAge.addEventListener('input', renderComparisons);
$('today-button').addEventListener('click', () => { referenceIsToday = true; referenceInput.value = toISO(today()); update(); });
$('clear-input').addEventListener('click', () => { input.value = ''; $('sample-indicator').hidden = true; update(); input.focus(); });
document.addEventListener('click', async event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.dataset.example !== undefined) { input.value = button.dataset.example; $('sample-indicator').hidden = true; update(); input.focus(); }
  if (button.dataset.copy !== undefined) await copyText(button.dataset.copy);
  if (button.dataset.step) { step = button.dataset.step === '1' ? 1 : 10; saveSetting('koyomi.timelineMode', String(step)); updateTimeline(); }
});
$('copy-timeline').addEventListener('click', () => { if (birth) void copyText(timelineText(rows, birth, today())); });
share.addEventListener('click', () => {
  if (share.disabled) return;
  const url = new URL(location.href);
  url.search = ''; url.hash = '';
  url.searchParams.set('birth', input.value);
  url.searchParams.set('ref', referenceInput.value);
  void copyText(url.href);
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (referenceIsToday) referenceInput.value = toISO(today()); update(); } });

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => {
    const worker = registration.installing ?? registration.waiting ?? registration.active;
    if (!worker) throw new Error('Service Worker unavailable');
    if (worker.state === 'activated') return;
    return new Promise<void>((resolve, reject) => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') resolve();
        else if (worker.state === 'redundant') reject(new Error('Service Worker installation failed'));
      });
    });
  }).then(() => {
    $('offline-status').textContent = 'オフラインでも利用できます';
  }).catch(() => { $('offline-status').textContent = 'すべての計算はこの端末内で行います'; });
}
