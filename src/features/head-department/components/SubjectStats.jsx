import React from 'react';
import { BookOpen, Package, BookMarked, Filter, Users } from 'lucide-react';

/**
 * SubjectStats Component
 * Style: Matching Staff/Admin Hub Design
 * Branding: FPT Orange context
 */
export default function SubjectStats({ total, active, inactive, categories, selectedStat, onStatClick }) {
  const stats = [
    { key: 'total', label: 'Total', value: total, icon: BookOpen },
    { key: 'active', label: 'Active', value: active, icon: Package },
    { key: 'inactive', label: 'Inactive', value: inactive, icon: BookMarked },
    { key: 'categories', label: 'Categories', value: categories, icon: Filter },
  ];

  return (
    <div className="w-full max-w-xl">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon;
          const isSelected = selectedStat === stat.key;
          return (
            <div
              key={stat.key}
              onClick={() => onStatClick?.(stat.key)}
              className={`rounded-2xl border px-4 py-3 shadow-sm backdrop-blur cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500' 
                  : 'border-orangeFpt-100 bg-white/60 hover:border-orangeFpt-300 hover:bg-white'
                }
              `}
            >
              <div className="flex justify-between items-start">
                <p className={`text-[11px] uppercase tracking-wide font-semibold ${isSelected ? 'text-orangeFpt-700' : 'text-slate-500'}`}>
                  {stat.label}
                </p>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-orangeFpt-600' : 'text-slate-400'}`} />
              </div>
              <div className="flex justify-between items-end mt-1">
                <p className={`text-xl font-bold ${isSelected ? 'text-orangeFpt-600' : 'text-slate-700'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}