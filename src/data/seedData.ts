import type { Coach, School, Shift } from '../types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseTime(t: string): string {
  // "3:35pm" → "15:35"
  const m = t.trim().match(/^(\d+):(\d+)(am|pm)$/i);
  if (!m) return t;
  let h = parseInt(m[1]);
  const min = m[2];
  const period = m[3].toLowerCase();
  if (period === 'pm' && h !== 12) h += 12;
  if (period === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function toISO(month: number, day: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Parse "10/12, 11/23" strings into ISO date arrays. Dates ≥ 8 are assumed 2026, Jan–Jul 2027 otherwise.
function parseNoDates(str: string, baseYear = 2026): string[] {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const [m, d] = s.split('/').map(Number);
    const year = m >= 8 ? baseYear : baseYear + 1;
    return toISO(m, d, year);
  });
}

const DOW_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

let _idSeq = 1;
function id(prefix: string) { return `${prefix}_${String(_idSeq++).padStart(4, '0')}`; }

/** Expand a recurring program into individual Shift records. */
function expandShifts(opts: {
  schoolId: string;
  coachId: string | null;
  sport: Shift['sport'];
  dayOfWeek: string; // 'Monday', etc.
  startDate: string; // ISO
  endDate: string;   // ISO
  startTime: string; // "3:35pm"
  endTime: string;
  noClass: string;   // "10/12, 11/23"
  payRate?: number;
}): Shift[] {
  const dow = DOW_MAP[opts.dayOfWeek];
  const noDates = new Set(parseNoDates(opts.noClass));
  const start = new Date(opts.startDate + 'T12:00:00');
  const end = new Date(opts.endDate + 'T12:00:00');
  const shifts: Shift[] = [];
  const cur = new Date(start);
  // advance to first matching DOW
  while (cur.getDay() !== dow) cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    if (!noDates.has(iso)) {
      shifts.push({
        id: id('sh'),
        schoolId: opts.schoolId,
        coachId: opts.coachId,
        sport: opts.sport,
        date: iso,
        startTime: parseTime(opts.startTime),
        endTime: parseTime(opts.endTime),
        status: 'Scheduled',
        payRate: opts.payRate ?? 20,
        notes: '',
      });
    }
    cur.setDate(cur.getDate() + 7);
  }
  return shifts;
}

// ── Schools ──────────────────────────────────────────────────────────────────

