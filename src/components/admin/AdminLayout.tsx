import React, { useState } from 'react';
import { FormResponse } from '../../types';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  PlusCircle,
  Home
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
  activeTab,
  setActiveTab,
  responses,
  onLogout,
  onViewPublicSite,
  onOpenNewFormBuilder,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const newLeadsCount = responses.filter((r) => r.status === 'New').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'forms',
      label: 'Forms Manager',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'responses',
      label: 'Responses & Leads',
      icon: <Users className="w-5 h-5" />,
      badge: newLeadsCount > 0 ? newLeadsCount : null,
    },
    {
      id: 'settings',
      label: 'Company Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#131B2E] text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex flex-col leading-tight">
          <span className="font-serif font-bold text-white text-lg tracking-wider">JOKDEL ROYAL</span>
          <span className="text-[10px] text-slate-400 tracking-widest uppercase">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewPublicSite}
            className="p-2 text-slate-300 hover:text-white"
            title="View Public Form Site"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop / Mobile Sidebar Overlay */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-[#131B2E] text-white flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Section */}
          <div className="px-2 py-4 border-b border-slate-800/80 mb-6 flex items-center justify-between">
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-bold text-white text-xl tracking-wider">JOKDEL ROYAL</span>
              <span className="text-[10px] text-slate-400 tracking-widest uppercase mt-0.5">CRM Admin Panel</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add Form Action */}
          <div className="px-2 mb-6">
            <button
              onClick={() => {
                onOpenNewFormBuilder();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#6E1E1E] hover:bg-[#852525] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#C5A059]" />
              <span>Create New Form</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-2">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
              Management Menu
            </p>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-xs border-l-4 border-[#C5A059]'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#C5A059]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#6E1E1E] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Public Site Switcher */}
          <div className="mt-8 px-2">
            <button
              onClick={onViewPublicSite}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white border border-slate-700/60 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Public Form Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>
          </div>
        </div>

        {/* Footer Admin User & Logout */}
        <div className="pt-4 border-t border-slate-800 px-2 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-[#C5A059] shrink-0">
                JR
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Staff Admin</p>
                <p className="text-[10px] text-slate-400 truncate">Jokdel Royal Real Estate</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
