import { MAX_YEAR, MIN_YEAR } from '../utils/date';
import { icon } from './icons';
import { TAB_IDS } from './tabs';
import { renderInformation } from './information';

export function renderLayout(): string {
  const labels = { convert: '変換', age: '年齢計算', people: '年齢比較', timeline: '年表', school: '学年' };
  const needsBirth = '<p class="needs-birth" hidden>生年・生年月日を入力すると表示されます。年齢から調べる場合は「変換」タブで生年の候補を選んでください。</p>';
  return `
    <a class="skip-link" href="#main-input">入力欄へ移動</a>
    <header class="site-header">
      <a class="brand" href="./" aria-label="暦 ホーム"><span class="brand-icon">${icon('calendar')}</span><span class="brand-name">暦<span class="brand-en">KOYOMI</span></span></a>
      <div class="header-actions"><button type="button" class="header-button" data-open-dialog="history-dialog" aria-haspopup="dialog" aria-controls="history-dialog">更新履歴</button><button type="button" class="header-button help-button" data-open-dialog="help-dialog" aria-haspopup="dialog" aria-controls="help-dialog">Help<span>使い方</span></button><button type="button" id="theme-toggle" class="icon-button" aria-label="表示テーマを切り替え"></button></div>
    </header>
    <main id="main" class="container">
      <section class="intro"><h1>年齢・西暦和暦早見</h1><p>西暦・和暦の変換と年齢計算</p></section>
      <div class="tool-tabs" role="tablist" aria-label="使う機能を選ぶ">
        ${TAB_IDS.map(id => `<button type="button" id="tab-${id}" role="tab" aria-label="${labels[id]}" aria-controls="panel-${id}" aria-selected="${id === 'convert'}" tabindex="${id === 'convert' ? 0 : -1}">${id === 'age' || id === 'people' ? `<span>年齢</span><span>${labels[id].slice(2)}</span>` : labels[id]}</button>`).join('')}
      </div>
      <section id="single-input" class="input-panel" aria-labelledby="input-heading">
        <div class="input-label-row"><label id="input-heading" for="main-input">生年・生年月日・和暦</label><span id="sample-indicator" class="sample-indicator">入力例</span></div>
        <div class="main-input-wrap">${icon('search')}<input id="main-input" type="text" placeholder="例：1998 / H10 / 1998/4/12" autocomplete="off" spellcheck="false" maxlength="100" aria-describedby="input-hint input-error"><button type="button" id="clear-input" class="icon-button" aria-label="入力をクリア">${icon('close')}</button></div>
        <span id="input-hint" class="sr-only">西暦・和暦・生年月日、または50歳のような年齢を入力できます。</span>
        <p id="sample-result-note" class="sample-result-note">入力例の結果です。調べたい生年・生年月日に書き換えてください。</p>
        <p id="input-error" class="field-error" role="alert" hidden></p>
        <details id="input-options" class="input-options">
          <summary>入力例を見る</summary>
          <div class="examples"><div class="chips"><button type="button" class="chip" data-example="昭和42年生まれ">昭和42年生まれ</button><button type="button" class="chip" data-example="H10">H10</button><button type="button" class="chip" data-example="1998/04/12">1998/04/12</button><button type="button" class="chip" data-example="現在50歳">現在50歳</button></div></div>
        </details>
        <details id="reference-options" class="input-options reference-options">
          <summary>年齢の基準日<span id="reference-summary"></span><span class="reference-edit">変更</span></summary>
          <div class="reference-row"><label for="reference-date">年齢の基準日</label><div class="reference-controls"><input id="reference-date" type="date" min="${MIN_YEAR}-01-01" max="${MAX_YEAR}-12-31" aria-describedby="reference-error"><button type="button" id="today-button" class="text-button">今日に戻す</button></div></div>
          <p class="section-note">変換と年齢比較で共通です。年表の「現在」は今日の日付を使います。</p>
          <p id="reference-error" class="field-error" role="alert" hidden></p>
        </details>
      </section>

      <section id="panel-convert" role="tabpanel" aria-labelledby="tab-convert">
        <section id="result" class="result-region" aria-label="変換結果" aria-live="polite" aria-atomic="true"></section>
        <div class="share-row"><button type="button" id="share-button" class="text-button" aria-describedby="share-description" disabled>${icon('link')}共有URLをコピー</button><p id="share-description" class="section-note" hidden></p></div>
      </section>
      <section id="panel-age" role="tabpanel" aria-labelledby="tab-age" hidden>
        ${needsBirth}
        <section class="compare-section" data-requires-birth aria-labelledby="compare-heading">
          <div class="section-heading"><h2 id="compare-heading">年と年齢を調べる</h2></div>
          <div class="compare-grid">
            <div class="compare-card"><label for="target-year">この年に何歳？</label><div class="compact-input-wrap"><input id="target-year" type="text" value="2000" placeholder="例：2000 / 平成12年" autocomplete="off" maxlength="100"><span>${icon('arrow')}</span></div><div id="target-year-result" class="compare-output" aria-live="polite"></div></div>
            <div class="compare-card"><label for="target-age">この年齢になるのは？</label><div class="compact-input-wrap"><input id="target-age" type="text" inputmode="numeric" value="20" placeholder="例：20" autocomplete="off" maxlength="10"><span>歳</span></div><div id="target-age-result" class="compare-output" aria-live="polite"></div></div>
          </div>
        </section>
      </section>
      <section id="panel-people" role="tabpanel" aria-labelledby="tab-people" hidden><section id="people-comparison" class="section-card people-section" aria-labelledby="people-heading"></section></section>
      <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" hidden>
        ${needsBirth}
        <section class="timeline-section section-card" data-requires-birth aria-labelledby="timeline-heading">
          <div class="section-heading"><h2 id="timeline-heading">年齢年表</h2><div class="segmented" role="group" aria-label="年表の間隔"><button id="step-10" type="button" data-step="10">10年ごと</button><button id="step-1" type="button" data-step="1">1年ごと</button></div></div>
          <p class="table-description" id="timeline-description"></p><p class="timeline-reference" id="timeline-reference"></p><div id="timeline" class="table-wrap" tabindex="0" role="region" aria-label="年齢年表のスクロール領域"></div>
          <div class="table-footer"><span>その年に迎える年齢です。</span><button type="button" id="copy-timeline" class="text-button">${icon('copy')}年表をコピー</button></div>
          <p class="section-note future-note">未来の改元は未考慮。「現在」は今日の日付で計算します。</p>
        </section>
      </section>
      <section id="panel-school" role="tabpanel" aria-labelledby="tab-school" hidden>
        ${needsBirth}
        <section class="school-section section-card" data-requires-birth aria-labelledby="school-heading"><div class="section-heading"><h2 id="school-heading">学年早見</h2><span class="subtle-tag">参考</span></div><div id="school"></div></section>
      </section>
    </main>
    <footer class="site-footer"><span>${icon('shield')} 端末内で計算・入力履歴は保存しません</span><span id="offline-status">外部送信なし</span></footer>
    ${renderInformation()}
    <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}
