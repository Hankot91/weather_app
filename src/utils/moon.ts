export interface MoonPhaseInfo {
	label: string;
	emoji: string;
}

export function getMoonPhaseInfo(phase: number): MoonPhaseInfo {
	if (phase === 0 || phase === 1) return { label: "Luna nueva", emoji: "🌑" };
	if (phase < 0.25) return { label: "Luna creciente", emoji: "🌒" };
	if (phase === 0.25) return { label: "Cuarto creciente", emoji: "🌓" };
	if (phase < 0.5) return { label: "Gibosa creciente", emoji: "🌔" };
	if (phase === 0.5) return { label: "Luna llena", emoji: "🌕" };
	if (phase < 0.75) return { label: "Gibosa menguante", emoji: "🌖" };
	if (phase === 0.75) return { label: "Cuarto menguante", emoji: "🌗" };
	return { label: "Luna menguante", emoji: "🌘" };
}
