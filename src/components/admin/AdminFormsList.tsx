import React, { useState } from 'react';
import { FormConfig, FormResponse } from '../../types';
import {
  PlusCircle,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Search,
  Link2,
  CloudUpload,
  CheckCircle2,
} from 'lucide-react';

interface AdminFormsListProps {
  forms: FormConfig[];
  responses: FormResponse[];
  onEditForm: (form: FormConfig) => void;
  onDuplicateForm: (form: FormConfig) => void;
  onToggleFormActive: (formId: string) => void;
  onDeleteForm: (formId: string) => void;
  onOpenNewFormBuilder: () => void;
  onPreviewPublicForm: (formId: string) => void;
  onBulkSyncToFirestore?: (forms: FormConfig[]) => Promise<void>;
}

export const AdminFormsList: React.FC<AdminFormsListProps> = ({
  forms,
  responses,
  onEditForm,
  onDuplicateForm,
  onToggleFormActive,
  onDeleteForm,
  onOpenNewFormBuilder,
  onPreviewPublicForm,
  onBulkSyncToFirestore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const copyFormLink = (formId: string) => {
    const url = `${window.location.origin}/?formId=${formId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    });
  };

  const handleBulkSync = async () => {
    if (!onBulkSyncToFirestore) return;
    setIsSyncing(true);
    try {
      await onBulkSyncToFirestore(forms);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    } catch (e) {
      console.warn('Bulk sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredForms = forms.filter((form) => {
    const matchesCategory = categoryFilter === 'All' || form.category === categoryFilter;
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getResponseCountForForm = (formId: string) => {
    return responses.filter((r) => r.formId === formId).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#131B2E]">Forms Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build, edit, duplicate, and control active status for all inquiry forms.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {onBulkSyncToFirestore && (
            <button
              onClick={handleBulkSync}
              disabled={isSyncing}
              title="Push all forms to Firebase Firestore so all devices stay in sync"
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                syncDone
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              } disabled:opacity-60`}
            >
              {syncDone ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Synced!</span></>
              ) : isSyncing ? (
                <><CloudUpload className="w-3.5 h-3.5 animate-pulse" /><span>Syncing...</span></>
              ) : (
                <><CloudUpload className="w-3.5 h-3.5" /><span>Sync to Cloud</span></>
              )}
            </button>
          )}
          <button
            onClick={onOpenNewFormBuilder}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#131B2E] hover:bg-slate-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A059]" />
            <span>Create New Form</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['All', 'Sales', 'Rentals', 'Property Management'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-[#131B2E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#131B2E]"
          />
        </div>
      </div>

      {/* Forms Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Quick Tip */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>💡 <strong>Public Visibility:</strong> Click the status pill or the eye icon to instantly hide/show any form. Use <strong>Copy Link</strong> to share a direct form URL with a client.</span>
          <span className="font-semibold text-slate-400">Total Forms: {filteredForms.length}</span>
        </div>

        {filteredForms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Form Title & Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Fields</th>
                  <th className="py-3.5 px-4 text-center">Submissions</th>
                  <th className="py-3.5 px-4 text-center">Public Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredForms.map((form) => {
                  const respCount = getResponseCountForForm(form.id);

                  return (
                    <tr key={form.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-bold text-[#131B2E] text-sm flex items-center gap-2">
                          <span>{form.title}</span>
                          {!form.isActive && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 truncate text-xs mt-0.5">
                          {form.description}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {form.category || 'General'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        {form.fields.length}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {respCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => onToggleFormActive(form.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                            form.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={form.isActive ? 'Click to hide this form from public site' : 'Click to show this form on public site'}
                        >
                          {form.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Visible on Site</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              <span>Hidden from Site</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Form Link */}
                          <button
                            onClick={() => copyFormLink(form.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              copiedFormId === form.id
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate-500 hover:text-[#131B2E] hover:bg-slate-100'
                            }`}
                            title="Copy shareable form link to clipboard"
                          >
                            {copiedFormId === form.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Link2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Toggle Visibility */}
                          <button
                            onClick={() => onToggleFormActive(form.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              form.isActive
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={form.isActive ? 'Hide form from public site' : 'Show form on public site'}
                          >
                            {form.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* Preview Public View */}
                          <button
                            onClick={() => onPreviewPublicForm(form.id)}
                            className="p-1.5 text-slate-500 hover:text-[#131B2E] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview Public Form"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Form */}
                          <button
                            onClick={() => onEditForm(form)}
                            className="p-1.5 text-slate-500 hover:text-[#131B2E] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Form Builder"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Duplicate Form */}
                          <button
                            onClick={() => onDuplicateForm(form)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Form"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete Form Permanently */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${form.title}"? This form will be permanently deleted and removed from the public website.`)) {
                                onDeleteForm(form.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove / Delete Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 p-6">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No forms found.</p>
            <p className="text-xs text-slate-400 mt-1">Create a new form to start receiving client inquiries.</p>
            <button
              onClick={onOpenNewFormBuilder}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#131B2E] hover:bg-slate-800"
            >
              Create Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
