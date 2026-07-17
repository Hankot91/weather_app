import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL =
	"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Método no permitido" });
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
