/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import logoImg from '../assets/jokdel_royal_logo.jpg';
import {
  FormConfig,
  FormResponse,
  CompanySettings,
  AdminUser,
  ResponseStatus,
  StaffNote,
} from './types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_FORMS,
  INITIAL_RESPONSES,
} from './data/initialData';

// Public Components
import { Header } from './components/Header';
import { PublicFormsList } from './components/PublicFormsList';
import { DynamicForm } from './components/DynamicForm';
import { FormSuccessScreen } from './components/FormSuccessScreen';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminFormsList } from './components/admin/AdminFormsList';
import { FormBuilder } from './components/admin/FormBuilder';
import { AdminResponses } from './components/admin/AdminResponses';
import { AdminSettings } from './components/admin/AdminSettings';

const STORAGE_KEYS = {
  FORMS: 'jokdel_forms_v3',
  RESPONSES: 'jokdel_responses_v3',
  SETTINGS: 'jokdel_settings_v3',
  AUTH: 'jokdel_auth_v3',
};

export default function App() {
  // Navigation / View state
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  // Public View state
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [activeSubmittedResponse, setActiveSubmittedResponse] = useState<FormResponse | null>(null);

  // Admin View state
  const [adminTab, setAdminTab] = useState<'dashboard' | 'forms' | 'responses' | 'settings'>('dashboard');
  const [isBuildingForm, setIsBuildingForm] = useState(false);
  const [editingFormConfig, setEditingFormConfig] = useState<FormConfig | null>(null);
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<FormResponse | null>(null);
  const [responsesStatusFilter, setResponsesStatusFilter] = useState<string>('All');

  // Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Main Forms State
  const [forms, setForms] = useState<FormConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORMS);
      if (!saved) return INITIAL_FORMS;
      const parsed: FormConfig[] = JSON.parse(saved);
      const missingInitial = INITIAL_FORMS.filter(
        (init) => !parsed.some((p) => p.id === init.id)
      );
      if (missingInitial.length > 0) {
        return [...parsed, ...missingInitial];
      }
      return parsed;
    } catch {
      return INITIAL_FORMS;
    }
  });

  // Main Responses State
  const [responses, setResponses] = useState<FormResponse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESPONSES);
      return saved ? JSON.parse(saved) : INITIAL_RESPONSES;
    } catch {
      return INITIAL_RESPONSES;
    }
  });

  // Main Company Settings State
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
    } catch {
      return INITIAL_COMPANY_SETTINGS;
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [adminUser]);

  // Auth Handlers
  const handleAdminLogin = (email: string) => {
    const user: AdminUser = {
      email,
      name: 'Staff Admin',
      role: 'Property Manager',
      isAuthenticated: true,
    };
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentView('public');
  };

  // Public Submission Handler
  const handleFormSubmission = (
    formData: Record<string, any>,
    submitterName: string,
    submitterEmail: string,
    submitterPhone: string
  ) => {
    const targetForm = forms.find((f) => f.id === selectedFormId);
    if (!targetForm) return;

    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const newResponseId = `JOK-${new Date().getFullYear()}-${refNumber}`;

    const newResponse: FormResponse = {
      id: newResponseId,
      formId: targetForm.id,
      formTitle: targetForm.title,
      submittedAt: new Date().toISOString(),
      submitterName,
      submitterEmail,
      submitterPhone,
      status: 'New',
      notes: [
        {
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
          author: 'System',
          content: `Inquiry submitted via public web form.`,
        },
      ],
      fieldValues: formData,
    };

    setResponses((prev) => [newResponse, ...prev]);
    setActiveSubmittedResponse(newResponse);
  };

  // Form Management Handlers
  const handleSaveForm = (formToSave: FormConfig) => {
    setForms((prev) => {
      const existsIndex = prev.findIndex((f) => f.id === formToSave.id);
      if (existsIndex > -1) {
        const copy = [...prev];
        copy[existsIndex] = formToSave;
        return copy;
      }
      return [formToSave, ...prev];
    });
    setIsBuildingForm(false);
    setEditingFormConfig(null);
    setAdminTab('forms');
  };

  const handleDuplicateForm = (formToDuplicate: FormConfig) => {
    const newForm: FormConfig = {
      ...formToDuplicate,
      id: `form-${Date.now()}`,
      title: `${formToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setForms((prev) => [newForm, ...prev]);
  };

  const handleToggleFormActive = (formId: string) => {
    setForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, isActive: !f.isActive } : f))
    );
  };

  const handleDeleteForm = (formId: string) => {
    setForms((prev) => prev.filter((f) => f.id !== formId));
  };

  // Response CRM Handlers
  const handleUpdateResponseStatus = (responseId: string, newStatus: ResponseStatus) => {
    setResponses((prev) =>
      prev.map((r) => {
        if (r.id !== responseId) return r;
        const statusNote: StaffNote = {
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
          author: adminUser?.name || 'Staff Admin',
          content: `Pipeline status changed to "${newStatus}".`,
        };
        return {
          ...r,
          status: newStatus,
          notes: [...r.notes, statusNote],
        };
      })
    );

    if (selectedResponseDetail?.id === responseId) {
      setSelectedResponseDetail((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }
  };

  const handleAddResponseNote = (responseId: string, noteContent: string) => {
    const newNote: StaffNote = {
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: adminUser?.name || 'Staff Admin',
      content: noteContent,
    };

    setResponses((prev) =>
      prev.map((r) => {
        if (r.id !== responseId) return r;
        return {
          ...r,
          notes: [...r.notes, newNote],
        };
      })
    );

    if (selectedResponseDetail?.id === responseId) {
      setSelectedResponseDetail((prev) =>
        prev ? { ...prev, notes: [...prev.notes, newNote] } : null
      );
    }
  };

  const handleResetSampleData = () => {
    setForms(INITIAL_FORMS);
    setResponses(INITIAL_RESPONSES);
    setSettings(INITIAL_COMPANY_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.FORMS);
    localStorage.removeItem(STORAGE_KEYS.RESPONSES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  // Helper to open public form view directly
  const selectedFormObj = forms.find((f) => f.id === selectedFormId);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-[#131B2E] selection:text-white">
      {currentView === 'public' ? (
        <div className="min-h-screen flex flex-col bg-white">
          {/* Public Header Navigation */}
          <Header
            forms={forms}
            selectedFormId={selectedFormId}
            onSelectForm={(id) => {
              setSelectedFormId(id);
              setActiveSubmittedResponse(null);
            }}
            onOpenAdmin={() => setCurrentView('admin')}
          />

          {/* Public Content Container */}
          <main className="flex-1 bg-slate-50/50">
            {activeSubmittedResponse && selectedFormObj ? (
              <FormSuccessScreen
                form={selectedFormObj}
                response={activeSubmittedResponse}
                companySettings={settings}
                onBackToHome={() => {
                  setSelectedFormId(null);
                  setActiveSubmittedResponse(null);
                }}
              />
            ) : selectedFormObj ? (
              <DynamicForm
                form={selectedFormObj}
                onBack={() => setSelectedFormId(null)}
                onSubmit={handleFormSubmission}
              />
            ) : (
              <PublicFormsList
                forms={forms}
                onSelectForm={(id) => {
                  setSelectedFormId(id);
                  setActiveSubmittedResponse(null);
                }}
              />
            )}
          </main>

          {/* Public Footer */}
          <footer className="bg-[#131B2E] text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-center md:text-left">
              <div>
                <img src={logoImg} alt="Jokdel Royal" className="h-20 w-auto object-contain brightness-0 invert" />
                <p className="text-slate-400 mt-0.5">{settings.tagline}</p>
              </div>

              <div className="space-y-1">
                <p>{settings.address}</p>
                <p>Tel: {settings.phone} | Email: {settings.email}</p>
              </div>

              <div>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                >
                  Internal Staff Portal
                </button>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* ADMIN PANEL VIEW */
        !adminUser || !adminUser.isAuthenticated ? (
          <AdminLogin
            onLogin={handleAdminLogin}
            onViewPublicSite={() => setCurrentView('public')}
          />
        ) : (
          <AdminLayout
            activeTab={adminTab}
            setActiveTab={(tab) => {
              setAdminTab(tab);
              setIsBuildingForm(false);
              setEditingFormConfig(null);
            }}
            responses={responses}
            onLogout={handleAdminLogout}
            onViewPublicSite={() => setCurrentView('public')}
            onOpenNewFormBuilder={() => {
              setEditingFormConfig(null);
              setIsBuildingForm(true);
            }}
          >
            {isBuildingForm || editingFormConfig ? (
              <FormBuilder
                initialForm={editingFormConfig}
                onSave={handleSaveForm}
                onCancel={() => {
                  setIsBuildingForm(false);
                  setEditingFormConfig(null);
                }}
              />
            ) : adminTab === 'dashboard' ? (
              <AdminDashboard
                forms={forms}
                responses={responses}
                onNavigateToForms={() => setAdminTab('forms')}
                onNavigateToResponses={(statusFilter) => {
                  setResponsesStatusFilter(statusFilter || 'All');
                  setAdminTab('responses');
                }}
                onOpenNewFormBuilder={() => {
                  setEditingFormConfig(null);
                  setIsBuildingForm(true);
                }}
                onSelectResponseDetail={(res) => {
                  setSelectedResponseDetail(res);
                  setAdminTab('responses');
                }}
              />
            ) : adminTab === 'forms' ? (
              <AdminFormsList
                forms={forms}
                responses={responses}
                onEditForm={(form) => {
                  setEditingFormConfig(form);
                  setIsBuildingForm(true);
                }}
                onDuplicateForm={handleDuplicateForm}
                onToggleFormActive={handleToggleFormActive}
                onDeleteForm={handleDeleteForm}
                onOpenNewFormBuilder={() => {
                  setEditingFormConfig(null);
                  setIsBuildingForm(true);
                }}
                onPreviewPublicForm={(formId) => {
                  setSelectedFormId(formId);
                  setCurrentView('public');
                }}
              />
            ) : adminTab === 'responses' ? (
              <AdminResponses
                forms={forms}
                responses={responses}
                initialStatusFilter={responsesStatusFilter}
                onUpdateStatus={handleUpdateResponseStatus}
                onAddNote={handleAddResponseNote}
                selectedResponseDetail={selectedResponseDetail}
                onSelectResponseDetail={setSelectedResponseDetail}
              />
            ) : (
              <AdminSettings
                settings={settings}
                onSaveSettings={setSettings}
                onResetSampleData={handleResetSampleData}
              />
            )}
          </AdminLayout>
        )
      )}
    </div>
  );
}
