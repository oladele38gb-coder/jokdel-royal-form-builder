import React, { useState } from 'react';
import { FormConfig, FormField, FileDataValue } from '../types';
import {
  ArrowLeft,
  Send,
  AlertCircle,
  Info,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

interface DynamicFormProps {
  form: FormConfig;
  onBack: () => void;
  onSubmit: (
    formData: Record<string, any>,
    submitterName: string,
    submitterEmail: string,
    submitterPhone: string
  ) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ form, onBack, onSubmit }) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    form.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        initial[field.id] = [];
      } else {
        initial[field.id] = field.defaultValue || '';
      }
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (fieldId: string, optionValue: string) => {
    setFormValues((prev) => {
      const current = Array.isArray(prev[fieldId]) ? [...prev[fieldId]] : [];
      const index = current.indexOf(optionValue);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(optionValue);
      }
      return { ...prev, [fieldId]: current };
    });
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleFileUpload = (field: FormField, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMb = field.maxSizeMb || 5;
    const fileSizeMb = Number((file.size / (1024 * 1024)).toFixed(2));

    if (fileSizeMb > maxMb) {
      setErrors((prev) => ({
        ...prev,
        [field.id]: `File size (${fileSizeMb}MB) exceeds maximum limit of ${maxMb}MB.`,
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileObj: FileDataValue = {
        fileName: file.name,
        fileType: file.type,
        fileSizeMb,
        dataUrl: reader.result as string,
      };
      handleInputChange(field.id, fileObj);
    };
    reader.readAsDataURL(file);
  };

  const isFieldVisible = (field: FormField) => {
    if (!field.conditionalOn) return true;
    const parentVal = formValues[field.conditionalOn.fieldId];
    if (!parentVal) return false;

    if (Array.isArray(field.conditionalOn.value)) {
      return field.conditionalOn.value.includes(String(parentVal));
    }
    return String(parentVal) === field.conditionalOn.value;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    form.fields.forEach((field) => {
      if (!isFieldVisible(field)) return;

      const val = formValues[field.id];

      // Required check
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!Array.isArray(val) || val.length === 0) {
            newErrors[field.id] = 'Please select at least one option';
          }
        } else if (field.type === 'file' || field.type === 'image') {
          if (!val || typeof val !== 'object' || !val.fileName) {
            newErrors[field.id] = `${field.label} upload is required`;
          }
        } else if (val === undefined || val === null || String(val).trim() === '') {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      // Format validations
      if (val && typeof val === 'string' && val.trim() !== '') {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            newErrors[field.id] = 'Please enter a valid email address';
          }
        }

        if (field.type === 'phone') {
          const digitsOnly = val.replace(/\D/g, '');
          if (digitsOnly.length < 8) {
            newErrors[field.id] = 'Please enter a valid phone number';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    let name = 'Client';
    let email = 'Not provided';
    let phone = 'Not provided';

    // Extract name, email, phone from values
    form.fields.forEach((field) => {
      const val = formValues[field.id];
      if (!val) return;
      if (typeof val === 'string') {
        if (field.type === 'email' || field.id.includes('email')) {
          email = val;
        } else if (field.type === 'phone' || field.id.includes('phone') || field.id.includes('mobile')) {
          phone = val;
        } else if (
          field.label.toLowerCase().includes('surname') ||
          field.label.toLowerCase().includes('name') ||
          field.id.includes('name') ||
          field.id.includes('fullname')
        ) {
          if (name === 'Client' || name.length < val.length) {
            name = val;
          }
        }
      }
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(formValues, name, email, phone);
    }, 400);
  };

  const handleCopyAccount = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Group fields by sections if present
  let currentSectionHeading = '';

  return (
    <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#131B2E] transition-colors mb-4 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#131B2E] transition-colors" />
        <span>Back to All Inquiry Forms</span>
      </button>

      {/* Form Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Document Banner / Header Notice if present */}
        {form.headerNotice && (
          <div className="bg-[#131B2E] text-white p-3 px-4 sm:px-6 text-center text-xs font-semibold tracking-wide flex flex-col sm:flex-row items-center justify-between gap-1 border-b border-slate-800">
            <span className="font-serif text-xs sm:text-sm italic font-bold tracking-wider">JOKDEL ROYAL NIG. LTD</span>
            <span className="text-slate-300 text-[10px] sm:text-[11px]">{form.headerNotice}</span>
          </div>
        )}

        <div className="p-4 sm:p-8">
          {/* Form Title Header */}
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-[#6E1E1E] text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-1.5">
              {form.category || 'Jokdel Royal Form'}
            </div>
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#131B2E] tracking-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          {/* Consultation Fee / Commitment Notice Box (Light Blue / Emerald Modern Redesign) */}
          {form.noticeBox && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 border border-emerald-200/90 rounded-xl sm:rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-950">
                    {form.noticeBox.title}
                  </h3>
                </div>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Required Action
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {form.noticeBox.description}
              </p>

              {form.noticeBox.bankDetails && (
                <div className="mt-3 p-3.5 sm:p-4 bg-white/95 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  {/* Fee Amount Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Required Commitment Fee
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 tracking-tight">
                      {form.noticeBox.bankDetails.amount}
                    </span>
                  </div>

                  {/* Bank & Account Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                        Banker & Account Name
                      </span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{form.noticeBox.bankDetails.bankName}</span>
                      </p>
                      <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                        Name: <strong className="text-slate-800">{form.noticeBox.bankDetails.accountName}</strong>
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 flex flex-col justify-between">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                        GTBank Account Number
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-1 bg-white p-1.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                        <span className="font-mono text-sm sm:text-base font-black tracking-wider text-slate-900 pl-1">
                          {form.noticeBox.bankDetails.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(form.noticeBox!.bankDetails!.accountNumber)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            copiedAccount
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                          }`}
                        >
                          {copiedAccount ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Fields Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {form.fields.map((field, idx) => {
              if (!isFieldVisible(field)) return null;

              const hasError = !!errors[field.id];

              // Check if field has a section header that needs to be displayed
              let renderSectionHeader = false;
              if (field.section && field.section !== currentSectionHeading) {
                currentSectionHeading = field.section;
                renderSectionHeader = true;
              }

              return (
                <React.Fragment key={field.id}>
                  {renderSectionHeader && (
                    <div className="pt-4 pb-1.5 border-b border-slate-200 mt-6 mb-3">
                      <h2 className="font-serif text-sm sm:text-base font-bold text-[#131B2E]">
                        {currentSectionHeading}
                      </h2>
                    </div>
                  )}

                  <div id={`field-${field.id}`} className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                      {field.label}
                      {field.required && <span className="text-[#6E1E1E] font-bold ml-1">*</span>}
                    </label>

                    {/* Input Element */}
                    {renderFieldInput(
                      field,
                      formValues[field.id],
                      (val) => handleInputChange(field.id, val),
                      (optVal) => handleCheckboxToggle(field.id, optVal),
                      (e) => handleFileUpload(field, e),
                      hasError
                    )}

                    {/* Help Text */}
                    {field.helpText && !hasError && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{field.helpText}</span>
                      </p>
                    )}

                    {/* Error Message */}
                    {hasError && (
                      <p className="text-xs text-[#6E1E1E] font-medium flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors[field.id]}</span>
                      </p>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Submit Button */}
            <div className="pt-8 border-t border-slate-100 mt-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#162744] focus:outline-hidden focus:ring-2 focus:ring-[#1D3557] focus:ring-offset-2 transition-all shadow-md disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Details...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#C5A059]" />
                    <span>Submit Form to Jokdel Royal</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Your information is kept strictly confidential in accordance with Jokdel Royal Terms.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

function renderFieldInput(
  field: FormField,
  value: any,
  onChange: (val: any) => void,
  onCheckboxToggle: (optVal: string) => void,
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  hasError: boolean
) {
  const baseInputClass = `w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white border text-slate-800 transition-colors focus:outline-hidden ${
    hasError
      ? 'border-[#6E1E1E] focus:ring-1 focus:ring-[#6E1E1E]'
      : 'border-slate-300 focus:border-[#131B2E] focus:ring-1 focus:ring-[#131B2E]'
  }`;

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter response...'}
          className={baseInputClass}
        />
      );

    case 'textarea':
      return (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter details...'}
          className={baseInputClass}
        />
      );

    case 'email':
      return (
        <input
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'e.g. name@example.com'}
          className={baseInputClass}
        />
      );

    case 'phone':
      return (
        <input
          type="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'e.g. 0816 215 3670'}
          className={baseInputClass}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '0'}
          className={baseInputClass}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} bg-right`}
        >
          <option value="" disabled>
            {field.placeholder || '-- Select an option --'}
          </option>
          {field.options?.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="space-y-2 mt-1">
          {field.options?.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                value === opt.value
                  ? 'border-[#131B2E] bg-slate-50 font-medium'
                  : 'border-slate-200 hover:bg-slate-50/60'
              }`}
            >
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="mt-0.5 text-[#131B2E] focus:ring-[#131B2E]"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      const selectedList: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2 mt-1">
          {field.options?.map((opt) => {
            const isChecked = selectedList.includes(opt.value);
            return (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  isChecked
                    ? 'border-[#131B2E] bg-slate-50 font-medium'
                    : 'border-slate-200 hover:bg-slate-50/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onCheckboxToggle(opt.value)}
                  className="mt-0.5 rounded-sm text-[#131B2E] focus:ring-[#131B2E]"
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    case 'file':
    case 'image':
      const fileData: FileDataValue | null = value && typeof value === 'object' ? value : null;
      const isImage = field.type === 'image' || field.accept?.includes('image');

      return (
        <div className="mt-1">
          {fileData ? (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                {isImage && fileData.dataUrl ? (
                  <img
                    src={fileData.dataUrl}
                    alt={fileData.fileName}
                    className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{fileData.fileName}</p>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Uploaded ({fileData.fileSizeMb} MB)</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${
                hasError ? 'border-red-300 bg-red-50/20' : 'border-slate-300'
              }`}
            >
              <input
                type="file"
                accept={field.accept || (isImage ? 'image/*' : '.pdf,.jpg,.png,.jpeg')}
                onChange={onFileUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#131B2E] mb-2">
                {isImage ? <ImageIcon className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click to select or drag file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {isImage ? 'JPG or PNG format' : 'PDF, JPG or PNG'} (Max limit: {field.maxSizeMb || 5}MB)
              </p>
            </label>
          )}
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      );
  }
}
