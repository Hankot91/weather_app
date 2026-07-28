import { lazy, Suspense, useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Header } from "../components/Header";
import { AtmosphereBackground } from "../components/AtmosphereBackground";
import { useWeather } from "../hooks/useWeather";
import { usePopularCities } from "../hooks/usePopularCities";
import { useMinimumLoadingDuration } from "../hooks/useMinimumLoadingDuration";
import { useAtmosphereShowcase } from "../hooks/useAtmosphereShowcase";
import {
	getCurrentPosition,
	getGeolocationErrorMessage,
} from "../utils/geolocation";
import type { GeocodingResult } from "../interfaces/geocoding";
import { isDaytime } from "../utils/atmosphere";
import { getUpcomingHours } from "../utils/time";
import { useUnit } from "../context/unit-context";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Skeleton } from "../components/Skeleton";
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
import { Globe, LayoutGrid } from "lucide-react";

// El globo 3D carga three.js + @react-three/fiber + drei, que pesan bastante
// más que el resto del bundle. Se separa en su propio chunk y se pide recién
// cuando el componente entra al árbol, para no bloquear el first paint.
const LocationGlobe = lazy(() =>
	import("../components/LocationGlobe").then((m) => ({
		default: m.LocationGlobe,
	})),
);

function GlobeFallback() {
	return (
		<div className="glass-panel relative w-full h-full min-h-55 overflow-hidden p-3">
			<Skeleton className="absolute inset-6 rounded-full" />
		</div>
	);
}

const GRID_EASE = [0.23, 1, 0.32, 1] as const;

function getGridVariants(shouldReduceMotion: boolean) {
	const container = {
		hidden: {},
		show: {
			transition: {
				staggerChildren: shouldReduceMotion ? 0 : 0.08,
			},
		},
	};
	const item = {
		hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: shouldReduceMotion ? 0.15 : 0.45,
				ease: GRID_EASE,
			},
		},
	};
	return { container, item };
}

