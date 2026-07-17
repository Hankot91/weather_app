import { Droplets, Wind, Gauge, Sun, Eye, Cloud, Navigation } from "lucide-react";
import type { ReactNode } from "react";
import type { CurrentConditions } from "../interfaces/weather";
import { RingGauge } from "./RingGauge";
import { severityColor } from "../utils/alertStyle";
import { useUnit } from "../context/unit-context";

interface MetricCardProps {
	icon: ReactNode;
	label: string;
	value: string;
	detail?: string;
	detailIcon?: ReactNode;
}

function MetricCard({ icon, label, value, detail, detailIcon }: MetricCardProps) {
	return (
		<div className="glass-panel bento-tile-ambient flex flex-col gap-1 p-3 min-w-30 h-full justify-center">
			<div className="flex items-center gap-1.5 text-textMuted">
				{icon}
				<span className="font-body text-[11px] uppercase tracking-wide">
					{label}
				</span>
			</div>
			<p className="font-display text-lg text-textPrimary">{value}</p>
			{detail && (
				<p className="font-mono text-[11px] text-textMuted flex items-center gap-1">
					{detailIcon}
					{detail}
				</p>
			)}
		</div>
	);
}

interface GaugeMetricCardProps {
	icon: ReactNode;
	label: string;
	percent: number;
	color: string;
	valueLabel: string;
	detail?: string;
	gaugeAriaLabel: string;
}

/** Variante de MetricCard con un RingGauge en vez de solo texto plano —
 *  reservada a métricas con una escala 0-100 clara. */
function GaugeMetricCard({
	icon,
	label,
	percent,
	color,
	valueLabel,
	detail,
	gaugeAriaLabel,
}: GaugeMetricCardProps) {
	return (
		<div className="glass-panel bento-tile-ambient flex items-center gap-3 p-3 min-w-30 h-full">
			<RingGauge percent={percent} color={color} label={gaugeAriaLabel}>
				<span
					className="font-display text-sm text-textPrimary"
					aria-hidden="true"
				>
					{valueLabel}
				</span>
			</RingGauge>
			<div className="flex flex-col gap-0.5 min-w-0">
				<div className="flex items-center gap-1.5 text-textMuted">
					{icon}
					<span className="font-body text-[11px] uppercase tracking-wide">
						{label}
					</span>
				</div>
				{detail && (
					<p className="font-mono text-[11px] text-textMuted">{detail}</p>
				)}
			</div>
		</div>
	);
}

function uvLabel(uvindex: number): string {
	if (uvindex <= 2) return "Bajo";
	if (uvindex <= 5) return "Moderado";
	if (uvindex <= 7) return "Alto";
	if (uvindex <= 10) return "Muy alto";
	return "Extremo";
}

/** Mismo lenguaje de severidad que las alertas meteorológicas — un UV alto
 *  se lee con el mismo color que una alerta severa, coherencia entre piezas. */
function uvColor(uvindex: number): string {
	if (uvindex <= 2) return severityColor("minor");
	if (uvindex <= 5) return severityColor("moderate");
	if (uvindex <= 7) return severityColor("severe");
	return severityColor("extreme");
}

function windDirectionLabel(deg: number): string {
	const directions = [
		"Norte",
		"Noreste",
		"Este",
		"Sureste",
		"Sur",
		"Suroeste",
		"Oeste",
		"Noroeste",
	];
	const index = Math.round(deg / 45) % 8;
	return directions[index];
}

function pressureLabel(hpa: number): string {
	if (hpa < 1009) return "Baja";
	if (hpa <= 1022) return "Normal";
	return "Alta";
}

interface WeatherMetricsProps {
	current: CurrentConditions;
}

export function WeatherMetrics({ current }: WeatherMetricsProps) {
	const { formatWind, formatVisibility } = useUnit();
	const uvPercent = Math.min((current.uvindex / 11) * 100, 100);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full h-full">
			<GaugeMetricCard
				icon={<Droplets size={14} strokeWidth={1.5} aria-hidden="true" />}
				label="Humedad"
				percent={current.humidity}
				color="var(--color-skyDay)"
				valueLabel={`${Math.round(current.humidity)}%`}
				gaugeAriaLabel={`Humedad ${Math.round(current.humidity)} por ciento`}
			/>
			<MetricCard
				icon={<Wind size={16} strokeWidth={1.5} aria-hidden="true" />}
				label="Viento"
				value={formatWind(current.windspeed)}
				detail={windDirectionLabel(current.winddir)}
				detailIcon={
					<Navigation
						size={10}
						strokeWidth={2}
						aria-hidden="true"
						style={{ transform: `rotate(${current.winddir}deg)` }}
					/>
				}
			/>
			<MetricCard
				icon={<Gauge size={16} strokeWidth={1.5} aria-hidden="true" />}
				label="Presión"
				value={`${Math.round(current.pressure)} hPa`}
				detail={pressureLabel(current.pressure)}
			/>
			<GaugeMetricCard
				icon={<Sun size={14} strokeWidth={1.5} aria-hidden="true" />}
				label="Índice UV"
				percent={uvPercent}
				color={uvColor(current.uvindex)}
				valueLabel={`${Math.round(current.uvindex)}`}
				detail={uvLabel(current.uvindex)}
				gaugeAriaLabel={`Índice UV ${Math.round(current.uvindex)}, ${uvLabel(current.uvindex)}`}
			/>
			<MetricCard
				icon={<Eye size={16} strokeWidth={1.5} aria-hidden="true" />}
				label="Visibilidad"
				value={formatVisibility(current.visibility)}
			/>
			<GaugeMetricCard
				icon={<Cloud size={14} strokeWidth={1.5} aria-hidden="true" />}
				label="Nubosidad"
				percent={current.cloudcover}
				color="var(--color-text-muted)"
				valueLabel={`${Math.round(current.cloudcover)}%`}
				gaugeAriaLabel={`Nubosidad ${Math.round(current.cloudcover)} por ciento`}
			/>
		</div>
	);
}
