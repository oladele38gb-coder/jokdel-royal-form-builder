import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { FormConfig } from '../types';
import { ChevronDown, Phone, Home, Layers, FileText, Shield } from 'lucide-react';

interface HeaderProps {
  forms: FormConfig[];
  selectedFormId: string | null;
  onSelectForm: (formId: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ forms, selectedFormId, onSelectForm }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeForms = forms.filter((f) => f.isActive);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200" style={{ boxShadow: '0 1px 3px rgba(27,42,92,0.07)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex items-center justify-between h-16">

        {/* Brand Logo */}
        <button
          onClick={() => { onSelectForm(null); setDropdownOpen(false); }}
          className="hover:opacity-85 transition-opacity focus:outline-none"
          aria-label="Home"
        >
          <Logo height={48} />
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Forms Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#1B2A5C' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f3f8')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Inquiry Forms</span>
              <span className="sm:hidden">Forms</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl border border-gray-200 py-2 z-20" style={{ boxShadow: '0 8px 24px rgba(27,42,92,0.12)' }}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      Available Services
                    </p>
                  </div>

                  <button
                    onClick={() => { onSelectForm(null); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors hover:bg-gray-50"
                    style={{ color: selectedFormId === null ? '#1B2A5C' : '#475569', fontWeight: selectedFormId === null ? 600 : 400 }}
                  >
                    <Home className="w-4 h-4 shrink-0" style={{ color: '#64748b' }} />
                    <span>All Inquiry Forms</span>
                  </button>

                  {activeForms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => { onSelectForm(form.id); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors hover:bg-gray-50"
                      style={{ color: selectedFormId === form.id ? '#1B2A5C' : '#475569', fontWeight: selectedFormId === form.id ? 600 : 400 }}
                    >
                      <FileText className="w-4 h-4 shrink-0" style={{ color: '#8B1A2A' }} />
                      <div className="truncate">
                        <div className="truncate font-medium">{form.title}</div>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{form.category || 'General'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Phone — desktop only */}
          <a
            href="tel:+2348162153670"
            className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{ color: '#1B2A5C', background: '#f0f3f8' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0f3f8')}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+234 816 215 3670</span>
          </a>

          {/* Admin Portal */}
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:text-[#1B2A5C] hover:border-[#1B2A5C] hover:bg-slate-50 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#B8962E]" />
            <span className="hidden sm:inline">Admin CRM</span>
            <span className="sm:hidden">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
