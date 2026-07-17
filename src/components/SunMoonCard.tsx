import { Sunrise, Sunset, Moon } from "lucide-react";
import { getMoonPhaseInfo } from "../utils/moon";
import { getDayPhase, type DayPhase } from "../utils/atmosphere";
import { formatHourLabel } from "../utils/time";
import type { CurrentConditions } from "../interfaces/weather";

interface SunMoonCardProps {
	current: CurrentConditions;
}

const PHASE_STYLE: Record<DayPhase, { gradient: string; accent: string }> = {
	dawn: {
		gradient:
			"linear-gradient(135deg, rgba(242,166,90,0.2), transparent 70%), rgba(255,255,255,0.08)",
		accent: "#F2A65A",
	},
	day: {
		gradient:
			"linear-gradient(135deg, rgba(127,209,232,0.14), transparent 70%), rgba(255,255,255,0.08)",
		accent: "#7FD1E8",
	},
	dusk: {
		gradient:
			"linear-gradient(135deg, rgba(217,131,79,0.22), rgba(61,43,78,0.1) 70%), rgba(255,255,255,0.08)",
		accent: "#D9834F",
	},
	night: {
		gradient:
			"linear-gradient(135deg, rgba(122,132,214,0.16), transparent 70%), rgba(255,255,255,0.08)",
		accent: "#9AA5B8",
	},
};

export function SunMoonCard({ current }: SunMoonCardProps) {
	const phase = getDayPhase(current.sunriseEpoch, current.sunsetEpoch);
	const moon = getMoonPhaseInfo(current.moonphase);
	const style = PHASE_STYLE[phase];

	return (
		<div
			className="glass-panel bento-tile-ambient flex flex-col justify-center gap-3 p-4 w-full h-full"
			style={{ background: style.gradient }}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Sunrise
						size={18}
						strokeWidth={1.5}
						style={{
							color: phase === "dawn" ? style.accent : undefined,
						}}
						className={phase === "dawn" ? "" : "text-textMuted"}
						aria-hidden="true"
					/>
					<div className="flex flex-col">
						<span className="font-body text-[11px] text-textMuted uppercase tracking-wide">
							Amanecer
						</span>
						<span className="font-display text-base text-textPrimary">
							{formatHourLabel(current.sunrise)}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex flex-col items-end">
						<span className="font-body text-[11px] text-textMuted uppercase tracking-wide">
							Atardecer
						</span>
						<span className="font-display text-base text-textPrimary">
							{formatHourLabel(current.sunset)}
						</span>
					</div>
					<Sunset
						size={18}
						strokeWidth={1.5}
						style={{
							color: phase === "dusk" ? style.accent : undefined,
						}}
						className={phase === "dusk" ? "" : "text-textMuted"}
						aria-hidden="true"
					/>
				</div>
			</div>

			<div className="h-px bg-white/10" />

			<div className="flex items-center gap-2">
				{phase === "night" ? (
					<span className="text-xl leading-none" aria-hidden="true">{moon.emoji}</span>
				) : (
					<Moon
						size={18}
						strokeWidth={1.5}
						className="text-textMuted"
						aria-hidden="true"
					/>
				)}
				<span className="font-body text-sm text-textPrimary">
					{phase === "night"
						? moon.label
						: `Próxima fase: ${moon.label}`}
				</span>
			</div>
		</div>
	);
}
