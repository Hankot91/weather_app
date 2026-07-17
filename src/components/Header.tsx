import { SearchBar } from "./SearchBar";
import { UnitToggle } from "./UnitToggle";
import type { GeocodingResult } from "../interfaces/geocoding";

interface HeaderProps {
	value: string;
	onChange: (value: string) => void;
	onSearch: (city: string) => void;
	onSelectSuggestion: (result: GeocodingResult) => void;
	onLocate: () => void;
	loading: boolean;
}

export function Header({
	value,
	onChange,
	onSearch,
	onSelectSuggestion,
	onLocate,
	loading,
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
		</header>
	);
}