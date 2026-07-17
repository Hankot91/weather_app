import { useUnit } from "../context/unit-context";

export function UnitToggle() {
	const { unit, toggleUnit } = useUnit();

	return (
		<button
			type="button"
			onClick={toggleUnit}
			aria-label={`Cambiar a grados ${unit === "C" ? "Fahrenheit" : "Celsius"}`}
			className="glass-panel flex items-center gap-1 px-2.5 py-1.5 font-mono text-xs text-textPrimary cursor-pointer transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70"
		>
			<span
				className={unit === "C" ? "text-textPrimary" : "text-textMuted"}
			>
				°C
			</span>
			<span className="text-textMuted/50">/</span>
			<span
				className={unit === "F" ? "text-textPrimary" : "text-textMuted"}
			>
				°F
			</span>
		</button>
	);
}
