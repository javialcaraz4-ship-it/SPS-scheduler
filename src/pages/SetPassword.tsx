/**
 * MOCK SET-PASSWORD PAGE — local demo use only.
 * Replace with Supabase Auth invite flow before production.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function SetPassword() {
  const [params] = useSearchParams();
  const phone = params.get('phone') ?? '';
  const { coaches, updateCoach } = useData();
  const navigate = useNavigate();

  const coach = coaches.find(c => c.phone === phone);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!coach) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm w-full text-center">
          <p className="text-slate-700 font-medium mb-4">Invalid or expired invite link.</p>
          <Link to="/login" className="text-sm text-red-800 hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    // MOCK ONLY — real password should be hashed and stored server-side
    updateCoach({ ...coach, password, passwordSet: true, inviteStatus: 'Active' });
    setDone(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-800 flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white font-bold text-xl">SPS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SPS Scheduler</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-900">Password set!</p>
              <p className="text-sm text-slate-500 mt-1">Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Set your password</h2>
              <p className="text-sm text-slate-500 mb-5">
                Welcome, <span className="font-medium text-slate-700">{coach.name}</span>. Choose a password to activate your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'New Password', value: password, onChange: setPassword },
                  { label: 'Confirm Password', value: confirm, onChange: setConfirm },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                {error && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
                >
                  Set Password & Activate
                </button>
              </form>
            </>
          )}
        </div>
        <div className="text-center mt-4">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
