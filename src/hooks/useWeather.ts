import { useState, useCallback, useRef } from "react";
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
	/** true si el último error fue transitorio (red/5xx) y tiene sentido reintentar */
	canRetry: boolean;
	lastUpdated: Date | null;
	search: (city: string) => Promise<WeatherResponse | null>;
	searchByCoordinates: (
		lat: number,
		lon: number,
	) => Promise<WeatherResponse | null>;
	/** Repite la última búsqueda (por texto o coordenadas), sea cual sea */
	retry: () => Promise<WeatherResponse | null>;
}

type LastQuery =
	| { type: "city"; value: string }
	| { type: "coords"; lat: number; lon: number };

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
	const [canRetry, setCanRetry] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const lastQuery = useRef<LastQuery | null>(null);

	function handleFailure(err: unknown): null {
		if (err instanceof WeatherApiError) {
			setError(err.message);
			setCanRetry(err.retryable);
		} else {
			setError("Error inesperado al buscar el clima.");
			setCanRetry(true);
		}
		return null;
	}

	const search = useCallback(async (city: string) => {
		const trimmed = city.trim();
		if (!trimmed) return null;

		lastQuery.current = { type: "city", value: trimmed };
		setLoading(true);
		setError(null);
		setCanRetry(false);

		try {
			const cached = getCachedWeather(queryKey(trimmed));
			const data = cached ?? (await weatherApi.getForecast(trimmed));
			if (!cached) cacheResult(trimmed, data);

			setWeather(data);
			setLastUpdated(new Date());
			return data;
		} catch (err) {
			return handleFailure(err);
		} finally {
			setLoading(false);
		}
	}, []);

	const searchByCoordinates = useCallback(
		async (lat: number, lon: number) => {
			lastQuery.current = { type: "coords", lat, lon };
			setLoading(true);
			setError(null);
			setCanRetry(false);

			try {
				const cached = getCachedWeather(coordKey(lat, lon));
				const data =
					cached ?? (await weatherApi.getByCoordinates(lat, lon));
				if (!cached) cacheResult(null, data);

				setWeather(data);
				setLastUpdated(new Date());
				return data;
			} catch (err) {
				return handleFailure(err);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const retry = useCallback(async () => {
		const query = lastQuery.current;
		if (!query) return null;
		return query.type === "city"
			? search(query.value)
			: searchByCoordinates(query.lat, query.lon);
	}, [search, searchByCoordinates]);

	return {
		weather,
		loading,
		error,
		canRetry,
		lastUpdated,
		search,
		searchByCoordinates,
		retry,
	};
}
