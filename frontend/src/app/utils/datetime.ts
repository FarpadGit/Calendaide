export const weekdays: { code: string; name: string; value: number }[] = [
  { code: 'H', name: 'Hétfő', value: 0 },
  { code: 'K', name: 'Kedd', value: 1 },
  { code: 'Sze', name: 'Szerda', value: 2 },
  { code: 'Cs', name: 'Csütörtök', value: 3 },
  { code: 'P', name: 'Péntek', value: 4 },
  { code: 'Szo', name: 'Szombat', value: 5 },
  { code: 'V', name: 'Vasárnap', value: 6 },
];

export function getDuration(start?: Date | null, end?: Date | null) {
  if (!start) return 0;
  if (!end) return 60;
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (60 * 1000));
}

export function timeDelta(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

export function addToDate(a: Date, delta: number) {
  return new Date(a.getTime() + delta);
}

export function dateToText(date: Date, options?: Intl.DateTimeFormatOptions) {
  return Intl.DateTimeFormat('hu-HU', options).format(date);
}
