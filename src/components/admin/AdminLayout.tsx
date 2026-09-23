import React, { useState } from 'react';
import { Logo } from '../Logo';
import { FormResponse } from '../../types';
import {
  LayoutDashboard, FileSpreadsheet, Users, Settings,
  LogOut, ExternalLink, Menu, X, Home,
} from 'lucide-react';

interface AdminLayoutProps {
  activeTab: 'dashboard' | 'forms' | 'responses' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'forms' | 'responses' | 'settings') => void;
  responses: FormResponse[];
  onLogout: () => void;
  onViewPublicSite: () => void;
  onOpenNewFormBuilder: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab, setActiveTab, responses, onLogout, onViewPublicSite, onOpenNewFormBuilder, children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const newLeadsCount = responses.filter((r) => r.status === 'New').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'forms',     label: 'Forms Manager', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'responses', label: 'Responses',     icon: <Users className="w-4 h-4" />, badge: newLeadsCount > 0 ? newLeadsCount : null },
    { id: 'settings',  label: 'Settings',      icon: <Settings className="w-4 h-4" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <div className="bg-white rounded-lg px-2 py-1.5 flex items-center">
            <Logo height={36} />
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          CRM Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                borderLeft: isActive ? '3px solid #B8962E' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: isActive ? '#B8962E' : 'rgba(255,255,255,0.45)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge != null && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white" style={{ background: '#8B1A2A' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={onViewPublicSite}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Home className="w-4 h-4" />
          <span>Public Form Site</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fca5a5', e.currentTarget.style.background = 'rgba(139,26,42,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)', e.currentTarget.style.background = 'transparent')}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#F7F8FA' }}>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="bg-white rounded-lg">
          <Logo height={36} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onViewPublicSite} className="p-2 text-gray-400 hover:text-gray-600">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 h-full" style={{ background: '#1B2A5C' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen sticky top-0" style={{ background: '#1B2A5C' }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
