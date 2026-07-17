import { motion, useReducedMotion } from "framer-motion";
import { Droplets } from "lucide-react";
import type { Day } from "../interfaces/weather";
import { ICON_MAP } from "../utils/iconMap";
import { useUnit } from "../context/unit-context";

interface DayRowProps {
	day: Day;
	isToday: boolean;
	maxTempOfWeek: number;
	minTempOfWeek: number;
}

function formatDayLabel(datetime: string, isToday: boolean): string {
	if (isToday) return "Hoy";
	const date = new Date(`${datetime}T00:00:00`);
	const label = date.toLocaleDateString("es-ES", { weekday: "short" });
	return label.charAt(0).toUpperCase() + label.slice(1);
}

function DayRow({ day, isToday, maxTempOfWeek, minTempOfWeek }: DayRowProps) {
	const Icon = ICON_MAP[day.icon];
	const { formatTemp } = useUnit();
	const weekRange = maxTempOfWeek - minTempOfWeek || 1;
	const barStart = ((day.tempmin - minTempOfWeek) / weekRange) * 100;
	const barEnd = ((day.tempmax - minTempOfWeek) / weekRange) * 100;

	return (
		<div className="glass-panel bento-tile-ambient flex items-center gap-1.5 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 w-full">
			<span className="font-body text-xs sm:text-sm text-textPrimary w-8 sm:w-10 shrink-0">
				{formatDayLabel(day.datetime, isToday)}
			</span>

			<Icon
				size={18}
				strokeWidth={1.5}
				className="text-textPrimary/80 shrink-0"
				aria-hidden="true"
			/>

			{day.precipprob > 0 ? (
				<div className="flex items-center gap-0.5 w-9 sm:w-12 shrink-0 text-skyDay">
					<Droplets size={11} strokeWidth={1.5} aria-hidden="true" />
					<span className="font-mono text-[10px]">
						{Math.round(day.precipprob)}%
					</span>
				</div>
			) : (
				<div className="w-9 sm:w-12 shrink-0" />
			)}

			<span className="font-mono text-xs sm:text-sm text-textMuted w-6 sm:w-8 text-right shrink-0">
				{formatTemp(day.tempmin)}
			</span>

			<div className="flex-1 h-1 rounded-full bg-white/10 relative min-w-9 sm:min-w-15">
				<div
					className="absolute h-full rounded-full bg-linear-to-r from-skyDay to-skyDusk"
					style={{ left: `${barStart}%`, right: `${100 - barEnd}%` }}
				/>
			</div>

			<span className="font-mono text-xs sm:text-sm text-textPrimary w-6 sm:w-8 shrink-0">
				{formatTemp(day.tempmax)}
			</span>
		</div>
	);
}

interface DailyForecastProps {
	days: Day[];
}

export function DailyForecast({ days }: DailyForecastProps) {
	const maxTempOfWeek = Math.max(...days.map((d) => d.tempmax));
	const minTempOfWeek = Math.min(...days.map((d) => d.tempmin));
	const shouldReduceMotion = useReducedMotion();

	return (
		<div className="flex flex-col gap-2 w-full">
			{days.map((day, index) => (
				<motion.div
					key={day.datetime}
					initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: shouldReduceMotion ? 0.15 : 0.35,
						delay: shouldReduceMotion ? 0 : index * 0.06,
						ease: [0.23, 1, 0.32, 1],
					}}
				>
					<DayRow
						day={day}
						isToday={index === 0}
						maxTempOfWeek={maxTempOfWeek}
						minTempOfWeek={minTempOfWeek}
					/>
				</motion.div>
			))}
		</div>
	);
}