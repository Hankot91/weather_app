import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Header } from "../components/Header";
import { AtmosphereBackground } from "../components/AtmosphereBackground";
import { useWeather } from "../hooks/useWeather";
import { usePopularCities } from "../hooks/usePopularCities";
import { useMinimumLoadingDuration } from "../hooks/useMinimumLoadingDuration";
import {
	getCurrentPosition,
	getGeolocationErrorMessage,
} from "../utils/geolocation";
import type { GeocodingResult } from "../interfaces/geocoding";
import { isDaytime } from "../utils/atmosphere";
import { getUpcomingHours } from "../utils/time";
import { LocationGlobe } from "../components/LocationGlobe";
import { CurrentWeather } from "../components/CurrentWeather";
import { WeatherMetrics } from "../components/WeatherMetrics";
import { HourlyForecast } from "../components/HourlyForecast";
import { DailyForecast } from "../components/DailyForecast";
import { Alerts } from "../components/Alerts";
import { SunMoonCard } from "../components/SunMoonCard";
import { Toast } from "../components/Toast";
import { CityTile } from "../components/CityTile";
import { WeatherSkeleton } from "../components/WeatherSkeleton";
import { Footer } from "../components/Footer";
import type { PopularCity } from "../utils/popularCities";

const CITY_AREA_CLASSES = [
	"[grid-area:city1]",
	"[grid-area:city2]",
	"[grid-area:city3]",
	"[grid-area:city4]",
];

const BENTO_EASE = [0.23, 1, 0.32, 1] as const;

function getBentoVariants(shouldReduceMotion: boolean) {
	const container = {
		hidden: {},
		show: {
			transition: {
				staggerChildren: shouldReduceMotion ? 0 : 0.06,
			},
		},
	};
	const item = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: shouldReduceMotion ? 0.15 : 0.4,
				ease: BENTO_EASE,
			},
		},
	};
	return { container, item };
}

