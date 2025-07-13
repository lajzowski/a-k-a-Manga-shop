export function parseDateFromString(dateStr: string): Date | null {
  if (dateStr && /^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  } else if (dateStr && /^\d{2}\.\d{2}$/.test(dateStr)) {
    const [day, month] = dateStr.split('.').map(Number);
    const year = (new Date()).getFullYear();
    return new Date(year, month - 1, day);
  }
  return null;
} 