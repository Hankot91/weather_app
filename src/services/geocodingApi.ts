import type { GeocodingResult } from "../interfaces/geocoding";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface GeocodingApiResponse {
	results?: Array<{
		id: number;
		name: string;
		admin1?: string;
		country: string;
		latitude: number;
		longitude: number;
	}>;
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
	const trimmed = query.trim();
	if (trimmed.length < 2) return [];

	const url = new URL(BASE_URL);
	url.searchParams.set("name", trimmed);
	url.searchParams.set("count", "5");
	url.searchParams.set("language", "es");

	try {
		const response = await fetch(url.toString());
		if (!response.ok) return [];

		const data: GeocodingApiResponse = await response.json();
		if (!data.results) return [];

		return data.results.map((r) => ({
			id: r.id,
			name: r.name,
			admin1: r.admin1,
			country: r.country,
			latitude: r.latitude,
			longitude: r.longitude,
		}));
	} catch {
		return [];
	}
}
