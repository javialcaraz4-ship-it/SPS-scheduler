import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import Header from '../components/layout/Header';
import type { AppContext } from '../App';
import { calcHours, formatTime, SPORT_COLORS } from '../utils';
import clsx from 'clsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Reports() {
  const { shifts, coaches, schools } = useOutletContext<AppContext>();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  const monthShifts = shifts.filter(s => {
    if (s.status === 'Cancelled') return false;
    const d = new Date(s.date + 'T12:00:00');
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const hoursByCoach = coaches
    .filter(c => c.active)
    .map(coach => {
      const cs = monthShifts.filter(s => s.coachId === coach.id);
      const confirmed = cs.filter(s => s.status === 'Confirmed' || s.status === 'Completed').length;
      const issues = cs.filter(s => s.status === 'Issue Reported' || s.status === 'Needs Coverage').length;
      const hours = cs.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
      const pay = cs.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime) * s.payRate, 0);
      return { coach, total: cs.length, confirmed, issues, hours, pay };
    })
    .filter(r => r.total > 0)
    .sort((a, b) => b.hours - a.hours);

  const shiftsBySchool = schools
    .filter(s => s.active)
    .map(school => {
      const ss = monthShifts.filter(s => s.schoolId === school.id);
      const hours = ss.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
      return { school, shifts: ss.length, hours };
    })
    .filter(r => r.shifts > 0)
    .sort((a, b) => b.shifts - a.shifts);

  const sportNames = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'] as const;
  const shiftsBySport = sportNames.map(sport => {
    const ss = monthShifts.filter(s => s.sport === sport);
    const hours = ss.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
    return { sport, shifts: ss.length, hours };
  }).filter(r => r.shifts > 0);

  const totalHours     = monthShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
  const totalPay       = monthShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime) * s.payRate, 0);
  const totalConfirmed = monthShifts.filter(s => s.status === 'Confirmed' || s.status === 'Completed').length;
  const totalIssues    = monthShifts.filter(s => s.status === 'Issue Reported' || s.status === 'Needs Coverage').length;

  const exportSummaryCSV = () => {
    const rows = [
      [`Monthly Payroll Summary — ${monthLabel}`],
      [],
      ['Coach', 'Total Shifts', 'Confirmed', 'Issues', 'Total Hours', 'Pay Rate', 'Est. Pay'],
      ...hoursByCoach.map(r => [
        r.coach.name,
        r.total,
        r.confirmed,
        r.issues,
        r.hours.toFixed(1),
        `$${r.coach.payRate}/hr`,
        `$${r.pay.toFixed(2)}`,
      ]),
      [],
      ['Totals', hoursByCoach.reduce((s, r) => s + r.total, 0), totalConfirmed, totalIssues, totalHours.toFixed(1), '', `$${totalPay.toFixed(2)}`],
    ];
    downloadCSV(rows, `sps-payroll-${selectedYear}-${pad(selectedMonth + 1)}-summary.csv`);
  };

  const exportDailyCSV = () => {
    const sorted = [...monthShifts].sort((a, b) =>
      a.date.localeCompare(b.date) ||
      (coaches.find(c => c.id === a.coachId)?.name ?? '').localeCompare(
        coaches.find(c => c.id === b.coachId)?.name ?? '',
      ),
    );
    const rows = [
      [`Daily Breakdown — ${monthLabel}`],
      [],
      ['Coach', 'Date', 'Day', 'School', 'Sport', 'Start', 'End', 'Hours', 'Rate', 'Pay'],
      ...sorted.map(s => {
        const coach = coaches.find(c => c.id === s.coachId);
        const school = schools.find(sc => sc.id === s.schoolId);
        const hours = calcHours(s.startTime, s.endTime);
        const day = new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
        return [
          coach?.name ?? 'Unassigned',
          s.date,
          day,
          school?.name ?? '—',
          s.sport,
          formatTime(s.startTime),
          formatTime(s.endTime),
          hours.toFixed(2),
          `$${s.payRate}/hr`,
          `$${(hours * s.payRate).toFixed(2)}`,
        ];
      }),
    ];
    downloadCSV(rows, `sps-payroll-${selectedYear}-${pad(selectedMonth + 1)}-daily.csv`);
  };

  return (
    <div>
      <Header
        title="Reports"
        subtitle={`${monthShifts.length} shifts · ${totalHours.toFixed(1)}h · $${totalPay.toFixed(0)} labor — ${monthLabel}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month / Year picker */}
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={exportSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download size={14} /> Export Summary
            </button>
            <button
              onClick={exportDailyCSV}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FileText size={14} /> Export Daily
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Shifts',  value: monthShifts.length,           sub: monthLabel },
            { label: 'Confirmed',     value: totalConfirmed,               sub: 'Confirmed + Completed' },
            { label: 'Total Hours',   value: `${totalHours.toFixed(1)}h`,  sub: 'Scheduled labor' },
            { label: 'Est. Payroll',  value: `$${totalPay.toFixed(0)}`,    sub: 'Before taxes' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Coach payroll table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Monthly Payroll Summary</h2>
            <span className="text-sm text-slate-400">{monthLabel}</span>
          </div>
          {hoursByCoach.length === 0 ? (
            <p className="px-5 py-8 text-center text-slate-400 text-sm">No shifts in {monthLabel}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Coach', 'Shifts', 'Confirmed', 'Issues', 'Total Hours', 'Pay Rate', 'Est. Pay'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hoursByCoach.map(({ coach, total, confirmed, issues, hours, pay }) => (
                  <tr key={coach.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-800 font-bold text-xs">
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-900">{coach.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{total}</td>
                    <td className="px-5 py-3"><span className="text-green-700 font-medium">{confirmed}</span></td>
                    <td className="px-5 py-3">
                      {issues > 0
                        ? <span className="text-red-600 font-medium">{issues}</span>
                        : <span className="text-slate-400">0</span>}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{hours.toFixed(1)}h</td>
                    <td className="px-5 py-3 text-slate-500">${coach.payRate}/hr</td>
                    <td className="px-5 py-3 font-semibold text-green-700">${pay.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-5 py-3 font-semibold text-slate-900">Total</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{hoursByCoach.reduce((s, r) => s + r.total, 0)}</td>
                  <td className="px-5 py-3 font-semibold text-green-700">{totalConfirmed}</td>
                  <td className="px-5 py-3 font-semibold text-red-600">{totalIssues > 0 ? totalIssues : <span className="text-slate-400">0</span>}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">{totalHours.toFixed(1)}h</td>
                  <td />
                  <td className="px-5 py-3 font-bold text-green-700">${totalPay.toFixed(0)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* By school */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Shifts by School</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['School', 'Shifts', 'Hours'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {shiftsBySchool.length === 0
                  ? <tr><td colSpan={3} className="px-5 py-6 text-center text-slate-400 text-sm">No data</td></tr>
                  : shiftsBySchool.map(({ school, shifts: sc, hours }) => (
                    <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900">{school.name}</td>
                      <td className="px-5 py-3 text-slate-700">{sc}</td>
                      <td className="px-5 py-3 text-slate-700">{hours.toFixed(1)}h</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* By sport */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Shifts by Sport</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Sport', 'Shifts', 'Hours'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {shiftsBySport.length === 0
                  ? <tr><td colSpan={3} className="px-5 py-6 text-center text-slate-400 text-sm">No data</td></tr>
                  : shiftsBySport.map(({ sport, shifts: sc, hours }) => {
                    const c = SPORT_COLORS[sport];
                    return (
                      <tr key={sport} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', c.bg, c.text)}>{sport}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-700">{sc}</td>
                        <td className="px-5 py-3 text-slate-700">{hours.toFixed(1)}h</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function downloadCSV(rows: (string | number)[][], filename: string) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