export function Home() {
	const { weather, loading, error, lastUpdated, search, searchByCoordinates } =
		useWeather();
	const { results: popularResults, loading: popularLoading } =
		usePopularCities();
	const [cityInput, setCityInput] = useState("");
	const [locationError, setLocationError] = useState<string | null>(null);
	const [displayName, setDisplayName] = useState("");

	const handleSelectSuggestion = useCallback(
		async (result: GeocodingResult) => {
			const data = await searchByCoordinates(
				result.latitude,
				result.longitude,
			);
			if (data) {
				const name = [result.name, result.admin1, result.country]
					.filter(Boolean)
					.join(", ");
				setCityInput(name);
				setDisplayName(name);
			}
		},
		[searchByCoordinates],
	);

	const handleSelectPopularCity = useCallback(
		async (city: PopularCity) => {
			const data = await searchByCoordinates(city.lat, city.lon);
			if (data) {
				setCityInput(data.resolvedAddress);
				setDisplayName(data.resolvedAddress);
			}
		},
		[searchByCoordinates],
	);

	const handleSearch = useCallback(
		async (city: string) => {
			const data = await search(city);
			if (data) {
				setCityInput(data.resolvedAddress);
				setDisplayName(data.resolvedAddress);
			}
		},
		[search],
	);

	const handleLocate = useCallback(async () => {
		setLocationError(null);
		try {
			const position = await getCurrentPosition();
			const data = await searchByCoordinates(
				position.coords.latitude,
				position.coords.longitude,
			);
			if (data) {
				setCityInput(data.resolvedAddress);
				setDisplayName(data.resolvedAddress);
			}
		} catch (err) {
			setLocationError(getGeolocationErrorMessage(err));
		}
	}, [searchByCoordinates]);

	const current = weather?.currentConditions;
	const isDay = current
		? isDaytime(current.sunriseEpoch, current.sunsetEpoch)
		: true;
	const showLoading = useMinimumLoadingDuration(loading);
	const shouldReduceMotion = useReducedMotion();
	const { container: bentoContainer, item: bentoItem } = getBentoVariants(
		!!shouldReduceMotion,
	);

	return (
		<>
			<AtmosphereBackground
				icon={current?.icon ?? "clear-day"}
				isDay={isDay}
			/>
			<div className="relative min-h-screen flex flex-col">
				<Toast
					message={locationError}
					onDismiss={() => setLocationError(null)}
				/>
				<Header
					value={cityInput}
					onChange={setCityInput}
					onSearch={handleSearch}
					onSelectSuggestion={handleSelectSuggestion}
					onLocate={handleLocate}
					loading={loading}
				/>

				<main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 pb-10">
					<AnimatePresence mode="wait">
						{!weather && !showLoading && !error && (
							<motion.div
								key="empty-state"
								initial="hidden"
								animate="show"
								exit={{ opacity: 0 }}
								variants={bentoContainer}
								transition={{ duration: 0.35 }}
								className="bento-empty"
							>
								<motion.div variants={bentoItem} className="[grid-area:globe] min-w-0">
									<LocationGlobe />
								</motion.div>

								{popularResults.slice(0, 4).map((data, index) => (
									<motion.div
										key={data.city.name}
										variants={bentoItem}
										className={`${CITY_AREA_CLASSES[index]} min-w-0`}
									>
										<CityTile
											data={data}
											onSelect={() =>
												handleSelectPopularCity(data.city)
											}
											disabled={popularLoading}
										/>
									</motion.div>
								))}

								<motion.div
									variants={bentoItem}
									className="[grid-area:prompt] min-w-0 flex items-center justify-center py-2"
								>
									<p className="text-textMuted font-body text-sm">
										Buscá una ciudad para ver el clima
									</p>
								</motion.div>
							</motion.div>
						)}

						{showLoading && (
							<motion.div
								key="loading-state"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.35 }}
							>
								<WeatherSkeleton />
							</motion.div>
						)}

						{weather && current && !showLoading && (
							<motion.div
								key="weather-state"
								initial="hidden"
								animate="show"
								exit={{ opacity: 0 }}
								variants={bentoContainer}
								transition={{ duration: 0.35 }}
								className="bento-weather"
							>
								<motion.div variants={bentoItem} className="[grid-area:hero] h-full min-w-0">
									<CurrentWeather
										current={current}
										cityName={displayName}
										tempmax={weather.days[0].tempmax}
										tempmin={weather.days[0].tempmin}
										upcomingHours={getUpcomingHours(
											weather.days[0].hours,
											weather.days[1]?.hours,
										)}
									/>
								</motion.div>

								<motion.div variants={bentoItem} className="[grid-area:globe] h-full min-w-0">
									<LocationGlobe
										lat={weather.latitude}
										lng={weather.longitude}
										cityName={displayName || weather.resolvedAddress}
									/>
								</motion.div>

								{weather.alerts.length > 0 && (
									<motion.div variants={bentoItem} className="[grid-area:alerts] min-w-0">
										<Alerts alerts={weather.alerts} />
									</motion.div>
								)}

								<motion.div variants={bentoItem} className="[grid-area:hourly] min-w-0">
									<HourlyForecast
										todayHours={weather.days[0].hours}
										tomorrowHours={weather.days[1]?.hours}
									/>
								</motion.div>

								<motion.div variants={bentoItem} className="[grid-area:metrics] h-full min-w-0">
									<WeatherMetrics current={current} />
								</motion.div>

								<motion.div variants={bentoItem} className="[grid-area:sunmoon] h-full min-w-0">
									<SunMoonCard current={current} />
								</motion.div>

								<motion.div variants={bentoItem} className="[grid-area:daily] min-w-0">
									<DailyForecast days={weather.days.slice(0, 7)} />
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					{error && (
						<p className="text-textPrimary font-body text-sm glass-panel px-4 py-3 mt-6 mx-auto max-w-md text-center">
							{error}
						</p>
					)}
				</main>
				{weather && <Footer lastUpdated={lastUpdated} />}
			</div>
		</>
	);
}