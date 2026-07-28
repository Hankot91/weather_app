import { useMemo } from "react";
import { getAtmosphereCategory } from "../utils/atmosphere";
import type { WeatherIcon } from "../interfaces/weather";

interface Particle {
	id: number;
	left: number;
	delay: number;
	duration: number;
}

function generateParticles(
	count: number,
	durationRange: [number, number],
	delayMax: number,
): Particle[] {
	const spread = durationRange[1] - durationRange[0];

	return Array.from({ length: count }, (_, id) => ({
		id,
		left: (id * 37) % 100,
		delay: (((id * 29) % 100) / 100) * delayMax,
		duration: durationRange[0] + (((id * 17) % 100) / 100) * spread,
	}));
}

function RainLayer({ intense = false }: { intense?: boolean }) {
	const drops = useMemo(
		() => generateParticles(intense ? 60 : 40, [0.6, 1.1], 2),
		[intense],
	);
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{drops.map((d) => (
				<span
					key={d.id}
					className="absolute top-[-10%] w-px h-8 bg-white/30 animate-rain-fall"
					style={{
						left: `${d.left}%`,
						animationDuration: `${d.duration}s`,
						animationDelay: `${d.delay}s`,
					}}
				/>
			))}
		</div>
	);
}

function SnowLayer() {
	const flakes = useMemo(() => generateParticles(30, [4, 7], 4), []);
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{flakes.map((f) => (
				<span
					key={f.id}
					className="absolute top-[-5%] w-1 h-1 rounded-full bg-white/70 animate-snow-fall"
					style={{
						left: `${f.left}%`,
						animationDuration: `${f.duration}s`,
						animationDelay: `${f.delay}s`,
					}}
				/>
			))}
		</div>
	);
}

interface CloudLayerProps {
	variant?: "light" | "dark";
	opacityScale?: number;
	richer?: boolean;
}

const CLOUD_SHAPES = [
	{ top: "12%", size: 260, duration: 60 },
	{ top: "28%", size: 180, duration: 80 },
	{ top: "6%", size: 200, duration: 70 },
];

const EXTRA_CLOUD_SHAPES = [
	{ top: "18%", size: 150, duration: 95 },
	{ top: "34%", size: 220, duration: 55 },
];

function CloudLayer({
	variant = "light",
	opacityScale = 1,
	richer = false,
}: CloudLayerProps) {
	const shapes = richer
		? [...CLOUD_SHAPES, ...EXTRA_CLOUD_SHAPES]
		: CLOUD_SHAPES;
	const baseOpacity =
		variant === "light"
			? [0.12, 0.08, 0.1, 0.07, 0.09]
			: [0.4, 0.32, 0.36, 0.3, 0.34];
	const color = variant === "light" ? "bg-white" : "bg-[#141a2b]";

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{shapes.map((c, i) => (
				<div
					key={i}
					className={`absolute rounded-full blur-3xl animate-cloud-drift ${color}`}
					style={{
						top: c.top,
						width: c.size,
						height: c.size * 0.5,
						opacity: baseOpacity[i] * opacityScale,
						animationDuration: `${c.duration}s`,
					}}
				/>
			))}
		</div>
	);
}

function LightningLayer() {
	const flashes = useMemo(
		() => [
			{ top: "10%", left: "20%", size: 180, delay: 0 },
			{ top: "22%", left: "62%", size: 220, delay: 3.4 },
			{ top: "5%", left: "45%", size: 160, delay: 6.1 },
		],
		[],
	);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<div className="absolute inset-0 bg-white animate-lightning-flash" />
			{flashes.map((f, i) => (
				<div
					key={i}
					className="absolute rounded-full blur-2xl animate-lightning-local"
					style={{
						top: f.top,
						left: f.left,
						width: f.size,
						height: f.size,
						background:
							"radial-gradient(circle, rgba(220,230,255,0.9), transparent 70%)",
						animationDuration: "9s",
						animationDelay: `${f.delay}s`,
					}}
				/>
			))}
		</div>
	);
}

