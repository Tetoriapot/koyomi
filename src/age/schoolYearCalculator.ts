import type { CalendarDate } from '../parser/types';
import { assertDate } from '../utils/date';

export function schoolYears(birth: CalendarDate) {
  assertDate(birth);
  const early = birth.month < 4 || (birth.month === 4 && birth.day === 1);
  const cohort = birth.year - (early ? 1 : 0);
  return { cohort, elementary: cohort + 7, juniorHigh: cohort + 13, highSchool: cohort + 16, graduation: cohort + 19 };
}
