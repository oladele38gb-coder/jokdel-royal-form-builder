import React, { useState, useRef } from 'react';
import { FormConfig, FormField, FileDataValue } from '../types';
import { SignaturePad } from './SignaturePad';
import {
  ArrowLeft, Send, AlertCircle, Info, Upload, FileText,
  Image as ImageIcon, CheckCircle2, X, CreditCard, Building,
  ShieldCheck, Copy, Check, PenLine, Eye,
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
      if (field.type === 'checkbox') initial[field.id] = [];
      else initial[field.id] = field.defaultValue || '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const isTenancyForm = form.id === 'form-tenancy-data';

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
    }
  };

  const handleCheckboxToggle = (fieldId: string, optionValue: string) => {
    setFormValues((prev) => {
      const current = Array.isArray(prev[fieldId]) ? [...prev[fieldId]] : [];
      const index = current.indexOf(optionValue);
      if (index > -1) current.splice(index, 1);
      else current.push(optionValue);
      return { ...prev, [fieldId]: current };
    });
    if (errors[fieldId]) setErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
  };

  const handleFileUpload = (field: FormField, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMb = field.maxSizeMb || 5;
    const fileSizeMb = Number((file.size / (1024 * 1024)).toFixed(2));
    if (fileSizeMb > maxMb) {
      setErrors((prev) => ({ ...prev, [field.id]: `File size (${fileSizeMb}MB) exceeds the ${maxMb}MB limit.` }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const fileObj: FileDataValue = { fileName: file.name, fileType: file.type, fileSizeMb, dataUrl: reader.result as string };
      handleInputChange(field.id, fileObj);
    };
    reader.readAsDataURL(file);
  };

  const isFieldVisible = (field: FormField) => {
    if (!field.conditionalOn) return true;
    const parentVal = formValues[field.conditionalOn.fieldId];
    if (!parentVal) return false;
    if (Array.isArray(field.conditionalOn.value)) return field.conditionalOn.value.includes(String(parentVal));
    return String(parentVal) === field.conditionalOn.value;
  };

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      if (!isFieldVisible(field)) return;
      const val = formValues[field.id];

      // Tenancy form signature field is handled specifically below
      if (isTenancyForm && field.id === 't-signature-fullname') {
        return;
      }

      if (field.required) {
        if (field.type === 'checkbox') {
          if (!Array.isArray(val) || val.length === 0) newErrors[field.id] = 'Please select / accept this declaration.';
        } else if (field.type === 'file' || field.type === 'image') {
          if (!val || typeof val !== 'object' || !val.fileName) newErrors[field.id] = `Please upload ${field.label}.`;
        } else if (val === undefined || val === null || String(val).trim() === '') {
          newErrors[field.id] = `${field.label} is required.`;
        }
      }
      if (val && typeof val === 'string' && val.trim() !== '') {
        const trimmed = val.trim();
        const isNa = /^(n\/?a|nil|none|no|-)$/i.test(trimmed);
        if (field.type === 'email' && !isNa && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          newErrors[field.id] = 'Please enter a valid email address.';
        }
        if (field.type === 'phone' && !isNa && trimmed.replace(/\D/g, '').length < 7) {
          newErrors[field.id] = 'Please enter a valid phone number (at least 7 digits).';
        }
      }
    });

    // Signature handling on tenancy form
    if (isTenancyForm) {
      if (!signatureDataUrl) {
        newErrors['__signature__'] = 'Please draw and apply your signature before submitting.';
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleAutoFillDemo = () => {
    const demoValues: Record<string, any> = {};
    form.fields.forEach((field) => {
      if (field.type === 'email') demoValues[field.id] = 'oladele.client@gmail.com';
      else if (field.type === 'phone') demoValues[field.id] = '0816 215 3670';
      else if (field.type === 'number') demoValues[field.id] = 3;
      else if (field.type === 'date') demoValues[field.id] = '2026-09-23';
      else if (field.type === 'select') demoValues[field.id] = field.options?.[0]?.value || '';
      else if (field.type === 'radio') demoValues[field.id] = field.options?.[0]?.value || '';
      else if (field.type === 'checkbox') demoValues[field.id] = field.options?.map(o => o.value) || ['Accepted'];
      else if (field.type === 'file' || field.type === 'image') {
        demoValues[field.id] = {
          fileName: `${field.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_sample.png`,
          fileType: 'image/png',
          fileSizeMb: 0.15,
          dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        };
      } else {
        demoValues[field.id] = field.id.includes('name') ? 'Oladele Babatunde' : `Sample ${field.label}`;
      }
    });
    setFormValues(demoValues);
    if (isTenancyForm) {
      // Sample 1-pixel transparent PNG dataUrl for demo signature
      setSignatureDataUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    }
    setErrors({});
  };

  const scrollToField = (fieldKey: string) => {
    const targetId = (fieldKey === '__signature__' || fieldKey === 't-signature-fullname')
      ? 'field-t-signature-fullname'
      : `field-${fieldKey}`;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = el.querySelector('input, select, textarea, button') as HTMLElement | null;
      focusable?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      scrollToField(errorKeys[0]);
      return;
    }
    setIsSubmitting(true);

    let name = 'Client', email = 'Not provided', phone = 'Not provided';
    // Extract name
    if (formValues['t-surname'] || formValues['t-othernames']) {
      const combined = `${formValues['t-surname'] || ''} ${formValues['t-othernames'] || ''}`.trim();
      if (combined) name = combined;
    }

    form.fields.forEach((field) => {
      const val = formValues[field.id];
      if (!val || typeof val !== 'string') return;
      if (field.type === 'email' || field.id.includes('email')) email = val;
      else if (field.type === 'phone' || field.id.includes('phone') || field.id.includes('mobile')) phone = val;
      else if (name === 'Client' && (field.label.toLowerCase().includes('surname') || field.label.toLowerCase().includes('name') || field.id.includes('name') || field.id.includes('fullname'))) {
        name = val;
      }
    });

    const finalData = { ...formValues };
    if (signatureDataUrl) finalData['__signature_image__'] = signatureDataUrl;
    if (isTenancyForm && (!finalData['t-signature-fullname'] || finalData['t-signature-fullname'] === '')) {
      finalData['t-signature-fullname'] = name !== 'Client' ? name : 'Signed Digitally';
    }

    setTimeout(() => { setIsSubmitting(false); onSubmit(finalData, name, email, phone); }, 400);
  };

  const handleCopyAccount = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  let currentSectionHeading = '';

  // Count required fields filled for progress
  const requiredFields = form.fields.filter(f => f.required && isFieldVisible(f));
  const filledRequired = requiredFields.filter(f => {
    if (isTenancyForm && f.id === 't-signature-fullname') return !!signatureDataUrl;
    const val = formValues[f.id];
    if (f.type === 'checkbox') return Array.isArray(val) && val.length > 0;
    if (f.type === 'file' || f.type === 'image') return val && typeof val === 'object' && val.fileName;
    return val !== undefined && val !== null && String(val).trim() !== '';
  });
  const progressPct = requiredFields.length > 0 ? Math.round((filledRequired.length / requiredFields.length) * 100) : 0;
  const allFilled = progressPct === 100 && (!isTenancyForm || !!signatureDataUrl);

  return (
    <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {showSignaturePad && (
        <SignaturePad
          tenantName={formValues['t-othernames'] ? `${formValues['t-surname'] || ''} ${formValues['t-othernames'] || ''}`.trim() : undefined}
          onSave={(dataUrl) => {
            setSignatureDataUrl(dataUrl);
            const fullName = `${formValues['t-surname'] || ''} ${formValues['t-othernames'] || ''}`.trim();
            if (fullName && !formValues['t-signature-fullname']) {
              handleInputChange('t-signature-fullname', fullName);
            }
            if (errors['__signature__'] || errors['t-signature-fullname']) {
              setErrors(p => {
                const n = {...p};
                delete n['__signature__'];
                delete n['t-signature-fullname'];
                return n;
              });
            }
          }}
          onClose={() => setShowSignaturePad(false)}
        />
      )}

      {/* Back */}
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors group" style={{ color: '#64748b' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#1B2A5C')} onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to All Forms
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" ref={formRef}>
        {/* Form header notice (tenancy letterhead strip) */}
        {form.headerNotice && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 px-5 py-3 text-xs" style={{ background: '#1B2A5C' }}>
            <span className="font-serif font-bold text-white tracking-wider text-sm">JOKDEL ROYAL NIG. LTD</span>
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>{form.headerNotice}</span>
          </div>
        )}

        {/* Progress bar */}
        {requiredFields.length > 0 && (
          <div className="h-1 w-full" style={{ background: '#f1f5f9' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: progressPct === 100 ? '#15803d' : '#1B2A5C' }}
            />
          </div>
        )}

        <div className="p-5 sm:p-8">
          {/* Title */}
          <div className="border-b border-gray-100 pb-4 mb-6">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase mb-1.5" style={{ background: 'rgba(27,42,92,0.07)', color: '#1B2A5C' }}>
              {form.category || 'Jokdel Royal'}
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold" style={{ color: '#1B2A5C' }}>{form.title}</h1>
            {form.description && <p className="mt-1 text-sm" style={{ color: '#64748b' }}>{form.description}</p>}
            {requiredFields.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <p className="text-xs" style={{ color: progressPct === 100 ? '#15803d' : '#94a3b8' }}>
                  {filledRequired.length} of {requiredFields.length} required fields completed ({progressPct}%)
                </p>
                {progressPct < 100 && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstMissing = requiredFields.find(f => {
                        if (isTenancyForm && f.id === 't-signature-fullname') return !signatureDataUrl;
                        const val = formValues[f.id];
                        if (f.type === 'checkbox') return !Array.isArray(val) || val.length === 0;
                        if (f.type === 'file' || f.type === 'image') return !val || typeof val !== 'object' || !val.fileName;
                        return val === undefined || val === null || String(val).trim() === '';
                      });
                      if (firstMissing) scrollToField(firstMissing.id);
                    }}
                    className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    Jump to next required field →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Top Error Alert if submission attempted with missing fields */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 rounded-xl border text-xs" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#8B1A2A' }}>
              <div className="flex items-center gap-2 font-bold mb-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Unable to submit: {Object.keys(errors).length} required item(s) need your attention:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-slate-700">
                {Object.entries(errors).map(([fieldKey, errText]) => (
                  <li key={fieldKey}>
                    <button
                      type="button"
                      onClick={() => scrollToField(fieldKey)}
                      className="hover:underline font-medium text-left text-red-800 cursor-pointer"
                    >
                      {errText} <span className="text-[10px] text-slate-400 font-normal">→ click to jump</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fee Notice Box */}
          {form.noticeBox && (
            <div className="mb-6 p-4 sm:p-5 rounded-xl border" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="flex items-center gap-2 border-b border-amber-200 pb-2.5 mb-3">
                <ShieldCheck className="w-4 h-4" style={{ color: '#92400e' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#92400e' }}>{form.noticeBox.title}</h3>
              </div>
              <p className="text-sm mb-3" style={{ color: '#78350f' }}>{form.noticeBox.description}</p>
              {form.noticeBox.bankDetails && (
                <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      <CreditCard className="w-4 h-4 inline mr-1" style={{ color: '#92400e' }} />
                      Commitment Fee
                    </span>
                    <span className="text-2xl font-black font-mono" style={{ color: '#92400e' }}>{form.noticeBox.bankDetails.amount}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg" style={{ background: '#fafafa', border: '1px solid #f1f5f9' }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: '#94a3b8' }}>Bank & Name</span>
                      <p className="font-bold flex items-center gap-1.5" style={{ color: '#1e293b' }}>
                        <Building className="w-3.5 h-3.5" style={{ color: '#92400e' }} />
                        {form.noticeBox.bankDetails.bankName}
                      </p>
                      <p className="mt-0.5" style={{ color: '#64748b' }}>Acct: <strong style={{ color: '#1e293b' }}>{form.noticeBox.bankDetails.accountName}</strong></p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ background: '#fafafa', border: '1px solid #f1f5f9' }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: '#94a3b8' }}>Account Number</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-base font-black" style={{ color: '#1e293b' }}>{form.noticeBox.bankDetails.accountNumber}</span>
                        <button type="button" onClick={() => handleCopyAccount(form.noticeBox!.bankDetails!.accountNumber)}
                          className="px-2 py-1 rounded-md text-[11px] font-bold text-white transition-all" style={{ background: copiedAccount ? '#15803d' : '#92400e' }}>
                          {copiedAccount ? <><Check className="w-3 h-3 inline" /> Copied</> : <><Copy className="w-3 h-3 inline" /> Copy</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {form.fields.map((field) => {
                if (!isFieldVisible(field)) return null;
                const hasError = !!errors[field.id];

                let renderSectionHeader = false;
                if (field.section && field.section !== currentSectionHeading) {
                  currentSectionHeading = field.section;
                  renderSectionHeader = true;
                }

                // Special handling: Section E tenancy declaration name & signature pad UI
                if (isTenancyForm && field.id === 't-signature-fullname') {
                  return (
                    <React.Fragment key={field.id}>
                      {renderSectionHeader && <SectionHeader title={currentSectionHeading} />}
                      <div id={`field-${field.id}`} className="space-y-4">
                        {/* Legal Name declaration text input */}
                        <div className="space-y-1">
                          <label className="block text-sm font-semibold" style={{ color: '#1e293b' }}>
                            Full Name Signature Declaration & Date
                          </label>
                          <input
                            type="text"
                            value={formValues['t-signature-fullname'] || ''}
                            onChange={e => handleInputChange('t-signature-fullname', e.target.value)}
                            placeholder="Enter your full legal name as digital signature"
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white border border-gray-200 transition-colors focus:outline-none"
                            style={{ color: '#1e293b' }}
                          />
                        </div>

                        {/* Signature Drawing Pad */}
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold" style={{ color: '#1e293b' }}>
                            Draw Handwritten Signature <span style={{ color: '#8B1A2A' }}>*</span>
                          </label>

                          {signatureDataUrl ? (
                            <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                              <div className="px-4 py-2 flex items-center justify-between border-b" style={{ borderColor: '#bbf7d0' }}>
                                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#15803d' }}>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Signature applied
                                </div>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => setShowSignaturePad(true)}
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors bg-white hover:bg-slate-50 cursor-pointer" style={{ color: '#1B2A5C', borderColor: '#c7d2fe' }}>
                                    <Eye className="w-3 h-3 inline mr-1" />Edit
                                  </button>
                                  <button type="button" onClick={() => setSignatureDataUrl(null)}
                                    className="text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors bg-white hover:bg-red-50 cursor-pointer" style={{ color: '#8B1A2A', borderColor: '#fecaca' }}>
                                    <X className="w-3 h-3 inline" />
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 flex justify-center">
                                <img src={signatureDataUrl} alt="Signature" className="max-h-20 object-contain" style={{ maxWidth: '100%' }} />
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowSignaturePad(true)}
                              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all text-sm font-semibold cursor-pointer"
                              style={{
                                borderColor: errors['__signature__'] ? '#fca5a5' : '#cbd5e1',
                                color: '#64748b',
                                background: errors['__signature__'] ? '#fff5f5' : '#fafbfc',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B2A5C'; e.currentTarget.style.color = '#1B2A5C'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = errors['__signature__'] ? '#fca5a5' : '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
                            >
                              <PenLine className="w-4 h-4" />
                              Click to Draw Your Signature
                            </button>
                          )}

                          {errors['__signature__'] && (
                            <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#8B1A2A' }}>
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {errors['__signature__']}
                            </p>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={field.id}>
                    {renderSectionHeader && <SectionHeader title={currentSectionHeading} />}
                    <div id={`field-${field.id}`} className="space-y-1">
                      <label className="block text-sm font-semibold" style={{ color: '#1e293b' }}>
                        {field.label}
                        {field.required && <span className="font-bold ml-1" style={{ color: '#8B1A2A' }}>*</span>}
                      </label>

                      {renderFieldInput(field, formValues[field.id], (val) => handleInputChange(field.id, val),
                        (optVal) => handleCheckboxToggle(field.id, optVal), (e) => handleFileUpload(field, e), hasError)}

                      {field.helpText && !hasError && (
                        <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: '#64748b' }}>
                          <Info className="w-3.5 h-3.5 shrink-0" style={{ color: '#94a3b8' }} />
                          {field.helpText}
                        </p>
                      )}
                      {hasError && (
                        <p className="text-xs font-medium flex items-center gap-1.5 mt-1" style={{ color: '#8B1A2A' }}>
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors[field.id]}
                        </p>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Submit */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-4 rounded-xl border text-xs" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#8B1A2A' }}>
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Please complete the following required items before submitting:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-slate-700">
                    {Object.entries(errors).map(([fieldKey, errText]) => (
                      <li key={fieldKey}>
                        <button
                          type="button"
                          onClick={() => scrollToField(fieldKey)}
                          className="hover:underline font-medium text-left text-red-800 cursor-pointer"
                        >
                          {errText} <span className="text-[10px] text-slate-400 font-normal">→ click to jump</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!allFilled && Object.keys(errors).length === 0 && (
                <p className="text-xs text-center mb-3 font-medium" style={{ color: '#94a3b8' }}>
                  Complete all required fields{isTenancyForm ? ' and draw your signature' : ''} to submit
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                style={{ background: '#1B2A5C' }}
                onMouseEnter={e => !isSubmitting && (e.currentTarget.style.background = '#111c3e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1B2A5C')}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" style={{ color: '#B8962E' }} />
                    Submit Form to Jokdel Royal
                  </>
                )}
              </button>

              {/* Quick Test Demo Fill Helper */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-center">
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:text-[#1B2A5C] hover:border-[#1B2A5C] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ⚡ Auto-Fill Sample Data (Quick Test Fill)
                </button>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click to populate all required fields & documents instantly for testing submission.
                </p>
              </div>

              <p className="text-center text-xs mt-3" style={{ color: '#94a3b8' }}>
                Your information is kept strictly confidential.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Section Header sub-component
const SectionHeader = ({ title }: { title: string }) => (
  <div className="pt-4 mb-1">
    <div className="jr-section-heading">{title}</div>
  </div>
);

// Field input renderer
function renderFieldInput(
  field: FormField, value: any,
  onChange: (val: any) => void,
  onCheckboxToggle: (optVal: string) => void,
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  hasError: boolean
) {
  const base = `w-full px-4 py-2.5 rounded-xl text-sm bg-white border transition-colors focus:outline-none ${
    hasError ? 'border-red-300 bg-red-50/20' : 'border-gray-200'
  }`;

  switch (field.type) {
    case 'text':
      return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} className={base} style={{ color: '#1e293b' }} />;
    case 'textarea':
      return <textarea rows={3} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''} className={base} style={{ color: '#1e293b', resize: 'vertical' }} />;
    case 'email':
      return <input type="email" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || 'Enter email address'} className={base} style={{ color: '#1e293b' }} />;
    case 'phone':
      return <input type="tel" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || 'Enter phone number'} className={base} style={{ color: '#1e293b' }} />;
    case 'number':
      return <input type="number" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || 'Enter number'} className={base} style={{ color: '#1e293b' }} />;
    case 'date':
      return <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={base} style={{ color: '#1e293b' }} />;
    case 'select':
      return (
        <select value={value || ''} onChange={e => onChange(e.target.value)} className={base} style={{ color: value ? '#1e293b' : '#94a3b8' }}>
          <option value="" disabled style={{ color: '#94a3b8' }}>{field.placeholder || '— Select an option —'}</option>
          {field.options?.map(opt => <option key={opt.id} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-2 mt-1">
          {field.options?.map(opt => (
            <label key={opt.id} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
              style={{ borderColor: value === opt.value ? '#1B2A5C' : '#e2e8f0', background: value === opt.value ? 'rgba(27,42,92,0.04)' : 'white' }}>
              <input type="radio" name={field.id} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="mt-0.5" />
              <span className="text-sm" style={{ color: '#1e293b' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox': {
      const sel: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2 mt-1">
          {field.options?.map(opt => {
            const checked = sel.includes(opt.value);
            return (
              <label key={opt.id} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                style={{ borderColor: checked ? '#1B2A5C' : '#e2e8f0', background: checked ? 'rgba(27,42,92,0.04)' : 'white' }}>
                <input type="checkbox" checked={checked} onChange={() => onCheckboxToggle(opt.value)} className="mt-0.5 rounded" />
                <span className="text-sm" style={{ color: '#1e293b' }}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case 'file':
    case 'image': {
      const fileData: FileDataValue | null = value && typeof value === 'object' ? value : null;
      const isImg = field.type === 'image' || field.accept?.includes('image');
      return (
        <div className="mt-1">
          {fileData ? (
            <div className="p-4 rounded-xl border flex items-center justify-between gap-3" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
              <div className="flex items-center gap-3 overflow-hidden">
                {isImg && fileData.dataUrl
                  ? <img src={fileData.dataUrl} alt={fileData.fileName} className="w-12 h-12 object-cover rounded-lg border border-green-200 shrink-0" />
                  : <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#dcfce7', color: '#15803d' }}><FileText className="w-5 h-5" /></div>
                }
                <div className="truncate">
                  <p className="text-xs font-bold truncate" style={{ color: '#1e293b' }}>{fileData.fileName}</p>
                  <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: '#15803d' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded ({fileData.fileSizeMb} MB)
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => onChange('')} className="p-1.5 rounded-lg transition-colors" style={{ color: '#94a3b8' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8B1A2A')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors"
                style={{ borderColor: hasError ? '#fca5a5' : '#e2e8f0', background: hasError ? '#fff5f5' : '#fafbfc' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#1B2A5C', e.currentTarget.style.background = 'rgba(27,42,92,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = hasError ? '#fca5a5' : '#e2e8f0', e.currentTarget.style.background = hasError ? '#fff5f5' : '#fafbfc')}
              >
                <input type="file" accept={field.accept || (isImg ? 'image/*' : '.pdf,.jpg,.png,.jpeg')} onChange={onFileUpload} className="hidden" />
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: '#f1f5f9', color: '#1B2A5C' }}>
                  {isImg ? <ImageIcon className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>
                <p className="text-xs font-semibold" style={{ color: '#475569' }}>Click to upload or drag file here</p>
                <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>{isImg ? 'JPG or PNG' : 'PDF, JPG or PNG'} — max {field.maxSizeMb || 5}MB</p>
              </label>
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const sampleObj: FileDataValue = {
                      fileName: `${field.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_doc.${isImg ? 'png' : 'pdf'}`,
                      fileType: isImg ? 'image/png' : 'application/pdf',
                      fileSizeMb: 0.15,
                      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                    };
                    onChange(sampleObj);
                  }}
                  className="text-[11px] font-medium text-slate-400 hover:text-[#1B2A5C] hover:underline cursor-pointer"
                >
                  ⚡ Attach sample test file
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    default:
      return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className={base} style={{ color: '#1e293b' }} />;
  }
}
