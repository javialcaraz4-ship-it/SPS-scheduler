import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);

  const isEmail = identifier.includes('@');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    const subject = 'SPS Scheduler — Password Reset Request';
    const body = isEmail
      ? `Hi SPS Team,\n\nI need to reset my admin password.\nAccount email: ${id}\n\nThank you`
      : `Hi SPS Team,\n\nI need to reset my coach account password.\nPhone number: ${id}\n\nThank you`;

    window.location.href = `mailto:info@stanfordparksports.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
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
          {!sent ? (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Reset your password</h2>
              <p className="text-sm text-slate-500 mb-5">
                Enter your email (admin) or phone number (coach). We'll open your email client with a pre-written reset request to send to the SPS team.
              </p>

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
                    required
                    autoFocus
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-shadow"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-red-800 text-white hover:bg-red-900 transition-colors"
                >
                  <Mail size={16} />
                  Send Reset Request
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Request sent!</h2>
              <p className="text-sm text-slate-500">
                Your email client should have opened with a pre-filled message. Send it and the SPS team will reset your password within 24 hours.
              </p>
              <p className="text-xs text-slate-400 pt-1">
                If your email client didn't open, email us directly at{' '}
                <a href="mailto:info@stanfordparksports.com" className="text-red-700 hover:underline">
                  info@stanfordparksports.com
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