function StarsLayer({ density = "high" }: { density?: "high" | "low" }) {
	const stars = useMemo(() => {
		const count = density === "high" ? 45 : 18;

		return Array.from({ length: count }, (_, id) => ({
			id,
			top: (id * 19) % 65,
			left: (id * 37) % 100,
			size: id % 5 === 0 ? 1.6 : 1,
			delay: (((id * 13) % 100) / 100) * 5,
			duration: 2.5 + (((id * 11) % 100) / 100) * 3,
		}));
	}, [density]);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{stars.map((s) => (
				<span
					key={s.id}
					className="absolute rounded-full bg-white animate-twinkle"
					style={{
						top: `${s.top}%`,
						left: `${s.left}%`,
						width: s.size,
						height: s.size,
						animationDuration: `${s.duration}s`,
						animationDelay: `${s.delay}s`,
					}}
				/>
			))}
		</div>
	);
}

function SunHaloLayer() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<div
				className="absolute animate-sun-halo"
				style={{
					top: "-20%",
					right: "-10%",
					width: "140%",
					height: "70%",
					background:
						"linear-gradient(115deg, transparent 40%, rgba(255,244,214,0.16) 52%, rgba(255,244,214,0.22) 56%, transparent 68%)",
					transform: "rotate(-8deg)",
				}}
			/>
			<DustMotesLayer />
		</div>
	);
}

function DustMotesLayer() {
	const motes = useMemo(
		() =>
			Array.from({ length: 14 }, (_, id) => ({
				id,
				left: (id * 31) % 100,
				bottom: (id * 23) % 70,
				size: id % 3 === 0 ? 3 : 2,
				delay: (((id * 19) % 100) / 100) * 10,
				duration: 14 + (((id * 13) % 100) / 100) * 10,
			})),
		[],
	);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{motes.map((m) => (
				<span
					key={m.id}
					className="absolute rounded-full bg-[#fff4d6] animate-dust-float"
					style={{
						left: `${m.left}%`,
						bottom: `${m.bottom}%`,
						width: m.size,
						height: m.size,
						animationDuration: `${m.duration}s`,
						animationDelay: `${m.delay}s`,
					}}
				/>
			))}
		</div>
	);
}


function ShootingStarLayer() {
	const streaks = useMemo(
		() => [
			{ top: "12%", left: "70%", duration: 22, delay: 3 },
			{ top: "24%", left: "40%", duration: 28, delay: 14 },
		],
		[],
	);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{streaks.map((s, i) => (
				<span
					key={i}
					className="absolute h-px w-24 bg-linear-to-r from-white to-transparent animate-shooting-star"
					style={{
						top: s.top,
						left: s.left,
						animationDuration: `${s.duration}s`,
						animationDelay: `${s.delay}s`,
						transformOrigin: "left center",
					}}
				/>
			))}
		</div>
	);
}

function FogLayer() {
	const bands = useMemo(
		() => [
			{ top: "20%", duration: 45, opacity: 0.1 },
			{ top: "40%", duration: 60, opacity: 0.14 },
			{ top: "62%", duration: 50, opacity: 0.09 },
		],
		[],
	);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{bands.map((b, i) => (
				<div
					key={i}
					className="absolute left-0 w-[140%] h-24 blur-3xl bg-white rounded-full animate-fog-drift"
					style={{
						top: b.top,
						opacity: b.opacity,
						animationDuration: `${b.duration}s`,
					}}
				/>
			))}
		</div>
	);
}

interface WeatherParticlesProps {
	icon: WeatherIcon;
	isDay: boolean;
}

export function WeatherParticles({ icon, isDay }: WeatherParticlesProps) {
	const category = getAtmosphereCategory(icon);

	switch (category) {
		case "clear":
			return isDay ? (
				<SunHaloLayer />
			) : (
				<>
					<StarsLayer density="high" />
					<ShootingStarLayer />
				</>
			);

		case "cloudy":
			return (
				<>
					<CloudLayer variant="light" richer={isDay} />
					{!isDay && <StarsLayer density="low" />}
				</>
			);

		case "rain":
			return (
				<>
					<CloudLayer variant="dark" />
					<RainLayer />
				</>
			);

		case "storm":
			return (
				<>
					<CloudLayer variant="dark" opacityScale={1.15} />
					<RainLayer intense />
					<LightningLayer />
				</>
			);

		case "snow":
			return (
				<>
					<CloudLayer variant="light" opacityScale={0.6} />
					<SnowLayer />
				</>
			);

		case "fog":
			return <FogLayer />;

		default:
			return null;
	}
}
