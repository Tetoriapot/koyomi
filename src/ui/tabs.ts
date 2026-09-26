export const TAB_IDS = ['convert', 'age', 'people', 'timeline', 'school'] as const;
export type TabId = typeof TAB_IDS[number];

const HASH_TABS: Record<string, TabId> = {
  '#convert': 'convert', '#main-input': 'convert', '#age': 'age',
  '#people-comparison': 'people', '#timeline': 'timeline', '#school': 'school',
};
const TAB_HASHES: Record<TabId, string> = {
  convert: '#convert', age: '#age', people: '#people-comparison', timeline: '#timeline', school: '#school',
};

/** Hide panels without remounting them so inputs and disclosure state survive tab changes. */
export function mountTabs(root: HTMLElement, onChange: (tab: TabId) => void) {
  const buttons = TAB_IDS.map(id => root.querySelector<HTMLButtonElement>(`#tab-${id}`)!);
  function select(id: TabId, focus = false, updateHash = false): void {
    TAB_IDS.forEach((tab, index) => {
      const active = tab === id;
      buttons[index].setAttribute('aria-selected', String(active));
      buttons[index].tabIndex = active ? 0 : -1;
      root.querySelector<HTMLElement>(`#panel-${tab}`)!.hidden = !active;
    });
    onChange(id);
    if (focus) buttons[TAB_IDS.indexOf(id)].focus();
    if (updateHash) {
      const url = new URL(location.href);
      url.hash = TAB_HASHES[id];
      history.replaceState(null, '', url);
    }
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(TAB_IDS[index], false, true));
    button.addEventListener('keydown', event => {
      let next: number;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      select(TAB_IDS[next], true, true);
    });
  });
  window.addEventListener('hashchange', () => {
    const id = HASH_TABS[location.hash];
    if (id) select(id);
  });
  select(HASH_TABS[location.hash] ?? 'convert');
  return { select };
}
