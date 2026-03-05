'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useTransition } from 'react';
import { Filter, X, ChevronDown, MapPin, Building2, Award, Stethoscope } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface HospitalFiltersProps {
  cities: FilterOption[];
  types: FilterOption[];
  accreditations: FilterOption[];
  specialties: FilterOption[];
  totalCount: number;
}

export default function HospitalFilters({
  cities,
  types,
  accreditations,
  specialties,
  totalCount,
}: HospitalFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentCity = searchParams.get('city') || '';
  const currentType = searchParams.get('type') || '';
  const currentAccreditation = searchParams.get('accreditation') || '';
  const currentSpecialty = searchParams.get('specialty') || '';

  const activeFiltersCount = [currentCity, currentType, currentAccreditation, currentSpecialty].filter(Boolean).length;

  const updateFilters = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        router.push(`/hospitals?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push('/hospitals');
    });
  }, [router]);

  return (
    <div className="mb-8">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
        >
          <Filter size={16} />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-xs">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
              Clear all
            </button>
          )}
          <span className="text-sm text-slate-500">
            {isPending ? 'Loading...' : `${totalCount} hospitals`}
          </span>
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentCity && (
            <FilterPill
              label={cities.find(c => c.value === currentCity)?.label || currentCity}
              icon={<MapPin size={12} />}
              onRemove={() => updateFilters('city', '')}
            />
          )}
          {currentType && (
            <FilterPill
              label={types.find(t => t.value === currentType)?.label || currentType}
              icon={<Building2 size={12} />}
              onRemove={() => updateFilters('type', '')}
            />
          )}
          {currentAccreditation && (
            <FilterPill
              label={currentAccreditation}
              icon={<Award size={12} />}
              onRemove={() => updateFilters('accreditation', '')}
            />
          )}
          {currentSpecialty && (
            <FilterPill
              label={specialties.find(s => s.value === currentSpecialty)?.label || currentSpecialty}
              icon={<Stethoscope size={12} />}
              onRemove={() => updateFilters('specialty', '')}
            />
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* City Filter */}
            <FilterDropdown
              label="City"
              icon={<MapPin size={16} className="text-teal-500" />}
              value={currentCity}
              options={cities}
              onChange={(v) => updateFilters('city', v)}
              placeholder="All cities"
            />

            {/* Type Filter */}
            <FilterDropdown
              label="Hospital Type"
              icon={<Building2 size={16} className="text-blue-500" />}
              value={currentType}
              options={types}
              onChange={(v) => updateFilters('type', v)}
              placeholder="All types"
            />

            {/* Accreditation Filter */}
            <FilterDropdown
              label="Accreditation"
              icon={<Award size={16} className="text-amber-500" />}
              value={currentAccreditation}
              options={accreditations}
              onChange={(v) => updateFilters('accreditation', v)}
              placeholder="Any accreditation"
            />

            {/* Specialty Filter */}
            <FilterDropdown
              label="Specialty"
              icon={<Stethoscope size={16} className="text-purple-500" />}
              value={currentSpecialty}
              options={specialties}
              onChange={(v) => updateFilters('specialty', v)}
              placeholder="All specialties"
            />
          </div>

          {/* Quick Filters */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Filters</p>
            <div className="flex flex-wrap gap-2">
              <QuickFilter
                label="JCI Accredited"
                isActive={currentAccreditation === 'JCI'}
                onClick={() => updateFilters('accreditation', currentAccreditation === 'JCI' ? '' : 'JCI')}
              />
              <QuickFilter
                label="NABH Accredited"
                isActive={currentAccreditation === 'NABH'}
                onClick={() => updateFilters('accreditation', currentAccreditation === 'NABH' ? '' : 'NABH')}
              />
              <QuickFilter
                label="Multi-Specialty"
                isActive={currentType === 'multi_specialty'}
                onClick={() => updateFilters('type', currentType === 'multi_specialty' ? '' : 'multi_specialty')}
              />
              <QuickFilter
                label="Teaching Hospital"
                isActive={currentType === 'teaching'}
                onClick={() => updateFilters('type', currentType === 'teaching' ? '' : 'teaching')}
              />
              <QuickFilter
                label="Corporate Chain"
                isActive={currentType === 'corporate_chain'}
                onClick={() => updateFilters('type', currentType === 'corporate_chain' ? '' : 'corporate_chain')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  icon,
  onRemove,
}: {
  label: string;
  icon: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-sm">
      {icon}
      {label}
      <button onClick={onRemove} className="ml-1 hover:text-teal-900">
        <X size={14} />
      </button>
    </span>
  );
}

function FilterDropdown({
  label,
  icon,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label} {opt.count !== undefined && `(${opt.count})`}
          </option>
        ))}
      </select>
    </div>
  );
}

function QuickFilter({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? 'bg-teal-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
