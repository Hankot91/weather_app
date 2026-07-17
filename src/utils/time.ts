import type { Hour } from "../interfaces/weather";


export function getUpcomingHours(
	todayHours: Hour[],
	tomorrowHours: Hour[] | undefined,
	now: Date = new Date(),
	maxHours = 24,
): Hour[] {
	const currentHour = now.getHours();

	const remainingToday = todayHours.filter((hour) => {
		const hourValue = Number.parseInt(hour.datetime.split(":")[0], 10);
		return hourValue >= currentHour;
	});

	const combined = tomorrowHours
		? [...remainingToday, ...tomorrowHours]
		: remainingToday;

	return combined.slice(0, maxHours);
}

/** Formatea "14:00:00" -> "14:00" */
export function formatHourLabel(datetime: string): string {
	return datetime.slice(0, 5);
}