export function Home() {
	const {
		weather,
		loading,
		error,
		canRetry,
		lastUpdated,
		search,
		searchByCoordinates,
		retry,
	} = useWeather();
	const { results: popularResults, loading: popularLoading } =
		usePopularCities();
	const [cityInput, setCityInput] = useState("");
	const [locationError, setLocationError] = useState<string | null>(null);
	const [displayName, setDisplayName] = useState("");
	const [viewMode, setViewMode] = useState<"orbit" | "compact">("orbit");
	const { formatTemp } = useUnit();

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
	const showcase = useAtmosphereShowcase(!weather);
	const showLoading = useMinimumLoadingDuration(loading);
	const shouldReduceMotion = useReducedMotion();
	const { container: gridContainer, item: gridItem } =
		getGridVariants(!!shouldReduceMotion);

	return (
		<>
			<AtmosphereBackground
				icon={current?.icon ?? showcase.icon}
				isDay={current ? isDay : showcase.isDay}
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
					onSelectPopularCity={handleSelectPopularCity}
					onLocate={handleLocate}
					loading={loading}
					activeCityName={displayName}
				/>

				<main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-10">
					{weather && current && !showLoading && (
						<div className="flex items-center justify-center mb-5">
							<div
								role="tablist"
								aria-label="Vista del clima"
								className="glass-panel inline-flex items-center gap-1 p-1"
							>
								<button
									type="button"
									role="tab"
									aria-selected={viewMode === "orbit"}
									onClick={() => setViewMode("orbit")}
									className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 ${
										viewMode === "orbit"
											? "bg-skyDay/25 text-textPrimary"
											: "text-textMuted hover:text-textPrimary"
									}`}
								>
									<Globe size={13} aria-hidden="true" />
									<span>Vista 3D</span>
								</button>
								<button
									type="button"
									role="tab"
									aria-selected={viewMode === "compact"}
									onClick={() => setViewMode("compact")}
									className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 ${
										viewMode === "compact"
											? "bg-skyDay/25 text-textPrimary"
											: "text-textMuted hover:text-textPrimary"
									}`}
								>
									<LayoutGrid size={13} aria-hidden="true" />
									<span>Panel completo</span>
								</button>
							</div>
						</div>
					)}

					<AnimatePresence mode="wait">
						{!weather && !showLoading && !error && (
							<motion.div
								key="empty-state"
								initial="hidden"
								animate="show"
								exit={{ opacity: 0 }}
								variants={gridContainer}
								transition={{ duration: 0.35 }}
								className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
							>
								<motion.div
									variants={gridItem}
									className="lg:col-span-7 h-95 md:h-115 min-w-0"
								>
									<ErrorBoundary label="el globo 3D" fallback={<GlobeFallback />}>
										<Suspense fallback={<GlobeFallback />}>
											<LocationGlobe />
										</Suspense>
									</ErrorBoundary>
								</motion.div>

								<motion.div
									variants={gridItem}
									className="lg:col-span-5 min-w-0 grid grid-cols-2 gap-4"
								>
									{popularResults.slice(0, 4).map((data) => (
										<CityTile
											key={data.city.name}
											data={data}
											onSelect={() =>
												handleSelectPopularCity(
													data.city,
												)
											}
											disabled={popularLoading}
										/>
									))}
								</motion.div>

								<motion.div
									variants={gridItem}
									className="lg:col-span-12 flex items-center justify-center py-2"
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
								variants={gridContainer}
								transition={{ duration: 0.35 }}
								className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
							>
								<motion.div
									variants={gridItem}
									className={
										viewMode === "orbit"
											? "lg:col-span-5 flex flex-col gap-5 min-w-0"
											: "lg:col-span-12 flex flex-col gap-5 min-w-0"
									}
								>
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
									<HourlyForecast
										todayHours={weather.days[0].hours}
										tomorrowHours={weather.days[1]?.hours}
									/>
								</motion.div>

								{viewMode === "orbit" && (
									<motion.div
										variants={gridItem}
										className="lg:col-span-7 h-95 md:h-115 lg:h-full min-w-0"
									>
										<ErrorBoundary label="el globo 3D" fallback={<GlobeFallback />}>
											<Suspense fallback={<GlobeFallback />}>
												<LocationGlobe
													lat={weather.latitude}
													lng={weather.longitude}
													cityName={
														displayName ||
														weather.resolvedAddress
													}
													temp={formatTemp(current.temp)}
													icon={current.icon}
												/>
											</Suspense>
										</ErrorBoundary>
									</motion.div>
								)}

								{weather.alerts.length > 0 && (
									<motion.div
										variants={gridItem}
										className="lg:col-span-12 min-w-0"
									>
										<Alerts alerts={weather.alerts} />
									</motion.div>
								)}

								<motion.div
									variants={gridItem}
									className="lg:col-span-8 min-w-0"
								>
									<WeatherMetrics current={current} />
								</motion.div>

								<motion.div
									variants={gridItem}
									className="lg:col-span-4 min-w-0"
								>
									<SunMoonCard current={current} />
								</motion.div>

								<motion.div
									variants={gridItem}
									className="lg:col-span-12 min-w-0"
								>
									<DailyForecast
										days={weather.days.slice(0, 7)}
									/>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					{error && (
						<div className="glass-panel flex flex-col items-center gap-3 px-4 py-3 mt-6 mx-auto max-w-md text-center">
							<p className="text-textPrimary font-body text-sm">{error}</p>
							{canRetry && (
								<button
									type="button"
									onClick={() => retry()}
									disabled={loading}
									className="font-mono text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/16 transition-colors text-textPrimary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70"
								>
									{loading ? "Reintentando…" : "Reintentar"}
								</button>
							)}
						</div>
					)}
				</main>
				{weather && <Footer lastUpdated={lastUpdated} />}
			</div>
		</>
	);
}
