import {
  CloudLightning, Wind, Snowflake, Flame, Droplets, Waves, Tornado, AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Alert } from "../interfaces/weather";

export type AlertSeverity = "minor" | "moderate" | "severe" | "extreme";

export interface AlertStyle {
  severity: AlertSeverity;
  icon: LucideIcon;
  color: string;
  tint: string;
}

const SEVERITY_COLOR: Record<AlertSeverity, { color: string; tint: string }> = {
  minor: { color: "#F2C94C", tint: "rgba(242,201,76,0.14)" },
  moderate: { color: "#F2A65A", tint: "rgba(242,166,90,0.14)" },
  severe: { color: "#F2765A", tint: "rgba(242,118,90,0.16)" },
  extreme: { color: "#E63946", tint: "rgba(230,57,70,0.18)" },
};

function detectSeverity(alert: Alert): AlertSeverity {
  const text = `${alert.event} ${alert.headline}`.toLowerCase();
  if (/extrem|catastróf|emergencia/.test(text)) return "extreme";
  if (/severe|severo|grave|huracán|tornado/.test(text)) return "severe";
  if (/moderate|moderad|advertencia|watch/.test(text)) return "moderate";
  return "minor";
}

function detectIcon(alert: Alert): LucideIcon {
  const text = `${alert.event} ${alert.headline}`.toLowerCase();
  if (/tornado/.test(text)) return Tornado;
  if (/huracán|hurricane/.test(text)) return Wind;
  if (/tormenta|thunder|eléctrica|electrica/.test(text)) return CloudLightning;
  if (/nieve|snow|ventisca|blizzard/.test(text)) return Snowflake;
  if (/calor|heat/.test(text)) return Flame;
  if (/inundación|inundacion|flood/.test(text)) return Waves;
  if (/viento|wind/.test(text)) return Wind;
  if (/lluvia|rain/.test(text)) return Droplets;
  return AlertTriangle;
}

export function getAlertStyle(alert: Alert): AlertStyle {
  const severity = detectSeverity(alert);
  return { severity, icon: detectIcon(alert), ...SEVERITY_COLOR[severity] };
}

/** Expone el color de una severidad sola, para reusar el mismo lenguaje
 *  visual (amarillo -> naranja -> rojo) en otras piezas, como el gauge de UV. */
export function severityColor(severity: AlertSeverity): string {
  return SEVERITY_COLOR[severity].color;
}

export function severityLabel(severity: AlertSeverity): string {
  switch (severity) {
    case "extreme": return "Extrema";
    case "severe": return "Severa";
    case "moderate": return "Moderada";
    default: return "Menor";
  }
}
