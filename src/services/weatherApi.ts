import axios, { AxiosError } from "axios";
import type { WeatherResponse } from "../interfaces/weather";

const client = axios.create({ baseURL: "/api/weather" });

export class WeatherApiError extends Error {
	public status?: number;

	constructor(message: string, status?: number) {
		super(message);
		this.name = "WeatherApiError";
		this.status = status;
	}
}

function handleError(error: unknown): never {
	if (axios.isAxiosError(error)) {
		const err = error as AxiosError<{ message?: string }>;
		const status = err.response?.status;

		if (status === 401) {
			throw new WeatherApiError("API key inválida o vencida.", status);
		}
		if (status === 400) {
			throw new WeatherApiError(
				"Ciudad no encontrada. Prueba con otro nombre.",
				status,
			);
		}
		if (status === 429) {
			throw new WeatherApiError(
				"Se alcanzó el límite de consultas diarias.",
				status,
			);
		}
		throw new WeatherApiError(
			err.response?.data?.message ?? "No se pudo obtener el clima.",
			status,
		);
	}
	throw new WeatherApiError("Ocurrió un error inesperado.");
}

export const weatherApi = {
	async getForecast(city: string): Promise<WeatherResponse> {
		try {
			const { data } = await client.get<WeatherResponse>("", {
				params: { location: city },
			});
			return data;
		} catch (error) {
			return handleError(error);
		}
	},

	async getByCoordinates(lat: number, lon: number): Promise<WeatherResponse> {
		try {
			const { data } = await client.get<WeatherResponse>("", {
				params: { location: `${lat},${lon}` },
			});
			return data;
		} catch (error) {
			return handleError(error);
		}
	},
};