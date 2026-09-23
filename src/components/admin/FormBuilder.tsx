import React, { useState } from 'react';
import { FormConfig, FormField, FieldType, FormOption } from '../../types';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  ArrowLeft,
  GripVertical,
  ListPlus,
  Type,
  AlignLeft,
  Mail,
  Phone,
  List,
  CheckSquare,
  Hash,
  CalendarDays,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface FormBuilderProps {
  initialForm?: FormConfig | null;
  onSave: (form: FormConfig) => void;
  onCancel: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialForm?.title || 'New Real Estate Inquiry Form');
  const [description, setDescription] = useState(
    initialForm?.description || 'Please complete the details below and our team will get in touch.'
  );
  const [category, setCategory] = useState<any>(initialForm?.category || 'Sales');
  const [isActive, setIsActive] = useState(initialForm ? initialForm.isActive : true);

  const [fields, setFields] = useState<FormField[]>(
    initialForm?.fields || [
      {
        id: 'f-1',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter full name',
        required: true,
      },
      {
        id: 'f-2',
        type: 'email',
        label: 'Email Address',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        id: 'f-3',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '0816 215 3670',
        required: true,
      },
    ]
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(fields[0]?.id || null);

  // Field Type options including file and image
  const fieldTypes: { type: FieldType; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
    { type: 'textarea', label: 'Long Text / Area', icon: <AlignLeft className="w-4 h-4" /> },
    { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { type: 'phone', label: 'Phone Number', icon: <Phone className="w-4 h-4" /> },
    { type: 'select', label: 'Dropdown Select', icon: <List className="w-4 h-4" /> },
    { type: 'radio', label: 'Radio Buttons', icon: <ListPlus className="w-4 h-4" /> },
    { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="w-4 h-4" /> },
    { type: 'number', label: 'Number', icon: <Hash className="w-4 h-4" /> },
    { type: 'date', label: 'Date', icon: <CalendarDays className="w-4 h-4" /> },
    { type: 'file', label: 'File Upload (PDF/Doc)', icon: <Upload className="w-4 h-4" /> },
    { type: 'image', label: 'Passport/Image Photo', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const handleAddField = (type: FieldType) => {
    const newFieldId = `f-${Date.now()}`;
    const defaultOptions: FormOption[] = ['select', 'radio', 'checkbox'].includes(type)
      ? [
          { id: `opt-1`, label: 'Option 1', value: 'Option 1' },
          { id: `opt-2`, label: 'Option 2', value: 'Option 2' },
        ]
      : [];

    const newField: FormField = {
      id: newFieldId,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '',
      required: false,
      options: defaultOptions,
      maxSizeMb: type === 'file' || type === 'image' ? 5 : undefined,
      accept: type === 'image' ? 'image/*' : type === 'file' ? '.pdf,.jpg,.png' : undefined,
    };

    setFields([...fields, newField]);
    setEditingFieldId(newFieldId);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const handleRemoveField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (editingFieldId === fieldId) {
      setEditingFieldId(null);
    }
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);
    setFields(newFields);
  };

  // Option management for select, radio, checkbox
  const handleAddOption = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        const currentOpts = f.options || [];
        const optNum = currentOpts.length + 1;
        const newOpt: FormOption = {
          id: `opt-${Date.now()}`,
          label: `Option ${optNum}`,
          value: `Option ${optNum}`,
        };
        return { ...f, options: [...currentOpts, newOpt] };
      })
    );
  };

  const handleUpdateOption = (fieldId: string, optionId: string, newLabel: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        const updatedOpts = (f.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, label: newLabel, value: newLabel } : opt
        );
        return { ...f, options: updatedOpts };
      })
    );
  };

  const handleRemoveOption = (fieldId: string, optionId: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        return { ...f, options: (f.options || []).filter((opt) => opt.id !== optionId) };
      })
    );
  };

  const handleSaveForm = () => {
    if (!title.trim()) {
      alert('Please provide a form title.');
      return;
    }
    if (fields.length === 0) {
      alert('Please add at least one field to your form.');
      return;
    }

    const savedForm: FormConfig = {
      id: initialForm?.id || `form-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category: category as any,
      isActive,
      createdAt: initialForm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields,
      noticeBox: initialForm?.noticeBox,
      headerNotice: initialForm?.headerNotice,
    };

    onSave(savedForm);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#131B2E] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Forms</span>
          </button>
          <h1 className="font-serif text-2xl font-bold text-[#131B2E]">
            {initialForm ? 'Edit Form' : 'Create New Inquiry Form'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Mobile Tabs */}
          <div className="lg:hidden flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'editor' ? 'bg-white text-[#131B2E] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'preview' ? 'bg-white text-[#131B2E] shadow-2xs' : 'text-slate-600'
              }`}
            >
              Live Preview
            </button>
          </div>

          <button
            onClick={handleSaveForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D3557] hover:bg-[#162744] transition-colors shadow-xs"
          >
            <Save className="w-4 h-4 text-[#C5A059]" />
            <span>Save Form Configuration</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EDITOR */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            activeTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Form Meta Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#131B2E] uppercase tracking-wider border-b border-slate-100 pb-2">
              Form Header & Settings
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Form Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-[#131B2E] focus:outline-hidden focus:border-[#131B2E]"
                placeholder="Enter form title"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Description / Intro Text
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-[#131B2E]"
                placeholder="Brief instructions for submitters..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
                >
                  <option value="Sales">Sales</option>
                  <option value="Rentals">Rentals</option>
                  <option value="Property Management">Property Management</option>
                  <option value="KYC & Engagement">KYC & Engagement</option>
                  <option value="Tenancy">Tenancy</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Public Status
                </label>
                <label className="mt-1 flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded-sm text-[#131B2E] focus:ring-[#131B2E]"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {isActive ? 'Active on Site' : 'Inactive (Hidden)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Add Field Palette */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-[#131B2E] uppercase tracking-wider mb-3">
              Add Form Field
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fieldTypes.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => handleAddField(ft.type)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-[#131B2E] hover:text-white hover:border-[#131B2E] text-slate-700 text-xs font-semibold transition-colors text-left"
                >
                  {ft.icon}
                  <span className="truncate">{ft.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fields List & Inspector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#131B2E] uppercase tracking-wider border-b border-slate-100 pb-2">
              Configured Form Fields ({fields.length})
            </h2>

            {fields.map((field, index) => {
              const isSelected = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  className={`rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-[#131B2E] bg-slate-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Field Bar */}
                  <div
                    onClick={() => setEditingFieldId(isSelected ? null : field.id)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#131B2E]">{field.label}</span>
                          {field.required && (
                            <span className="text-[10px] text-[#6E1E1E] font-bold">*Required</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          Type: {field.type} {field.section ? `(${field.section})` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveField(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveField(index, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Field Settings Accordion */}
                  {isSelected && (
                    <div className="p-4 pt-0 border-t border-slate-200/80 space-y-3 bg-white rounded-b-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              handleUpdateField(field.id, { label: e.target.value })
                            }
                            className="mt-1 w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">
                            Section Heading (Optional Grouping)
                          </label>
                          <input
                            type="text"
                            value={field.section || ''}
                            onChange={(e) =>
                              handleUpdateField(field.id, { section: e.target.value })
                            }
                            placeholder="Enter section heading (e.g. Section A: Personal Details)"
                            className="mt-1 w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">
                            Placeholder Text
                          </label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) =>
                              handleUpdateField(field.id, { placeholder: e.target.value })
                            }
                            className="mt-1 w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">
                            Help Text
                          </label>
                          <input
                            type="text"
                            value={field.helpText || ''}
                            onChange={(e) =>
                              handleUpdateField(field.id, { helpText: e.target.value })
                            }
                            placeholder="Sub-label guide for users..."
                            className="mt-1 w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* File / Image settings */}
                      {(field.type === 'file' || field.type === 'image') && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Accepted Formats
                            </label>
                            <input
                              type="text"
                              value={field.accept || ''}
                              onChange={(e) =>
                                handleUpdateField(field.id, { accept: e.target.value })
                              }
                              placeholder=".pdf,.jpg,.png or image/*"
                              className="mt-1 w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Max File Size (MB)
                            </label>
                            <input
                              type="number"
                              value={field.maxSizeMb || 5}
                              onChange={(e) =>
                                handleUpdateField(field.id, { maxSizeMb: Number(e.target.value) || 5 })
                              }
                              className="mt-1 w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              handleUpdateField(field.id, { required: e.target.checked })
                            }
                            className="rounded-sm text-[#131B2E] focus:ring-[#131B2E]"
                          />
                          <span>Required Field</span>
                        </label>
                      </div>

                      {/* Options editor for select, radio, checkbox */}
                      {['select', 'radio', 'checkbox'].includes(field.type) && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-700">
                              Options List
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddOption(field.id)}
                              className="text-[11px] font-bold text-[#6E1E1E] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Option</span>
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {field.options?.map((opt) => (
                              <div key={opt.id} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) =>
                                    handleUpdateOption(field.id, opt.id, e.target.value)
                                  }
                                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(field.id, opt.id)}
                                  className="text-slate-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div
          className={`lg:col-span-5 ${
            activeTab === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#131B2E] uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#C5A059]" />
                <span>Live Public Preview</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Real-time Rendering
              </span>
            </div>

            {/* Preview Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 max-h-[600px] overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-[#6E1E1E] uppercase tracking-wider">
                  {category}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#131B2E]">
                  {title || 'Untitled Form'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {description || 'Form description preview...'}
                </p>
              </div>

              {/* Preview Form Fields */}
              <div className="space-y-3 pt-2">
                {fields.map((f) => (
                  <div key={f.id} className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      {f.label} {f.required && <span className="text-[#6E1E1E]">*</span>}
                    </label>

                    {f.type === 'textarea' ? (
                      <textarea
                        disabled
                        rows={2}
                        placeholder={f.placeholder || ''}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-400"
                      />
                    ) : f.type === 'select' ? (
                      <select disabled className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-400">
                        <option>{f.placeholder || '-- Select option --'}</option>
                        {f.options?.map((o) => (
                          <option key={o.id}>{o.label}</option>
                        ))}
                      </select>
                    ) : f.type === 'radio' || f.type === 'checkbox' ? (
                      <div className="space-y-1">
                        {f.options?.map((o) => (
                          <div key={o.id} className="flex items-center gap-2 text-xs text-slate-600">
                            <input type={f.type} disabled className="text-[#131B2E]" />
                            <span>{o.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : f.type === 'file' || f.type === 'image' ? (
                      <div className="p-3 border border-dashed border-slate-300 bg-white rounded-lg text-center text-xs text-slate-400">
                        File / Image upload box (Max {f.maxSizeMb || 5}MB)
                      </div>
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                        disabled
                        placeholder={f.placeholder || ''}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-400"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#131B2E] opacity-90 shadow-xs"
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
