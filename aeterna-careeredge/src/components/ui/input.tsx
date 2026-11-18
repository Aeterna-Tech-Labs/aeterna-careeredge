import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-dark-text"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        className={[
          "h-11 w-full rounded-lg border bg-white px-3 text-sm text-dark-text",
          "placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-maroon-700/20",
          error
            ? "border-red-500"
            : "border-app-border focus:border-maroon-700",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-secondary-text">{hint}</p>
      ) : null}
    </div>
  );
}
