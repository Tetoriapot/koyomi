import type { EraKey } from '../parser/types';

export interface Era {
  key: EraKey;
  name: string;
  short: string;
  reading: string;
  start: string;
  end: string | null;
  startYear: number;
}

// 明治の境界は企画書に従う便宜的な西暦日付。旧暦の換算は行わない。
export const ERAS: readonly Era[] = [
  { key: 'meiji', name: '明治', short: 'M', reading: 'めいじ', start: '1868-01-25', end: '1912-07-29', startYear: 1868 },
  { key: 'taisho', name: '大正', short: 'T', reading: 'たいしょう', start: '1912-07-30', end: '1926-12-24', startYear: 1912 },
  { key: 'showa', name: '昭和', short: 'S', reading: 'しょうわ', start: '1926-12-25', end: '1989-01-07', startYear: 1926 },
  { key: 'heisei', name: '平成', short: 'H', reading: 'へいせい', start: '1989-01-08', end: '2019-04-30', startYear: 1989 },
  { key: 'reiwa', name: '令和', short: 'R', reading: 'れいわ', start: '2019-05-01', end: null, startYear: 2019 },
];

export function getEra(key: EraKey): Era {
  return ERAS.find(era => era.key === key)!;
}
