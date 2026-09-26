let timeout: ReturnType<typeof setTimeout>;

export function toast(message: string): void {
  const element = document.querySelector<HTMLElement>('#toast')!;
  clearTimeout(timeout);
  element.textContent = message;
  element.classList.add('visible');
  timeout = setTimeout(() => element.classList.remove('visible'), 2800);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast('コピーしました');
    return true;
  } catch {
    const previous = document.activeElement as HTMLElement | null;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('aria-label', 'コピー用テキスト');
    field.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(field);
    field.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch { /* Report the failure below. */ }
    field.remove(); previous?.focus();
    toast(success ? 'コピーしました' : 'コピーできませんでした。結果のテキストを選択してコピーしてください。');
    return success;
  }
}
