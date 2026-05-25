import type { Coach, School, Shift, CoachAvailability } from '../types';

export const coaches: Coach[] = [
  {
    id: 'c1',
    name: 'Alex Rivera',
    email: 'alex@stanfordparksports.com',
    phone: '6505550101',
    sports: ['Soccer', 'Multi-Sport'],
    availability: 'Mon-Fri 2pm-6pm',
    payRate: 22,
    active: true,
    inviteStatus: 'Invited',
    passwordSet: false,
  },
  {
    id: 'c2',
    name: 'Jordan Kim',
    email: 'jordan@stanfordparksports.com',
    phone: '6505550102',
    sports: ['Basketball', 'Volleyball'],
    availability: 'Mon-Fri 2pm-7pm',
    payRate: 20,
    active: true,
    inviteStatus: 'Not Invited',
    passwordSet: false,
  },
  {
    id: 'c3',
    name: 'Sam Torres',
    email: 'sam@stanfordparksports.com',
    phone: '6505550103',
    sports: ['Soccer', 'Basketball', 'Multi-Sport'],
    availability: 'Tue-Sat 1pm-6pm',
    payRate: 21,
    active: true,
    inviteStatus: 'Not Invited',
    passwordSet: false,
  },
  {
    id: 'c4',
    name: 'Morgan Lee',
    email: 'morgan@stanfordparksports.com',
    phone: '6505550104',
    sports: ['Volleyball', 'Multi-Sport'],
    availability: 'Mon-Thu 2pm-6pm',
    payRate: 20,
    active: true,
    inviteStatus: 'Active',
    passwordSet: true,
    password: 'coach123',
  },
  {
    id: 'c5',
    name: 'Casey Nguyen',
    email: 'casey@stanfordparksports.com',
    phone: '6505550105',
    sports: ['Soccer', 'Camp'],
    availability: 'Mon-Fri 1pm-7pm',
    payRate: 19,
    active: true,
    inviteStatus: 'Not Invited',
    passwordSet: false,
  },
  {
    id: 'c6',
    name: 'Taylor Brooks',
    email: 'taylor@stanfordparksports.com',
    phone: '6505550106',
    sports: ['Basketball', 'Camp', 'Multi-Sport'],
    availability: 'Wed-Sat 2pm-6pm',
    payRate: 20,
    active: false,
    inviteStatus: 'Not Invited',
    passwordSet: false,
  },
  // ── Demo login coach ─────────────────────────────────────────────────────────
  // MOCK ONLY — real passwords must never be stored in plaintext
  {
    id: 'coach_5',
    name: 'Peter Ropek',
    email: '',
    phone: '699902076',
    sports: ['Soccer'],
    availability: 'Mon-Fri 2pm-6pm',
    payRate: 20,
    active: true,
    inviteStatus: 'Active',
    passwordSet: true,
    password: 'password123',
  },
];

