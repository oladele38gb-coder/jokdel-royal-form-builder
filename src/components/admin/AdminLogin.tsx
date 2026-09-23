import React, { useState } from 'react';
import { Logo } from '../Logo';
import { Mail, Lock, Shield } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string) => void;
  onViewPublicSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onViewPublicSite }) => {
  const [email, setEmail] = useState('admin@jokdelroyal.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password !== 'admin123') {
      setError('Invalid credentials. Please try again.');
      return;
    }
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#F7F8FA' }}>

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <Logo height={56} />
          </div>
          <h1 className="font-serif text-xl font-bold" style={{ color: '#1B2A5C' }}>Admin Login</h1>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Property CRM & Form Management</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="p-3 rounded-lg text-xs font-medium border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#8B1A2A' }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#475569' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  style={{ color: '#1e293b' }}
                  placeholder="admin@jokdelroyal.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#475569' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
              style={{ background: '#1B2A5C' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#111c3e')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1B2A5C')}
            >
              <Shield className="w-4 h-4" style={{ color: '#B8962E' }} />
              Login to Dashboard
            </button>
          </form>

          {/* Quick Demo Credentials Info & Auto-fill */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Default login credentials:</p>
            <div className="inline-flex items-center gap-2 text-xs bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700">
              <span>Password: <strong className="font-mono text-slate-900">admin123</strong></span>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@jokdelroyal.com');
                  setPassword('admin123');
                  setError('');
                }}
                className="text-xs font-bold text-[#1B2A5C] hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6">
          <button
            onClick={onViewPublicSite}
            className="text-xs font-medium transition-colors"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1B2A5C')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            ← Return to Public Form Site
          </button>
        </p>
      </div>
    </div>
  );
};
