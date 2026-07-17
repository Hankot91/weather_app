import { useState, useCallback } from "react";
import { weatherApi, WeatherApiError } from "../services/weatherApi";
import {
	getCachedWeather,
	setCachedWeather,
	coordKey,
	queryKey,
} from "../utils/weatherCache";
import type { WeatherResponse } from "../interfaces/weather";

interface UseWeatherReturn {
	weather: WeatherResponse | null;
	loading: boolean;
	error: string | null;
	lastUpdated: Date | null;
	search: (city: string) => Promise<WeatherResponse | null>;
	searchByCoordinates: (
		lat: number,
		lon: number,
	) => Promise<WeatherResponse | null>;
}

/** Guarda la respuesta bajo ambas claves (texto y coordenadas) para que una
 *  búsqueda por nombre y una posterior por ubicación de la misma ciudad
 *  compartan el mismo hit de caché. */
function cacheResult(query: string | null, data: WeatherResponse): void {
	if (query) setCachedWeather(queryKey(query), data);
	setCachedWeather(coordKey(data.latitude, data.longitude), data);
}

export function useWeather(): UseWeatherReturn {
	const [weather, setWeather] = useState<WeatherResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const search = useCallback(async (city: string) => {
		const trimmed = city.trim();
		if (!trimmed) return null;

		setLoading(true);
		setError(null);

		try {
			const cached = getCachedWeather(queryKey(trimmed));
			const data = cached ?? (await weatherApi.getForecast(trimmed));
			if (!cached) cacheResult(trimmed, data);

			setWeather(data);
			setLastUpdated(new Date());
			return data;
		} catch (err) {
			const message =
				err instanceof WeatherApiError
					? err.message
					: "Error inesperado al buscar el clima.";
			setError(message);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const searchByCoordinates = useCallback(
		async (lat: number, lon: number) => {
			setLoading(true);
			setError(null);

			try {
				const cached = getCachedWeather(coordKey(lat, lon));
				const data =
					cached ?? (await weatherApi.getByCoordinates(lat, lon));
				if (!cached) cacheResult(null, data);

				setWeather(data);
				setLastUpdated(new Date());
				return data;
			} catch (err) {
				const message =
					err instanceof WeatherApiError
						? err.message
						: "Error inesperado al buscar el clima.";
				setError(message);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return { weather, loading, error, lastUpdated, search, searchByCoordinates };
}
