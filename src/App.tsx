/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import letterheadLogo from '../assets/jokdel_royal_letterhead_logo.png';
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

// Firebase Real-Time Firestore Integration
import {
  subscribeToResponses,
  saveResponseToFirestore,
  updateResponseStatusInFirestore,
  addResponseNoteInFirestore,
  deleteResponseFromFirestore,
  clearAllResponsesFromFirestore,
} from './lib/firebase';

const STORAGE_KEYS = {
  FORMS: 'jokdel_forms_v4',
  SETTINGS: 'jokdel_settings_v3',
  AUTH: 'jokdel_auth_v3',
};

const API_BASE = 'http://localhost:3002/api';

// ─── Shared State Hook ────────────────────────────────────────────────────────
function useAppState() {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'forms' | 'responses' | 'settings'>('dashboard');
  const [isBuildingForm, setIsBuildingForm] = useState(false);
  const [editingFormConfig, setEditingFormConfig] = useState<FormConfig | null>(null);
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<FormResponse | null>(null);
  const [responsesStatusFilter, setResponsesStatusFilter] = useState<string>('All');

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [forms, setForms] = useState<FormConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORMS);
      if (saved) return JSON.parse(saved);
      return INITIAL_FORMS;
    } catch { return INITIAL_FORMS; }
  });

  const [responses, setResponses] = useState<FormResponse[]>(() => {
    try {
      const saved = localStorage.getItem('jokdel_responses_v3');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Load responses from Express API (authoritative source when API is reachable)
  const fetchResponses = useCallback(async () => {
    setLoadingResponses(true);
    try {
      const res = await fetch(`${API_BASE}/responses`);
      if (res.ok) {
        const serverData: FormResponse[] = await res.json();
        setResponses(serverData);
        try {
          localStorage.setItem('jokdel_responses_v3', JSON.stringify(serverData));
        } catch {}
      }
    } catch (e) {
      console.warn('API offline — using localStorage fallback.');
      try {
        const saved = localStorage.getItem('jokdel_responses_v3');
        if (saved) setResponses(JSON.parse(saved));
      } catch {}
    } finally {
      setLoadingResponses(false);
    }
  }, []);

  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
    } catch { return INITIAL_COMPANY_SETTINGS; }
  });

  useEffect(() => { fetchResponses(); }, [fetchResponses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms)); }, [forms]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => {
    try {
      localStorage.setItem('jokdel_responses_v3', JSON.stringify(responses));
    } catch {}
  }, [responses]);
  useEffect(() => {
    if (adminUser) localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(adminUser));
    else localStorage.removeItem(STORAGE_KEYS.AUTH);
  }, [adminUser]);



  const handleAdminLogin = (email: string) => {
    setAdminUser({ email, name: 'Staff Admin', role: 'Property Manager', isAuthenticated: true });
  };


  const handleAdminLogout = () => { setAdminUser(null); };

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
    setForms((prev) => prev.map((f) => (f.id === formId ? { ...f, isActive: !f.isActive } : f)));
  };

  const handleDeleteForm = (formId: string) => {
    setForms((prev) => prev.filter((f) => f.id !== formId));
  };

  const [firebaseLive, setFirebaseLive] = useState(false);

  // Subscribe to real-time Cloud Firestore updates
  useEffect(() => {
    const unsubscribe = subscribeToResponses(
      (liveList) => {
        setFirebaseLive(true);
        setResponses(liveList);
        try {
          localStorage.setItem('jokdel_responses_v3', JSON.stringify(liveList));
        } catch {}
      },
      () => {
        setFirebaseLive(false);
        fetchResponses();
      }
    );
    return () => unsubscribe();
  }, [fetchResponses]);

  const handleUpdateResponseStatus = async (responseId: string, newStatus: ResponseStatus) => {
    const statusNote: StaffNote = {
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: adminUser?.name || 'Staff Admin',
      content: `Pipeline status changed to "${newStatus}".`,
    };
    const target = responses.find((r) => r.id === responseId);
    const updatedNotes = target ? [...target.notes, statusNote] : [statusNote];

    // Optimistic update
    setResponses((prev) => prev.map((r) => r.id !== responseId ? r : { ...r, status: newStatus, notes: updatedNotes }));
    if (selectedResponseDetail?.id === responseId) {
      setSelectedResponseDetail((prev) => prev ? { ...prev, status: newStatus, notes: updatedNotes } : null);
    }

    // Sync to Firestore
    try {
      await updateResponseStatusInFirestore(responseId, newStatus, updatedNotes);
    } catch (e) {
      console.warn('Firestore status update error:', e);
    }

    // Also sync to local Express server if running
    try {
      await fetch(`${API_BASE}/responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: updatedNotes }),
      });
    } catch {}
  };

  const handleAddResponseNote = async (responseId: string, noteContent: string) => {
    const newNote: StaffNote = {
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: adminUser?.name || 'Staff Admin',
      content: noteContent,
    };
    const target = responses.find((r) => r.id === responseId);
    const updatedNotes = target ? [...target.notes, newNote] : [newNote];

    setResponses((prev) => prev.map((r) => r.id !== responseId ? r : { ...r, notes: updatedNotes }));
    if (selectedResponseDetail?.id === responseId) {
      setSelectedResponseDetail((prev) => prev ? { ...prev, notes: updatedNotes } : null);
    }

    // Sync to Firestore
    try {
      await addResponseNoteInFirestore(responseId, updatedNotes);
    } catch (e) {
      console.warn('Firestore note error:', e);
    }

    // Also sync to Express API
    try {
      await fetch(`${API_BASE}/responses/${responseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent, author: adminUser?.name || 'Staff Admin' }),
      });
    } catch {}
  };

  const handleDeleteResponse = async (responseId: string) => {
    setResponses((prev) => {
      const remaining = prev.filter((r) => r.id !== responseId);
      try {
        localStorage.setItem('jokdel_responses_v3', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });
    if (selectedResponseDetail?.id === responseId) {
      setSelectedResponseDetail(null);
    }

    // Delete from Firestore
    try {
      await deleteResponseFromFirestore(responseId);
    } catch (e) {
      console.warn('Firestore delete error:', e);
    }

    // Delete from Express API
    try {
      await fetch(`${API_BASE}/responses/${responseId}`, { method: 'DELETE' });
    } catch {}
  };

  const handleClearAllResponses = async () => {
    setResponses([]);
    setSelectedResponseDetail(null);
    try {
      localStorage.setItem('jokdel_responses_v3', JSON.stringify([]));
      localStorage.removeItem('jokdel_responses_v3');
    } catch {}

    // Clear from Firestore
    try {
      await clearAllResponsesFromFirestore();
    } catch (e) {
      console.warn('Firestore clear error:', e);
    }

    // Clear from Express API
    try {
      await fetch(`${API_BASE}/responses`, { method: 'DELETE' });
    } catch {}
  };

  const handleResetSampleData = async () => {
    setForms(INITIAL_FORMS);
    setResponses([]);
    setSelectedResponseDetail(null);
    setSettings(INITIAL_COMPANY_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.FORMS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    try {
      localStorage.setItem('jokdel_responses_v3', JSON.stringify([]));
      localStorage.removeItem('jokdel_responses_v3');
    } catch {}
    try {
      await clearAllResponsesFromFirestore();
    } catch {}
    try {
      await fetch(`${API_BASE}/responses`, { method: 'DELETE' });
    } catch {}
  };

  return {
    adminTab, setAdminTab,
    isBuildingForm, setIsBuildingForm,
    editingFormConfig, setEditingFormConfig,
    selectedResponseDetail, setSelectedResponseDetail,
    responsesStatusFilter, setResponsesStatusFilter,
    adminUser,
    forms, responses, setResponses, settings, setSettings,
    loadingResponses, fetchResponses, firebaseLive,
    handleAdminLogin, handleAdminLogout,
    handleSaveForm, handleDuplicateForm, handleToggleFormActive, handleDeleteForm,
    handleUpdateResponseStatus, handleAddResponseNote,
    handleDeleteResponse, handleClearAllResponses, handleResetSampleData,
  };
}

// ─── Public Page (/) ──────────────────────────────────────────────────────────
function PublicPage({ appState }: { appState: ReturnType<typeof useAppState> }) {
  const { forms, settings, setResponses } = appState;
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [activeSubmittedResponse, setActiveSubmittedResponse] = useState<FormResponse | null>(null);

  const selectedFormObj = forms.find((f) => f.id === selectedFormId);

  const handleFormSubmission = async (
    formData: Record<string, any>,
    submitterName: string,
    submitterEmail: string,
    submitterPhone: string
  ) => {
    const targetForm = forms.find((f) => f.id === selectedFormId);
    if (!targetForm) return;

    const payload = {
      formId: targetForm.id,
      formTitle: targetForm.title,
      submitterName,
      submitterEmail,
      submitterPhone,
      status: 'New' as ResponseStatus,
      notes: [{
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        author: 'System',
        content: 'Inquiry submitted via public web form.',
      }],
      fieldValues: formData,
    };

    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const newResponse: FormResponse = {
      id: `JOK-${new Date().getFullYear()}-${refNumber}`,
      submittedAt: new Date().toISOString(),
      ...payload,
    };

    // 1. Save directly to Firebase Firestore for real-time cloud sync
    try {
      await saveResponseToFirestore(newResponse);
    } catch (err) {
      console.warn('Firestore submission error (check rules if permission denied):', err);
    }

    // 2. Also save to local Express server if running
    try {
      await fetch(`${API_BASE}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResponse),
      });
    } catch {}

    // 3. Update local state & localStorage immediately
    setResponses((prev) => {
      const updated = [newResponse, ...prev.filter((r) => r.id !== newResponse.id)];
      try {
        localStorage.setItem('jokdel_responses_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveSubmittedResponse(newResponse);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        forms={forms}
        selectedFormId={selectedFormId}
        onSelectForm={(id) => { setSelectedFormId(id); setActiveSubmittedResponse(null); }}
      />
      <main className="flex-1 bg-slate-50/50">
        {activeSubmittedResponse && selectedFormObj ? (
          <FormSuccessScreen
            form={selectedFormObj}
            response={activeSubmittedResponse}
            companySettings={settings}
            onBackToHome={() => { setSelectedFormId(null); setActiveSubmittedResponse(null); }}
          />
        ) : selectedFormObj && selectedFormObj.isActive ? (
          <DynamicForm
            form={selectedFormObj}
            onBack={() => setSelectedFormId(null)}
            onSubmit={handleFormSubmission}
          />
        ) : selectedFormObj && !selectedFormObj.isActive ? (
          <div className="py-20 px-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🔒</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Service Currently Unavailable</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              "{selectedFormObj.title}" is currently hidden from the public website by administration.
            </p>
            <button
              onClick={() => setSelectedFormId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1B2A5C] hover:bg-slate-800 cursor-pointer"
            >
              ← Back to Available Services
            </button>
          </div>
        ) : (
          <PublicFormsList
            forms={forms}
            onSelectForm={(id) => { setSelectedFormId(id); setActiveSubmittedResponse(null); }}
          />
        )}
      </main>
      <footer style={{ background: '#1B2A5C', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-center md:text-left">
          <div>
            <div className="bg-white inline-flex rounded-xl px-3 py-2">
              <img src={letterheadLogo} alt="Jokdel Royal" style={{ height: '40px', objectFit: 'contain' }} />
            </div>
            <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{settings.tagline}</p>
          </div>
          <div className="space-y-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <p>{settings.address}</p>
            <p>Tel: {settings.phone} | Email: {settings.email}</p>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>&copy; {new Date().getFullYear()} Jokdel Royal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Admin Page (/admin) ──────────────────────────────────────────────────────
function AdminPage({ appState }: { appState: ReturnType<typeof useAppState> }) {
  const {
    adminTab, setAdminTab,
    isBuildingForm, setIsBuildingForm,
    editingFormConfig, setEditingFormConfig,
    selectedResponseDetail, setSelectedResponseDetail,
    responsesStatusFilter, setResponsesStatusFilter,
    adminUser,
    forms, responses, settings, setSettings,
    handleAdminLogin, handleAdminLogout,
    handleSaveForm, handleDuplicateForm, handleToggleFormActive, handleDeleteForm,
    handleUpdateResponseStatus, handleAddResponseNote,
    handleDeleteResponse, handleClearAllResponses, handleResetSampleData,
  } = appState;

  if (!adminUser || !adminUser.isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleAdminLogin}
        onViewPublicSite={() => { window.location.href = '/'; }}
      />
    );
  }

  return (
    <AdminLayout
      activeTab={adminTab}
      setActiveTab={(tab) => {
        setAdminTab(tab);
        setIsBuildingForm(false);
        setEditingFormConfig(null);
      }}
      responses={responses}
      onLogout={handleAdminLogout}
      onViewPublicSite={() => { window.location.href = '/'; }}
      onOpenNewFormBuilder={() => {
        setEditingFormConfig(null);
        setIsBuildingForm(true);
      }}
    >
      {isBuildingForm || editingFormConfig ? (
        <FormBuilder
          initialForm={editingFormConfig}
          onSave={handleSaveForm}
          onCancel={() => { setIsBuildingForm(false); setEditingFormConfig(null); }}
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
          onOpenNewFormBuilder={() => { setEditingFormConfig(null); setIsBuildingForm(true); }}
          onSelectResponseDetail={(res) => { setSelectedResponseDetail(res); setAdminTab('responses'); }}
        />
      ) : adminTab === 'forms' ? (
        <AdminFormsList
          forms={forms}
          responses={responses}
          onEditForm={(form) => { setEditingFormConfig(form); setIsBuildingForm(true); }}
          onDuplicateForm={handleDuplicateForm}
          onToggleFormActive={handleToggleFormActive}
          onDeleteForm={handleDeleteForm}
          onOpenNewFormBuilder={() => { setEditingFormConfig(null); setIsBuildingForm(true); }}
          onPreviewPublicForm={() => { window.location.href = '/'; }}
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
          onDeleteResponse={handleDeleteResponse}
          onClearAllResponses={handleClearAllResponses}
          onRefreshResponses={fetchResponses}
          isLoading={loadingResponses}
          isFirebaseLive={firebaseLive}
        />
      ) : (
        <AdminSettings
          settings={settings}
          onSaveSettings={setSettings}
          onResetSampleData={handleResetSampleData}
        />
      )}
    </AdminLayout>
  );
}

// ─── Root App with Router ─────────────────────────────────────────────────────
export default function App() {
  const appState = useAppState();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-[#131B2E] selection:text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicPage appState={appState} />} />
          <Route path="/admin" element={<AdminPage appState={appState} />} />
          <Route path="/admin/*" element={<AdminPage appState={appState} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
