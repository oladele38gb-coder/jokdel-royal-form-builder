import React from 'react';
import { FormConfig, FormResponse, CompanySettings } from '../types';
import { CheckCircle, Phone, MessageSquare, ArrowLeft, Home, Building, FileText, Share2 } from 'lucide-react';

interface FormSuccessScreenProps {
  form: FormConfig;
  response: FormResponse;
  companySettings: CompanySettings;
  onBackToHome: () => void;
}

export const FormSuccessScreen: React.FC<FormSuccessScreenProps> = ({
  form,
  response,
  companySettings,
  onBackToHome,
}) => {
  // Format WhatsApp Link
  const whatsappMsg = encodeURIComponent(
    `Hello Jokdel Royal,\nI just submitted an inquiry form on your website.\n\n` +
      `*Reference Code:* ${response.id}\n` +
      `*Form:* ${form.title}\n` +
      `*Name:* ${response.submitterName}\n` +
      `*Phone:* ${response.submitterPhone}\n\n` +
      `I would like to follow up on my request.`
  );

  const whatsappUrl = `https://wa.me/${companySettings.whatsappNumber.replace(/\D/g, '')}?text=${whatsappMsg}`;

  return (
    <div className="py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-10 text-center">
        {/* Success Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-emerald-600">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-[#131B2E] text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2">
          Reference Code: {response.id}
        </span>

        <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#131B2E] tracking-tight">
          Thank You — Inquiry Received!
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          Your response for <strong className="text-slate-800">{form.title}</strong> has been logged. A Jokdel Royal property advisor will review your details shortly.
        </p>

        {/* WhatsApp Quick Action Fallback */}
        <div className="my-5 sm:my-8 p-3.5 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-xl sm:rounded-2xl text-left">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-900">
                Need Faster Assistance? Connect via WhatsApp
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Click below to open WhatsApp and send your submission reference directly to our on-call agent.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <span>Chat with Jokdel Royal on WhatsApp</span>
                <Share2 className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Summary of Submitted Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Inquiry Submission Summary
          </h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Submitter Name:</span>
              <span className="font-semibold text-slate-800">{response.submitterName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Contact Phone:</span>
              <span className="font-semibold text-slate-800">{response.submitterPhone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Contact Email:</span>
              <span className="font-semibold text-slate-800">{response.submitterEmail}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Date & Time:</span>
              <span className="font-semibold text-slate-800">
                {new Date(response.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Company Info Box */}
        <div className="text-xs text-slate-500 space-y-1 mb-8">
          <p className="font-semibold text-slate-700">{companySettings.companyName}</p>
          <p>{companySettings.address}</p>
          <p>Direct Line: {companySettings.phone} | Email: {companySettings.email}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#131B2E] hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4 text-[#C5A059]" />
            <span>Return to Home & All Services</span>
          </button>
        </div>
      </div>
    </div>
  );
};