export const schools: School[] = [
  { id: 'sc_gissv',    name: 'GISSV Mountain View', address: '', contactName: '', contactEmail: '', programType: ['Soccer', 'Cheerleading'], notes: '', active: true },
  { id: 'sc_lakeside', name: 'Lakeside',             address: '', contactName: '', contactEmail: '', programType: ['Soccer'], notes: '', active: true },
  { id: 'sc_northstar',name: 'North Star',           address: '', contactName: '', contactEmail: '', programType: ['Soccer'], notes: '', active: true },
  { id: 'sc_whiteoaks',name: 'White Oaks',           address: '', contactName: '', contactEmail: '', programType: ['Soccer', 'Basketball'], notes: '', active: true },
  { id: 'sc_gabmis',   name: 'Gabriela Mistral',     address: '', contactName: '', contactEmail: '', programType: ['Soccer', 'Basketball'], notes: '', active: true },
  { id: 'sc_ycis',     name: 'YCIS',                 address: '', contactName: '', contactEmail: '', programType: ['Basketball', 'Soccer'], notes: '', active: true },
  { id: 'sc_laslom',   name: 'Las Lomitas',          address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_bowman',   name: 'Bowman',               address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_synapse',  name: 'Synapse',              address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_svis_c',   name: 'SVIS (Clarke)',        address: '2086 Clarke Ave Building B, East Palo Alto, CA 94303', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_sanmig',   name: 'San Miguel',           address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_lascuola', name: 'La Scuola (SF)',       address: '', contactName: '', contactEmail: '', programType: ['Basketball', 'Soccer'], notes: '', active: true },
  { id: 'sc_bhcs',     name: 'BHCS Foster City',     address: 'Edgewater Blvd and Dorado Ln tennis courts, Foster City', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_oakknoll', name: 'Oak Knoll',            address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_svis_co',  name: 'SVIS (Cohn)',          address: '151 Laura Ln, Palo Alto, CA 94303', contactName: '', contactEmail: '', programType: ['Soccer', 'Basketball'], notes: '', active: true },
  { id: 'sc_bentley',  name: 'Bentley School',       address: '151 Laura Ln, Palo Alto, CA 94303', contactName: '', contactEmail: '', programType: ['Multi-Sport'], notes: '', active: true },
  { id: 'sc_laent',    name: 'La Entrada',           address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_addison',  name: 'Addison',              address: '', contactName: '', contactEmail: '', programType: ['Soccer'], notes: '', active: true },
  { id: 'sc_pbs',      name: 'PBS',                  address: '', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
  { id: 'sc_ponderosa',name: 'Ponderosa',            address: '', contactName: '', contactEmail: '', programType: ['Soccer'], notes: '', active: true },
  { id: 'sc_cds',      name: 'CDS',                  address: '333 Dolores St, San Francisco, CA 94110', contactName: '', contactEmail: '', programType: ['Basketball'], notes: '', active: true },
];

// ── Coaches ───────────────────────────────────────────────────────────────────

export const coaches: Coach[] = [
  { id: 'co_alex',    name: 'Alex',    email: '', phone: '', sports: ['Basketball', 'Soccer'], availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_andy',    name: 'Andy',    email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_anthony', name: 'Anthony', email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_ashley',  name: 'Ashley',  email: '', phone: '', sports: ['Soccer'],              availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_bryce',   name: 'Bryce',   email: '', phone: '', sports: ['Basketball', 'Soccer'], availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_corey',   name: 'Corey',   email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_devyn',   name: 'Devyn',   email: '', phone: '', sports: ['Soccer'],              availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_diego',   name: 'Diego',   email: '', phone: '', sports: ['Soccer'],              availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_genesis', name: 'Genesis', email: '', phone: '', sports: ['Basketball', 'Soccer'], availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_jessica', name: 'Jessica', email: '', phone: '', sports: ['Cheerleading'],        availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_justin',  name: 'Justin',  email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_kawai',   name: 'Kawai',   email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_peter',   name: 'Peter',   email: '', phone: '', sports: ['Soccer', 'Basketball'], availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_quentin', name: 'Quentin', email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_quique',  name: 'Quique',  email: '', phone: '', sports: ['Soccer', 'Basketball'], availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_sierra',  name: 'Sierra',  email: '', phone: '', sports: ['Soccer'],              availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
  { id: 'co_vlado',   name: 'Vlado',   email: '', phone: '', sports: ['Basketball'],          availability: '', payRate: 20, active: true, inviteStatus: 'Not Invited', passwordSet: false },
];

function coachId(name: string): string | null {
  return coaches.find(c => c.name.toLowerCase() === name.toLowerCase())?.id ?? null;
}

// ── Shifts (Locked-In programs only) ─────────────────────────────────────────

const rawShifts: Shift[] = [
  // MONDAY
  ...expandShifts({ schoolId: 'sc_gissv',    coachId: coachId('Jessica'), sport: 'Cheerleading', dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2027-01-11', startTime: '3:35pm', endTime: '4:35pm', noClass: '10/12, 11/23, 12/21, 12/28', payRate: 45 }),
  ...expandShifts({ schoolId: 'sc_lakeside', coachId: coachId('Genesis'), sport: 'Soccer',     dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2026-12-14', startTime: '2:40pm', endTime: '3:40pm', noClass: '10/12, 11/23', payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_northstar',coachId: coachId('Bryce'),   sport: 'Multi-Sport',dayOfWeek: 'Monday',    startDate: '2026-08-24', endDate: '2026-11-02', startTime: '3:00pm', endTime: '4:00pm', noClass: '9/7, 9/28, 10/12',           payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_whiteoaks',coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2026-11-09', startTime: '2:40pm', endTime: '3:40pm', noClass: '',                            payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_whiteoaks',coachId: coachId('Quique'),  sport: 'Basketball', dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2026-11-09', startTime: '2:40pm', endTime: '3:40pm', noClass: '',                            payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_gabmis',   coachId: null,               sport: 'Basketball', dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2026-11-02', startTime: '2:40pm', endTime: '3:40pm', noClass: '',                            payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_ycis',     coachId: coachId('Justin'),  sport: 'Basketball', dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2027-01-25', startTime: '3:30pm', endTime: '4:30pm', noClass: '11/23, 12/21, 12/28, 1/4, 1/18', payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_ycis',     coachId: null,               sport: 'Basketball', dayOfWeek: 'Monday',    startDate: '2026-09-14', endDate: '2027-01-25', startTime: '3:30pm', endTime: '4:30pm', noClass: '11/23, 12/21, 12/28, 1/4, 1/18', payRate: 60 }),

  // TUESDAY
  ...expandShifts({ schoolId: 'sc_laslom',   coachId: coachId('Corey'),   sport: 'Basketball', dayOfWeek: 'Tuesday',   startDate: '2026-09-01', endDate: '2026-12-01', startTime: '2:25pm', endTime: '3:25pm', noClass: '11/10, 11/24',  payRate: 100 }),
  ...expandShifts({ schoolId: 'sc_laslom',   coachId: coachId('Corey'),   sport: 'Basketball', dayOfWeek: 'Tuesday',   startDate: '2026-09-01', endDate: '2026-12-01', startTime: '3:30pm', endTime: '4:30pm', noClass: '11/10, 11/24',  payRate: 100 }),
  ...expandShifts({ schoolId: 'sc_bowman',   coachId: coachId('Quentin'), sport: 'Basketball', dayOfWeek: 'Tuesday',   startDate: '2026-09-29', endDate: '2026-12-01', startTime: '4:00pm', endTime: '5:00pm', noClass: '',               payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_synapse',  coachId: coachId('Quique'),  sport: 'Basketball', dayOfWeek: 'Tuesday',   startDate: '2026-09-15', endDate: '2026-11-03', startTime: '3:45pm', endTime: '4:45pm', noClass: '',               payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_gabmis',   coachId: null,               sport: 'Soccer',     dayOfWeek: 'Tuesday',   startDate: '2026-09-15', endDate: '2026-11-03', startTime: '2:40pm', endTime: '3:40pm', noClass: '',              payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_svis_c',   coachId: coachId('Alex'),    sport: 'Basketball', dayOfWeek: 'Tuesday',   startDate: '2026-09-15', endDate: '2026-12-01', startTime: '3:00pm', endTime: '4:00pm', noClass: '10/13, 11/24',  payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_svis_c',   coachId: coachId('Sierra'),  sport: 'Soccer',     dayOfWeek: 'Tuesday',   startDate: '2026-09-15', endDate: '2026-12-01', startTime: '3:00pm', endTime: '4:00pm', noClass: '10/13, 11/24',  payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_sanmig',   coachId: coachId('Bryce'),   sport: 'Basketball', dayOfWeek: 'Tuesday',   startDate: '2026-09-22', endDate: '2026-11-17', startTime: '2:20pm', endTime: '3:20pm', noClass: '10/6',           payRate: 80 }),

  // WEDNESDAY
  // Justin does La Scuola back-to-back (2hr total = $140, $70 per shift)
  ...expandShifts({ schoolId: 'sc_lascuola', coachId: coachId('Justin'),  sport: 'Basketball', dayOfWeek: 'Thursday',  startDate: '2026-09-17', endDate: '2026-11-12', startTime: '3:40pm', endTime: '4:40pm', noClass: '',                         payRate: 70 }),
  ...expandShifts({ schoolId: 'sc_lascuola', coachId: coachId('Justin'),  sport: 'Basketball', dayOfWeek: 'Thursday',  startDate: '2026-09-17', endDate: '2026-11-12', startTime: '4:40pm', endTime: '5:40pm', noClass: '',                         payRate: 70 }),
  ...expandShifts({ schoolId: 'sc_bhcs',     coachId: coachId('Andy'),    sport: 'Basketball', dayOfWeek: 'Wednesday', startDate: '2026-09-02', endDate: '2026-12-09', startTime: '1:30pm', endTime: '2:30pm', noClass: '10/7, 11/11, 11/25',      payRate: 100 }),
  ...expandShifts({ schoolId: 'sc_bhcs',     coachId: coachId('Justin'),  sport: 'Basketball', dayOfWeek: 'Wednesday', startDate: '2026-09-02', endDate: '2026-12-09', startTime: '1:30pm', endTime: '2:30pm', noClass: '10/7, 11/11, 11/25',      payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_oakknoll', coachId: coachId('Vlado'),   sport: 'Basketball', dayOfWeek: 'Wednesday', startDate: '2026-09-09', endDate: '2026-12-16', startTime: '3:00pm', endTime: '4:00pm', noClass: '10/14, 11/11, 11/25',     payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_svis_co',  coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Wednesday', startDate: '2026-09-16', endDate: '2026-12-02', startTime: '3:00pm', endTime: '4:00pm', noClass: '10/14, 11/11, 11/25',     payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_svis_co',  coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Wednesday', startDate: '2026-09-16', endDate: '2026-12-02', startTime: '4:00pm', endTime: '5:00pm', noClass: '10/14, 11/11, 11/25',     payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_ycis',     coachId: coachId('Ashley'),  sport: 'Soccer',     dayOfWeek: 'Wednesday', startDate: '2026-09-09', endDate: '2027-01-27', startTime: '3:30pm', endTime: '4:30pm', noClass: '9/30, 11/25, 12/23, 12/30', payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_ycis',     coachId: coachId('Genesis'), sport: 'Soccer',     dayOfWeek: 'Wednesday', startDate: '2026-09-09', endDate: '2027-01-27', startTime: '3:30pm', endTime: '4:30pm', noClass: '9/30, 11/25, 12/23, 12/30', payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_bentley',  coachId: coachId('Corey'),   sport: 'Multi-Sport',dayOfWeek: 'Wednesday', startDate: '2026-09-02', endDate: '2026-12-02', startTime: '3:30pm', endTime: '4:30pm', noClass: '',                          payRate: 100 }),
  ...expandShifts({ schoolId: 'sc_addison',  coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Wednesday', startDate: '2026-09-09', endDate: '2026-12-09', startTime: '1:30pm', endTime: '2:30pm', noClass: '11/25',                     payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_addison',  coachId: coachId('Quique'),  sport: 'Soccer',     dayOfWeek: 'Wednesday', startDate: '2026-09-09', endDate: '2026-12-09', startTime: '1:30pm', endTime: '2:30pm', noClass: '11/25',                     payRate: 60 }),
  ...expandShifts({ schoolId: 'sc_laent',    coachId: coachId('Bryce'),   sport: 'Basketball', dayOfWeek: 'Wednesday', startDate: '2026-09-02', endDate: '2026-12-02', startTime: '2:30pm', endTime: '3:30pm', noClass: '11/11, 11/25',              payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_laent',    coachId: coachId('Bryce'),   sport: 'Basketball', dayOfWeek: 'Wednesday', startDate: '2026-09-02', endDate: '2026-12-02', startTime: '2:55pm', endTime: '3:55pm', noClass: '11/11, 11/25',              payRate: 80 }),

  // THURSDAY
  ...expandShifts({ schoolId: 'sc_laslom',   coachId: coachId('Jessica'), sport: 'Cheerleading', dayOfWeek: 'Thursday',  startDate: '2026-09-03', endDate: '2026-12-03', startTime: '3:30pm', endTime: '4:30pm', noClass: '11/12, 11/26', payRate: 45 }),
  ...expandShifts({ schoolId: 'sc_pbs',      coachId: coachId('Corey'),   sport: 'Basketball', dayOfWeek: 'Thursday',  startDate: '2026-09-03', endDate: '2026-11-19', startTime: '3:30pm', endTime: '4:30pm', noClass: '',              payRate: 100 }),
  ...expandShifts({ schoolId: 'sc_cds',      coachId: null,               sport: 'Basketball', dayOfWeek: 'Thursday',  startDate: '2026-09-17', endDate: '2026-12-09', startTime: '4:00pm', endTime: '5:00pm', noClass: '11/12, 11/26' }),
  ...expandShifts({ schoolId: 'sc_whiteoaks',coachId: coachId('Alex'),    sport: 'Basketball', dayOfWeek: 'Thursday',  startDate: '2026-09-10', endDate: '2026-10-29', startTime: '2:40pm', endTime: '3:40pm', noClass: '',              payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_ponderosa',coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Thursday',  startDate: '2026-09-17', endDate: '2026-11-05', startTime: '2:00pm', endTime: '3:40pm', noClass: '',              payRate: 54 }), // $90 flat (1h40m × $54/hr)

  // FRIDAY
  ...expandShifts({ schoolId: 'sc_bhcs',     coachId: coachId('Alex'),    sport: 'Basketball', dayOfWeek: 'Friday',    startDate: '2026-08-28', endDate: '2026-12-11', startTime: '5:15pm', endTime: '6:15pm', noClass: '9/11, 10/9, 10/30, 11/27', payRate: 75 }),
  ...expandShifts({ schoolId: 'sc_bhcs',     coachId: coachId('Quique'),  sport: 'Basketball', dayOfWeek: 'Friday',    startDate: '2026-08-28', endDate: '2026-12-11', startTime: '5:15pm', endTime: '6:15pm', noClass: '9/11, 10/9, 10/30, 11/27', payRate: 50 }),
  ...expandShifts({ schoolId: 'sc_lascuola', coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Friday',    startDate: '2026-09-11', endDate: '2026-11-13', startTime: '3:40pm', endTime: '4:40pm', noClass: '10/9, 10/16',              payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_lascuola', coachId: coachId('Peter'),   sport: 'Soccer',     dayOfWeek: 'Friday',    startDate: '2026-09-11', endDate: '2026-11-13', startTime: '4:40pm', endTime: '5:40pm', noClass: '10/9, 10/16',              payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_svis_co',  coachId: coachId('Bryce'),   sport: 'Basketball', dayOfWeek: 'Friday',    startDate: '2026-09-18', endDate: '2026-11-20', startTime: '3:00pm', endTime: '4:00pm', noClass: '10/16',                    payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_svis_co',  coachId: coachId('Bryce'),   sport: 'Basketball', dayOfWeek: 'Friday',    startDate: '2026-09-18', endDate: '2026-11-20', startTime: '4:00pm', endTime: '5:00pm', noClass: '10/16',                    payRate: 80 }),
  ...expandShifts({ schoolId: 'sc_synapse',  coachId: coachId('Jessica'), sport: 'Cheerleading', dayOfWeek: 'Friday',    startDate: '2026-09-18', endDate: '2026-12-18', startTime: '2:45pm', endTime: '3:45pm', noClass: '10/13',                    payRate: 45 }),
];

export const shifts: Shift[] = rawShifts;
export const availabilities = [];

// ── No-class dates per school (for display in schedule) ───────────────────────

export interface NoClassDate {
  date: string;   // ISO YYYY-MM-DD
  schoolId: string;
}

export const noClassDates: NoClassDate[] = [
  // GISSV – Mon Cheer
  ...parseNoDates('10/12, 11/23, 12/21, 12/28').map(date => ({ date, schoolId: 'sc_gissv' })),
  // Lakeside – Mon Soccer
  ...parseNoDates('10/12, 11/23').map(date => ({ date, schoolId: 'sc_lakeside' })),
  // North Star – Mon Run Club
  ...parseNoDates('9/7, 9/28, 10/12').map(date => ({ date, schoolId: 'sc_northstar' })),
  // YCIS – Mon Basketball
  ...parseNoDates('11/23, 12/21, 12/28, 1/4, 1/18').map(date => ({ date, schoolId: 'sc_ycis' })),
  // Las Lomitas – Tue Basketball
  ...parseNoDates('11/10, 11/24').map(date => ({ date, schoolId: 'sc_laslom' })),
  // SVIS Clarke – Tue Basketball
  ...parseNoDates('10/13, 11/24').map(date => ({ date, schoolId: 'sc_svis_c' })),
  // San Miguel – Tue Basketball
  ...parseNoDates('10/6').map(date => ({ date, schoolId: 'sc_sanmig' })),
  // BHCS – Wed Tennis
  ...parseNoDates('10/7, 11/11, 11/25').map(date => ({ date, schoolId: 'sc_bhcs' })),
  // Oak Knoll – Wed Basketball
  ...parseNoDates('10/14, 11/11, 11/25').map(date => ({ date, schoolId: 'sc_oakknoll' })),
  // SVIS Cohn – Wed Soccer
  ...parseNoDates('10/14, 11/11, 11/25').map(date => ({ date, schoolId: 'sc_svis_co' })),
  // YCIS – Wed Soccer
  ...parseNoDates('9/30, 11/25, 12/23, 12/30').map(date => ({ date, schoolId: 'sc_ycis' })),
  // Addison – Wed Soccer
  ...parseNoDates('11/25').map(date => ({ date, schoolId: 'sc_addison' })),
  // La Entrada – Wed Basketball
  ...parseNoDates('11/11, 11/25').map(date => ({ date, schoolId: 'sc_laent' })),
  // Las Lomitas – Thu Cheer
  ...parseNoDates('11/12, 11/26').map(date => ({ date, schoolId: 'sc_laslom' })),
  // CDS – Thu Basketball
  ...parseNoDates('11/12, 11/26').map(date => ({ date, schoolId: 'sc_cds' })),
  // BHCS – Fri Basketball
  ...parseNoDates('9/11, 10/9, 10/30, 11/27').map(date => ({ date, schoolId: 'sc_bhcs' })),
  // La Scuola – Fri Soccer
  ...parseNoDates('10/9, 10/16').map(date => ({ date, schoolId: 'sc_lascuola' })),
  // SVIS Cohn – Fri Basketball
  ...parseNoDates('10/16').map(date => ({ date, schoolId: 'sc_svis_co' })),
  // Synapse – Fri Cheer
  ...parseNoDates('10/13').map(date => ({ date, schoolId: 'sc_synapse' })),
];
