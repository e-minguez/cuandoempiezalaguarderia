import { addWeeks, addDays, isWeekend } from 'date-fns';

export interface CalculatorParams {
  birthDate: Date;
  motherWeeks: number;
  fatherWeeks: number;
  lactanciaDays: number;
  vacacionesDays: number;
  isHoliday: (date: Date) => boolean;
}

export type PeriodType = 
  | 'baja-obligatoria' 
  | 'baja-madre' 
  | 'baja-padre' 
  | 'lactancia' 
  | 'vacaciones';

export interface Period {
  type: PeriodType;
  start: Date;
  end: Date;
  owner: 'madre' | 'padre' | 'ambos' | 'any';
  label: string;
}

const MANDATORY_WEEKS = 6;

// Helper to add working days skipping weekends AND holidays
function addWorkingDays(startDate: Date, days: number, isHoliday: (d: Date) => boolean): Date {
  let count = 0;
  let currentDate = startDate;
  
  // If starting date is not a working day, move to next one before counting?
  // Usually if leave starts on Monday and Monday is holiday, you start counting Tuesday.
  // We'll iterate until we consume 'days' working days.
  // However, usually the 'start' date is fixed by previous period end + 1.
  // If that start date is a holiday/weekend, does it count?
  // For 'Lactancia' (accumulated hours), you are entitled to X working days off.
  // If the period starts on a Sunday, you just don't go to work Sunday (normal), 
  // and your first "lactancia day" is Monday.
  
  while (count < days) {
    // If it's a working day (not weekend AND not holiday)
    if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
      count++;
    }
    // If we haven't finished, move to next day
    if (count < days) {
      currentDate = addDays(currentDate, 1);
    }
  }
  return currentDate;
}

export function calculateTimeline(params: CalculatorParams): Period[] {
  const { birthDate, motherWeeks, fatherWeeks, lactanciaDays, vacacionesDays, isHoliday } = params;
  
  const periods: Period[] = [];
  let currentDate = birthDate;

  // 1. Baja Obligatoria (Simultaneous) - Calendar Weeks
  // Holidays do NOT extend this.
  const mandatoryEnd = addDays(addWeeks(currentDate, MANDATORY_WEEKS), -1);
  periods.push({
    type: 'baja-obligatoria',
    start: currentDate,
    end: mandatoryEnd,
    owner: 'ambos',
    label: 'Baja Obligatoria (6 semanas)'
  });
  
  currentDate = addDays(mandatoryEnd, 1);

  // 2. Madre Voluntary - Calendar Weeks
  const motherVoluntaryWeeks = Math.max(0, motherWeeks - MANDATORY_WEEKS);
  if (motherVoluntaryWeeks > 0) {
    const motherEnd = addDays(addWeeks(currentDate, motherVoluntaryWeeks), -1);
    periods.push({
      type: 'baja-madre',
      start: currentDate,
      end: motherEnd,
      owner: 'madre',
      label: `Baja Madre (${motherVoluntaryWeeks} semanas)`
    });
    currentDate = addDays(motherEnd, 1);
  }

  // 3. Padre Voluntary - Calendar Weeks
  const fatherVoluntaryWeeks = Math.max(0, fatherWeeks - MANDATORY_WEEKS);
  if (fatherVoluntaryWeeks > 0) {
    const fatherEnd = addDays(addWeeks(currentDate, fatherVoluntaryWeeks), -1);
    periods.push({
      type: 'baja-padre',
      start: currentDate,
      end: fatherEnd,
      owner: 'padre',
      label: `Baja Padre (${fatherVoluntaryWeeks} semanas)`
    });
    currentDate = addDays(fatherEnd, 1);
  }

  // 4. Lactancia (Working Days)
  // Holidays DO extend this.
  if (lactanciaDays > 0) {
    // Check if start date is valid working day? 
    // Usually periods are continuous.
    const lactanciaEnd = addWorkingDays(currentDate, lactanciaDays, isHoliday);
    
    periods.push({
      type: 'lactancia',
      start: currentDate,
      end: lactanciaEnd,
      owner: 'madre', 
      label: `Lactancia (${lactanciaDays} días laborables)`
    });
    currentDate = addDays(lactanciaEnd, 1);
  }

  // 5. Vacaciones (Working Days)
  if (vacacionesDays > 0) {
    const vacacionesEnd = addWorkingDays(currentDate, vacacionesDays, isHoliday);
    periods.push({
      type: 'vacaciones',
      start: currentDate,
      end: vacacionesEnd,
      owner: 'any',
      label: `Vacaciones (${vacacionesDays} días laborables)`
    });
    currentDate = addDays(vacacionesEnd, 1);
  }

  return periods;
}
