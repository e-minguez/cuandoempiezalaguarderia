import { describe, it, expect } from 'vitest';
import { calculateTimeline } from './calculator';
import { addDays, addWeeks } from 'date-fns';

describe('calculateTimeline', () => {
  const baseDate = new Date('2026-01-01'); // Thursday
  // Mock holiday function: always false (no holidays)
  const noHolidays = () => false;

  it('should calculate mandatory leave correctly (6 weeks)', () => {
    const result = calculateTimeline({
      birthDate: baseDate,
      motherWeeks: 16,
      fatherWeeks: 16,
      lactanciaDays: 0,
      vacacionesDays: 0,
      isHoliday: noHolidays
    });

    const mandatory = result.find(p => p.type === 'baja-obligatoria');
    expect(mandatory).toBeDefined();
    // 6 weeks from Jan 1st
    // Jan 1 + 6 weeks - 1 day
    const expectedEnd = addDays(addWeeks(baseDate, 6), -1);
    expect(mandatory?.start).toEqual(baseDate);
    expect(mandatory?.end).toEqual(expectedEnd);
  });

  it('should calculate mother voluntary leave correctly', () => {
    const motherWeeks = 16;
    const result = calculateTimeline({
      birthDate: baseDate,
      motherWeeks,
      fatherWeeks: 6, // No voluntary for father
      lactanciaDays: 0,
      vacacionesDays: 0,
      isHoliday: noHolidays
    });

    const motherLeave = result.find(p => p.type === 'baja-madre');
    expect(motherLeave).toBeDefined();
    
    // Should start after mandatory
    const mandatoryEnd = addDays(addWeeks(baseDate, 6), -1);
    const expectedStart = addDays(mandatoryEnd, 1);
    
    // Duration: 16 - 6 = 10 weeks
    const expectedEnd = addDays(addWeeks(expectedStart, 10), -1);

    expect(motherLeave?.start).toEqual(expectedStart);
    expect(motherLeave?.end).toEqual(expectedEnd);
  });

  it('should calculate lactancia days skipping weekends', () => {
    // Start on a Friday to ensure weekend skip logic is tested immediately
    // If calculateTimeline continues from previous period...
    // Let's just trust the chain.
    
    const result = calculateTimeline({
      birthDate: baseDate, // Thu Jan 1 2026
      motherWeeks: 6, // Only mandatory
      fatherWeeks: 6, // Only mandatory
      lactanciaDays: 5, // 5 working days
      vacacionesDays: 0,
      isHoliday: noHolidays
    });

    // Mandatory ends: Thu Jan 1 + 6 weeks - 1 day = Wed Feb 11
    // Lactancia starts: Thu Feb 12
    // Thu Feb 12 (1)
    // Fri Feb 13 (2)
    // Sat Feb 14 (Skip)
    // Sun Feb 15 (Skip)
    // Mon Feb 16 (3)
    // Tue Feb 17 (4)
    // Wed Feb 18 (5) -> End Date
    
    const lactancia = result.find(p => p.type === 'lactancia');
    expect(lactancia).toBeDefined();
    
    const mandatoryEnd = addDays(addWeeks(baseDate, 6), -1);
    const expectedStart = addDays(mandatoryEnd, 1);
    
    // We expect it to end on Feb 18
    const expectedEnd = new Date('2026-02-18');
    
    expect(lactancia?.start).toEqual(expectedStart);
    // Simple date check might fail on timezones if not careful, but we are using local dates usually.
    // Let's check string or similar.
    expect(lactancia?.end.toDateString()).toBe(expectedEnd.toDateString());
  });
});
