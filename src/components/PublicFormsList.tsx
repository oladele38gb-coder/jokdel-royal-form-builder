import React, { useState } from 'react';
import { FormConfig } from '../types';
import { ArrowRight, Search, Building2, Key, ShieldCheck, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface PublicFormsListProps {
  forms: FormConfig[];
  onSelectForm: (formId: string) => void;
}

export const PublicFormsList: React.FC<PublicFormsListProps> = ({ forms, onSelectForm }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeForms = forms.filter((f) => f.isActive);

  const categories = ['All', 'Sales', 'Rentals', 'Property Management', 'KYC & Engagement', 'Tenancy'];

  const filteredForms = activeForms.filter((form) => {
    const matchesCategory =
      selectedCategory === 'All' || form.category === selectedCategory;
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Sales':
        return <Building2 className="w-4 h-4 text-[#131B2E]" />;
      case 'Rentals':
        return <Key className="w-4 h-4 text-[#6E1E1E]" />;
      case 'Property Management':
        return <ShieldCheck className="w-4 h-4 text-[#C5A059]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#131B2E]" />;
    }
  };

  return (
    <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Intro Banner */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[#6E1E1E] text-[10px] sm:text-xs font-semibold tracking-wide uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6E1E1E]"></span>
          Verified Real Estate Solutions
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#131B2E] tracking-tight">
          Get in Touch with Jokdel Royal
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Select an inquiry service below to submit your requirements directly to our property specialists.
        </p>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-5 bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200">
        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#1D3557] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {cat === 'All' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 focus:outline-hidden focus:border-[#131B2E] text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Forms Grid - Clean, compact mobile cards */}
      {filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredForms.map((form) => {
            const estimatedMins = Math.max(2, Math.ceil((form.fields?.length || 4) * 0.5));

            return (
              <div
                key={form.id}
                onClick={() => onSelectForm(form.id)}
                className="group bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:border-[#131B2E]/40 transition-all cursor-pointer flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#131B2E] tracking-wider uppercase">
                      {form.category || 'General'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>~{estimatedMins} mins fill time</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#131B2E] group-hover:text-[#6E1E1E] transition-colors leading-snug">
                    {form.title}
                  </h3>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForm(form.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D3557] text-white text-xs font-semibold hover:bg-[#162744] transition-colors shadow-2xs"
                  >
                    <span>Fill Form</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 p-6">
          <p className="text-slate-500 font-medium text-xs sm:text-sm">
            No inquiry forms found matching your filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-2 text-xs font-semibold text-[#6E1E1E] hover:underline"
          >
            Clear search filters
          </button>
        </div>
      )}

      {/* Trust Badges Footer */}
      <div className="mt-8 sm:mt-12 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-slate-600">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6E1E1E]" />
          <span className="text-xs font-medium">Verified Property Titles</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#131B2E]" />
          <span className="text-xs font-medium">Fast Intermediary & Letting</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-medium">Structured Property Management</span>
        </div>
      </div>
    </div>
  );
};

