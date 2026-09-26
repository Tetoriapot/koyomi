import { comparePeople, comparisonText, formatAgeDifference, type PersonInput } from '../age/peopleComparison';
import { formatAge } from '../age/ageCalculator';
import { fromISO, japaneseDate, MAX_YEAR, MIN_YEAR, today, toISO } from '../utils/date';
import { escapeHTML as e } from '../utils/format';
import { icon } from './icons';
import { birthEra } from './renderResult';
import { copyText, toast } from './toast';
import { parseInput } from '../parser/inputParser';

interface PersonRow extends PersonInput { id: number }
interface Options { getMainInput(): string; onReferenceChange(value: string): void }

export function mountPeopleComparison(root: HTMLElement, options: Options) {
  let nextId = 3;
  let people: PersonRow[] = [{ id: 1, name: '', input: '' }, { id: 2, name: '', input: '' }];
  let referenceValue = toISO(today());
  let copyValue = '';
  const find = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;

  root.innerHTML = `
    <div class="section-heading"><div class="section-title">${icon('people')}<h2 id="people-heading">2～4人で年齢比較</h2></div><span id="people-count" class="subtle-tag">2人</span></div>
    <div class="people-reference"><label for="people-reference">比較の基準日</label><input type="date" id="people-reference" min="${MIN_YEAR}-01-01" max="${MAX_YEAR}-12-31" aria-describedby="people-reference-note people-reference-error"><button type="button" class="text-button" data-people-today>今日に戻す</button></div>
    <p id="people-reference-note" class="sr-only">基準日は各タブで共通です。</p><p id="people-reference-error" class="field-error" role="alert" hidden></p>
    <div class="people-toolbar"><button type="button" class="text-button" data-use-main>変換の入力を1人目に使う</button></div>
    <div id="people-inputs" class="people-grid"></div>
    <div class="people-actions"><button type="button" class="people-add" data-add-person>＋ 人を追加</button><span class="section-note">2～4人で比較できます</span></div>
    <div id="people-results" aria-live="polite" aria-atomic="true"></div>
    <div class="people-footer"><button type="button" class="text-button" data-copy-people disabled>${icon('copy')}比較結果をコピー</button><p class="section-note">比較の入力は保存されません。共有URLには含まれません。</p></div>`;

  function renderInputs(): void {
    find('#people-inputs').innerHTML = people.map((person, index) => `
      <fieldset class="person-card"><legend>${index + 1}人目</legend>
        <div class="person-top"><label for="person-birth-${person.id}">生年・生年月日</label><button type="button" class="icon-button person-remove" data-remove-person="${person.id}" aria-label="${index + 1}人目を削除" ${people.length <= 2 ? 'disabled' : ''}>${icon('close')}</button></div>
        <input id="person-birth-${person.id}" data-person-birth="${person.id}" aria-label="${index + 1}人目の生年・生年月日" type="text" value="${e(person.input)}" placeholder="例：1998年 / H10 / 1998/4/12" autocomplete="off" spellcheck="false" maxlength="100" aria-describedby="person-result-${person.id}">
        <div id="person-result-${person.id}" class="person-result" aria-live="polite"></div>
        <details class="person-name-options" ${person.name ? 'open' : ''}><summary>${index + 1}人目の呼び名を付ける</summary><label class="sr-only" for="person-name-${person.id}">${index + 1}人目の呼び名（任意）</label><input id="person-name-${person.id}" data-person-name="${person.id}" type="text" value="${e(person.name)}" placeholder="例：自分、家族" autocomplete="off" maxlength="30"></details>
      </fieldset>`).join('');
    find('#people-count').textContent = `${people.length}人`;
    const add = find<HTMLButtonElement>('[data-add-person]');
    add.disabled = people.length === 4;
    add.textContent = people.length === 4 ? '4人まで追加済み' : '＋ 人を追加';
  }

  function renderResults(): void {
    copyValue = '';
    find<HTMLButtonElement>('[data-copy-people]').disabled = true;
    find('#people-reference-error').hidden = true;
    find('#people-reference').setAttribute('aria-invalid', 'false');
    let reference;
    try { reference = fromISO(referenceValue); }
    catch {
      const error = find('#people-reference-error');
      error.textContent = `基準日は${MIN_YEAR}～${MAX_YEAR}年の有効な年月日を入力してください。`;
      error.hidden = false;
      find('#people-reference').setAttribute('aria-invalid', 'true');
      people.forEach(person => { find(`#person-result-${person.id}`).textContent = ''; });
      find('#people-results').innerHTML = '';
      return;
    }
    const comparison = comparePeople(people, reference);
    comparison.people.forEach((person, index) => {
      const id = people[index].id;
      find(`#person-birth-${id}`).setAttribute('aria-invalid', String(person.invalid));
      find(`#person-result-${id}`).innerHTML = person.birth && person.age
        ? `<strong class="person-age">${formatAge(person.age)}</strong><span>${e(person.birth.type === 'date' ? japaneseDate(person.birth) : `${person.birth.year}年`)}生まれ</span><span>${e(birthEra(person.birth))}</span>${person.birth.year > today().year ? '<small>未来の和暦は将来の改元を考慮していません。</small>' : ''}`
        : `<p class="${person.invalid ? 'field-error' : 'section-note'}">${e(person.message)}</p>`;
    });
    if (!comparison.ready) {
      find('#people-results').innerHTML = '<p class="people-pending">全員の生年・生年月日を入力すると、年齢差が表示されます。</p>';
      return;
    }
    find('#people-results').innerHTML = `<div class="people-differences"><h3>基準日の年齢差</h3><p class="section-note">${japaneseDate(reference)}時点の満年齢を比較しています。</p><dl>${comparison.pairs.map(pair => `<div><dt>${e(pair.first)}<span class="pair-separator">×</span>${e(pair.second)}</dt><dd>${formatAgeDifference(pair.difference)}</dd></div>`).join('')}</dl><p class="section-note">生年だけの場合、年齢と年齢差に幅があります。ここでの差は、誕生日どうしの間隔ではありません。</p></div>`;
    copyValue = comparisonText(comparison, reference);
    find<HTMLButtonElement>('[data-copy-people]').disabled = false;
  }

  function onInput(event: Event): void {
    if ((event as InputEvent).isComposing) return;
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.id === 'people-reference') { options.onReferenceChange(target.value); return; }
    const id = Number(target.dataset.personName ?? target.dataset.personBirth);
    const person = people.find(entry => entry.id === id);
    if (!person) return;
    if (target.dataset.personName) person.name = target.value;
    else person.input = target.value;
    renderResults();
  }
  root.addEventListener('input', onInput);
  root.addEventListener('compositionend', onInput);
  root.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-add-person') && people.length < 4) {
      people.push({ id: nextId++, name: '', input: '' });
      renderInputs(); renderResults();
      find<HTMLInputElement>(`#person-birth-${people.at(-1)!.id}`).focus();
    } else if (button.dataset.removePerson && people.length > 2) {
      const index = people.findIndex(person => person.id === +button.dataset.removePerson!);
      people = people.filter(person => person.id !== +button.dataset.removePerson!);
      renderInputs(); renderResults();
      find<HTMLInputElement>(`#person-birth-${people[Math.min(index, people.length - 1)].id}`).focus();
    } else if (button.hasAttribute('data-use-main')) {
      const input = options.getMainInput();
      const parsed = parseInput(input);
      if (parsed.type !== 'gregorian-year' && parsed.type !== 'era-year' && parsed.type !== 'date') {
        toast('変換タブに生年・生年月日を入力してください'); return;
      }
      people[0].input = input;
      find<HTMLInputElement>(`#person-birth-${people[0].id}`).value = input;
      renderResults();
      find<HTMLInputElement>(`#person-birth-${people[1].id}`).focus();
    } else if (button.hasAttribute('data-people-today')) options.onReferenceChange(toISO(today()));
    else if (button.hasAttribute('data-copy-people') && copyValue) void copyText(copyValue);
  });

  renderInputs();
  return {
    setReference(value: string): void {
      referenceValue = value;
      find<HTMLInputElement>('#people-reference').value = value;
      renderResults();
    },
  };
}
