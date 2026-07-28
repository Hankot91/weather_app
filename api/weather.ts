import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL =
	"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const timestamps = (requestLog.get(ip) ?? []).filter(
		(t) => now - t < RATE_LIMIT_WINDOW_MS,
	);

	if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
		requestLog.set(ip, timestamps);
		return true;
	}

	timestamps.push(now);
	requestLog.set(ip, timestamps);
	return false;
}

function getClientIp(req: VercelRequest): string {
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
	if (Array.isArray(forwarded)) return forwarded[0];
	return req.socket.remoteAddress ?? "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Método no permitido" });
	}

	const ip = getClientIp(req);
	if (isRateLimited(ip)) {
		res.setHeader("Retry-After", "60");
		return res.status(429).json({
			message: "Demasiadas solicitudes. Esperá un minuto e intentá de nuevo.",
		});
	}

	const { location } = req.query;
	if (!location || typeof location !== "string") {
		return res.status(400).json({ message: "Falta el parámetro location" });
	}

	const apiKey = process.env.WEATHER_API_KEY;
	if (!apiKey) {
		return res
			.status(500)
			.json({ message: "API key no configurada en el servidor" });
	}

	const url = new URL(`${BASE_URL}/${encodeURIComponent(location)}`);
	url.searchParams.set("unitGroup", "metric");
	url.searchParams.set("include", "current,days,hours,alerts");
	url.searchParams.set("key", apiKey);
	url.searchParams.set("contentType", "json");
	url.searchParams.set("lang", "es");

	try {
		const upstream = await fetch(url.toString());
		const data = await upstream.json();
		res.setHeader(
			"Cache-Control",
			"s-maxage=300, stale-while-revalidate=600",
		);
		return res.status(upstream.status).json(data);
	} catch {
		return res
			.status(502)
			.json({ message: "No se pudo contactar el servicio de clima" });
	}
}