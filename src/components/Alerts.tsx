import { motion, useReducedMotion } from "framer-motion";
import type { Alert } from "../interfaces/weather";
import { getAlertStyle, severityLabel } from "../utils/alertStyle";

interface AlertsProps {
  alerts: Alert[];
}

export function Alerts({ alerts }: AlertsProps) {
  const shouldReduceMotion = useReducedMotion();
  if (alerts.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-2 w-full"
      role="alert"
      aria-live="assertive"
    >
      {alerts.map((alert, index) => {
        const style = getAlertStyle(alert);
        const Icon = style.icon;

        return (
          <motion.div
            key={`${alert.event}-${index}`}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.4,
              delay: index * 0.06,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="glass-panel flex gap-3 p-4 border-l-4"
            style={{
              borderLeftColor: style.color,
              background: `linear-gradient(to right, ${style.tint}, transparent 65%), rgba(255,255,255,0.08)`,
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              style={{ color: style.color }}
              className="shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-body text-sm font-medium text-textPrimary">
                  {alert.headline || alert.event}
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                  style={{ color: style.color, border: `1px solid ${style.color}66` }}
                >
                  {severityLabel(style.severity)}
                </span>
              </div>
              <p className="font-body text-xs text-textMuted leading-relaxed">
                {alert.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
