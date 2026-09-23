import React, { useState } from 'react';
import { FormConfig, FormResponse, ResponseStatus, FileDataValue, CompanySettings } from '../../types';
import { LetterheadPDF, printLetterhead } from './LetterheadPDF';
import {
  Download, Search, Eye, MessageSquare, FileSpreadsheet, X, FileText,
  Image as ImageIcon, Printer,
} from 'lucide-react';

interface AdminResponsesProps {
  forms: FormConfig[];
  responses: FormResponse[];
  initialStatusFilter?: string;
  onUpdateStatus: (responseId: string, newStatus: ResponseStatus) => void;
  onAddNote: (responseId: string, noteContent: string) => void;
  selectedResponseDetail: FormResponse | null;
  onSelectResponseDetail: (response: FormResponse | null) => void;
  settings?: CompanySettings;
}

export const AdminResponses: React.FC<AdminResponsesProps> = ({
  forms,
  responses,
  initialStatusFilter = 'All',
  onUpdateStatus,
  onAddNote,
  selectedResponseDetail,
  onSelectResponseDetail,
  settings,
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [formFilter, setFormFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [newNoteText, setNewNoteText] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState<{ name: string; url: string } | null>(null);
  const [showLetterheadModal, setShowLetterheadModal] = useState(false);

  const defaultSettings: CompanySettings = {
    companyName: 'Jokdel Royal Nig. Ltd',
    address: 'No. 4 Yakubu Gowon Crescent, Asokoro, Abuja, FCT, Nigeria',
    phone: '+234 816 215 3670',
    email: 'info@jokdelroyal.com',
    whatsappNumber: '+2348162153670',
    tagline: 'Building Trust, Creating Legacies',
    enableEmailNotifications: false,
    workingHours: 'Mon – Fri: 8am – 6pm',
  };
  const activeSettings = settings || defaultSettings;

  const statusOptions: ResponseStatus[] = [
    'New',
    'Contacted',
    'In Progress',
    'Closed/Converted',
    'Not Interested',
  ];

  // Filtering responses
  const filteredResponses = responses.filter((res) => {
    const matchesForm = formFilter === 'All' || res.formId === formFilter;
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    const matchesSearch =
      res.submitterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.submitterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.submitterPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.formTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesForm && matchesStatus && matchesSearch;
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredResponses.length === 0) {
      alert('No responses available to export.');
      return;
    }

    const headers = [
      'Reference ID',
      'Form Title',
      'Submitter Name',
      'Submitter Email',
      'Submitter Phone',
      'Submitted At',
      'Pipeline Status',
      'Notes Count',
      'Field Responses Summary',
    ];

    const rows = filteredResponses.map((r) => {
      const summaryStr = Object.entries(r.fieldValues)
        .map(([k, v]) => {
          if (v && typeof v === 'object' && !Array.isArray(v) && 'fileName' in v) {
            return `${k}: Attachment (${(v as FileDataValue).fileName})`;
          }
          return `${k}: ${Array.isArray(v) ? v.join(', ') : v}`;
        })
        .join(' | ');

      return [
        `"${r.id}"`,
        `"${r.formTitle.replace(/"/g, '""')}"`,
        `"${r.submitterName.replace(/"/g, '""')}"`,
        `"${r.submitterEmail.replace(/"/g, '""')}"`,
        `"${r.submitterPhone.replace(/"/g, '""')}"`,
        `"${new Date(r.submittedAt).toLocaleString()}"`,
        `"${r.status}"`,
        `"${r.notes.length}"`,
        `"${summaryStr.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Jokdel_Royal_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedResponseDetail) return;
    onAddNote(selectedResponseDetail.id, newNoteText.trim());
    setNewNoteText('');
  };

  const getStatusBadge = (status: ResponseStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#6E1E1E] text-white">
            New
          </span>
        );
      case 'Contacted':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Contacted
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
            In Progress
          </span>
        );
      case 'Closed/Converted':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
            Converted
          </span>
        );
      case 'Not Interested':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">
            Not Interested
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const renderFieldValue = (val: any) => {
    if (!val) return 'N/A';

    if (typeof val === 'object' && !Array.isArray(val) && 'fileName' in val) {
      const fileObj = val as FileDataValue;
      const isImg = fileObj.fileType?.startsWith('image/') || fileObj.fileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

      return (
        <div className="mt-1 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 max-w-md">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImg && fileObj.dataUrl ? (
              <img
                src={fileObj.dataUrl}
                alt={fileObj.fileName}
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer hover:opacity-80"
                onClick={() => setPreviewImageModal({ name: fileObj.fileName, url: fileObj.dataUrl! })}
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#131B2E] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="truncate text-xs">
              <p className="font-bold text-[#131B2E] truncate">{fileObj.fileName}</p>
              <p className="text-[11px] text-slate-400">{fileObj.fileSizeMb || '1.0'} MB</p>
            </div>
          </div>

          {fileObj.dataUrl && (
            <button
              type="button"
              onClick={() => {
                if (isImg) {
                  setPreviewImageModal({ name: fileObj.fileName, url: fileObj.dataUrl! });
                } else {
                  const win = window.open();
                  if (win) {
                    win.document.write(
                      `<iframe src="${fileObj.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                    );
                  }
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#131B2E] hover:text-white text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>
          )}
        </div>
      );
    }

    if (Array.isArray(val)) {
      return val.join(', ');
    }

    return String(val);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="font-serif text-xl font-bold" style={{ color: '#1B2A5C' }}>Responses & CRM Leads</h1>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            Manage submissions, update client pipeline status and download letterhead PDFs.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors"
          style={{ background: '#1B2A5C' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#111c3e')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1B2A5C')}
        >
          <Download className="w-4 h-4" style={{ color: '#B8962E' }} />
          <span>Export CSV ({filteredResponses.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {['All', ...statusOptions].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? st === 'New'
                    ? 'bg-[#6E1E1E] text-white'
                    : 'bg-[#131B2E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Forms / Services</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search submitters, phones, emails..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#131B2E]"
            />
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredResponses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref & Submitter Name</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Inquiry Form</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredResponses.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectResponseDetail(res)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#131B2E] text-sm group-hover:text-[#6E1E1E]">
                        {res.submitterName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{res.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{res.submitterPhone}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[180px]">
                        {res.submitterEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{res.formTitle}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(res.submittedAt).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-slate-400">
                        {new Date(res.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={res.status}
                        onChange={(e) => onUpdateStatus(res.id, e.target.value as ResponseStatus)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border border-slate-200 cursor-pointer focus:outline-hidden ${
                          res.status === 'New'
                            ? 'bg-[#6E1E1E] text-white font-bold'
                            : res.status === 'Closed/Converted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st} className="bg-white text-slate-800">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectResponseDetail(res);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#131B2E] group-hover:text-white font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 p-6">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No responses match your filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or status filter.</p>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedResponseDetail && (
        <>
          {/* Letterhead Print Area (hidden on screen, visible on print) */}
          {showLetterheadModal && (() => {
            const detailForm = forms.find(f => f.id === selectedResponseDetail.formId);
            if (!detailForm) return null;
            return (
              <div className="fixed inset-0 z-[100] bg-white overflow-auto no-print" id="letterhead-modal">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 no-print">
                  <h3 className="font-semibold text-sm" style={{ color: '#1B2A5C' }}>Letterhead Preview — {selectedResponseDetail.submitterName}</h3>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowLetterheadModal(false); setTimeout(printLetterhead, 100); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#1B2A5C' }}>
                      <Printer className="w-4 h-4" /> Print / Save PDF
                    </button>
                    <button onClick={() => setShowLetterheadModal(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                      Close
                    </button>
                  </div>
                </div>
                <LetterheadPDF response={selectedResponseDetail} form={detailForm} settings={activeSettings} />
              </div>
            );
          })()}

          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8B1A2A' }}>
                  Ref: {selectedResponseDetail.id}
                </span>
                <h2 className="font-serif text-lg font-bold mt-0.5" style={{ color: '#1B2A5C' }}>
                  {selectedResponseDetail.submitterName}
                </h2>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {selectedResponseDetail.formTitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedResponseDetail.formId === 'form-tenancy-data' && (
                  <button
                    onClick={() => setShowLetterheadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
                    style={{ borderColor: '#cbd5e1', color: '#1B2A5C', background: '#f8fafc' }}
                    title="Print as Letterhead PDF"
                  >
                    <Printer className="w-3.5 h-3.5" /> Letterhead
                  </button>
                )}
                <button onClick={() => onSelectResponseDetail(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" style={{ color: '#94a3b8' }} />
                </button>
              </div>
            </div>


            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Status & Quick Actions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Pipeline Status
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedResponseDetail.status)}
                    <select
                      value={selectedResponseDetail.status}
                      onChange={(e) =>
                        onUpdateStatus(selectedResponseDetail.id, e.target.value as ResponseStatus)
                      }
                      className="text-xs font-semibold border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${selectedResponseDetail.submitterPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Submitter</span>
                </a>
              </div>

              {/* Submitter Contact Card */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Telephone / WhatsApp:</span>
                  <p className="font-bold text-[#131B2E] mt-0.5">{selectedResponseDetail.submitterPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email Address:</span>
                  <p className="font-bold text-[#131B2E] mt-0.5 truncate">{selectedResponseDetail.submitterEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Submission Date:</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {new Date(selectedResponseDetail.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Submitted Field Values */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#131B2E] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Form Response Fields & Uploads
                </h3>

                <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
                  {Object.entries(selectedResponseDetail.fieldValues).map(([key, val]) => (
                    <div key={key} className="py-2 border-b border-slate-200/60 last:border-0">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                        {key.replace('field-', '').replace('t-', '').replace(/-/g, ' ')}
                      </span>
                      <div className="text-sm font-medium text-slate-800 mt-0.5">
                        {renderFieldValue(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Follow-up Notes History */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-[#131B2E] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Staff Follow-up Notes ({selectedResponseDetail.notes.length})
                </h3>

                {selectedResponseDetail.notes.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedResponseDetail.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-amber-900 font-bold">
                          <span>{note.author}</span>
                          <span className="text-[10px] text-amber-700 font-normal">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
                )}

                {/* Add New Note Input */}
                <form onSubmit={handleAddNoteSubmit} className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Enter follow-up note..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#131B2E]"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3.5 py-2 bg-[#1D3557] hover:bg-[#162744] text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-colors shrink-0"
                    >
                      Log Note
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => onSelectResponseDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
        </>
      )}


      {/* Image Preview Overlay Modal */}
      {previewImageModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-xs text-[#131B2E] truncate">{previewImageModal.name}</h4>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center bg-slate-100 rounded-xl p-2 max-h-[70vh] overflow-hidden">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.name}
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
