import DateHolidays from 'date-holidays';

export const REGIONS = [
  { code: 'AN', name: 'Andalucía' },
  { code: 'AR', name: 'Aragón' },
  { code: 'AS', name: 'Asturias' },
  { code: 'CN', name: 'Canarias' },
  { code: 'CB', name: 'Cantabria' },
  { code: 'CM', name: 'Castilla-La Mancha' },
  { code: 'CL', name: 'Castilla y León' },
  { code: 'CT', name: 'Cataluña' },
  { code: 'EX', name: 'Extremadura' },
  { code: 'GA', name: 'Galicia' },
  { code: 'IB', name: 'Islas Baleares' },
  { code: 'RI', name: 'La Rioja' },
  { code: 'MD', name: 'Madrid' },
  { code: 'MC', name: 'Murcia' },
  { code: 'NC', name: 'Navarra' },
  { code: 'PV', name: 'País Vasco' },
  { code: 'VC', name: 'Comunidad Valenciana' },
  { code: 'CE', name: 'Ceuta' },
  { code: 'ML', name: 'Melilla' },
];

let hd = new DateHolidays();

export const initHolidays = (region?: string) => {
  if (region) {
    hd.init('ES', region);
  } else {
    hd.init('ES');
  }
};

export const isHoliday = (date: Date): boolean => {
  return !!hd.isHoliday(date);
};

export const getHolidayName = (date: Date): string | undefined => {
  const holiday = hd.isHoliday(date);
  return holiday ? (holiday as any).name : undefined;
};
