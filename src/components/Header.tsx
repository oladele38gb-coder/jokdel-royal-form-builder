import React, { useState } from 'react';
import { Logo } from './Logo';
import { FormConfig } from '../types';
import { Shield, ChevronDown, FileText, Phone, Home, Layers } from 'lucide-react';

interface HeaderProps {
  forms: FormConfig[];
  selectedFormId: string | null;
  onSelectForm: (formId: string | null) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  forms,
  selectedFormId,
  onSelectForm,
  onOpenAdmin,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeForms = forms.filter((f) => f.isActive);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onSelectForm(null);
            setDropdownOpen(false);
          }}
          className="hover:opacity-90 transition-opacity focus:outline-hidden text-left"
        >
          <Logo variant="inline" height={80} />
        </button>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Services / Forms Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#131B2E] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Layers className="w-4 h-4 text-[#131B2E]" />
              <span className="hidden sm:inline">Inquiry Forms</span>
              <span className="sm:hidden">Forms</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Available Inquiry Services
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectForm(null);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                      selectedFormId === null ? 'bg-slate-50 font-semibold text-[#131B2E]' : 'text-slate-700'
                    }`}
                  >
                    <Home className="w-4 h-4 text-slate-500" />
                    <span>All Inquiry Forms</span>
                  </button>
                  {activeForms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => {
                        onSelectForm(form.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                        selectedFormId === form.id ? 'bg-slate-50 font-semibold text-[#131B2E]' : 'text-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-[#6E1E1E]" />
                      <div className="truncate">
                        <div className="truncate font-medium">{form.title}</div>
                        <span className="text-xs text-slate-400">{form.category || 'General'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Contact Tag (Desktop) */}
          <a
            href="tel:+2348034567890"
            className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#131B2E]" />
            <span>+234 803 456 7890</span>
          </a>

          {/* Staff / Admin Portal Link */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#162744] px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg shadow-2xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059]" />
            <span>Admin CRM</span>
          </button>
        </div>
      </div>
    </header>
  );
};
