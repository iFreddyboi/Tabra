import { ButtonHTMLAttributes, forwardRef, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
  href?: string;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand",
  secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus-visible:ring-brand",
  ghost: "text-gray-600 hover:bg-gray-100 focus-visible:ring-brand",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className, children, asChild, href, ...props }, ref) => {
    const cls = clsx(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && href) {
      return <Link href={href} className={cls}>{children}</Link>;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cls}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
