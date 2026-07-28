import { useUnit } from "../context/unit-context";

export function UnitToggle() {
	const { unit, setUnit } = useUnit();

	return (
		<div
			role="radiogroup"
			aria-label="Unidad de temperatura"
			className="glass-panel flex items-center gap-1 p-1 font-mono text-xs text-textPrimary"
		>
			{(["C", "F"] as const).map((option) => (
				<button
					key={option}
					type="button"
					role="radio"
					aria-checked={unit === option}
					onClick={() => setUnit(option)}
					className={`px-2 py-1 rounded-full cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 ${
						unit === option
							? "bg-white/16 text-textPrimary"
							: "text-textMuted hover:text-textPrimary hover:bg-white/8"
					}`}
				>
					°{option}
				</button>
			))}
		</div>
	);
}
