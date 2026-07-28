import { useEffect, useRef, useState } from "react";
import type { WeatherIcon } from "../interfaces/weather";

export interface AtmosphereShowcaseFrame {
	icon: WeatherIcon;
	isDay: boolean;
}

/** Una vuelta por cada categoría de clima que sabe dibujar el fondo animado
 *  (soleado, nublado, lluvia, tormenta, nieve, niebla, despejado de noche),
 *  para que la pantalla de bienvenida no se vea siempre igual. */
const SHOWCASE_SEQUENCE: AtmosphereShowcaseFrame[] = [
	{ icon: "clear-day", isDay: true },
	{ icon: "partly-cloudy-day", isDay: true },
	{ icon: "rain", isDay: true },
	{ icon: "thunder-rain", isDay: true },
	{ icon: "snow", isDay: true },
	{ icon: "fog", isDay: true },
	{ icon: "clear-night", isDay: false },
	{ icon: "partly-cloudy-night", isDay: false },
];

/**
 * Cicla por SHOWCASE_SEQUENCE cada `intervalMs`, solo mientras `active` es
 * true (o sea: mientras todavía no hay una ciudad cargada). Apenas se busca
 * algo, el consumidor deja de usar este valor y pasa a mostrar el clima real.
 */
export function useAtmosphereShowcase(
	active: boolean,
	intervalMs = 7000,
): AtmosphereShowcaseFrame {
	const [index, setIndex] = useState(0);
	const activeRef = useRef(active);
	activeRef.current = active;

	useEffect(() => {
		if (!active) return;

		const timer = setInterval(() => {
			setIndex((i) => (i + 1) % SHOWCASE_SEQUENCE.length);
		}, intervalMs);

		return () => clearInterval(timer);
	}, [active, intervalMs]);

	return SHOWCASE_SEQUENCE[index];
}
