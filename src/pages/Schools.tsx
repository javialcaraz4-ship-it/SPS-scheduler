import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, MapPin, Mail, Edit2 } from 'lucide-react';
import { X } from 'lucide-react';
import Header from '../components/layout/Header';
import type { AppContext } from '../App';
import type { School, Sport } from '../types';
import clsx from 'clsx';
import { SPORT_COLORS } from '../utils';

const SPORTS: Sport[] = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'];

function emptySchool(): School {
  return {
    id: `s${Date.now()}`,
    name: '',
    address: '',
    contactName: '',
    contactEmail: '',
    programType: [],
    notes: '',
    active: true,
  };
}

export default function Schools() {
  const { schools, addSchool, updateSchool, shifts } = useOutletContext<AppContext>();
  const [editing, setEditing] = useState<School | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openNew = () => { setEditing(emptySchool()); setShowForm(true); };
  const openEdit = (s: School) => { setEditing({ ...s }); setShowForm(true); };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) return alert('School name required');
    if (schools.find(s => s.id === editing.id)) updateSchool(editing);
    else addSchool(editing);
    setShowForm(false);
  };

  const shiftsForSchool = (schoolId: string) =>
    shifts.filter(s => s.schoolId === schoolId).length;

  return (
    <div>
      <Header
        title="Schools & Programs"
        subtitle={`${schools.filter(s => s.active).length} active schools`}
        actions={
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900 transition-colors"
          >
            <Plus size={14} /> Add School
          </button>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {schools.map(school => {
            const shiftCount = shiftsForSchool(school.id);
            return (
              <div key={school.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-slate-900 text-lg">{school.name}</h3>
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        school.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500',
                      )}>
                        {school.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{shiftCount} scheduled shift{shiftCount !== 1 ? 's' : ''} this week</p>
                  </div>
                  <button
                    onClick={() => openEdit(school)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{school.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{school.contactName} · {school.contactEmail}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {school.programType.map(sport => {
                    const c = SPORT_COLORS[sport];
                    return (
                      <span key={sport} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                        {sport}
                      </span>
                    );
                  })}
                </div>

                {school.notes && (
                  <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-100 pt-2">{school.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">{schools.find(s => s.id === editing.id) ? 'Edit School' : 'New School'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'School Name *', field: 'name' as const },
                { label: 'Address', field: 'address' as const },
                { label: 'Contact Name', field: 'contactName' as const },
                { label: 'Contact Email', field: 'contactEmail' as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={editing[field]}
                    onChange={e => setEditing({ ...editing, [field]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Programs</label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map(s => {
                    const c = SPORT_COLORS[s];
                    const selected = editing.programType.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const has = editing.programType.includes(s);
                          setEditing({ ...editing, programType: has ? editing.programType.filter(x => x !== s) : [...editing.programType, s] });
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                          selected ? `${c.bg} ${c.text} ${c.border}` : 'bg-white text-slate-600 border-slate-300 hover:border-red-400',
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editing.notes}
                  onChange={e => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900">Save School</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
