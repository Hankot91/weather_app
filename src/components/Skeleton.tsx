interface SkeletonProps {
  className?: string;
}

/** Bloque base con efecto shimmer, para componer skeletons de cualquier forma */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer ${className}`}
      aria-hidden="true"
    />
  );
}
