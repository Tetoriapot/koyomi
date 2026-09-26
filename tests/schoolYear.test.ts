import { describe, expect, it } from 'vitest';
import { schoolYears } from '../src/age/schoolYearCalculator';
import { fromISO } from '../src/utils/date';
import { renderSchool } from '../src/ui/renderTimeline';

describe('仕様書 J：学校年度（79–85）', () => {
  it('#79 2000-04-01は1999年度生', () => expect(schoolYears(fromISO('2000-04-01')).cohort).toBe(1999));
  it('#80 2000-04-02は2000年度生', () => expect(schoolYears(fromISO('2000-04-02')).cohort).toBe(2000));
  it('#81 4月1日生まれは2006年入学', () => expect(schoolYears(fromISO('2000-04-01')).elementary).toBe(2006));
  it('#82 4月2日生まれは2007年入学', () => expect(schoolYears(fromISO('2000-04-02')).elementary).toBe(2007));
  it('#83 1998-04-12の小学校入学', () => expect(schoolYears(fromISO('1998-04-12')).elementary).toBe(2005));
  it('#84 1998-04-12の中学校入学', () => expect(schoolYears(fromISO('1998-04-12')).juniorHigh).toBe(2011));
  it('#85 1998-04-12の高校入学', () => expect(schoolYears(fromISO('1998-04-12')).highSchool).toBe(2014));
  it('高校卒業は3年後の3月', () => expect(schoolYears(fromISO('1998-04-12')).graduation).toBe(2017));
  it('2019年3月の高校卒業に令和を含めない', () => {
    const html = renderSchool({ type: 'date', ...fromISO('2000-04-02') });
    expect(html).toContain('平成31年');
    expect(html).not.toContain('令和');
  });
});
