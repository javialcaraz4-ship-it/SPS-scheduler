import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Shift, Coach, School, Sport, ShiftStatus } from '../../types';

const SPORTS: Sport[] = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'];
const STATUSES: ShiftStatus[] = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Needs Coverage'];

function newShift(defaults?: Partial<Shift>): Shift {
  return {
    id: `sh${Date.now()}`,
    schoolId: '',
    coachId: null,
    sport: 'Soccer',
    date: new Date().toISOString().split('T')[0],
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
  onClose: () => void;
}

export default function ShiftForm({ shift, coaches, schools, onSave, onClose }: ShiftFormProps) {
  const [form, setForm] = useState<Shift>(() => shift ? { ...shift } : newShift());

  useEffect(() => {
    setForm(shift ? { ...shift } : newShift());
  }, [shift]);

  const set = (field: keyof Shift, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolId) return alert('Please select a school.');
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {shift ? 'Edit Shift' : 'New Shift'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Coach</label>
            <select
              value={form.coachId ?? ''}
              onChange={e => set('coachId', e.target.value || null)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              <option value="">Unassigned</option>
              {coaches.filter(c => c.active).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as ShiftStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pay Rate ($/hr)</label>
              <input
                type="number"
                min={10}
                max={100}
                value={form.payRate}
                onChange={e => set('payRate', Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900 transition-colors"
            >
              {shift ? 'Save Changes' : 'Create Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
