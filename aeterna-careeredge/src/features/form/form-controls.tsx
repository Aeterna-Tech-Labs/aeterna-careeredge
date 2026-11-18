"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Input } from "@/components/ui/input";

/* ------------------------------- Shared motion ------------------------------ */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

/* ------------------------------- Shared styles ------------------------------ */

export const labelClass = "mb-2 block text-sm font-semibold text-[#352020]";

const iconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8580] transition-colors duration-200 group-focus-within:text-[#7A0F1F]";

/** Class names for the shared <Input> component. */
export function fieldClass({
  icon = false,
  error = false,
}: { icon?: boolean; error?: boolean } = {}) {
  return `h-12 rounded-xl border-[#EBDDD1] bg-white ${icon ? "pl-10" : ""} ${
    error ? "border-red-400 focus-visible:ring-red-200" : ""
  }`;
}

const nativeClass = (error: boolean) =>
  `w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-[#9A8580] focus:ring-4 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-[#EBDDD1] hover:border-[#7A0F1F]/40 focus:border-[#7A0F1F] focus:ring-[#7A0F1F]/10"
  }`;

/* ------------------------------- Error message ------------------------------ */

export function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string | null;
}) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <span className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-700">
            <AlertCircle
              size={14}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            {message}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------- Field wrappers ------------------------------ */

/** Label + control + hint + error. The error id is `${id}-error`. */
export function FormField({
  id,
  label,
  optional,
  hint,
  error,
  icon: Icon,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && (
          <span className="ml-1 font-normal text-[#9A8580]">(optional)</span>
        )}
      </label>
      <div className="group relative">
        {Icon && <Icon aria-hidden="true" className={iconClass} />}
        {children}
      </div>
      {hint && !error && <p className="mt-2 text-xs text-[#9A8580]">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </motion.div>
  );
}

/** For groups of controls (chips, radios). Renders a fieldset with a legend. */
export function FieldGroup({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <motion.fieldset variants={fadeUp} className="min-w-0">
      <legend className={labelClass}>
        {label}
        {optional && (
          <span className="ml-1 font-normal text-[#9A8580]">(optional)</span>
        )}
      </legend>
      {hint && <p className="-mt-1 mb-3 text-sm text-[#765F5D]">{hint}</p>}
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </motion.fieldset>
  );
}

/* ----------------------------------- Inputs ---------------------------------- */

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  optional,
  hint,
  icon,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  optional?: boolean;
  hint?: string;
  icon?: LucideIcon;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <FormField
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      icon={icon}
      className={className}
    >
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        onBlur={onBlur}
        className={fieldClass({ icon: !!icon, error: !!error })}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FormField>
  );
}

export function SelectControl({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly string[];
  placeholder: string;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside or tapping outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as HTMLElement | null;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        target?.getAttribute?.("for") !== id
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onBlur, id]);

  // Adjust scroll position when navigating with keyboard
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 250px below and more space above, open upwards
      setOpenUpwards(spaceBelow < 250 && rect.top > 250);
      const selectedIdx = options.findIndex((opt) => opt === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    onBlur?.();
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex]);
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? "z-30" : ""}`}
    >
      <input type="hidden" name={id} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`${nativeClass(!!error)} flex h-12 items-center justify-between text-left ${
          value ? "text-[#352020]" : "text-[#9A8580]"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-[#9A8580] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#7A0F1F]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            ref={listRef}
            initial={{ opacity: 0, y: openUpwards ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-xl border border-[#EBDDD1] bg-white py-1.5 shadow-xl shadow-black/10 focus:outline-none ${
              openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
          >
            {options.map((option, index) => {
              const isSelected = option === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-[#7A0F1F]/5 font-semibold text-[#7A0F1F]"
                      : isHighlighted
                        ? "bg-[#FFF8F0] text-[#352020]"
                        : "text-[#352020] hover:bg-[#FFF8F0]"
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && (
                    <Check
                      size={15}
                      className="ml-2 shrink-0 text-[#7A0F1F]"
                    />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TextareaControl({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${nativeClass(false)} resize-y py-3 text-[#352020]`}
    />
  );
}

/** "+91" prefix and a 10-digit field. The error id is `${id}-error`. */
export function MobileInput({
  id,
  value,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  value: string;
  onChange: (digits: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 overflow-hidden rounded-xl border bg-white transition focus-within:ring-4 ${
        error
          ? "border-red-400 focus-within:ring-red-200"
          : "border-[#EBDDD1] focus-within:border-[#7A0F1F] focus-within:ring-[#7A0F1F]/10"
      }`}
    >
      <span className="flex items-center border-r border-[#EBDDD1] bg-[#FCF6F3] px-3.5 text-sm font-semibold text-[#352020]">
        +91
      </span>
      <input
        id={id}
        name={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="10-digit mobile number"
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 10))
        }
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 min-w-0 flex-1 bg-white px-4 text-sm text-[#352020] outline-none placeholder:text-[#9A8580]"
      />
    </div>
  );
}

export function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      <Input
        id={id}
        name={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        onBlur={onBlur}
        className={`${fieldClass({ icon: true, error: !!error })} pr-11`}
        autoComplete="new-password"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-[#9A8580] transition-colors hover:text-[#7A0F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F]"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </motion.button>
    </>
  );
}

/* ------------------------------------ Chips ---------------------------------- */

export function ChipSelect({
  options,
  selected,
  onToggle,
  max,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const isDisabled =
          !isSelected && max !== undefined && selected.length >= max;

        return (
          <motion.button
            key={option}
            type="button"
            aria-pressed={isSelected}
            disabled={isDisabled}
            whileTap={isDisabled ? undefined : { scale: 0.95 }}
            onClick={() => onToggle(option)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A0F1F] focus-visible:ring-offset-2 ${
              isSelected
                ? "border-[#7A0F1F] bg-[#7A0F1F] text-white"
                : isDisabled
                  ? "cursor-not-allowed border-[#EBDDD1] bg-[#F8EFE7] text-[#C0A89E]"
                  : "border-[#EBDDD1] bg-white text-[#765F5D] hover:border-[#7A0F1F] hover:text-[#7A0F1F]"
            }`}
          >
            {isSelected && <Check size={14} aria-hidden="true" />}
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}