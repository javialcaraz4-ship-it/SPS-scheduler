import { useState, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import type { Shift, Coach, School, Sport, ShiftStatus } from '../../types';
import { toISODate } from '../../utils';
import clsx from 'clsx';

const SPORTS: Sport[] = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'];
const STATUSES: ShiftStatus[] = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Needs Coverage'];

// Mon–Sun labels, indices match JS Date.getDay() (0=Sun)
const DOW = [
  { label: 'Su', value: 0 },
  { label: 'M',  value: 1 },
  { label: 'Tu', value: 2 },
  { label: 'W',  value: 3 },
  { label: 'Th', value: 4 },
  { label: 'F',  value: 5 },
  { label: 'Sa', value: 6 },
];

function newShift(defaults?: Partial<Shift>): Shift {
  return {
    id: `sh${Date.now()}`,
    schoolId: '',
    coachId: null,
    sport: 'Soccer',
    date: toISODate(new Date()),
    startTime: '14:30',
    endTime: '15:30',
    status: 'Scheduled',
    payRate: 20,
    notes: '',
    ...defaults,
  };
}

interface ShiftFormProps {
  shift?: Shift | null;
  coaches: Coach[];
  schools: School[];
  onSave: (shift: Shift) => void;
  onSaveBulk?: (shifts: Shift[]) => void;
  onClose: () => void;
}

export default function ShiftForm({ shift, coaches, schools, onSave, onSaveBulk, onClose }: ShiftFormProps) {
  const isEdit = !!shift;
  const [mode, setMode] = useState<'single' | 'series'>(isEdit ? 'single' : 'single');

  // ── Single form ───────────────────────────────────────────────────────────
  const [form, setForm] = useState<Shift>(() => shift ? { ...shift } : newShift());
  useEffect(() => { setForm(shift ? { ...shift } : newShift()); }, [shift]);
  const set = (field: keyof Shift, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolId) return alert('Please select a school.');
    onSave(form);
    onClose();
  };

  // ── Series form ───────────────────────────────────────────────────────────
  const [seriesSchoolId, setSeriesSchoolId] = useState('');
  const [seriesSport,    setSeriesSport]    = useState<Sport>('Soccer');
  const [seriesCoachId,  setSeriesCoachId]  = useState<string | null>(null);
  const [seriesPayRate,  setSeriesPayRate]  = useState(20);
  const [seriesStart,    setSeriesStart]    = useState('14:30');
  const [seriesEnd,      setSeriesEnd]      = useState('15:30');
  const [seriesNotes,    setSeriesNotes]    = useState('');
  const [days,           setDays]           = useState<number[]>([1]); // Mon default
  const [fromDate,       setFromDate]       = useState('');
  const [toDate,         setToDate]         = useState('');
  const [skipDates,      setSkipDates]      = useState<string[]>([]);
  const [skipInput,      setSkipInput]      = useState('');

  const toggleDay = (d: number) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());

  const addSkip = () => {
    if (skipInput && !skipDates.includes(skipInput)) {
      setSkipDates(prev => [...prev, skipInput].sort());
    }
    setSkipInput('');
  };

  const previewDates = useMemo(() => {
    if (!fromDate || !toDate || days.length === 0) return [];
    const results: string[] = [];
    const cur = new Date(fromDate + 'T12:00:00');
    const end = new Date(toDate + 'T12:00:00');
    while (cur <= end) {
      const iso = toISODate(cur);
      if (days.includes(cur.getDay()) && !skipDates.includes(iso)) {
        results.push(iso);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return results;
  }, [days, fromDate, toDate, skipDates]);

  const handleSeriesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesSchoolId) return alert('Please select a school.');
    if (previewDates.length === 0) return alert('No dates match your selection. Adjust the days or date range.');
    const shifts: Shift[] = previewDates.map((date, i) => ({
      id: `sh${Date.now()}_${i}`,
      schoolId: seriesSchoolId,
      coachId: seriesCoachId,
      sport: seriesSport,
      date,
      startTime: seriesStart,
      endTime: seriesEnd,
      status: 'Scheduled' as ShiftStatus,
      payRate: seriesPayRate,
      notes: seriesNotes,
    }));
    onSaveBulk?.(shifts);
    onClose();
  };

  const fmtDate = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Shift' : 'New Shift'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Mode switcher (only for new shifts) */}
        {!isEdit && (
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mx-6 mt-4">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                mode === 'single' ? 'bg-white text-red-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Single Shift
            </button>
            <button
              type="button"
              onClick={() => setMode('series')}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                mode === 'series' ? 'bg-white text-red-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Recurring Series
            </button>
          </div>
        )}

        {/* ── Single Shift Form ── */}
        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School *</label>
              <select
                value={form.schoolId}
                onChange={e => set('schoolId', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                required
              >
                <option value="">Select school...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sport</label>
              <select
                value={form.sport}
                onChange={e => set('sport', e.target.value as Sport)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
                <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
                <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coach</label>
              <select value={form.coachId ?? ''} onChange={e => set('coachId', e.target.value || null)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700">
                <option value="">Unassigned</option>
                {coaches.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value as ShiftStatus)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pay Rate ($/hr)</label>
                <input type="number" min={10} max={100} value={form.payRate}
                  onChange={e => set('payRate', Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Optional notes..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors">
                {isEdit ? 'Save Changes' : 'Create Shift'}
              </button>
            </div>
          </form>
        )}

        {/* ── Recurring Series Form ── */}
        {mode === 'series' && (
          <form onSubmit={handleSeriesSubmit} className="p-6 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School *</label>
                <select value={seriesSchoolId} onChange={e => setSeriesSchoolId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" required>
                  <option value="">Select school...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sport</label>
                <select value={seriesSport} onChange={e => setSeriesSport(e.target.value as Sport)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700">
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Day of week toggles */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Repeat on</label>
              <div className="flex gap-2">
                {DOW.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className={clsx(
                      'w-9 h-9 rounded-full text-sm font-semibold transition-colors',
                      days.includes(value)
                        ? 'bg-red-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start time</label>
                <input type="time" value={seriesStart} onChange={e => setSeriesStart(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End time</label>
                <input type="time" value={seriesEnd} onChange={e => setSeriesEnd(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
            </div>

            {/* Coach + Pay */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Coach</label>
                <select value={seriesCoachId ?? ''} onChange={e => setSeriesCoachId(e.target.value || null)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700">
                  <option value="">Unassigned</option>
                  {coaches.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pay Rate ($/hr)</label>
                <input type="number" min={10} max={100} value={seriesPayRate}
                  onChange={e => setSeriesPayRate(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
              </div>
            </div>

            {/* Skip dates */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Skip dates <span className="text-slate-400 font-normal">(no school, holidays)</span>
              </label>
              <div className="flex gap-2">
                <input type="date" value={skipInput} onChange={e => setSkipInput(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" />
                <button type="button" onClick={addSkip} disabled={!skipInput}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-40 transition-colors">
                  <Plus size={14} /> Add
                </button>
              </div>
              {skipDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skipDates.map(d => (
                    <span key={d} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                      {fmtDate(d)}
                      <button type="button" onClick={() => setSkipDates(prev => prev.filter(x => x !== d))}
                        className="hover:text-red-900 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea rows={2} value={seriesNotes} onChange={e => setSeriesNotes(e.target.value)}
                placeholder="Applied to all shifts in series..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none" />
            </div>

            {/* Preview */}
            {previewDates.length > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {previewDates.length} shifts will be created
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {previewDates.map(d => (
                    <span key={d} className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg">
                      {fmtDate(d)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {fromDate && toDate && days.length > 0 && previewDates.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No matching dates in this range. Check your day selection or date range.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={previewDates.length === 0}
                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
                Create {previewDates.length > 0 ? `${previewDates.length} Shifts` : 'Series'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
