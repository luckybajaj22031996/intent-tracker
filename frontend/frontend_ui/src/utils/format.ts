/**
 * Format an ISO date string (YYYY-MM-DD) to a human-readable date.
 * e.g. "2026-07-15" → "Wednesday, 15 July 2026"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format an ISO date string to a short date.
 * e.g. "2026-07-15" → "15 Jul"
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Get today's date as an ISO string (YYYY-MM-DD).
 */
export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a datetime string to a readable time.
 * e.g. "2026-07-15T21:00:00.000Z" → "9:00 PM"
 */
export function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a currency amount.
 */
export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Check if the current time is in evening mode (after 5 PM).
 */
export function isEveningMode(): boolean {
  return new Date().getHours() >= 17;
}

/**
 * Get the month name for a given Date.
 */
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/**
 * Get the number of days in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of week (0=Sun) for the first day of a month.
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
