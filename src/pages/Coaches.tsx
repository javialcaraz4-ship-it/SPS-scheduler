import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Phone, Mail, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { X } from 'lucide-react';
import Header from '../components/layout/Header';
import CoachInviteButton from '../components/coaches/CoachInviteButton';
import type { AppContext } from '../App';
import type { Coach, Sport } from '../types';
import clsx from 'clsx';

const SPORTS: Sport[] = ['Soccer', 'Basketball', 'Volleyball', 'Multi-Sport', 'Camp'];

function emptyCoach(): Coach {
  return {
    id: `c${Date.now()}`,
    name: '',
    email: '',
    phone: '',
    sports: [],
    availability: '',
    payRate: 20,
    active: true,
    inviteStatus: 'Not Invited',
    passwordSet: false,
  };
}

export default function Coaches() {
  const { coaches, addCoach, updateCoach } = useOutletContext<AppContext>();
  const [editing, setEditing] = useState<Coach | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const visible = coaches.filter(c =>
    filterActive === 'all' ? true : filterActive === 'active' ? c.active : !c.active
  );

  const openNew = () => { setEditing(emptyCoach()); setShowForm(true); };
  const openEdit = (c: Coach) => { setEditing({ ...c }); setShowForm(true); };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) return alert('Name required');
    if (coaches.find(c => c.id === editing.id)) updateCoach(editing);
    else addCoach(editing);
    setShowForm(false);
  };

  return (
    <div>
      <Header
        title="Coaches"
        subtitle={`${coaches.filter(c => c.active).length} active coaches`}
        actions={
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900 transition-colors"
          >
            <Plus size={14} /> Add Coach
          </button>
        }
      />

      <div className="p-6">
        <div className="flex gap-1 mb-5 bg-slate-100 rounded-lg p-1 w-fit">
          {(['all', 'active', 'inactive'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterActive(v)}
              className={clsx(
                'px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors',
                filterActive === v ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {visible.map(coach => (
            <div key={coach.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-800 font-bold text-sm">
                    {coach.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{coach.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {coach.active
                        ? <CheckCircle size={12} className="text-green-500" />
                        : <XCircle size={12} className="text-slate-400" />}
                      <span className={clsx('text-xs', coach.active ? 'text-green-600' : 'text-slate-400')}>
                        {coach.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(coach)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{coach.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={13} className="text-slate-400 flex-shrink-0" />
                  <span>{coach.phone || '—'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {coach.sports.map(s => (
                  <span key={s} className="text-xs bg-red-50 text-red-800 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 mb-3">
                <CoachInviteButton coach={coach} onInvite={updateCoach} />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{coach.availability}</p>
                <p className="text-sm font-semibold text-slate-900">${coach.payRate}/hr</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">{coaches.find(c => c.id === editing.id) ? 'Edit Coach' : 'New Coach'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Full Name *', field: 'name' as const, type: 'text' },
                { label: 'Email', field: 'email' as const, type: 'email' },
                { label: 'Phone', field: 'phone' as const, type: 'tel' },
                { label: 'Availability', field: 'availability' as const, type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={editing[field] as string}
                    onChange={e => setEditing({ ...editing, [field]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pay Rate ($/hr)</label>
                <input
                  type="number" min={10} max={100}
                  value={editing.payRate}
                  onChange={e => setEditing({ ...editing, payRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sports</label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const has = editing.sports.includes(s);
                        setEditing({ ...editing, sports: has ? editing.sports.filter(x => x !== s) : [...editing.sports, s] });
                      }}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                        editing.sports.includes(s)
                          ? 'bg-red-800 text-white border-red-800'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-red-400',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, active: !editing.active })}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    editing.active
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'bg-slate-50 text-slate-500 border-slate-300',
                  )}
                >
                  {editing.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg text-sm font-medium hover:bg-red-900">Save Coach</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
