import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import type { Coach, School, Shift, Sport, CoachAvailability } from '../types';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import ShiftForm from '../components/shifts/ShiftForm';
import ConflictWarningModal from '../components/schedule/ConflictWarningModal';
import { getWeekDates, toISODate } from '../utils';
import { checkShiftConflicts } from '../utils/conflicts';
import type { ShiftConflict } from '../utils/conflicts';

const SPORTS: Sport[] = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'];

interface AdminScheduleViewProps {
  shifts: Shift[];
  coaches: Coach[];
  schools: School[];
  availability: CoachAvailability[];
  addShift: (s: Shift) => void;
  updateShift: (s: Shift) => void;
  deleteShift: (id: string) => void;
}

export default function AdminScheduleView({
  shifts, coaches, schools, availability, addShift, updateShift, deleteShift,
}: AdminScheduleViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekDates()[0]);
  const [editingShift, setEditingShift] = useState<Shift | null | undefined>(undefined);
  const [filterCoach, setFilterCoach] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Conflict modal state
  const [pendingShift, setPendingShift] = useState<Shift | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<ShiftConflict[]>([]);

  const weekDates = getWeekDates(weekStart);
  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday  = () => setWeekStart(getWeekDates()[0]);

  const weekDateSet = new Set(weekDates.map(toISODate));
  let visibleShifts = shifts.filter(s => weekDateSet.has(s.date));
  if (filterCoach) visibleShifts = visibleShifts.filter(s => s.coachId === filterCoach);
  if (filterSport) visibleShifts = visibleShifts.filter(s => s.sport === filterSport);

  // ── Conflict-aware save ──────────────────────────────────────────────────────
  const commitShift = (shift: Shift) => {
    if (shifts.find(s => s.id === shift.id)) updateShift(shift);
    else addShift(shift);
  };

  const handleSave = (shift: Shift) => {
    const conflicts = checkShiftConflicts(shift, coaches, shifts, availability);
    if (conflicts.length > 0) {
      setPendingShift(shift);
      setPendingConflicts(conflicts);
      setEditingShift(undefined); // close form while modal is shown
    } else {
      commitShift(shift);
    }
  };

  const handleConfirmConflict = () => {
    if (pendingShift) commitShift(pendingShift);
    setPendingShift(null);
    setPendingConflicts([]);
  };

  const handleCancelConflict = () => {
    setPendingShift(null);
    setPendingConflicts([]);
  };

  // ── Conflict-aware drop ──────────────────────────────────────────────────────
  const handleShiftDrop = (shiftId: string, newCoachId: string | null, newDate: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    const dropped = { ...shift, coachId: newCoachId, date: newDate };
    const conflicts = checkShiftConflicts(dropped, coaches, shifts, availability);
    if (conflicts.length > 0) {
      setPendingShift(dropped);
      setPendingConflicts(conflicts);
    } else {
      updateShift(dropped);
    }
  };

  const handleAddShift = (date: string, coachId?: string) => {
    setEditingShift({
      id: `sh${Date.now()}`,
      schoolId: '',
      coachId: coachId ?? null,
      sport: 'Soccer',
      date,
      startTime: '14:30',
      endTime: '15:30',
      status: 'Scheduled',
      payRate: 20,
      notes: '',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Today
          </button>
          <button onClick={nextWeek} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
          <span className="ml-2 text-sm font-semibold text-slate-800">{weekLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
          >
            <Filter size={14} /> Filters
            {(filterCoach || filterSport) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-red-700 inline-block" />
            )}
          </button>

          {showFilters && (
            <>
              <select
                value={filterCoach}
                onChange={e => setFilterCoach(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                <option value="">All Coaches</option>
                {coaches.filter(c => c.active).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={filterSport}
                onChange={e => setFilterSport(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                <option value="">All Sports</option>
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
              {(filterCoach || filterSport) && (
                <button onClick={() => { setFilterCoach(''); setFilterSport(''); }} className="text-xs text-red-800 hover:underline">
                  Clear
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setEditingShift(null)}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900 transition-colors"
          >
            <Plus size={14} /> New Shift
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-white">
        <ScheduleGrid
          shifts={visibleShifts}
          coaches={coaches}
          schools={schools}
          weekStart={weekStart}
          availability={availability}
          onEdit={setEditingShift}
          onDelete={deleteShift}
          onAddShift={handleAddShift}
          onShiftDrop={handleShiftDrop}
        />
      </div>

      {editingShift !== undefined && (
        <ShiftForm
          shift={editingShift}
          coaches={coaches}
          schools={schools}
          onSave={handleSave}
          onClose={() => setEditingShift(undefined)}
        />
      )}

      {pendingConflicts.length > 0 && (
        <ConflictWarningModal
          conflicts={pendingConflicts}
          onConfirm={handleConfirmConflict}
          onCancel={handleCancelConflict}
        />
      )}
    </div>
  );
}
