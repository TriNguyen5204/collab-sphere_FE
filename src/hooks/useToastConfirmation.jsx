import React, { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const CANCEL_BUTTON_CLASS = 'rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50';
const CONTAINER_BASE_CLASS = 'flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-xl';

const VARIANT_PRESETS = {
  warning: {
    borderClass: 'border-amber-200',
    iconClass: 'bg-amber-50 text-amber-600',
    confirmButtonClass: 'rounded-lg bg-orangeFpt-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-orangeFpt-600',
  },
  danger: {
    borderClass: 'border-red-200',
    iconClass: 'bg-red-50 text-red-600',
    confirmButtonClass: 'rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600',
  },
  info: {
    borderClass: 'border-blue-200',
    iconClass: 'bg-blue-50 text-blue-600',
    confirmButtonClass: 'rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700',
  },
};

const useToastConfirmation = () => {
  const confirmWithToast = useCallback((options) => {
    const normalizedOptions = typeof options === 'string' ? { message: options } : options ?? {};
    const {
      message = 'Are you sure?',
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      variant = 'warning',
      icon: IconComponent = AlertTriangle,
      iconProps,
      containerClassName = '',
      confirmButtonClassName,
      cancelButtonClassName,
      duration = Infinity,
      position = 'top-right',
    } = normalizedOptions;

    const variantPreset = VARIANT_PRESETS[variant] ?? VARIANT_PRESETS.warning;
    const confirmClassName = confirmButtonClassName ?? variantPreset.confirmButtonClass;
    const cancelClassName = cancelButtonClassName ?? CANCEL_BUTTON_CLASS;

    return new Promise((resolve) => {
      let isResolved = false;
      let toastId;

      const complete = (result) => {
        if (isResolved) return;
        isResolved = true;
        if (toastId) {
          toast.dismiss(toastId);
        }
        resolve(result);
      };

      toastId = toast.custom(
        () => (
          <div className={`${CONTAINER_BASE_CLASS} border ${variantPreset.borderClass} ${containerClassName}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${variantPreset.iconClass}`}>
              {React.isValidElement(IconComponent) ? (
                IconComponent
              ) : (
                <IconComponent {...(iconProps ?? { size: 18 })} />
              )}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-slate-800">{message}</p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => complete(false)}
                  className={cancelClassName}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => complete(true)}
                  className={confirmClassName}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>
        ),
        {
          duration,
          position,
          onDismiss: () => complete(false),
        },
      );
    });
  }, []);

  return confirmWithToast;
};

export default useToastConfirmation;
