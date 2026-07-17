import { motion, useReducedMotion } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import type { Hour } from "../interfaces/weather";
import { ICON_MAP } from "../utils/iconMap";
import { formatHourLabel, getUpcomingHours } from "../utils/time";
import { useUnit } from "../context/unit-context";

interface HourCardProps {
	hour: Hour;
	isNow: boolean;
}

function HourCard({ hour, isNow }: HourCardProps) {
	const Icon = ICON_MAP[hour.icon];
	const { formatTemp } = useUnit();

	return (
		<div className="glass-panel bento-tile-ambient flex flex-col items-center gap-2 px-4 py-3 min-w-19 shrink-0">
			<span className="font-mono text-[11px] text-textMuted">
				{isNow ? "Ahora" : formatHourLabel(hour.datetime)}
			</span>
			<Icon
				size={22}
				strokeWidth={1.5}
				className="text-textPrimary/80"
				aria-hidden="true"
			/>
			<span className="font-display text-lg text-textPrimary">
				{formatTemp(hour.temp)}
			</span>
			{hour.precipprob > 0 && (
				<span className="font-mono text-[10px] text-skyDay">
					{Math.round(hour.precipprob)}%
				</span>
			)}
		</div>
	);
}

interface HourlyForecastProps {
	todayHours: Hour[];
	tomorrowHours?: Hour[];
}

export function HourlyForecast({
	todayHours,
	tomorrowHours,
}: HourlyForecastProps) {
	const upcoming = getUpcomingHours(todayHours, tomorrowHours);
	const scrollRef = useRef<HTMLDivElement>(null);
	const shouldReduceMotion = useReducedMotion();

	const isDragging = useRef(false);
	const startX = useRef(0);
	const scrollLeftStart = useRef(0);

	const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
		if (!scrollRef.current) return;
		isDragging.current = true;
		startX.current = e.pageX;
		scrollLeftStart.current = scrollRef.current.scrollLeft;
	};

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		if (!isDragging.current || !scrollRef.current) return;
		e.preventDefault();
		const delta = e.pageX - startX.current;
		scrollRef.current.scrollLeft = scrollLeftStart.current - delta;
	};

	const stopDragging = () => {
		isDragging.current = false;
	};

	return (
		<motion.div
			ref={scrollRef}
			tabIndex={0}
			role="region"
			aria-label="Pronóstico por horas, usá las flechas para navegar"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			onKeyDown={(e) => {
				if (!scrollRef.current) return;
				if (e.key === "ArrowRight")
					scrollRef.current.scrollBy({
						left: 100,
						behavior: "smooth",
					});
				if (e.key === "ArrowLeft")
					scrollRef.current.scrollBy({
						left: -100,
						behavior: "smooth",
					});
			}}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={stopDragging}
			onMouseLeave={stopDragging}
			className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 -my-4 py-4 cursor-grab active:cursor-grabbing select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 [touch-action:pan-x]"
			style={{
				maskImage:
					"linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
			}}
		>
			<div className="flex gap-2 pb-2">
				{upcoming.map((hour, index) => (
					<motion.div
						key={hour.datetime}
						initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: shouldReduceMotion ? 0.15 : 0.3,
							delay: shouldReduceMotion ? 0 : index * 0.04,
							ease: [0.23, 1, 0.32, 1],
						}}
					>
						<HourCard hour={hour} isNow={index === 0} />
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}
