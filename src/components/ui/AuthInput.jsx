import React from 'react';

const VARIANT_STYLES = {
  blue: {
    gradient: 'from-sky-400/75 via-indigo-400/60 to-blue-500/70',
    glow: 'shadow-[0_26px_60px_-34px_rgba(37,99,235,0.65)]',
    iconBg: 'bg-gradient-to-br from-sky-50/90 via-white/40 to-indigo-50/80 text-indigo-500',
    focusLabel: 'peer-focus:text-indigo-500',
    focusShadow: 'group-focus-within:shadow-[0_26px_58px_-28px_rgba(37,99,235,0.55)]',
  },
  purple: {
    gradient: 'from-fuchsia-400/75 via-purple-400/60 to-pink-500/70',
    glow: 'shadow-[0_26px_60px_-34px_rgba(192,38,211,0.6)]',
    iconBg: 'bg-gradient-to-br from-fuchsia-50/90 via-white/40 to-pink-50/80 text-purple-500',
    focusLabel: 'peer-focus:text-purple-500',
    focusShadow: 'group-focus-within:shadow-[0_26px_58px_-28px_rgba(192,38,211,0.55)]',
  },
};

const AuthInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  error,
  rightElement,
  variant = 'blue',
  autoComplete,
  disabled = false,
  children,
  inputMode,
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;
  const gradientClasses = error
    ? 'from-rose-400/80 via-orange-400/70 to-rose-500/80 opacity-100 shadow-[0_24px_60px_-30px_rgba(244,63,94,0.55)]'
    : `${styles.gradient} ${styles.glow}`;
  const labelColorClass = error ? 'text-rose-500' : 'text-gray-500';

  return (
    <div className="space-y-2">
      <label className="relative block group">
        <div
          className={`pointer-events-none absolute -inset-[1.6px] rounded-2xl opacity-0 transition-all duration-500 ease-out group-hover:opacity-75 group-focus-within:opacity-100 ${gradientClasses}`}
        />
        <div
          className={`relative flex items-center gap-3 rounded-2xl border border-white/45 bg-white/85 px-4 py-3 transition-all duration-300 backdrop-blur-sm ${
            error
              ? 'border-rose-200/80 bg-white/95 shadow-[0_24px_55px_-28px_rgba(244,63,94,0.45)]'
              : `hover:border-white/70 ${styles.focusShadow}`
          } group-focus-within:border-transparent group-focus-within:bg-white/95`}
        >
          {Icon && (
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconBg}`}>
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="relative flex-1 py-1">
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              autoComplete={autoComplete}
              disabled={disabled}
              inputMode={inputMode}
              placeholder=" "
              className={`peer w-full bg-transparent text-base font-medium text-gray-900 placeholder-transparent focus:outline-none ${
                disabled ? 'cursor-not-allowed text-gray-400' : ''
              }`}
            />
            <span
              className={`pointer-events-none absolute left-0 top-0 -translate-y-3 text-xs font-medium tracking-wide opacity-90 transition-all duration-300 ease-out ${
                styles.focusLabel
              } ${labelColorClass} peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-500`}
            >
              {label}
            </span>
          </div>
          {rightElement && <div className="flex items-center justify-center">{rightElement}</div>}
        </div>
      </label>
      {children && <div className="mt-2">{children}</div>}
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
};

export default AuthInput;
