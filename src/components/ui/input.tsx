import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand",
            error ? "border-red-400" : "border-gray-200",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
