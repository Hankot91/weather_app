import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import type { WeatherIcon } from "../interfaces/weather";
import { getAtmosphereTheme } from "../utils/atmosphere";
import { WeatherParticles } from "./WeatherParticles";

interface AtmosphereBackgroundProps {
	icon: WeatherIcon;
	isDay: boolean;
}

export function AtmosphereBackground({
	icon,
	isDay,
}: AtmosphereBackgroundProps) {
	const theme = useMemo(() => getAtmosphereTheme(icon, isDay), [icon, isDay]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			<AnimatePresence>
				<motion.div
					key={`${theme.category}-${theme.isDay}`}
					className="absolute inset-0"
					style={{
						background: `linear-gradient(160deg, var(${theme.fromVar}), var(${theme.toVar}))`,
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 1.4, ease: "easeInOut" }}
				/>
			</AnimatePresence>
			<WeatherParticles icon={icon} isDay={theme.isDay} />
			<div className="absolute inset-0 grain-overlay pointer-events-none" />
			{/* Resplandor sutil tipo sol/luna — el único elemento con vida propia, todo lo demás queda quieto */}
			<motion.div
				className="absolute rounded-full blur-3xl"
				style={{
					width: 420,
					height: 420,
					top: theme.isDay ? "8%" : "12%",
					left: theme.isDay ? "65%" : "20%",
					background: theme.isDay
						? "radial-gradient(circle, rgba(255,244,214,0.35), transparent 70%)"
						: "radial-gradient(circle, rgba(200,210,255,0.18), transparent 70%)",
				}}
				animate={{ opacity: [0.6, 0.9, 0.6] }}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}