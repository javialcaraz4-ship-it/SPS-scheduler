import type { Shift, Coach, CoachAvailability } from '../types';
import { getCoachAvailabilityForDate, timeOverlaps } from './availability';

export interface ShiftConflict {
  type: 'unavailable' | 'tentative' | 'overlap' | 'inactive' | 'sport_mismatch';
  message: string;
}

/**
 * Returns all scheduling conflicts for a shift.
 * Checks: inactive coach, sport mismatch, availability, and overlapping shifts.
 */
export function checkShiftConflicts(
  shift: Shift,
  coaches: Coach[],
  allShifts: Shift[],
  availability: CoachAvailability[],
): ShiftConflict[] {
  const conflicts: ShiftConflict[] = [];
  if (!shift.coachId) return conflicts;

  const coach = coaches.find(c => c.id === shift.coachId);
  if (!coach) return conflicts;

  if (!coach.active) {
    conflicts.push({ type: 'inactive', message: `${coach.name} is marked as inactive.` });
  }

  if (!coach.sports.includes(shift.sport)) {
    conflicts.push({
      type: 'sport_mismatch',
      message: `${coach.name} is not listed as a ${shift.sport} coach.`,
    });
  }

  const availStatus = getCoachAvailabilityForDate(
    shift.coachId, shift.date, shift.startTime, shift.endTime, availability,
  );
  if (availStatus === 'unavailable') {
    conflicts.push({
      type: 'unavailable',
      message: `${coach.name} is marked unavailable during this time.`,
    });
  } else if (availStatus === 'tentative') {
    conflicts.push({
      type: 'tentative',
      message: `${coach.name} is tentative during this time — they may not be available.`,
    });
  }

  const overlapping = allShifts.filter(
    s => s.id !== shift.id &&
      s.coachId === shift.coachId &&
      s.date === shift.date &&
      timeOverlaps(shift.startTime, shift.endTime, s.startTime, s.endTime),
  );
  if (overlapping.length > 0) {
    conflicts.push({ type: 'overlap', message: `${coach.name} already has another shift during this time.` });
  }

  return conflicts;
}
