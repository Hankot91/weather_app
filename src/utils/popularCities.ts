export interface PopularCity {
	name: string;
	lat: number;
	lon: number;
}

export const POPULAR_CITIES: PopularCity[] = [
	{ name: "Bogotá", lat: 4.711, lon: -74.0721 },
	{ name: "Ciudad de México", lat: 19.4326, lon: -99.1332 },
	{ name: "Madrid", lat: 40.4168, lon: -3.7038 },
	{ name: "Nueva York", lat: 40.7128, lon: -74.006 },
	{ name: "Tokio", lat: 35.6762, lon: 139.6503 },
];
