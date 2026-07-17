import type { WeatherResponse } from "../interfaces/weather";

const CACHE_PREFIX = "weather-cache:";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

interface CacheEntry {
	data: WeatherResponse;
	timestamp: number;
}

/** Clave de caché para una búsqueda por coordenadas (geolocalización, ciudades populares, click en sugerencia). */
export function coordKey(lat: number, lon: number): string {
	return `coord:${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/** Clave de caché para una búsqueda por texto libre (lo que el usuario tipeó). */
export function queryKey(query: string): string {
	return `query:${query.trim().toLowerCase()}`;
}

export function getCachedWeather(key: string): WeatherResponse | null {
	try {
		const raw = sessionStorage.getItem(CACHE_PREFIX + key);
		if (!raw) return null;

		const entry: CacheEntry = JSON.parse(raw);
		if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
			sessionStorage.removeItem(CACHE_PREFIX + key);
			return null;
		}
		return entry.data;
	} catch {
		return null;
	}
}

export function setCachedWeather(key: string, data: WeatherResponse): void {
	try {
		const entry: CacheEntry = { data, timestamp: Date.now() };
		sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
	} catch {
		// Si sessionStorage falla (modo privado, cuota llena, etc.), simplemente no cacheamos
	}
}
