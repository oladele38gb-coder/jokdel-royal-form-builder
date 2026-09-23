import React from 'react';
import { FormConfig, FormResponse, CompanySettings, FileDataValue } from '../../types';
import letterheadLogo from '../../../assets/jokdel_royal_letterhead_logo.png';

interface LetterheadPDFProps {
  response: FormResponse;
  form: FormConfig;
  settings: CompanySettings;
}

export const LetterheadPDF: React.FC<LetterheadPDFProps> = ({ response, form, settings }) => {
  const signatureDataUrl = response.fieldValues?.['__signature_image__'] as string | undefined;

  const getStringValue = (val: any): string => {
    if (val === undefined || val === null) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object' && 'fileName' in val) return `[File: ${(val as FileDataValue).fileName}]`;
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  // Group fields by section
  const sections: Record<string, { label: string; value: string }[]> = {};
  form.fields.forEach(field => {
    if (field.id === '__signature_image__') return;
    const section = field.section || 'General';
    if (!sections[section]) sections[section] = [];
    const rawVal = response.fieldValues?.[field.id];
    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      sections[section].push({ label: field.label, value: getStringValue(rawVal) });
    }
  });

  return (
    <div
      id="letterhead-print-area"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '18mm 20mm 15mm 20mm',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10pt',
        color: '#1a1a2e',
        background: 'white',
        position: 'relative',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-35deg)',
        fontSize: '72pt', fontWeight: 900,
        color: 'rgba(27,42,92,0.04)',
        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0,
        letterSpacing: '0.1em', userSelect: 'none',
      }}>CONFIDENTIAL</div>

      {/* Content wrapper — above watermark */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Letterhead Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1B2A5C', paddingBottom: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={letterheadLogo} alt="Jokdel Royal" style={{ height: '56px', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', lineHeight: 1.7, color: '#475569' }}>
            <div style={{ fontWeight: 700, color: '#1B2A5C', fontSize: '10pt' }}>{settings.companyName}</div>
            <div>{settings.address}</div>
            <div>Email: {settings.email}</div>
            <div>Phone: {settings.phone}</div>
          </div>
        </div>

        {/* Document Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '14pt', fontWeight: 700, color: '#1B2A5C', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {form.title}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '6px', fontSize: '9pt', color: '#64748b' }}>
            <span><strong>Reference:</strong> {response.id}</span>
            <span><strong>Date Submitted:</strong> {new Date(response.submittedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <span><strong>Status:</strong> {response.status}</span>
          </div>
          <div style={{ height: '1px', background: '#e2e8f0', marginTop: '12px' }} />
        </div>

        {/* Field Sections */}
        {Object.entries(sections).map(([section, fields]) => (
          <div key={section} style={{ marginBottom: '16px' }}>
            <div style={{
              backgroundColor: '#1B2A5C', color: 'white',
              padding: '4px 10px', fontSize: '8pt', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              {section}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
              <tbody>
                {fields.map((f, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '5px 10px', border: '1px solid #e2e8f0', fontWeight: 600, width: '38%', color: '#475569', verticalAlign: 'top' }}>
                      {f.label}
                    </td>
                    <td style={{ padding: '5px 10px', border: '1px solid #e2e8f0', color: '#1e293b', verticalAlign: 'top', wordBreak: 'break-word' }}>
                      {f.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Signature Section */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '9pt', color: '#475569', marginBottom: '8px', fontStyle: 'italic' }}>
                I hereby declare that all information provided above is accurate and complete to the best of my knowledge. I understand that a false statement may invalidate this submission.
              </p>
              <div style={{ borderTop: '1px solid #1B2A5C', paddingTop: '6px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '8pt', color: '#94a3b8', margin: '0 0 2px' }}>Tenant's Name</p>
                  <p style={{ fontSize: '10pt', fontWeight: 700, color: '#1B2A5C', margin: 0 }}>{response.submitterName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '8pt', color: '#94a3b8', margin: '0 0 2px' }}>Date</p>
                  <p style={{ fontSize: '10pt', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                    {new Date(response.submittedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ height: '60px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                {signatureDataUrl
                  ? <img src={signatureDataUrl} alt="Signature" style={{ maxHeight: '56px', maxWidth: '150px', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '8pt', color: '#cbd5e1' }}>No signature provided</span>
                }
              </div>
              <p style={{ fontSize: '8pt', color: '#94a3b8', margin: 0 }}>Applicant Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', textAlign: 'center', fontSize: '8pt', color: '#94a3b8' }}>
          <p style={{ margin: 0 }}>
            {settings.companyName} — {settings.address} — {settings.phone} — {settings.email}
          </p>
          <p style={{ margin: '3px 0 0', color: '#B8962E', fontWeight: 600 }}>
            This is an official document generated by the Jokdel Royal Property Management System.
          </p>
        </div>
      </div>
    </div>
  );
};

// Utility to trigger browser print for the letterhead
export function printLetterhead() {
  window.print();
}