export const schools: School[] = [
  {
    id: 's1',
    name: 'White Oaks',
    address: '1601 Whiteoaks Ave, San Carlos, CA 94070',
    contactName: 'Linda Park',
    contactEmail: 'lpark@whiteoaks.edu',
    phone: '6505550201',
    programType: ['Soccer', 'Basketball'],
    notes: 'Side entrance on Elm St. Park in lot B.',
    fieldLocation: 'Blacktop behind main building',
    coachInstructions: 'Check in at front office. Bring pinnies and cones.',
    parkingNotes: 'Lot B on Elm St side',
    active: true,
  },
  {
    id: 's2',
    name: 'Selby Lane',
    address: '170 Selby Ln, Atherton, CA 94027',
    contactName: 'Tom Hewitt',
    contactEmail: 'thewitt@selby.edu',
    phone: '6505550202',
    programType: ['Soccer', 'Multi-Sport'],
    notes: 'Check in at front office.',
    fieldLocation: 'Upper field near back gate',
    coachInstructions: 'Check in at front office before program. Gates close at 6 PM.',
    parkingNotes: 'Street parking on Selby Ln',
    active: true,
  },
  {
    id: 's3',
    name: 'Addison',
    address: '650 Addison Ave, Palo Alto, CA 94301',
    contactName: 'Maria Gonzalez',
    contactEmail: 'mgonzalez@addison.edu',
    programType: ['Volleyball', 'Basketball'],
    notes: 'Gym is building C, use back door.',
    fieldLocation: 'Gym — Building C, back entrance',
    coachInstructions: 'Use back door of Building C. Net is set up by custodian at 2:30 PM.',
    parkingNotes: 'Visitor lot near main office',
    active: true,
  },
  {
    id: 's4',
    name: 'Lakeside',
    address: '2500 Lakeside Dr, Menlo Park, CA 94025',
    contactName: 'Kevin Tanaka',
    contactEmail: 'ktanaka@lakeside.edu',
    programType: ['Soccer', 'Camp'],
    notes: 'Meet at the soccer field near the east gate.',
    fieldLocation: 'Soccer field near east gate',
    coachInstructions: 'Meet students at east gate at program start time.',
    parkingNotes: 'Lot C near east gate',
    active: true,
  },
  {
    id: 's5',
    name: 'La Entrada',
    address: '2200 Sharon Rd, Menlo Park, CA 94025',
    contactName: 'Susan Choi',
    contactEmail: 'schoi@laentrada.edu',
    programType: ['Multi-Sport'],
    notes: 'After-school pickup area shared with program space.',
    fieldLocation: 'Multipurpose room / outdoor blacktop',
    coachInstructions: 'Coordinate with after-school supervisor for space use.',
    parkingNotes: 'Shared lot — arrive 10 min early',
    active: true,
  },
  {
    id: 's6',
    name: 'St. Simon',
    address: '1100 Glenwood Ave, Menlo Park, CA 94025',
    contactName: "Fr. Patrick O'Brien",
    contactEmail: 'admin@stsimon.edu',
    programType: ['Soccer', 'Basketball'],
    notes: 'Private school — sign in at security desk.',
    fieldLocation: 'Lower field behind chapel',
    coachInstructions: 'Sign in at security desk. Wear SPS shirt. No food/drink on field.',
    parkingNotes: 'Visitor spaces in front lot',
    active: true,
  },
  {
    id: 's7',
    name: 'Gabriela Mistral',
    address: '750 N California Ave, East Palo Alto, CA 94303',
    contactName: 'Rosa Fuentes',
    contactEmail: 'rfuentes@gm.edu',
    programType: ['Soccer', 'Multi-Sport'],
    notes: 'Program runs in courtyard if weather allows.',
    fieldLocation: 'Courtyard (weather permitting) or gym',
    coachInstructions: 'Check weather — move to gym if needed. Coordinator is Rosa.',
    parkingNotes: 'Street parking on California Ave',
    active: true,
  },
  {
    id: 's8',
    name: 'Oak Hills',
    address: '400 Eucalyptus Ave, Hillsborough, CA 94010',
    contactName: 'David Wu',
    contactEmail: 'dwu@oakhills.edu',
    programType: ['Camp', 'Multi-Sport'],
    notes: 'Parking is limited — carpool if possible.',
    fieldLocation: 'Main athletic field (behind gym)',
    coachInstructions: 'Full day camps — bring lunch. Set up by 8:45 AM.',
    parkingNotes: 'Limited — carpool or park on Eucalyptus Ave',
    active: true,
  },
];

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

const week = getWeekDates();
const [mon, tue, wed, thu, fri, sat] = week;

