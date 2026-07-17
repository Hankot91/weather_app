import { useEffect, useState } from "react";
import { weatherApi } from "../services/weatherApi";
import { POPULAR_CITIES, type PopularCity } from "../utils/popularCities";
import { getCachedWeather, setCachedWeather, coordKey } from "../utils/weatherCache";
import { delay } from "../utils/delay";
import type { WeatherResponse } from "../interfaces/weather";

export interface PopularCityWeather {
	city: PopularCity;
	weather: WeatherResponse | null;
}

const REQUEST_SPACING_MS = 600;

export function usePopularCities() {
	const [results, setResults] = useState<PopularCityWeather[]>(
		POPULAR_CITIES.map((city) => ({ city, weather: null })),
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadSequentially() {
			for (const city of POPULAR_CITIES) {
				if (cancelled) return;

				const cached = getCachedWeather(coordKey(city.lat, city.lon));
				if (cached) {
					setResults((prev) =>
						prev.map((r) =>
							r.city.name === city.name
								? { city, weather: cached }
								: r,
						),
					);
					continue; // sin cache = sin espera, no cuenta contra el rate limit
				}

				try {
					const weather = await weatherApi.getByCoordinates(
						city.lat,
						city.lon,
					);
					setCachedWeather(coordKey(city.lat, city.lon), weather);
					if (!cancelled) {
						setResults((prev) =>
							prev.map((r) =>
								r.city.name === city.name
									? { city, weather }
									: r,
							),
						);
					}
				} catch {
					// Esa ciudad queda sin datos, seguimos con las demás
				}

				await delay(REQUEST_SPACING_MS);
			}

			if (!cancelled) setLoading(false);
		}

		loadSequentially();

		return () => {
			cancelled = true;
		};
	}, []);

	return { results, loading };
}
