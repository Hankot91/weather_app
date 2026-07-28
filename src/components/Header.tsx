import { SearchBar } from "./SearchBar";
import { UnitToggle } from "./UnitToggle";
import type { GeocodingResult } from "../interfaces/geocoding";
import { POPULAR_CITIES, type PopularCity } from "../utils/popularCities";

interface HeaderProps {
	value: string;
	onChange: (value: string) => void;
	onSearch: (city: string) => void;
	onSelectSuggestion: (result: GeocodingResult) => void;
	onSelectPopularCity: (city: PopularCity) => void;
	onLocate: () => void;
	loading: boolean;
	/** Nombre resuelto de la ciudad actual, para resaltar el chip activo */
	activeCityName: string;
}

export function Header({
	value,
	onChange,
	onSearch,
	onSelectSuggestion,
	onSelectPopularCity,
	onLocate,
	loading,
	activeCityName,
}: HeaderProps) {
	return (
		<header className="relative z-20 flex flex-col items-center gap-4 px-6 pt-8 pb-4">
			<div className="absolute right-6 top-8">
				<UnitToggle />
			</div>
			<h1 className="font-display text-lg tracking-wide text-textPrimary/90">
				Nimbo
			</h1>
			<SearchBar
				value={value}
				onChange={onChange}
				onSearch={onSearch}
				onSelectSuggestion={onSelectSuggestion}
				onLocate={onLocate}
				loading={loading}
			/>

			{/* Barra fija de ciudades populares: siempre visible, no solo antes
			    de buscar, para que cambiar de ciudad sea un click sin tener
			    que volver al estado vacío. */}
			<nav
				aria-label="Ciudades populares"
				className="flex items-center gap-2 max-w-full overflow-x-auto scrollbar-hide px-1"
			>
				{POPULAR_CITIES.map((city) => {
					const isActive = activeCityName
						.toLowerCase()
						.includes(city.name.toLowerCase());
					return (
						<button
							key={city.name}
							type="button"
							onClick={() => onSelectPopularCity(city)}
							disabled={loading}
							aria-pressed={isActive}
							className={`shrink-0 font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 disabled:opacity-50 ${
								isActive
									? "bg-skyDay/25 border-skyDay/60 text-textPrimary"
									: "bg-white/5 border-white/10 text-textMuted hover:text-textPrimary hover:border-skyDay/30 hover:bg-white/10"
							}`}
						>
							{city.name}
						</button>
					);
				})}
			</nav>
		</header>
	);
}
