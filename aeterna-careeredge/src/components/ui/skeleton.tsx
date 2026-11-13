
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
}: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circular: "h-12 w-12 rounded-full",
    rectangular: "h-24 w-full rounded-xl",
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-app-border/70 ${variants[variant]} ${className}`}
    />
  );
}
