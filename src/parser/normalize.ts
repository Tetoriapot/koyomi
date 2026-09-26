export function normalize(input: string): string {
  return input.normalize('NFKC').trim().toUpperCase().replace(/\s+/g, '').replace(/[−–—]/g, '-');
}
