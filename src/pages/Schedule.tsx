import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Header from '../components/layout/Header';
import AdminScheduleView from '../views/AdminScheduleView';
import CoachScheduleView from '../views/CoachScheduleView';
import type { AppContext } from '../App';
import clsx from 'clsx';

type ViewMode = 'admin' | 'preview';

export default function Schedule() {
  const {
    shifts, coaches, schools, availability,
    addShift, updateShift, deleteShift,
    addAvailability, updateAvailability, deleteAvailability,
  } = useOutletContext<AppContext>();

  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [previewCoachId, setPreviewCoachId] = useState('');

  useEffect(() => {
    if (viewMode === 'preview' && !previewCoachId) {
      const first = coaches.find(c => c.active);
      if (first) setPreviewCoachId(first.id);
    }
  }, [viewMode, coaches, previewCoachId]);

  const previewCoach = coaches.find(c => c.id === previewCoachId);

  const viewSwitcher = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {(['admin', 'preview'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap',
              viewMode === mode
                ? 'bg-white text-red-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {mode === 'admin' ? 'Admin View' : 'Coach Preview'}
          </button>
        ))}
      </div>

      {viewMode === 'preview' && (
        <div className="relative">
          <select
            value={previewCoachId}
            onChange={e => setPreviewCoachId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700 cursor-pointer"
          >
            {coaches.filter(c => c.active).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Schedule"
        subtitle={
          viewMode === 'admin'
            ? 'Admin · All coaches'
            : `Coach Preview · ${previewCoach?.name ?? '—'}`
        }
        actions={viewSwitcher}
      />

      {viewMode === 'admin' ? (
        <AdminScheduleView
          shifts={shifts}
          coaches={coaches}
          schools={schools}
          availability={availability}
          addShift={addShift}
          updateShift={updateShift}
          deleteShift={deleteShift}
        />
      ) : (
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <CoachScheduleView
            coachId={previewCoachId}
            shifts={shifts}
            coaches={coaches}
            schools={schools}
            availability={availability}
            updateShift={updateShift}
            addAvailability={addAvailability}
            updateAvailability={updateAvailability}
            deleteAvailability={deleteAvailability}
            allowActions={false}
            isAdminPreview
          />
        </div>
      )}
    </div>
  );
}
