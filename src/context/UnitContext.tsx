import { useMemo, useState, type ReactNode } from "react";
import {
	UnitContext,
	type TemperatureUnit,
	type UnitContextValue,
} from "./unit-context";

function celsiusToFahrenheit(c: number): number {
	return (c * 9) / 5 + 32;
}

// La API entrega todo en métrico (km/h, km); cuando el usuario elige °F
// mostramos el resto de las unidades en su par imperial habitual (mph, mi)
// para que la vista completa sea consistente.
const KM_TO_MI = 0.621371;

export function UnitProvider({ children }: { children: ReactNode }) {
	const [unit, setUnit] = useState<TemperatureUnit>("C");

	const value = useMemo<UnitContextValue>(() => {
		const formatTemp = (celsius: number) => {
			const converted =
				unit === "C" ? celsius : celsiusToFahrenheit(celsius);
			return `${Math.round(converted)}°`;
		};
		const formatWind = (kmh: number) => {
			if (unit === "C") return `${Math.round(kmh)} km/h`;
			return `${Math.round(kmh * KM_TO_MI)} mph`;
		};
		const formatVisibility = (km: number) => {
			if (unit === "C") return `${Math.round(km)} km`;
			return `${Math.round(km * KM_TO_MI)} mi`;
		};
		return {
			unit,
			toggleUnit: () => setUnit((u) => (u === "C" ? "F" : "C")),
			formatTemp,
			formatWind,
			formatVisibility,
		};
	}, [unit]);

	return (
		<UnitContext.Provider value={value}>{children}</UnitContext.Provider>
	);
}
