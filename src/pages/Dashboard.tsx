import { CalendarDays, Clock, Users, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import type { AppContext } from '../App';
import { calcHours, formatTime, SPORT_COLORS, STATUS_COLORS, toISODate } from '../utils';
import { checkShiftConflicts } from '../utils/conflicts';
import clsx from 'clsx';

type CoverageReason = 'Unassigned' | 'Issue Reported' | 'Needs Coverage' | 'Inactive Coach' | 'Sport Mismatch' | 'Unavailable' | 'Tentative';

interface CoverageItem {
  shiftId: string;
  school: string;
  sport: string;
  date: string;
  time: string;
  coachName: string | null;
  reasons: CoverageReason[];
}

const REASON_STYLES: Record<CoverageReason, string> = {
  'Unassigned':     'bg-red-100 text-red-700',
  'Issue Reported': 'bg-orange-100 text-orange-700',
  'Needs Coverage': 'bg-red-100 text-red-700',
  'Inactive Coach': 'bg-slate-100 text-slate-600',
  'Sport Mismatch': 'bg-purple-100 text-purple-700',
  'Unavailable':    'bg-red-100 text-red-700',
  'Tentative':      'bg-amber-100 text-amber-700',
};

export default function Dashboard() {
  const { shifts, coaches, schools, availability } = useOutletContext<AppContext>();

  const today = toISODate(new Date());
  const todayShifts = shifts.filter(s => s.date === today);
  const weekShifts = shifts.filter(s => s.status !== 'Cancelled');
  const scheduledCoachIds = new Set(shifts.filter(s => s.coachId).map(s => s.coachId));
  const totalHours = weekShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);

  const getCoach = (id: string | null) => coaches.find(c => c.id === id);
  const getSchool = (id: string) => schools.find(s => s.id === id);

  // Build Needs Coverage list
  const coverageItems: CoverageItem[] = [];
  for (const shift of weekShifts) {
    const reasons: CoverageReason[] = [];
    const coach = shift.coachId ? getCoach(shift.coachId) : null;

    if (!shift.coachId) {
      reasons.push('Unassigned');
    } else {
      if (shift.status === 'Issue Reported') reasons.push('Issue Reported');
      if (shift.status === 'Needs Coverage') reasons.push('Needs Coverage');
      if (coach && !coach.active) reasons.push('Inactive Coach');
      if (coach && !coach.sports.includes(shift.sport)) reasons.push('Sport Mismatch');

      const conflicts = checkShiftConflicts(shift, coaches, shifts, availability);
      if (conflicts.some(c => c.type === 'unavailable')) reasons.push('Unavailable');
      else if (conflicts.some(c => c.type === 'tentative')) reasons.push('Tentative');
    }

    if (reasons.length === 0) continue;

    const school = getSchool(shift.schoolId);
    const dateLabel = new Date(shift.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    coverageItems.push({
      shiftId: shift.id,
      school: school?.name ?? '—',
      sport: shift.sport,
      date: dateLabel,
      time: `${formatTime(shift.startTime)} – ${formatTime(shift.endTime)}`,
      coachName: coach?.name ?? null,
      reasons,
    });
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Week overview · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Scheduled Shifts"  value={weekShifts.length}            icon={CalendarDays}    color="red"    sub="This week" />
          <StatCard label="Labor Hours"        value={totalHours.toFixed(1)}        icon={Clock}           color="green"  sub="This week" />
          <StatCard label="Coaches Scheduled" value={scheduledCoachIds.size}        icon={Users}           color="orange" sub={`of ${coaches.filter(c => c.active).length} active`} />
          <StatCard label="Needs Attention"   value={coverageItems.length}          icon={AlertTriangle}   color="red"    sub="Conflicts & coverage" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Today's shifts */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Today's Shifts</h2>
              <span className="text-sm text-slate-500">{todayShifts.length} shifts</span>
            </div>
            <div className="divide-y divide-slate-50">
              {todayShifts.length === 0 ? (
                <p className="px-5 py-8 text-center text-slate-400 text-sm">No shifts scheduled today</p>
              ) : (
                todayShifts.map(shift => {
                  const school = getSchool(shift.schoolId);
                  const coach = getCoach(shift.coachId);
                  const colors = SPORT_COLORS[shift.sport];
                  return (
                    <div key={shift.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-2 h-10 rounded-full ${colors.bg.replace('-100', '-400')}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{school?.name} · {shift.sport}</p>
                        <p className="text-xs text-slate-500">{formatTime(shift.startTime)} – {formatTime(shift.endTime)}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                        {shift.sport}
                      </span>
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm font-medium text-slate-900">
                          {coach?.name ?? <span className="text-red-700">Unassigned</span>}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[shift.status]}`}>
                          {shift.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Needs Attention panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-red-100 shadow-sm">
              <div className="px-5 py-4 border-b border-red-50">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-700" />
                  Needs Attention
                  {coverageItems.length > 0 && (
                    <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      {coverageItems.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
                {coverageItems.length === 0 ? (
                  <p className="px-5 py-6 text-center text-slate-400 text-sm">All shifts covered ✓</p>
                ) : (
                  coverageItems.map((item, i) => (
                    <div key={`${item.shiftId}-${i}`} className="px-4 py-3 hover:bg-red-50/40 transition-colors">
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.school} · {item.sport}
                          </p>
                          <p className="text-xs text-slate-500">{item.date} · {item.time}</p>
                          {item.coachName && (
                            <p className="text-xs text-slate-500">{item.coachName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.reasons.map(r => (
                          <span key={r} className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', REASON_STYLES[r])}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active coaches */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Active Coaches</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {coaches.filter(c => c.active).slice(0, 5).map(coach => (
                  <div key={coach.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-800 font-semibold text-sm">
                      {coach.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{coach.name}</p>
                      <p className="text-xs text-slate-500">{coach.sports.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
