import type { Sport } from '../types';

export const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  Soccer:       { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  Basketball:   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  Volleyball:   { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'Multi-Sport':{ bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  Camp:         { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
};

export const STATUS_COLORS: Record<string, string> = {
  Scheduled:      'bg-blue-100 text-blue-700',
  Confirmed:      'bg-green-100 text-green-700',
  Completed:      'bg-gray-100 text-gray-600',
  Cancelled:      'bg-red-100 text-red-700',
  'Needs Coverage': 'bg-red-100 text-red-700',
};

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateLabel(date: Date): { day: string; date: string } {
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}
