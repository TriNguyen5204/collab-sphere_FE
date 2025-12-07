import React from 'react';

/**
 * StatCard Component
 * Style: Soft Minimalism (Rounded, Clean, Light Elevation)
 */
export default function StatCard({ icon: Icon, label, value, color = 'orange' }) {
  // Color Strategy: Muted, warm palettes with accent colors
  const styles = {
    orange: {
      wrapper: 'bg-white hover:border-orange-200',
      iconBg: 'bg-orange-50 text-orange-600',
      ring: 'group-hover:ring-orange-50',
    },
    green: {
      wrapper: 'bg-white hover:border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      ring: 'group-hover:ring-emerald-50',
    },
    gray: {
      wrapper: 'bg-white hover:border-gray-300',
      iconBg: 'bg-gray-100 text-gray-500',
      ring: 'group-hover:ring-gray-100',
    },
    purple: {
      wrapper: 'bg-white hover:border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600',
      ring: 'group-hover:ring-purple-50',
    },
  };

  const currentStyle = styles[color] || styles.orange;

  return (
    // Implementation Notes: Rounded containers, light elevation, generous whitespace
    // Added 'group' for hover effects
    <div 
      className={`
        group relative overflow-hidden
        ${currentStyle.wrapper}
        rounded-2xl border border-gray-100 shadow-sm
        p-6 transition-all duration-300 ease-out
        hover:shadow-md hover:-translate-y-1
      `}
    >
      <div className='flex items-start justify-between'>
        <div className='flex flex-col gap-2'>
          {/* Typography: Friendly, clean */}
          <p className='text-sm font-medium text-gray-500 tracking-wide uppercase'>
            {label}
          </p>
          <p className='text-4xl font-bold text-gray-900 tracking-tight'>
            {value}
          </p>
        </div>
        
        {/* Icon: Soft geometry with accent color */}
        <div className={`
          ${currentStyle.iconBg}
          w-14 h-14 rounded-xl flex items-center justify-center
          transition-all duration-300
          ring-4 ring-transparent ${currentStyle.ring}
        `}>
          <Icon className='w-7 h-7' />
        </div>
      </div>
      
      {/* Decorative: Subtle background glow for Soft Minimalism depth */}
      <div className={`
        absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 pointer-events-none
        ${currentStyle.iconBg.split(' ')[0].replace('bg-', 'bg-')}
      `} />
    </div>
  );
}