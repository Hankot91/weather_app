import {
	Sun,
	Moon,
	CloudSun,
	CloudMoon,
	Cloud,
	CloudRain,
	CloudSnow,
	CloudDrizzle,
	Wind,
	CloudFog,
	CloudLightning,
	type LucideIcon,
} from "lucide-react";
import type { WeatherIcon } from "../interfaces/weather";

export const ICON_MAP: Record<WeatherIcon, LucideIcon> = {
	"clear-day": Sun,
	"clear-night": Moon,
	"partly-cloudy-day": CloudSun,
	"partly-cloudy-night": CloudMoon,
	cloudy: Cloud,
	rain: CloudRain,
	snow: CloudSnow,
	sleet: CloudDrizzle,
	wind: Wind,
	fog: CloudFog,
	"thunder-rain": CloudLightning,
	"thunder-showers-day": CloudLightning,
	"thunder-showers-night": CloudLightning,
};
