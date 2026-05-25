/**
 * MOCK LOGIN — local demo use only.
 * Replace with Supabase Auth or another secure backend before production.
 */
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

  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/schedule' : '/coach', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small artificial delay so the button feedback is visible
    await new Promise(r => setTimeout(r, 300));

    const id = identifier.trim();
    const isEmail = id.includes('@');

    if (isEmail) {
      // ── Admin login ──────────────────────────────────────────────────────────
      const result = loginAsAdmin(id, password);
      if (result.success) {
        login(result.user);
        navigate('/schedule', { replace: true });
      } else {
        setError(result.error);
      }
    } else {
      // ── Coach login (phone number) ────────────────────────────────────────────
      const coach = coaches.find(
        c => c.phone === id && c.passwordSet && c.password === password && c.active,
      );
      if (coach) {
        login({
          id: `coach_user_${coach.id}`,
          name: coach.name,
          role: 'coach',
          phone: id,
          coachId: coach.id,
        });
        navigate('/coach', { replace: true });
      } else {
        setError('Invalid phone number or password.');
      }
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email or Phone Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="admin@example.com or 699902076"
                autoComplete="username"
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                loading
                  ? 'bg-red-300 text-white cursor-not-allowed'
                  : 'bg-red-800 text-white hover:bg-red-900',
              )}
            >
              <LogIn size={16} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600 mb-1.5">Demo credentials</p>
          <p><span className="font-medium text-slate-700">Admin:</span> javi@stanfordparksports.com / password123</p>
          <p><span className="font-medium text-slate-700">Coach:</span> 699902076 / password123</p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          SPS Scheduler · Mock auth for demo only
        </p>
      </div>
    </div>
  );
}
