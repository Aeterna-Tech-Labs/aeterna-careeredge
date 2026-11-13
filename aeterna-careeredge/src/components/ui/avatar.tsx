interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      role="img"
      aria-label={name}
      className={[
        "flex shrink-0 items-center justify-center rounded-full",
        "bg-soft-gold font-semibold text-maroon-800",
        sizes[size],
        className,
      ].join(" ")}
    >
      {initials || "?"}
    </div>
  );
}
