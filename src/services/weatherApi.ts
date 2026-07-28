import axios, { AxiosError } from "axios";
import type { WeatherResponse } from "../interfaces/weather";

const client = axios.create({ baseURL: "/api/weather" });

export class WeatherApiError extends Error {
	public status?: number;
	/** Si es true, tiene sentido ofrecerle al usuario un botón de "Reintentar" */
	public retryable: boolean;

	constructor(message: string, status?: number, retryable = false) {
		super(message);
		this.name = "WeatherApiError";
		this.status = status;
		this.retryable = retryable;
	}
}

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Errores de red (sin respuesta) o 5xx: transitorios, tiene sentido reintentar.
 *  400/401/429 son errores "definitivos" para ese pedido — reintentar no cambia nada. */
function isTransientError(error: unknown): boolean {
	if (!axios.isAxiosError(error)) return false;
	if (!error.response) return true; // timeout, sin conexión, DNS, CORS, etc.
	return error.response.status >= 500;
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
		if (!status) {
			throw new WeatherApiError(
				"No hay conexión con el servicio de clima. Revisá tu internet.",
				status,
				true,
			);
		}
		throw new WeatherApiError(
			err.response?.data?.message ?? "No se pudo obtener el clima.",
			status,
			status >= 500,
		);
	}
	throw new WeatherApiError("Ocurrió un error inesperado.", undefined, true);
}

/** Ejecuta la request y, si falla por un motivo transitorio (red caída, 5xx),
 *  reintenta con backoff exponencial antes de rendirse. Errores "definitivos"
 *  (ciudad no encontrada, API key inválida, rate limit) fallan al toque. */
async function requestWithRetry(
	params: Record<string, string>,
): Promise<WeatherResponse> {
	let attempt = 0;

	while (true) {
		try {
			const { data } = await client.get<WeatherResponse>("", { params });
			return data;
		} catch (error) {
			const canRetry = attempt < MAX_RETRIES && isTransientError(error);
			if (!canRetry) return handleError(error);

			await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
			attempt += 1;
		}
	}
}

export const weatherApi = {
	async getForecast(city: string): Promise<WeatherResponse> {
		return requestWithRetry({ location: city });
	},

	async getByCoordinates(lat: number, lon: number): Promise<WeatherResponse> {
		return requestWithRetry({ location: `${lat},${lon}` });
	},
};