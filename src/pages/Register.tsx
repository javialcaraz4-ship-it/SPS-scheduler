import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Coach } from '../types';

type Step = 'name' | 'confirm' | 'credentials' | 'done';

function findMatchingCoach(query: string, coaches: Coach[]): Coach | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // Only match unclaimed profiles (not yet registered)
  const unclaimed = coaches.filter(c => c.active && !c.passwordSet);

  // 1. Exact full name
  const exact = unclaimed.find(c => c.name.toLowerCase() === q);
  if (exact) return exact;

  // 2. Query contained in name or name contained in query
  const partial = unclaimed.find(c =>
    c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()),
  );
  if (partial) return partial;

  // 3. All query words appear somewhere in the coach name
  const qWords = q.split(/\s+/);
  return (
    unclaimed.find(c => {
      const cWords = c.name.toLowerCase().split(/\s+/);
      return qWords.every(qw => cWords.some(cw => cw.startsWith(qw)));
    }) ?? null
  );
}

export default function Register() {
  const { coaches, updateCoach, addCoach } = useData();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]             = useState<Step>('name');
  const [nameInput, setNameInput]   = useState('');
  const [matchedCoach, setMatchedCoach] = useState<Coach | null>(null);
  const [isNewCoach, setIsNewCoach] = useState(false);
  const [phone, setPhone]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState('');

  // ── Step 1: name submitted ────────────────────────────────────────────────
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const match = findMatchingCoach(nameInput, coaches);
    if (match) {
      setMatchedCoach(match);
      setStep('confirm');
    } else {
      setIsNewCoach(true);
      setMatchedCoach(null);
      setStep('credentials');
    }
  };

  // ── Step 2: coach confirmed ───────────────────────────────────────────────
  const handleConfirmYes = () => {
    setIsNewCoach(false);
    setStep('credentials');
  };

  const handleConfirmNo = () => {
    setMatchedCoach(null);
    setIsNewCoach(true);
    setStep('credentials');
  };

  // ── Step 3: set credentials ───────────────────────────────────────────────
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (coaches.some(c => c.phone === phone.trim() && c.passwordSet)) {
      setError('That phone number is already registered. Try signing in instead.');
      return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    if (matchedCoach) {
      // Link to existing profile
      const updated: Coach = { ...matchedCoach, phone: phone.trim(), password, passwordSet: true, inviteStatus: 'Active' };
      updateCoach(updated);
      login({ id: `coach_user_${matchedCoach.id}`, name: matchedCoach.name, role: 'coach', phone: phone.trim(), coachId: matchedCoach.id });
    } else {
      // Create new unlinked coach
      const newCoach: Coach = {
        id: `coach_self_${Date.now()}`,
        name: nameInput.trim(),
        email: '',
        phone: phone.trim(),
        sports: [],
        availability: '',
        payRate: 22,
        active: true,
        inviteStatus: 'Active',
        passwordSet: true,
        password,
      };
      addCoach(newCoach);
      login({ id: `coach_user_${newCoach.id}`, name: newCoach.name, role: 'coach', phone: phone.trim(), coachId: newCoach.id });
    }

    setStep('done');
    setTimeout(() => navigate('/coach'), 1800);
  };

  const displayName = matchedCoach?.name ?? nameInput.trim();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-800 flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white font-bold text-xl tracking-tight">SPS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SPS Scheduler</h1>
          <p className="text-sm text-slate-500 mt-1">Stanford Park Sports</p>
        </div>

        {/* Progress dots */}
        {step !== 'done' && (
          <div className="flex justify-center gap-2 mb-6">
            {(['name', 'confirm', 'credentials'] as const).map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === s ? 'bg-red-800' :
                  ['name', 'confirm', 'credentials'].indexOf(step) > i ? 'bg-red-300' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          {/* ── Step 1: Enter name ── */}
          {step === 'name' && (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Coach sign-up</h2>
              <p className="text-sm text-slate-500 mb-5">Enter your full name so we can find your profile.</p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your full name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                    autoFocus
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!nameInput.trim()}
                  className="w-full py-2.5 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: Confirm match ── */}
          {step === 'confirm' && matchedCoach && (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">We found a profile</h2>
              <p className="text-sm text-slate-500 mb-5">Is this you?</p>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-red-800 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {matchedCoach.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{matchedCoach.name}</p>
                  {matchedCoach.sports.length > 0 && (
                    <p className="text-xs text-slate-500">{matchedCoach.sports.join(', ')}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmNo}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserPlus size={15} /> Not me
                </button>
                <button
                  onClick={handleConfirmYes}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
                >
                  <UserCheck size={15} /> Yes, that's me
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Set credentials ── */}
          {step === 'credentials' && (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">
                {isNewCoach ? 'Create your account' : `Welcome, ${displayName}!`}
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                {isNewCoach
                  ? "No problem — you'll show up in the system and an admin will complete your profile."
                  : 'Set your phone number and password to activate your account.'}
              </p>

              {isNewCoach && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4 text-xs text-amber-700">
                  Your account will be created as <span className="font-semibold">{nameInput.trim()}</span>. The SPS team will add your schedule details.
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number (used to log in)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 6501234567"
                    required
                    autoFocus
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  />
                </div>

                {[
                  { label: 'Password', value: password, set: setPassword },
                  { label: 'Confirm password', value: confirm, set: setConfirm },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={value}
                        onChange={e => set(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                {error && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
                >
                  Create Account
                </button>
              </form>
            </>
          )}

          {/* ── Step 4: Done ── */}
          {step === 'done' && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle size={44} className="text-green-500 mx-auto" />
              <p className="font-semibold text-slate-900">Account created!</p>
              <p className="text-sm text-slate-500">
                Welcome, <span className="font-medium">{displayName}</span>. Taking you to your schedule…
              </p>
            </div>
          )}
        </div>

        {step !== 'done' && (
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-800 transition-colors"
            >
              <ArrowLeft size={14} /> Already have an account? Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
