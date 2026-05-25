import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Header from '../components/layout/Header';
import CoachAvailabilityPanel from '../components/availability/CoachAvailabilityPanel';
import type { AppContext } from '../App';

export default function Availability() {
  const {
    coaches, availability,
    addAvailability, updateAvailability, deleteAvailability,
  } = useOutletContext<AppContext>();

  const [selectedCoachId, setSelectedCoachId] = useState('');

  useEffect(() => {
    if (!selectedCoachId) {
      const first = coaches.find(c => c.active);
      if (first) setSelectedCoachId(first.id);
    }
  }, [coaches, selectedCoachId]);

  const selectedCoach = coaches.find(c => c.id === selectedCoachId);
  const activeCoaches = coaches.filter(c => c.active);

  return (
    <div>
      <Header
        title="Availability"
        subtitle="View and manage coach availability"
        actions={
          <div className="relative">
            <select
              value={selectedCoachId}
              onChange={e => setSelectedCoachId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700 cursor-pointer"
            >
              {activeCoaches.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        }
      />

      <div className="p-6">
        {selectedCoach ? (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-800 font-bold text-sm">
                {selectedCoach.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedCoach.name}</p>
                <p className="text-sm text-slate-500">{selectedCoach.sports.join(', ')} · ${selectedCoach.payRate}/hr</p>
              </div>
            </div>

            <CoachAvailabilityPanel
              coachId={selectedCoachId}
              coachName={selectedCoach.name}
              availability={availability}
              addAvailability={addAvailability}
              updateAvailability={updateAvailability}
              deleteAvailability={deleteAvailability}
            />
          </>
        ) : (
          <p className="text-slate-400 text-sm text-center py-12">Select a coach to view availability.</p>
        )}
      </div>
    </div>
  );
}
