export type Sport = 'Soccer' | 'Basketball' | 'Volleyball' | 'Multi-Sport' | 'Camp';

export type ShiftStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Needs Coverage'
  | 'Issue Reported';

export type InviteStatus = 'Not Invited' | 'Invited' | 'Active';

// ── Availability ───────────────────────────────────────────────────────────────
export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative' | 'preferred';
export type AvailabilityType = 'default' | 'exception';

export interface CoachAvailability {
  id: string;
  coachId: string;
  type: AvailabilityType;
  /** JS day-of-week: 0=Sun, 1=Mon … 6=Sat. Only for type='default'. */
  dayOfWeek?: number;
  /** ISO date YYYY-MM-DD. Only for type='exception'. */
  date?: string;
  startTime: string; // HH:MM 24h
  endTime: string;   // HH:MM 24h
  status: AvailabilityStatus;
  note?: string;
}

// ── Coach ──────────────────────────────────────────────────────────────────────
export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  sports: Sport[];
  availability: string; // legacy text description
  payRate: number;
  active: boolean;
  inviteStatus: InviteStatus;
  passwordSet: boolean;
  /** MOCK ONLY — never store real passwords in plaintext in production */
  password?: string;
}

// ── School ─────────────────────────────────────────────────────────────────────
export interface School {
  id: string;
  name: string;
  address: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  programType: Sport[];
  notes: string;
  fieldLocation?: string;
  coachInstructions?: string;
  parkingNotes?: string;
  active: boolean;
}

// ── Shift ──────────────────────────────────────────────────────────────────────
export interface Shift {
  id: string;
  schoolId: string;
  coachId: string | null;
  sport: Sport;
  date: string;       // ISO date YYYY-MM-DD
  startTime: string;  // HH:MM 24h
  endTime: string;    // HH:MM 24h
  status: ShiftStatus;
  payRate: number;
  notes: string;
  issueNote?: string;
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'coach';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  coachId?: string;
}