export const shifts: Shift[] = [
  // Monday
  { id: 'sh1',  schoolId: 's1', coachId: 'c1',      sport: 'Soccer',      date: mon, startTime: '14:40', endTime: '15:40', status: 'Confirmed',      payRate: 22, notes: '' },
  { id: 'sh2',  schoolId: 's2', coachId: 'c3',      sport: 'Soccer',      date: mon, startTime: '14:30', endTime: '15:30', status: 'Scheduled',      payRate: 21, notes: 'Bring cones' },
  { id: 'sh3',  schoolId: 's3', coachId: 'c2',      sport: 'Basketball',  date: mon, startTime: '15:00', endTime: '16:00', status: 'Scheduled',      payRate: 20, notes: '' },
  { id: 'sh4',  schoolId: 's6', coachId: null,      sport: 'Multi-Sport', date: mon, startTime: '14:45', endTime: '15:45', status: 'Needs Coverage', payRate: 20, notes: 'Need sub' },

  // Tuesday
  { id: 'sh5',  schoolId: 's4', coachId: 'c5',      sport: 'Soccer',      date: tue, startTime: '14:30', endTime: '15:30', status: 'Scheduled',      payRate: 19, notes: '' },
  { id: 'sh6',  schoolId: 's5', coachId: 'c4',      sport: 'Multi-Sport', date: tue, startTime: '14:45', endTime: '15:45', status: 'Confirmed',      payRate: 20, notes: '' },
  { id: 'sh7',  schoolId: 's7', coachId: 'c3',      sport: 'Soccer',      date: tue, startTime: '15:00', endTime: '16:00', status: 'Scheduled',      payRate: 21, notes: '' },
  { id: 'sh8',  schoolId: 's1', coachId: 'c1',      sport: 'Soccer',      date: tue, startTime: '14:40', endTime: '15:40', status: 'Scheduled',      payRate: 22, notes: '' },

  // Wednesday
  { id: 'sh9',  schoolId: 's3', coachId: 'c2',      sport: 'Volleyball',  date: wed, startTime: '15:00', endTime: '16:30', status: 'Scheduled',      payRate: 20, notes: 'Gym C' },
  { id: 'sh10', schoolId: 's8', coachId: 'c5',      sport: 'Camp',        date: wed, startTime: '14:00', endTime: '17:00', status: 'Confirmed',      payRate: 19, notes: 'Full camp day' },
  { id: 'sh11', schoolId: 's2', coachId: 'c1',      sport: 'Soccer',      date: wed, startTime: '14:30', endTime: '15:30', status: 'Scheduled',      payRate: 22, notes: '' },
  { id: 'sh12', schoolId: 's6', coachId: 'c3',      sport: 'Basketball',  date: wed, startTime: '15:00', endTime: '16:00', status: 'Scheduled',      payRate: 21, notes: '' },

  // Thursday
  { id: 'sh13', schoolId: 's4', coachId: 'c5',      sport: 'Soccer',      date: thu, startTime: '14:30', endTime: '15:30', status: 'Scheduled',      payRate: 19, notes: '' },
  { id: 'sh14', schoolId: 's5', coachId: 'c4',      sport: 'Multi-Sport', date: thu, startTime: '14:45', endTime: '15:45', status: 'Scheduled',      payRate: 20, notes: '' },
  { id: 'sh15', schoolId: 's7', coachId: null,      sport: 'Soccer',      date: thu, startTime: '15:00', endTime: '16:00', status: 'Needs Coverage', payRate: 21, notes: 'Coach called out' },
  { id: 'sh16', schoolId: 's1', coachId: 'c2',      sport: 'Basketball',  date: thu, startTime: '14:40', endTime: '15:40', status: 'Confirmed',      payRate: 20, notes: '' },

  // Friday
  { id: 'sh17', schoolId: 's8', coachId: 'c5',      sport: 'Camp',        date: fri, startTime: '13:00', endTime: '17:00', status: 'Scheduled',      payRate: 19, notes: 'Fun Friday' },
  { id: 'sh18', schoolId: 's3', coachId: 'c4',      sport: 'Volleyball',  date: fri, startTime: '15:00', endTime: '16:00', status: 'Scheduled',      payRate: 20, notes: '' },
  { id: 'sh19', schoolId: 's2', coachId: 'c1',      sport: 'Soccer',      date: fri, startTime: '14:30', endTime: '15:30', status: 'Completed',      payRate: 22, notes: '' },
  { id: 'sh20', schoolId: 's6', coachId: 'c3',      sport: 'Multi-Sport', date: fri, startTime: '14:45', endTime: '15:45', status: 'Completed',      payRate: 21, notes: '' },

  // Saturday
  { id: 'sh21', schoolId: 's8', coachId: 'c3',      sport: 'Camp',        date: sat, startTime: '09:00', endTime: '13:00', status: 'Scheduled',      payRate: 21, notes: 'Weekend camp' },
  { id: 'sh22', schoolId: 's4', coachId: 'c1',      sport: 'Soccer',      date: sat, startTime: '10:00', endTime: '11:30', status: 'Confirmed',      payRate: 22, notes: '' },

  // Peter Ropek (coach_5) shifts
  { id: 'sh23', schoolId: 's1', coachId: 'coach_5', sport: 'Soccer',      date: mon, startTime: '15:00', endTime: '16:00', status: 'Scheduled',      payRate: 20, notes: 'Bring pinnies' },
  { id: 'sh24', schoolId: 's7', coachId: 'coach_5', sport: 'Soccer',      date: wed, startTime: '14:30', endTime: '15:30', status: 'Confirmed',      payRate: 20, notes: '' },
  { id: 'sh25', schoolId: 's2', coachId: 'coach_5', sport: 'Soccer',      date: fri, startTime: '15:00', endTime: '16:00', status: 'Scheduled',      payRate: 20, notes: 'End-of-week session' },
];

