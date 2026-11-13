interface ProgressProps {
  value: number;
  showLabel?: boolean;
  color?: "maroon" | "gold" | "success";
  className?: string;
}

const colors = {
  maroon: "bg-maroon-700",
  gold: "bg-gold-500",
  success: "bg-success",
};

export function Progress({
  value,
  showLabel = false,
  color = "maroon",
  className = "",
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-dark-text">Progress</span>
          <span className="text-secondary-text">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-2 w-full overflow-hidden rounded-full bg-soft-gold"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
