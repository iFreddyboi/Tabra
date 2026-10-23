import { SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white",
            "focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand",
            error ? "border-red-400" : "border-gray-200",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
