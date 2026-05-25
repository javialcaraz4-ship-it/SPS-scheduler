import { useOutletContext } from 'react-router-dom';
import { Download } from 'lucide-react';
import Header from '../components/layout/Header';
import type { AppContext } from '../App';
import { calcHours, SPORT_COLORS } from '../utils';
import clsx from 'clsx';

export default function Reports() {
  const { shifts, coaches, schools } = useOutletContext<AppContext>();

  const hoursByCoach = coaches
    .filter(c => c.active)
    .map(coach => {
      const coachShifts = shifts.filter(s => s.coachId === coach.id && s.status !== 'Cancelled');
      const confirmed = coachShifts.filter(s => s.status === 'Confirmed' || s.status === 'Completed').length;
      const issues = coachShifts.filter(s => s.status === 'Issue Reported' || s.status === 'Needs Coverage').length;
      const hours = coachShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
      const pay = coachShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime) * s.payRate, 0);
      return { coach, total: coachShifts.length, confirmed, issues, hours, pay };
    })
    .filter(r => r.total > 0)
    .sort((a, b) => b.hours - a.hours);

  const shiftsBySchool = schools
    .filter(s => s.active)
    .map(school => {
      const schoolShifts = shifts.filter(s => s.schoolId === school.id && s.status !== 'Cancelled');
      const hours = schoolShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
      return { school, shifts: schoolShifts.length, hours };
    })
    .filter(r => r.shifts > 0)
    .sort((a, b) => b.shifts - a.shifts);

  const sportNames = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'] as const;
  const shiftsBySport = sportNames.map(sport => {
    const sportShifts = shifts.filter(s => s.sport === sport && s.status !== 'Cancelled');
    const hours = sportShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
    return { sport, shifts: sportShifts.length, hours };
  }).filter(r => r.shifts > 0);

  const totalHours = shifts.filter(s => s.status !== 'Cancelled').reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
  const totalPay   = shifts.filter(s => s.status !== 'Cancelled').reduce((sum, s) => sum + calcHours(s.startTime, s.endTime) * s.payRate, 0);
  const totalConfirmed = shifts.filter(s => s.status === 'Confirmed' || s.status === 'Completed').length;
  const totalIssues    = shifts.filter(s => s.status === 'Issue Reported' || s.status === 'Needs Coverage').length;

  const exportCSV = () => {
    const rows = [
      ['Coach', 'Total Shifts', 'Confirmed', 'Issues', 'Total Hours', 'Pay Rate', 'Est. Pay'],
      ...hoursByCoach.map(r => [
        r.coach.name,
        r.total,
        r.confirmed,
        r.issues,
        r.hours.toFixed(1),
        `$${r.coach.payRate}/hr`,
        `$${r.pay.toFixed(0)}`,
      ]),
      [],
      ['Totals', '', '', '', totalHours.toFixed(1), '', `$${totalPay.toFixed(0)}`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sps-payroll-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Header
        title="Reports"
        subtitle={`${shifts.filter(s => s.status !== 'Cancelled').length} total shifts · ${totalHours.toFixed(1)} hours · $${totalPay.toFixed(0)} labor`}
        actions={
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Shifts', value: shifts.filter(s => s.status !== 'Cancelled').length, sub: 'All coaches' },
            { label: 'Confirmed',    value: totalConfirmed,  sub: 'Confirmed + Completed' },
            { label: 'Total Hours',  value: `${totalHours.toFixed(1)}h`, sub: 'Scheduled labor' },
            { label: 'Est. Payroll', value: `$${totalPay.toFixed(0)}`, sub: 'Before taxes' },
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
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Weekly Payroll Summary</h2>
          </div>
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
                  <td className="px-5 py-3">
                    <span className="text-green-700 font-medium">{confirmed}</span>
                  </td>
                  <td className="px-5 py-3">
                    {issues > 0 ? (
                      <span className="text-red-600 font-medium">{issues}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
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
                <td className="px-5 py-3 font-semibold text-slate-700">
                  {hoursByCoach.reduce((s, r) => s + r.total, 0)}
                </td>
                <td className="px-5 py-3 font-semibold text-green-700">{totalConfirmed}</td>
                <td className="px-5 py-3 font-semibold text-red-600">
                  {totalIssues > 0 ? totalIssues : <span className="text-slate-400">0</span>}
                </td>
                <td className="px-5 py-3 font-bold text-slate-900">{totalHours.toFixed(1)}h</td>
                <td />
                <td className="px-5 py-3 font-bold text-green-700">${totalPay.toFixed(0)}</td>
              </tr>
            </tfoot>
          </table>
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
                {shiftsBySchool.map(({ school, shifts: sc, hours }) => (
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
                {shiftsBySport.map(({ sport, shifts: sc, hours }) => {
                  const c = SPORT_COLORS[sport];
                  return (
                    <tr key={sport} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', c.bg, c.text)}>
                          {sport}
                        </span>
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
