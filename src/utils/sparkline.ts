export interface SparklinePoint {
  x: number;
  y: number;
  temp: number;
}

export interface SparklineData {
  points: SparklinePoint[];
  linePath: string;
  areaPath: string;
}

/**
 * Convierte una serie de temperaturas en coordenadas SVG normalizadas.
 * El rango vertical se calcula sobre la propia serie (no sobre 0-100),
 * así la curva siempre usa el espacio disponible aunque la variación
 * del día sea de solo 2-3 grados.
 *
 * paddingX/paddingY dejan aire en los 4 bordes: sin esto, el primer y
 * último punto quedan pegados al borde del SVG y cualquier elemento que
 * crezca sobre ellos (como el anillo pulsante del marcador "ahora") se
 * corta al salir del viewBox.
 */
export function buildSparkline(
  temps: number[],
  width: number,
  height: number,
  paddingX = 8,
  paddingY = 8,
): SparklineData {
  if (temps.length < 2) {
    return { points: [], linePath: "", areaPath: "" };
  }

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;
  const step = usableWidth / (temps.length - 1);

  const points: SparklinePoint[] = temps.map((temp, i) => {
    const x = paddingX + i * step;
    const normalized = (temp - min) / range;
    const y = paddingY + (1 - normalized) * usableHeight;
    return { x, y, temp };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} ` +
    `L ${points[0].x.toFixed(1)} ${height} Z`;

  return { points, linePath, areaPath };
}
