import React, { useState } from 'react';
import { FormConfig, FormResponse } from '../../types';
import {
  PlusCircle,
  Copy,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Power,
  FileSpreadsheet,
  Calendar,
  Layers,
  Search
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

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
        <button
          onClick={onOpenNewFormBuilder}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#131B2E] hover:bg-slate-800 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-[#C5A059]" />
          <span>Create New Form</span>
        </button>
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
        {filteredForms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Form Title & Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Fields</th>
                  <th className="py-3.5 px-4 text-center">Submissions</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredForms.map((form) => {
                  const respCount = getResponseCountForForm(form.id);

                  return (
                    <tr key={form.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-bold text-[#131B2E] text-sm">{form.title}</div>
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            form.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Click to toggle Active/Inactive"
                        >
                          <Power className="w-3 h-3" />
                          <span>{form.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Public View */}
                          <button
                            onClick={() => onPreviewPublicForm(form.id)}
                            className="p-1.5 text-slate-500 hover:text-[#131B2E] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Preview Public Form"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Form */}
                          <button
                            onClick={() => onEditForm(form)}
                            className="p-1.5 text-slate-500 hover:text-[#131B2E] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Form Builder"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Duplicate Form */}
                          <button
                            onClick={() => onDuplicateForm(form)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Duplicate Form"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete Form */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${form.title}"?`)) {
                                onDeleteForm(form.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Form"
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
