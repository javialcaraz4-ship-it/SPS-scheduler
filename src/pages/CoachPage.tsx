import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import CoachScheduleView from '../views/CoachScheduleView';

export default function CoachPage() {
  const { user, logout } = useAuth();
  const {
    shifts, coaches, schools, availability,
    updateShift, addAvailability, updateAvailability, deleteAvailability,
  } = useData();
  const coachId = user?.coachId ?? '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
            <span className="text-white font-bold text-xs">SPS</span>
          </div>
          <span className="font-semibold text-slate-900 text-sm">SPS Scheduler</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-800 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>

      <CoachScheduleView
        coachId={coachId}
        shifts={shifts}
        coaches={coaches}
        schools={schools}
        availability={availability}
        updateShift={updateShift}
        addAvailability={addAvailability}
        updateAvailability={updateAvailability}
        deleteAvailability={deleteAvailability}
        allowActions
      />
    </div>
  );
}
