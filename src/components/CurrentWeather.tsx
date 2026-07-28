import { motion, useReducedMotion } from "framer-motion";
import type { CurrentConditions, Hour } from "../interfaces/weather";
import { ICON_MAP } from "../utils/iconMap";
import { getAtmosphereCategory } from "../utils/atmosphere";
import { TemperatureSparkline } from "./TemperatureSparkline";
import { useUnit } from "../context/unit-context";

interface CurrentWeatherProps {
	current: CurrentConditions;
	cityName: string;
	tempmax: number;
	tempmin: number;
	upcomingHours: Hour[];
}

function getIconMotion(category: ReturnType<typeof getAtmosphereCategory>) {
	switch (category) {
		case "clear":
			return {
				animate: { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] },
				transition: {
					duration: 3.2,
					repeat: Infinity,
					ease: "easeInOut" as const,
				},
			};
		case "cloudy":
		case "fog":
			return {
				animate: { x: [-2, 2, -2] },
				transition: {
					duration: 5,
					repeat: Infinity,
					ease: "easeInOut" as const,
				},
			};
		case "rain":
		case "storm":
			return {
				animate: { y: [0, 2, 0] },
				transition: {
					duration: 1.8,
					repeat: Infinity,
					ease: "easeInOut" as const,
				},
			};
		case "snow":
			return {
				animate: { y: [0, 3, 0], rotate: [-3, 3, -3] },
				transition: {
					duration: 3.6,
					repeat: Infinity,
					ease: "easeInOut" as const,
				},
			};
		default:
			return { animate: {}, transition: {} };
	}
}

export function CurrentWeather({
	current,
	cityName,
	tempmax,
	tempmin,
	upcomingHours,
}: CurrentWeatherProps) {
	const Icon = ICON_MAP[current.icon];
	const shouldReduceMotion = useReducedMotion();
	const category = getAtmosphereCategory(current.icon);
	const iconMotion = getIconMotion(category);
	const { formatTemp } = useUnit();

	return (
		<motion.div
			key={cityName}
			initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: shouldReduceMotion ? 0.15 : 0.6,
				ease: [0.23, 1, 0.32, 1],
			}}
			className="glass-panel glass-glow flex flex-col items-center justify-center text-center w-full h-full p-6"
		>
			<h2 className="font-body text-lg text-textPrimary/90">
				{cityName}
			</h2>

			<div className="flex items-center gap-2 mt-1">
				<motion.div
					animate={
						shouldReduceMotion ? undefined : iconMotion.animate
					}
					transition={iconMotion.transition}
				>
					<Icon
						size={32}
						strokeWidth={1.5}
						className="text-textPrimary/80"
						aria-hidden="true"
					/>
				</motion.div>
				<p className="font-body text-sm text-textMuted capitalize">
					{current.conditions}
				</p>
			</div>

			<p className="font-display font-medium text-8xl leading-none mt-4 text-transparent bg-clip-text bg-linear-to-b from-textPrimary to-skyDay/80 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
				{formatTemp(current.temp)}
			</p>

			<TemperatureSparkline hours={upcomingHours} />

			<div className="flex items-center gap-3 mt-3 font-mono text-sm">
				<span className="text-rose-300/90 font-medium">
					Máx {formatTemp(tempmax)}
				</span>
				<span className="w-px h-3 bg-textMuted/40" />
				<span className="text-skyDay/90 font-medium">
					Mín {formatTemp(tempmin)}
				</span>
			</div>

			<p className="font-mono text-xs text-textMuted mt-2">
				Sensación térmica {formatTemp(current.feelslike)}
			</p>
		</motion.div>
	);
}
