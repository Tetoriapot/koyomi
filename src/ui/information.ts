import { icon } from './icons';

const help = `
  <section><h3>使い方</h3><ul>
    <li>「変換」に生年・生年月日・和暦を入力します。例：1998、H10、1998/4/12、50歳。</li>
    <li>タブで年齢計算・年齢比較・年表・学年を切り替えます。切り替えても入力は保持されます。</li>
    <li>「年齢比較」では2～4人を追加して、同じ基準日での年齢差を確認できます。呼び名は任意です。</li>
    <li>年齢比較の上部に年齢一覧と入力状況を表示します。一覧の人を選ぶと、その入力欄へ移動します。全員の入力が有効になると全組み合わせの差を表示します。</li>
    <li>「年齢の基準日」を開いて日付を変更できます。変換と年齢比較の基準日は共通です。年表の「現在」は今日の日付で計算します。</li>
    <li>干支は「干支を見る」を開くと表示されます。コピーアイコンで結果をコピーできます。</li>
    <li>和暦の略称はM＝明治、T＝大正、S＝昭和、H＝平成、R＝令和です。「入力例を見る」から入力例を選べます。</li>
    <li>キーボードではTabキーで操作先を移動し、タブは左右矢印・Home・Endキーで切り替えます。ポップアップはEscキーで閉じられます。文字はブラウザーの拡大機能で大きくできます。</li>
  </ul></section>
  <section><h3>年齢と計算について</h3>
    <p>生年だけの場合は誕生日が不明なため、基準年の誕生日前～誕生日後の満年齢を幅で表示します。基準日の月日を変えてもこの幅は変わりません。生年月日がある場合は、基準日時点の満年齢です。「この年に何歳？」にも年月日を入力できます。</p>
    <p>西暦・和暦だけの入力も生年として扱います。「50」のような数字だけでは確定せず、年齢や和暦の候補を表示します。</p>
    <p>西暦は1000～2200年、和暦は明治以降に対応しています。改元年は複数の元号を表示し、日付がある場合はその日の元号を表示します。明治の開始日は仕様上1868年1月25日とし、旧暦の日付換算は行いません。</p>
    <p>2月29日生まれの満年齢は平年では3月1日に加算します。長寿の節目は満年齢での参考表示です。数え年ではありません。</p>
  </section>
  <section><h3>入力と共有</h3>
    <p>入力内容は端末内で計算し、履歴は保存しません。再読み込みすると入力はリセットされますが、共有URLから開いた場合はURLの内容を表示します。初回は「昭和42年生まれ」を入力例として表示します。</p>
    <p>共有URLには変換タブの入力内容と基準日が含まれます。複数人の比較は含まれません。共有先ではその内容を確認でき、開いたURLはブラウザーの履歴や配信元のアクセスログに残る場合があります。</p>
    <p>生年月日を伝えずに年齢だけを共有したい場合は、年齢の横のコピーアイコンを使ってください。</p>
  </section>
  <section><h3>ご利用にあたって</h3>
    <p>本ツールは日付・年齢確認を補助するための簡易ツールです。正式な行政手続、法律上の年齢判定、資格要件等については、各制度を所管する公的機関の情報をご確認ください。</p>
  </section>`;

const history = `
  <section class="release-entry"><time datetime="2026-10-26">2026年10月26日</time><h3>計算条件と比較結果の表示を改善</h3><ul>
    <li>基準日と年齢幅の理由、年表の「現在」の日付を明示しました。</li>
    <li>年齢比較の上部に各人の年齢、入力状況、全組み合わせの差をまとめました。</li>
    <li>コピーなどのボタンを押せる範囲と、計算条件の文字を大きくしました。</li>
    <li>共有URLに含まれる入力内容と基準日を、コピーボタン付近に表示しました。</li>
    <li>初期結果を入力例と明示し、Helpに日本語の案内を添えました。</li>
  </ul></section>
  <section class="release-entry"><time datetime="2026-09-26">2026年9月26日</time><h3>タブ表示と複数人比較を追加</h3><ul>
    <li>右上に「更新履歴」と「Help」のポップアップを追加しました。</li>
    <li>変換・年齢計算・年齢比較・年表・学年をタブに整理しました。</li>
    <li>干支や補足設定を、必要なときだけ開く表示にしました。</li>
    <li>2～4人の年齢比較を追加しました。各人の年齢と、全組み合わせの年齢差を確認できます。</li>
  </ul></section>
  <section class="release-entry"><time datetime="2026-09-25">2026年9月25日</time><h3>初期版を作成</h3><ul>
    <li>西暦・和暦の変換、満年齢の計算、年齢年表、学年早見、干支の表示に対応しました。</li>
    <li>結果のコピーと共有URL、表示テーマの切り替え、オフラインでの利用に対応しました。</li>
  </ul></section>`;

export function renderInformation(): string {
  return [{ id: 'history', title: '更新履歴', body: history }, { id: 'help', title: 'Help', body: help }]
    .map(({ id, title, body }) => `<dialog id="${id}-dialog" class="info-dialog" aria-labelledby="${id}-title">
      <header class="info-dialog-header"><h2 id="${id}-title">${title}</h2><button type="button" class="icon-button" data-close-dialog aria-label="${title}を閉じる" autofocus>${icon('close')}</button></header>
      <div class="info-dialog-body" tabindex="0" role="region" aria-label="${title}の内容">${body}</div>
    </dialog>`).join('');
}

export function mountInformation(root: HTMLElement): void {
  const dialogs = Array.from(root.querySelectorAll<HTMLDialogElement>('.info-dialog'));
  const open = (dialog: HTMLDialogElement): void => {
    if (dialog.open) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('.info-dialog-body')!.scrollTop = 0;
    document.documentElement.classList.add('modal-open');
  };
  root.querySelectorAll<HTMLButtonElement>('[data-open-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = dialogs.find(item => item.id === button.dataset.openDialog);
      if (dialog) open(dialog);
    });
  });
  dialogs.forEach(dialog => {
    dialog.querySelector('[data-close-dialog]')!.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!dialogs.some(item => item.open)) document.documentElement.classList.remove('modal-open');
    });
    const isBackdrop = (event: PointerEvent): boolean => {
      const bounds = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom);
    };
    let beganOnBackdrop = false;
    dialog.addEventListener('pointerdown', event => { beganOnBackdrop = isBackdrop(event); });
    dialog.addEventListener('pointerup', event => {
      if (beganOnBackdrop && isBackdrop(event)) dialog.close();
      beganOnBackdrop = false;
    });
    dialog.addEventListener('pointercancel', () => { beganOnBackdrop = false; });
  });
  // Keep existing Help bookmarks usable after moving the guide into a dialog.
  const openFromHash = (): void => {
    if (location.hash === '#guide') open(dialogs.find(dialog => dialog.id === 'help-dialog')!);
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}
