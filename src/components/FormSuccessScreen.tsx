import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { FormConfig, FormResponse, CompanySettings } from '../types';
import { CheckCircle, MessageSquare, Home, Phone, Shield } from 'lucide-react';

interface FormSuccessScreenProps {
  form: FormConfig;
  response: FormResponse;
  companySettings: CompanySettings;
  onBackToHome: () => void;
}

export const FormSuccessScreen: React.FC<FormSuccessScreenProps> = ({
  form, response, companySettings, onBackToHome,
}) => {
  const whatsappMsg = encodeURIComponent(
    `Hello Jokdel Royal,\nI just submitted a form on your website.\n\n` +
    `*Reference:* ${response.id}\n` +
    `*Form:* ${form.title}\n` +
    `*Name:* ${response.submitterName}\n\n` +
    `Please confirm receipt. Thank you.`
  );
  const whatsappUrl = `https://wa.me/${companySettings.whatsappNumber.replace(/\D/g, '')}?text=${whatsappMsg}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Top Card — Navy Hero */}
        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <div className="px-6 py-10 text-center" style={{ background: '#1B2A5C' }}>
            {/* Logo */}
            <div className="inline-flex bg-white rounded-xl px-4 py-2 mb-6">
              <Logo height={40} />
            </div>

            {/* Check icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-check-pop"
              style={{ background: 'rgba(184,150,46,0.15)', border: '2px solid #B8962E' }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: '#B8962E' }} />
            </div>

            <h1 className="font-serif text-xl font-bold text-white mb-1">
              Form Submitted Successfully
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {form.title}
            </p>

            {/* Reference badge */}
            <div className="inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest" style={{ background: 'rgba(184,150,46,0.18)', color: '#d4ae4a' }}>
              REF: {response.id}
            </div>
          </div>

          {/* White body */}
          <div className="bg-white px-6 py-6">
            <p className="text-sm text-center mb-5" style={{ color: '#64748b' }}>
              Your submission has been received. A Jokdel Royal advisor will review your details and be in touch shortly.
            </p>

            {/* Summary */}
            <div className="rounded-xl border border-gray-100 overflow-hidden mb-5">
              <div className="px-4 py-2 border-b border-gray-100" style={{ background: '#f8fafc' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Submission Summary</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  ['Name', response.submitterName],
                  ['Phone', response.submitterPhone],
                  ['Email', response.submitterEmail],
                  ['Date', new Date(response.submittedAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span style={{ color: '#94a3b8' }}>{label}</span>
                    <span className="font-semibold text-right" style={{ color: '#1e293b', maxWidth: '60%', wordBreak: 'break-word' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold mb-3 transition-all border"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Follow up on WhatsApp</span>
            </a>

            {/* Return home */}
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer mb-2.5"
              style={{ background: '#1B2A5C' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#111c3e')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1B2A5C')}
            >
              <Home className="w-4 h-4" style={{ color: '#B8962E' }} />
              Return to All Services
            </button>

            {/* View in Admin */}
            <Link
              to="/admin"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-[#1B2A5C] border-slate-200"
            >
              <Shield className="w-3.5 h-3.5 text-[#B8962E]" />
              <span>Open Admin Panel to View Submission →</span>
            </Link>
          </div>
        </div>

        {/* Company footer */}
        <div className="text-center mt-5 space-y-1">
          <p className="text-xs font-semibold" style={{ color: '#475569' }}>{companySettings.companyName}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{companySettings.address}</p>
          <a href={`tel:${companySettings.phone}`} className="inline-flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
            <Phone className="w-3 h-3" />
            {companySettings.phone}
          </a>
        </div>
      </div>
    </div>
  );
};
