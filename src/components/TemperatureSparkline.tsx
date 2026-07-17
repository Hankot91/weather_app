import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { buildSparkline } from "../utils/sparkline";
import { formatHourLabel } from "../utils/time";
import { useUnit } from "../context/unit-context";
import type { Hour } from "../interfaces/weather";

interface TemperatureSparklineProps {
	hours: Hour[];
}

const WIDTH = 220;
const HEIGHT = 44;

export function TemperatureSparkline({ hours }: TemperatureSparklineProps) {
	const shouldReduceMotion = useReducedMotion();
	const gradientId = useId();
	const { formatTemp } = useUnit();

	const sample = hours.slice(0, 8);
	if (sample.length < 2) return null;

	const temps = sample.map((h) => h.temp);
	const { points, linePath, areaPath } = buildSparkline(temps, WIDTH, HEIGHT);
	if (points.length === 0) return null;

	const first = sample[0];
	const last = sample[sample.length - 1];
	const nowPoint = points[0];

	return (
		<div className="flex flex-col items-center gap-1 mt-3">
			<svg
				width={WIDTH}
				height={HEIGHT}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role="img"
				aria-label={`Tendencia de temperatura de las próximas ${sample.length} horas`}
			>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0)" />
					</linearGradient>
				</defs>

				<path d={areaPath} fill={`url(#${gradientId})`} />
				<motion.path
					d={linePath}
					fill="none"
					stroke="rgba(245,247,250,0.75)"
					strokeWidth={1.5}
					strokeLinecap="round"
					strokeLinejoin="round"
					initial={shouldReduceMotion ? undefined : { pathLength: 0 }}
					animate={shouldReduceMotion ? undefined : { pathLength: 1 }}
					transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
				/>

				<circle
					cx={nowPoint.x}
					cy={nowPoint.y}
					r={2.5}
					fill="#F2A65A"
				/>
				<motion.circle
					cx={nowPoint.x}
					cy={nowPoint.y}
					r={2.5}
					fill="none"
					stroke="#F2A65A"
					strokeWidth={1}
					animate={
						shouldReduceMotion
							? undefined
							: { r: [2.5, 6, 2.5], opacity: [0.7, 0, 0.7] }
					}
					transition={{
						duration: 2.2,
						repeat: Infinity,
						ease: "easeOut",
					}}
				/>
			</svg>

			<div className="flex justify-between w-full max-w-55 px-2 font-mono text-[10px] text-textMuted">
				<span>Ahora</span>
				<span>{formatHourLabel(last.datetime)}</span>
			</div>

			<span className="sr-only">
				{`Desde ${formatTemp(first.temp)} ahora hasta ${formatTemp(last.temp)} a las ${formatHourLabel(last.datetime)}`}
			</span>
		</div>
	);
}
