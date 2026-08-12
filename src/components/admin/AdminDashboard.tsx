import React from 'react';
import { FormConfig, FormResponse } from '../../types';
import {
  FileSpreadsheet,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Filter,
  Eye,
  CheckCircle,
  PhoneCall
} from 'lucide-react';

interface AdminDashboardProps {
  forms: FormConfig[];
  responses: FormResponse[];
  onNavigateToForms: () => void;
  onNavigateToResponses: (statusFilter?: string) => void;
  onOpenNewFormBuilder: () => void;
  onSelectResponseDetail: (response: FormResponse) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  forms,
  responses,
  onNavigateToForms,
  onNavigateToResponses,
  onOpenNewFormBuilder,
  onSelectResponseDetail,
}) => {
  const totalForms = forms.length;
  const activeForms = forms.filter((f) => f.isActive).length;
  const totalResponses = responses.length;

  const newResponses = responses.filter((r) => r.status === 'New');
  const inProgressResponses = responses.filter((r) => r.status === 'In Progress' || r.status === 'Contacted');
  const convertedResponses = responses.filter((r) => r.status === 'Closed/Converted');

  // Responses this week (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const responsesThisWeek = responses.filter(
    (r) => new Date(r.submittedAt) >= oneWeekAgo
  ).length;

  // Recent 8 submissions
  const recentSubmissions = [...responses]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 8);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#6E1E1E] text-white">
            New Lead
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
            Closed/Converted
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

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#131B2E]">
            Jokdel Royal Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of inquiry forms, lead response status pipeline, and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewFormBuilder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1D3557] hover:bg-[#162744] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A059]" />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Forms */}
        <div
          onClick={onNavigateToForms}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Forms
            </span>
            <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-[#131B2E] group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5 text-[#131B2E] group-hover:text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#131B2E]">{totalForms}</span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              {activeForms} Active
            </span>
          </div>
        </div>

        {/* Total Responses */}
        <div
          onClick={() => onNavigateToResponses()}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Responses
            </span>
            <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-[#131B2E] group-hover:text-white transition-colors">
              <Users className="w-5 h-5 text-[#131B2E] group-hover:text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#131B2E]">{totalResponses}</span>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              +{responsesThisWeek} this week
            </span>
          </div>
        </div>

        {/* New Unhandled Leads */}
        <div
          onClick={() => onNavigateToResponses('New')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-[#6E1E1E]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E1E1E] uppercase tracking-wider">
              New Leads
            </span>
            <div className="p-2.5 bg-red-50 rounded-xl text-[#6E1E1E]">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#6E1E1E]">{newResponses.length}</span>
            <span className="text-xs font-bold text-white bg-[#6E1E1E] px-2 py-0.5 rounded-full">
              Action Needed
            </span>
          </div>
        </div>

        {/* Converted / Deals */}
        <div
          onClick={() => onNavigateToResponses('Closed/Converted')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Converted Deals
            </span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#131B2E]">
              {convertedResponses.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalResponses > 0
                ? `${Math.round((convertedResponses.length / totalResponses) * 100)}% Conversion`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* CRM Pipeline Progress Bar Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#131B2E]">
            Lead Status Pipeline Breakdown
          </h2>
          <button
            onClick={() => onNavigateToResponses()}
            className="text-xs font-semibold text-[#6E1E1E] hover:underline inline-flex items-center gap-1"
          >
            <span>View Full CRM Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <button
            onClick={() => onNavigateToResponses('New')}
            className="p-3 bg-red-50/60 hover:bg-red-50 border border-red-200/80 rounded-xl transition-colors text-left"
          >
            <p className="text-[10px] font-bold uppercase text-[#6E1E1E]">New Leads</p>
            <p className="text-2xl font-bold text-[#6E1E1E] mt-1">{newResponses.length}</p>
          </button>

          <button
            onClick={() => onNavigateToResponses('Contacted')}
            className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 rounded-xl transition-colors text-left"
          >
            <p className="text-[10px] font-bold uppercase text-blue-800">Contacted</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {responses.filter((r) => r.status === 'Contacted').length}
            </p>
          </button>

          <button
            onClick={() => onNavigateToResponses('In Progress')}
            className="p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-200/80 rounded-xl transition-colors text-left"
          >
            <p className="text-[10px] font-bold uppercase text-amber-800">In Progress</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">
              {responses.filter((r) => r.status === 'In Progress').length}
            </p>
          </button>

          <button
            onClick={() => onNavigateToResponses('Closed/Converted')}
            className="p-3 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 rounded-xl transition-colors text-left"
          >
            <p className="text-[10px] font-bold uppercase text-emerald-800">Converted</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {convertedResponses.length}
            </p>
          </button>

          <button
            onClick={() => onNavigateToResponses('Not Interested')}
            className="p-3 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition-colors text-left col-span-2 sm:col-span-1"
          >
            <p className="text-[10px] font-bold uppercase text-slate-600">Not Interested</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {responses.filter((r) => r.status === 'Not Interested').length}
            </p>
          </button>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#131B2E]">Recent Inquiries</h2>
            <p className="text-xs text-slate-500">Latest form submissions received</p>
          </div>
          <button
            onClick={() => onNavigateToResponses()}
            className="text-xs font-semibold text-[#131B2E] hover:underline"
          >
            View All Responses ({totalResponses})
          </button>
        </div>

        {recentSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Ref ID & Submitter</th>
                  <th className="py-3 px-3">Form / Service</th>
                  <th className="py-3 px-3">Date Submitted</th>
                  <th className="py-3 px-3">Pipeline Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {recentSubmissions.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectResponseDetail(res)}
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#131B2E] group-hover:text-[#6E1E1E]">
                        {res.submitterName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{res.id}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      {res.formTitle}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(res.submittedAt).toLocaleDateString()} {new Date(res.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectResponseDetail(res);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#131B2E] group-hover:text-white font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            No submissions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
