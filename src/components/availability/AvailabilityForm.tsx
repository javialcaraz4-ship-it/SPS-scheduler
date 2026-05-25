import { useState } from 'react';
import type { CoachAvailability, AvailabilityStatus, AvailabilityType } from '../../types';
import clsx from 'clsx';

const DAY_OPTIONS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const STATUS_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: 'available',   label: 'Available',  color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'preferred',   label: 'Preferred',  color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'tentative',   label: 'Tentative',  color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-800 border-red-300' },
];

interface AvailabilityFormProps {
  coachId: string;
  initial?: CoachAvailability | null;
  onSave: (a: CoachAvailability) => void;
  onCancel: () => void;
}

export default function AvailabilityForm({ coachId, initial, onSave, onCancel }: AvailabilityFormProps) {
  const [type, setType] = useState<AvailabilityType>(initial?.type ?? 'default');
  const [dayOfWeek, setDayOfWeek] = useState<number>(initial?.dayOfWeek ?? 1);
  const [date, setDate] = useState<string>(initial?.date ?? '');
  const [startTime, setStartTime] = useState(initial?.startTime ?? '14:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '18:00');
  const [status, setStatus] = useState<AvailabilityStatus>(initial?.status ?? 'available');
  const [note, setNote] = useState(initial?.note ?? '');

  const handleSave = () => {
    if (type === 'exception' && !date) return alert('Please select a date for the exception.');
    if (startTime >= endTime) return alert('End time must be after start time.');
    onSave({
      id: initial?.id ?? `av${Date.now()}`,
      coachId,
      type,
      dayOfWeek: type === 'default' ? dayOfWeek : undefined,
      date: type === 'exception' ? date : undefined,
      startTime,
      endTime,
      status,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
        <div className="flex gap-2">
          {(['default', 'exception'] as AvailabilityType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={clsx(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize',
                type === t
                  ? 'bg-red-800 text-white border-red-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-red-400',
              )}
            >
              {t === 'default' ? 'Weekly Default' : 'Week Exception'}
            </button>
          ))}
        </div>
      </div>

      {/* Day / Date */}
      {type === 'default' ? (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
          <select
            value={dayOfWeek}
            onChange={e => setDayOfWeek(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            {DAY_OPTIONS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Specific Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>
      )}

      {/* Time range */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Start Time', value: startTime, setter: setStartTime },
          { label: 'End Time',   value: endTime,   setter: setEndTime },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type="time"
              value={value}
              onChange={e => setter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>
        ))}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={clsx(
                'py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                status === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-current' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder='e.g. "Class until 3 PM" or "Can work if needed"'
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
