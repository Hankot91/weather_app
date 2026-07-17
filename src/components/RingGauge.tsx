import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RingGaugeProps {
  /** Valor ya normalizado 0-100 */
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  children: ReactNode;
}

/**
 * Anillo de progreso circular compacto para métricas con una escala 0-100%
 * clara (humedad, UV, nubosidad). El número/valor va centrado adentro,
 * así el gauge reemplaza el texto plano sin ocupar espacio extra.
 */
export function RingGauge({
  percent,
  color,
  size = 52,
  strokeWidth = 5,
  label,
  children,
}: RingGaugeProps) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.min(Math.max(percent, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - clamped / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: shouldReduceMotion ? targetOffset : circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
