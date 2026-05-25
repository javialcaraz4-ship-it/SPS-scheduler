import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Header from '../components/layout/Header';
import ShiftForm from '../components/shifts/ShiftForm';
import type { AppContext } from '../App';
import type { Shift, ShiftStatus, Sport } from '../types';
import { formatTime, SPORT_COLORS, STATUS_COLORS, calcHours } from '../utils';
import clsx from 'clsx';

const ALL_STATUSES: ShiftStatus[] = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Needs Coverage'];
const ALL_SPORTS: Sport[] = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'];

export default function Shifts() {
  const { shifts, coaches, schools, addShift, updateShift, deleteShift } = useOutletContext<AppContext>();
  const [editing, setEditing] = useState<Shift | null | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSport, setFilterSport] = useState('');

  const getCoach = (id: string | null) => coaches.find(c => c.id === id);
  const getSchool = (id: string) => schools.find(s => s.id === id);

  let visible = [...shifts].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  if (filterStatus) visible = visible.filter(s => s.status === filterStatus);
  if (filterSport)  visible = visible.filter(s => s.sport === filterSport);

  const handleSave = (shift: Shift) => {
    if (shifts.find(s => s.id === shift.id)) updateShift(shift);
    else addShift(shift);
  };

  return (
    <div>
      <Header
        title="Shift Management"
        subtitle={`${shifts.length} total shifts`}
        actions={
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900 transition-colors"
          >
            <Plus size={14} /> New Shift
          </button>
        }
      />

      <div className="p-6">
        <div className="flex gap-3 mb-5">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={filterSport}
            onChange={e => setFilterSport(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="">All Sports</option>
            {ALL_SPORTS.map(s => <option key={s}>{s}</option>)}
          </select>
          {(filterStatus || filterSport) && (
            <button onClick={() => { setFilterStatus(''); setFilterSport(''); }} className="text-sm text-red-800 hover:underline px-1">
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Date', 'Time', 'School', 'Sport', 'Coach', 'Hours', 'Pay', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(shift => {
                const school = getSchool(shift.schoolId);
                const coach = getCoach(shift.coachId);
                const colors = SPORT_COLORS[shift.sport];
                const hours = calcHours(shift.startTime, shift.endTime);
                return (
                  <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {new Date(shift.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{school?.name}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', colors.bg, colors.text)}>
                        {shift.sport}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {coach?.name ?? <span className="text-red-700 font-medium">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{hours.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-slate-600">${(hours * shift.payRate).toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_COLORS[shift.status])}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(shift)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this shift?')) deleteShift(shift.id); }}
                          className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="text-center py-12 text-slate-400 text-sm">No shifts found</p>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <ShiftForm
          shift={editing}
          coaches={coaches}
          schools={schools}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
