import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import type { CoachAvailability, AvailabilityStatus } from '../../types';
import { formatTime } from '../../utils';
import AvailabilityForm from './AvailabilityForm';
import clsx from 'clsx';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri

const STATUS_STYLES: Record<AvailabilityStatus, { bg: string; text: string; label: string; dot: string }> = {
  available:   { bg: 'bg-green-50',   text: 'text-green-700',  label: 'Available',   dot: 'bg-green-400' },
  preferred:   { bg: 'bg-emerald-50', text: 'text-emerald-700',label: 'Preferred',   dot: 'bg-emerald-500' },
  tentative:   { bg: 'bg-amber-50',   text: 'text-amber-700',  label: 'Tentative',   dot: 'bg-amber-400' },
  unavailable: { bg: 'bg-red-50',     text: 'text-red-700',    label: 'Unavailable', dot: 'bg-red-400' },
};

interface CoachAvailabilityPanelProps {
  coachId: string;
  coachName: string;
  availability: CoachAvailability[];
  addAvailability: (a: CoachAvailability) => void;
  updateAvailability: (a: CoachAvailability) => void;
  deleteAvailability: (id: string) => void;
  readonly?: boolean;
}

export default function CoachAvailabilityPanel({
  coachId, coachName, availability,
  addAvailability, updateAvailability, deleteAvailability,
  readonly = false,
}: CoachAvailabilityPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CoachAvailability | null>(null);

  const coachAvail = availability.filter(a => a.coachId === coachId);
  const defaults = coachAvail.filter(a => a.type === 'default');
  const exceptions = coachAvail.filter(a => a.type === 'exception');

  const handleSave = (a: CoachAvailability) => {
    if (coachAvail.find(x => x.id === a.id)) updateAvailability(a);
    else addAvailability(a);
    setShowForm(false);
    setEditing(null);
  };

  const openEdit = (a: CoachAvailability) => {
    setEditing(a);
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      {/* Default weekly availability */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Default Weekly Availability</h3>
          {!readonly && (
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium"
            >
              <Plus size={12} /> Add Block
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-50">
          {WEEKDAYS.map(dow => {
            const dayBlocks = defaults.filter(a => a.dayOfWeek === dow);
            return (
              <div key={dow} className="px-5 py-3 flex items-start gap-4">
                <span className="text-sm font-medium text-slate-500 w-10 flex-shrink-0 pt-0.5">
                  {DAY_NAMES[dow]}
                </span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {dayBlocks.length === 0 ? (
                    <span className="text-sm text-slate-400 italic">No blocks set</span>
                  ) : (
                    dayBlocks.map(block => {
                      const s = STATUS_STYLES[block.status];
                      return (
                        <div
                          key={block.id}
                          className={clsx('flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border', s.bg, s.text, 'border-current/20')}
                        >
                          <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)} />
                          <span className="font-medium">{s.label}</span>
                          <span className="text-slate-500">{formatTime(block.startTime)}–{formatTime(block.endTime)}</span>
                          {block.note && <span className="text-slate-400 truncate max-w-[120px]" title={block.note}>· {block.note}</span>}
                          {!readonly && (
                            <div className="flex gap-1 ml-1">
                              <button onClick={() => openEdit(block)} className="hover:opacity-70">
                                <Edit2 size={11} />
                              </button>
                              <button onClick={() => deleteAvailability(block.id)} className="hover:opacity-70">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exceptions */}
      {(exceptions.length > 0 || !readonly) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Week-Specific Exceptions</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {exceptions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400 italic text-center">No exceptions set</p>
            ) : (
              exceptions
                .sort((a, b) => (a.date ?? '') < (b.date ?? '') ? -1 : 1)
                .map(block => {
                  const s = STATUS_STYLES[block.status];
                  const dateLabel = block.date
                    ? new Date(block.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : '—';
                  return (
                    <div key={block.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', s.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{dateLabel}</p>
                        <p className="text-xs text-slate-500">
                          {s.label} · {formatTime(block.startTime)}–{formatTime(block.endTime)}
                          {block.note && ` · ${block.note}`}
                        </p>
                      </div>
                      {!readonly && (
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(block)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteAvailability(block.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {editing ? 'Edit Availability' : 'Add Availability Block'}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-4">{coachName}</p>
              <AvailabilityForm
                coachId={coachId}
                initial={editing}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
