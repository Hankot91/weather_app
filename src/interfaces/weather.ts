// Estructura de la respuesta de la Timeline API de Visual Crossing

export interface WeatherResponse {
	queryCost: number;
	latitude: number;
	longitude: number;
	resolvedAddress: string;
	address: string;
	timezone: string;
	tzoffset: number;
	description: string;
	currentConditions: CurrentConditions;
	days: Day[];
	alerts: Alert[];
}

export interface CurrentConditions {
	datetime: string;
	temp: number;
	feelslike: number;
	humidity: number;
	pressure: number;
	visibility: number;
	uvindex: number;
	windspeed: number;
	windgust: number | null;
	winddir: number;
	cloudcover: number;
	sunrise: string;
	sunriseEpoch: number;
	sunset: string;
	sunsetEpoch: number;
	moonphase: number;
	icon: WeatherIcon;
	conditions: string;
}

export interface Day {
	datetime: string;
	tempmax: number;
	tempmin: number;
	temp: number;
	precip: number;
	precipprob: number;
	humidity: number;
	windspeed: number;
	uvindex: number;
	sunrise: string;
	sunset: string;
	icon: WeatherIcon;
	conditions: string;
	hours: Hour[];
}

export interface Hour {
	datetime: string;
	temp: number;
	feelslike: number;
	humidity: number;
	precip: number;
	precipprob: number;
	windspeed: number;
	icon: WeatherIcon;
	conditions: string;
}

export interface Alert {
	event: string;
	headline: string;
	description: string;
	onset: string;
	ends: string | null;
}

// Íconos que devuelve Visual Crossing
export type WeatherIcon =
	| "clear-day"
	| "clear-night"
	| "partly-cloudy-day"
	| "partly-cloudy-night"
	| "cloudy"
	| "rain"
	| "snow"
	| "sleet"
	| "wind"
	| "fog"
	| "thunder-rain"
	| "thunder-showers-day"
	| "thunder-showers-night";
