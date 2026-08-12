import React, { useState } from 'react';
import { CompanySettings } from '../../types';
import { Save, RefreshCw, CheckCircle2, Building, Phone, Mail, MapPin, MessageSquare, Bell } from 'lucide-react';

interface AdminSettingsProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
  onResetSampleData: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetSampleData,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#131B2E]">Company Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage company brand info, WhatsApp fallback contact, and email notification preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Company settings saved successfully!</span>
          </div>
        )}

        {/* Company Profile Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-[#131B2E] uppercase tracking-wider border-b border-slate-100 pb-2">
            Company Contact Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-[#131B2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Office Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Notification Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-[#131B2E] uppercase tracking-wider border-b border-slate-100 pb-2">
            Quick Actions & Fallbacks
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              WhatsApp Fallback Number (Without + or spaces)
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="2348034567890"
              required
              className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used to generate the instant WhatsApp contact button on form completion screens.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableEmailNotifications}
                onChange={(e) =>
                  setFormData({ ...formData, enableEmailNotifications: e.target.checked })
                }
                className="rounded-sm text-[#131B2E] focus:ring-[#131B2E]"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">New Submission Email Alerts</p>
                <p className="text-[11px] text-slate-500">
                  Send real-time lead notification summaries to staff email upon client submission.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#1D3557] hover:bg-[#162744] transition-colors shadow-xs"
          >
            <Save className="w-4 h-4 text-[#C5A059]" />
            <span>Save Company Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone / Reset Demo Data */}
      <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-2xs space-y-3 mt-10">
        <h2 className="text-sm font-bold text-[#6E1E1E] uppercase tracking-wider">
          Reset / Seed Prototype Demo Data
        </h2>
        <p className="text-xs text-slate-600">
          Re-seed the initial Jokdel Royal forms and sample client lead entries. Useful for demonstration and reset testing.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all forms and leads to initial sample dataset?')) {
              onResetSampleData();
              alert('Sample dataset restored!');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#6E1E1E] bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Forms & Leads</span>
        </button>
      </div>
    </div>
  );
};
