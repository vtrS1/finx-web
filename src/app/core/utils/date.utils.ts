const DEFAULT_DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  year: 'numeric',
};

export function calculateAge(birthDate: string, referenceDate = new Date()): number {
  const date = parseIsoDate(birthDate);
  let age = referenceDate.getFullYear() - date.getFullYear();
  const monthDifference = referenceDate.getMonth() - date.getMonth();
  const hasBirthdayPassed =
    monthDifference > 0 || (monthDifference === 0 && referenceDate.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day);
}

export function formatDateTime(
  value: string | Date,
  locale = 'pt-BR',
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_TIME_FORMAT_OPTIONS,
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatDateToIsoDate(date: Date | null): string {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
