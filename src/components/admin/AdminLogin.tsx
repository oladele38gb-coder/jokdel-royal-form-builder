import React, { useState } from 'react';
import { Shield, Mail, CheckCircle2, Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string) => void;
  onViewPublicSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onViewPublicSite }) => {
  const [email, setEmail] = useState('admin@jokdelroyal.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    onLogin(email);
  };

  const handleQuickLogin = () => {
    onLogin('admin@jokdelroyal.com');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="font-serif text-2xl font-bold text-[#131B2E]">
          Jokdel Royal Admin Panel
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Internal Form Builder &amp; Property Lead Management System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-slate-200 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#6E1E1E] text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Staff Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#131B2E] focus:ring-1 focus:ring-[#131B2E]"
                  placeholder="admin@jokdelroyal.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#131B2E] focus:ring-1 focus:ring-[#131B2E]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded-sm text-[#131B2E] focus:ring-[#131B2E] mr-2"
                />
                Remember login session
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#162744] transition-colors shadow-xs"
            >
              <Shield className="w-4 h-4 text-[#C5A059]" />
              <span>Login to Admin Dashboard</span>
            </button>
          </form>

          {/* Quick Demo Access Box */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">
              Evaluating the prototype?
            </p>
            <button
              onClick={handleQuickLogin}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-[#131B2E] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#6E1E1E]" />
              <span>Quick One-Click Demo Admin Login</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onViewPublicSite}
              className="text-xs font-semibold text-slate-500 hover:text-[#131B2E] transition-colors inline-flex items-center gap-1"
            >
              <span>← Back to Public Form Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
