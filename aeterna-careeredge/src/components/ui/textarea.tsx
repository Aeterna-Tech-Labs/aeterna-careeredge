import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id ?? React.useId();

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-dark-text"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={!!error}
        className={[
          "min-h-28 w-full resize-y rounded-lg border bg-white px-3 py-2.5",
          "text-sm text-dark-text placeholder:text-muted-text",
          "focus:outline-none focus:ring-2 focus:ring-maroon-700/20",
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
