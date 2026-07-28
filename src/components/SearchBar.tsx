import { Search, MapPin, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { GeocodingResult } from "../interfaces/geocoding";
import { searchCities } from "../services/geocodingApi";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onSearch: (city: string) => void;
	onSelectSuggestion: (result: GeocodingResult) => void;
	onLocate: () => void;
	loading: boolean;
}

export function SearchBar({
	value,
	onChange,
	onSearch,
	onSelectSuggestion,
	onLocate,
	loading,
}: SearchBarProps) {
	const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const listboxId = useId();
	const debouncedValue = useDebounce(value, 350);

	useEffect(() => {
		let cancelled = false;
		searchCities(debouncedValue).then((results) => {
			if (!cancelled) {
				setSuggestions(results);
				setIsOpen(results.length > 0);
				setActiveIndex(-1);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [debouncedValue]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
		e?.preventDefault();
		setIsOpen(false);
		setActiveIndex(-1);
		onSearch(value);
	};

	const handleSelect = (result: GeocodingResult) => {
		setIsOpen(false);
		setActiveIndex(-1);
		onSelectSuggestion(result);
	};

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!isOpen || suggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (i + 1) % suggestions.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
		} else if (e.key === "Enter" && activeIndex >= 0) {
			e.preventDefault();
			handleSelect(suggestions[activeIndex]);
		} else if (e.key === "Escape") {
			setIsOpen(false);
			setActiveIndex(-1);
		}
	}

	return (
		<>
			{isOpen && (
				<div className="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm transition-opacity" />
			)}

			<div ref={containerRef} className="relative z-20 w-full max-w-md">
				<form
					onSubmit={handleSubmit}
					className="glass-panel flex items-center gap-2 px-4 py-3 w-full focus-within:ring-2 focus-within:ring-skyDay/70 focus-within:ring-offset-2 focus-within:ring-offset-night transition-shadow"
				>
					<Search size={18} className="text-textMuted shrink-0" aria-hidden="true" />
					<input
						type="text"
						role="combobox"
						aria-expanded={isOpen}
						aria-controls={listboxId}
						aria-autocomplete="list"
						aria-activedescendant={
							activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
						}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() =>
							suggestions.length > 0 && setIsOpen(true)
						}
						placeholder="Buscar ciudad…"
						aria-label="Buscar ciudad"
						className="bg-transparent outline-none flex-1 text-textPrimary placeholder:text-textMuted font-body text-sm focus-visible:outline-none"
					/>
					<button
						type="button"
						onClick={onLocate}
						disabled={loading}
						aria-label="Usar mi ubicación"
						className="glass-panel flex flex-col items-center gap-1.5 p-4 cursor-pointer transition-all duration-200 hover:bg-white/14 hover:-translate-y-1 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 disabled:cursor-default disabled:opacity-50"
					>
						{loading ? (
							<Loader2 size={18} className="animate-spin" aria-hidden="true" />
						) : (
							<MapPin size={18} aria-hidden="true" />
						)}
					</button>
				</form>

				{isOpen && (
					<div
						id={listboxId}
						role="listbox"
						aria-label="Sugerencias de ciudades"
						className="glass-panel absolute top-full mt-2 w-full overflow-hidden py-1"
					>
						{suggestions.map((result, index) => (
							<button
								key={result.id}
								id={`${listboxId}-option-${index}`}
								role="option"
								aria-selected={index === activeIndex}
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onMouseEnter={() => setActiveIndex(index)}
								onClick={() => handleSelect(result)}
								className={`w-full text-left px-4 py-2.5 transition-colors flex flex-col ${
									index === activeIndex
										? "bg-white/14"
										: "hover:bg-white/10"
								}`}
							>
								<span className="font-body text-sm text-textPrimary">
									{result.name}
								</span>
								<span className="font-mono text-[11px] text-textMuted">
									{[result.admin1, result.country]
										.filter(Boolean)
										.join(", ")}
								</span>
							</button>
						))}
					</div>
				)}
			</div>
		</>
	);
}
