import type { CoachAvailability, AvailabilityStatus } from '../types';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
  return timeToMinutes(start1) < timeToMinutes(end2) && timeToMinutes(end1) > timeToMinutes(start2);
}

/** Most-restrictive status across a set of blocks. */
function dominantStatus(blocks: CoachAvailability[]): AvailabilityStatus {
  if (blocks.some(b => b.status === 'unavailable')) return 'unavailable';
  if (blocks.some(b => b.status === 'tentative')) return 'tentative';
  if (blocks.some(b => b.status === 'preferred')) return 'preferred';
  return 'available';
}

/**
 * Returns the dominant availability status for a coach on a given day
 * (ignores shift times — used to shade the admin schedule grid cells).
 */
export function getDayAvailabilityStatus(
  coachId: string,
  date: string,
  availabilities: CoachAvailability[],
): AvailabilityStatus | null {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const coachAvail = availabilities.filter(a => a.coachId === coachId);

  const exceptions = coachAvail.filter(a => a.type === 'exception' && a.date === date);
  const blocks = exceptions.length > 0
    ? exceptions
    : coachAvail.filter(a => a.type === 'default' && a.dayOfWeek === dayOfWeek);

  if (blocks.length === 0) return null;
  return dominantStatus(blocks);
}

/**
 * Returns the availability status for a coach during a specific time window on a date.
 * Exceptions override defaults. Used for conflict checking.
 */
export function getCoachAvailabilityForDate(
  coachId: string,
  date: string,
  startTime: string,
  endTime: string,
  availabilities: CoachAvailability[],
): AvailabilityStatus | null {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const coachAvail = availabilities.filter(a => a.coachId === coachId);

  const exceptions = coachAvail.filter(
    a => a.type === 'exception' && a.date === date && timeOverlaps(startTime, endTime, a.startTime, a.endTime),
  );
  const blocks = exceptions.length > 0
    ? exceptions
    : coachAvail.filter(
        a => a.type === 'default' && a.dayOfWeek === dayOfWeek && timeOverlaps(startTime, endTime, a.startTime, a.endTime),
      );

  if (blocks.length === 0) return null;
  return dominantStatus(blocks);
}

/** All availability blocks for a coach on a specific date (exceptions take priority over defaults). */
export function getCoachDayBlocks(
  coachId: string,
  date: string,
  availabilities: CoachAvailability[],
): CoachAvailability[] {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const coachAvail = availabilities.filter(a => a.coachId === coachId);
  const exceptions = coachAvail.filter(a => a.type === 'exception' && a.date === date);
  if (exceptions.length > 0) return exceptions;
  return coachAvail.filter(a => a.type === 'default' && a.dayOfWeek === dayOfWeek);
}