// ── Availability mock data ────────────────────────────────────────────────────
// dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

export const availabilities: CoachAvailability[] = [
  // Alex Rivera (c1) — available Mon-Fri 2-6 PM
  { id: 'av1',  coachId: 'c1',      type: 'default', dayOfWeek: 1, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av2',  coachId: 'c1',      type: 'default', dayOfWeek: 2, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av3',  coachId: 'c1',      type: 'default', dayOfWeek: 3, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av4',  coachId: 'c1',      type: 'default', dayOfWeek: 4, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av5',  coachId: 'c1',      type: 'default', dayOfWeek: 5, startTime: '14:00', endTime: '18:00', status: 'available' },

  // Jordan Kim (c2) — unavailable Wed, preferred Tue/Thu
  { id: 'av6',  coachId: 'c2',      type: 'default', dayOfWeek: 1, startTime: '14:00', endTime: '19:00', status: 'available' },
  { id: 'av7',  coachId: 'c2',      type: 'default', dayOfWeek: 2, startTime: '14:00', endTime: '19:00', status: 'preferred' },
  { id: 'av8',  coachId: 'c2',      type: 'default', dayOfWeek: 3, startTime: '14:00', endTime: '19:00', status: 'unavailable', note: 'Standing obligation' },
  { id: 'av9',  coachId: 'c2',      type: 'default', dayOfWeek: 4, startTime: '14:00', endTime: '19:00', status: 'preferred' },
  { id: 'av10', coachId: 'c2',      type: 'default', dayOfWeek: 5, startTime: '14:00', endTime: '17:00', status: 'available' },

  // Sam Torres (c3) — tentative Fridays
  { id: 'av11', coachId: 'c3',      type: 'default', dayOfWeek: 1, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av12', coachId: 'c3',      type: 'default', dayOfWeek: 2, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av13', coachId: 'c3',      type: 'default', dayOfWeek: 3, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av14', coachId: 'c3',      type: 'default', dayOfWeek: 4, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av15', coachId: 'c3',      type: 'default', dayOfWeek: 5, startTime: '14:00', endTime: '18:00', status: 'tentative', note: 'Family commitment — can usually make it' },

  // Peter Ropek (coach_5)
  { id: 'av16', coachId: 'coach_5', type: 'default', dayOfWeek: 1, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av17', coachId: 'coach_5', type: 'default', dayOfWeek: 2, startTime: '14:00', endTime: '18:00', status: 'unavailable', note: 'Class until 6 PM' },
  { id: 'av18', coachId: 'coach_5', type: 'default', dayOfWeek: 3, startTime: '14:00', endTime: '18:00', status: 'available' },
  { id: 'av19', coachId: 'coach_5', type: 'default', dayOfWeek: 4, startTime: '14:00', endTime: '18:00', status: 'tentative', note: 'Can work if needed' },
  { id: 'av20', coachId: 'coach_5', type: 'default', dayOfWeek: 5, startTime: '14:00', endTime: '17:00', status: 'available' },
];
