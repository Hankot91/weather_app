import type { WeatherIcon } from "../interfaces/weather";
export type DayPhase = "dawn" | "day" | "dusk" | "night";

const TWILIGHT_WINDOW = 30 * 60; // 30 min alrededor de sunrise/sunset

export function getDayPhase(
	sunriseEpoch: number,
	sunsetEpoch: number,
	nowEpoch: number = Date.now() / 1000,
): DayPhase {
	if (Math.abs(nowEpoch - sunriseEpoch) <= TWILIGHT_WINDOW) return "dawn";
	if (Math.abs(nowEpoch - sunsetEpoch) <= TWILIGHT_WINDOW) return "dusk";
	if (nowEpoch > sunriseEpoch && nowEpoch < sunsetEpoch) return "day";
	return "night";
}

export type AtmosphereCategory =
	| "clear"
	| "cloudy"
	| "rain"
	| "storm"
	| "snow"
	| "fog";

export interface AtmosphereTheme {
	category: AtmosphereCategory;
	isDay: boolean;
	fromVar: string;
	toVar: string;
}

const CATEGORY_BY_ICON: Record<WeatherIcon, AtmosphereCategory> = {
	"clear-day": "clear",
	"clear-night": "clear",
	"partly-cloudy-day": "cloudy",
	"partly-cloudy-night": "cloudy",
	cloudy: "cloudy",
	rain: "rain",
	snow: "snow",
	sleet: "snow",
	wind: "cloudy",
	fog: "fog",
	"thunder-rain": "storm",
	"thunder-showers-day": "storm",
	"thunder-showers-night": "storm",
};

export function isDaytime(
	sunriseEpoch: number,
	sunsetEpoch: number,
	nowEpoch: number = Date.now() / 1000,
): boolean {
	return nowEpoch >= sunriseEpoch && nowEpoch < sunsetEpoch;
}

export function getAtmosphereCategory(icon: WeatherIcon): AtmosphereCategory {
	return CATEGORY_BY_ICON[icon];
}

export function getAtmosphereTheme(
	icon: WeatherIcon,
	isDay: boolean,
): AtmosphereTheme {
	const category = CATEGORY_BY_ICON[icon];

	const map: Record<
		AtmosphereCategory,
		{ day: [string, string]; night: [string, string] }
	> = {
		clear: {
			day: ["--color-sky-clear-from", "--color-sky-clear-to"],
			night: ["--color-sky-night-from", "--color-sky-night-to"],
		},
		cloudy: {
			day: ["--color-sky-cloudy-day-from", "--color-sky-cloudy-day-to"],
			night: [
				"--color-sky-cloudy-night-from",
				"--color-sky-cloudy-night-to",
			],
		},
		rain: {
			day: ["--color-sky-rain-from", "--color-sky-rain-to"],
			night: ["--color-sky-night-from", "--color-sky-night-to"],
		},
		storm: {
			day: ["--color-sky-storm-from", "--color-sky-storm-to"],
			night: ["--color-sky-storm-from", "--color-sky-storm-to"],
		},
		snow: {
			day: ["--color-sky-snow-from", "--color-sky-snow-to"],
			night: [
				"--color-sky-cloudy-night-from",
				"--color-sky-cloudy-night-to",
			],
		},
		fog: {
			day: ["--color-sky-fog-from", "--color-sky-fog-to"],
			night: [
				"--color-sky-cloudy-night-from",
				"--color-sky-cloudy-night-to",
			],
		},
	};

	const [fromVar, toVar] = isDay ? map[category].day : map[category].night;
	return { category, isDay, fromVar, toVar };
}
