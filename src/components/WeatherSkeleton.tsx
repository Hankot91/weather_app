import { motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "./Skeleton";

function HourSkeleton() {
  return (
    <div className="glass-panel flex flex-col items-center gap-2 px-4 py-3 min-w-19 shrink-0">
      <Skeleton className="h-2.5 w-8 rounded-full" />
      <Skeleton className="h-5.5 w-5.5 rounded-full" />
      <Skeleton className="h-4 w-6 rounded-full" />
    </div>
  );
}

function MetricSkeleton({ variant }: { variant: "gauge" | "plain" }) {
  if (variant === "gauge") {
    return (
      <div className="glass-panel flex items-center gap-3 p-3 min-w-30 h-full">
        <Skeleton className="h-13 w-13 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 min-w-0 w-full">
          <Skeleton className="h-2.5 w-14 rounded-full" />
          <Skeleton className="h-2.5 w-10 rounded-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="glass-panel flex flex-col gap-1 p-3 min-w-30 h-full justify-center">
      <Skeleton className="h-2.5 w-14 rounded-full" />
      <Skeleton className="h-5 w-10 mt-1 rounded-full" />
    </div>
  );
}

function DaySkeleton() {
  return (
    <div className="glass-panel flex items-center gap-1.5 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 w-full">
      <Skeleton className="h-3.5 w-8 rounded-full" />
      <Skeleton className="h-4.5 w-4.5 rounded-full shrink-0" />
      <div className="flex-1" />
      <Skeleton className="h-3.5 w-6 rounded-full" />
      <Skeleton className="h-1 flex-1 rounded-full" />
      <Skeleton className="h-3.5 w-6 rounded-full" />
    </div>
  );
}

export function WeatherSkeleton() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-label="Cargando información del clima"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.15 : 0.35 }}
      className="bento-weather"
    >
      <div className="[grid-area:hero] h-full">
        <div className="glass-panel flex flex-col items-center justify-center gap-3 w-full h-full p-6">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-20 w-32 rounded-3xl mt-1" />
          <Skeleton className="h-11 w-55 rounded-2xl mt-1" />
          <Skeleton className="h-4 w-32 mt-1 rounded-full" />
        </div>
      </div>

      <div className="[grid-area:globe] h-full">
        <div className="glass-panel relative w-full h-full min-h-55 overflow-hidden p-3 flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      </div>

      <div className="[grid-area:hourly]">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <HourSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="[grid-area:metrics] h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full h-full">
          {(["gauge", "plain", "plain", "gauge", "plain", "gauge"] as const).map(
            (variant, i) => (
              <MetricSkeleton key={i} variant={variant} />
            ),
          )}
        </div>
      </div>

      <div className="[grid-area:sunmoon] h-full">
        <div className="glass-panel flex flex-col justify-center gap-3 p-4 w-full h-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-20 rounded-2xl" />
            <Skeleton className="h-8 w-20 rounded-2xl" />
          </div>
          <div className="h-px bg-white/10" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
      </div>

      <div className="[grid-area:daily]">
        <div className="flex flex-col gap-2 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <DaySkeleton key={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}