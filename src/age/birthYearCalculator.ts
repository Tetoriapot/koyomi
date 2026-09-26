import { assertYear } from '../utils/date';
import { assertAge } from './ageCalculator';

export function birthYearsFromAge(age: number, referenceYear: number): { min: number; max: number } {
  assertAge(age); assertYear(referenceYear);
  const max = referenceYear - age;
  assertYear(max - 1);
  return { min: max - 1, max };
}
