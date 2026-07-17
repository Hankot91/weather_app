/** Semicírculo superior: de -180° (izquierda) a 0° (derecha), pasando por -90° (arriba) */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export interface ArcGaugeData {
  trackPath: string;
  valuePath: string;
}

/**
 * value: 0-1. Genera dos arcos SVG (pista completa + progreso) para un
 * gauge de medio círculo, evitando traer una librería de charts para
 * un indicador tan simple.
 */
export function buildArcGauge(value: number, cx: number, cy: number, r: number): ArcGaugeData {
  const clamped = Math.max(0, Math.min(1, value));
  const start = polarToCartesian(cx, cy, r, -180);
  const end = polarToCartesian(cx, cy, r, 0);
  const valueEnd = polarToCartesian(cx, cy, r, -180 + clamped * 180);

  const trackPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  const largeArc = clamped > 0.5 ? 1 : 0;
  const valuePath =
    clamped <= 0
      ? ""
      : `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${valueEnd.x} ${valueEnd.y}`;

  return { trackPath, valuePath };
}
