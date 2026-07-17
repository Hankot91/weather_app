import { createContext, useContext } from "react";

export type TemperatureUnit = "C" | "F";

export interface UnitContextValue {
	unit: TemperatureUnit;
	toggleUnit: () => void;
	formatTemp: (celsius: number) => string;
	/** Recibe km/h siempre (así llega de la API) y muestra km/h o mph según la unidad activa. */
	formatWind: (kmh: number) => string;
	/** Recibe km siempre (así llega de la API) y muestra km o mi según la unidad activa. */
	formatVisibility: (km: number) => string;
}

export const UnitContext = createContext<UnitContextValue | null>(null);

export function useUnit(): UnitContextValue {
	const ctx = useContext(UnitContext);
	if (!ctx) {
		throw new Error("useUnit debe usarse dentro de un <UnitProvider>");
	}
	return ctx;
}
