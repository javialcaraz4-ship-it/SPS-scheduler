import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { loginAsAdmin } from '../auth/mockAuth';
import clsx from 'clsx';

export default function Login() {
  const { login, user } = useAuth();
  const { coaches } = useData();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [javiMode, setJaviMode] = useState(false); // name was "Javi", now needs password
  const [adminMode, setAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/schedule' : '/coach', { replace: true });
    }
  }, [user, navigate]);

  const handleCoachLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 200));

    const q = name.trim().toLowerCase();

    // Javi = admin by name, but needs a password first
    if (q === 'javi') {
      setJaviMode(true);
      setLoading(false);
      return;
    }

    const coach = coaches.find(c => c.active && c.name.toLowerCase() === q);
    if (coach) {
      login({ id: `coach_user_${coach.id}`, name: coach.name, role: 'coach', coachId: coach.id });
      navigate('/coach', { replace: true });
    } else {
      setError("Name not found. Contact your admin to be added.");
    }
    setLoading(false);
  };

  const handleJaviLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 200));
    if (password === 'SPS1') {
      login({ id: 'admin_javi', name: 'Javi', role: 'admin', email: 'javi@stanfordparksports.com' });
      navigate('/schedule', { replace: true });
    } else {
      setError('Incorrect password.');
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 200));

    const result = loginAsAdmin(email.trim(), password);
    if (result.success) {
      login(result.user);
      navigate('/schedule', { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {javiMode ? (
            <>
              <button
                onClick={() => { setJaviMode(false); setPassword(''); setError(''); }}
                className="text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Welcome, Javi</h2>
              <p className="text-sm text-slate-500 mb-5">Enter your password to continue</p>
              <form onSubmit={handleJaviLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Password"
                    autoFocus
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-shadow"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">{error}</div>}
                <button type="submit" disabled={loading}
                  className={clsx('w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    loading ? 'bg-red-300 text-white cursor-not-allowed' : 'bg-red-800 text-white hover:bg-red-900')}>
                  <LogIn size={16} />{loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </>
          ) : !adminMode ? (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Welcome back</h2>
              <p className="text-sm text-slate-500 mb-5">Enter your name to sign in</p>

              <form onSubmit={handleCoachLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="e.g. Sam Torres"
                    autoFocus
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-shadow"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    loading || !name.trim()
                      ? 'bg-red-300 text-white cursor-not-allowed'
                      : 'bg-red-800 text-white hover:bg-red-900',
                  )}
                >
                  <LogIn size={16} />
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => { setAdminMode(true); setError(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Admin sign in →
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setAdminMode(false); setError(''); }}
                className="text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-base font-semibold text-slate-800 mb-5">Admin Sign In</h2>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="admin@stanfordparksports.com"
                    autoFocus
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password"
                      required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    loading ? 'bg-red-300 text-white cursor-not-allowed' : 'bg-red-800 text-white hover:bg-red-900',
                  )}
                >
                  <LogIn size={16} />
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          SPS Scheduler · Stanford Park Sports
        </p>
      </div>
    </div>
  );
}
