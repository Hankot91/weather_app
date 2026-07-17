import { useMemo } from "react";
import type { PopularCityWeather } from "../hooks/usePopularCities";
import { ICON_MAP } from "../utils/iconMap";
import { getAtmosphereTheme, isDaytime } from "../utils/atmosphere";
import { useUnit } from "../context/unit-context";

interface CityTileProps {
  data: PopularCityWeather;
  onSelect: () => void;
  disabled: boolean;
}

export function CityTile({ data, onSelect, disabled }: CityTileProps) {
  const { city, weather } = data;
  const current = weather?.currentConditions;
  const Icon = current ? ICON_MAP[current.icon] : null;
  const { formatTemp } = useUnit();

  const gradientStyle = useMemo(() => {
    if (!current) return undefined;
    const isDay = isDaytime(current.sunriseEpoch, current.sunsetEpoch);
    const theme = getAtmosphereTheme(current.icon, isDay);
    return {
      background: `linear-gradient(160deg, var(${theme.fromVar}), var(${theme.toVar}))`,
    };
  }, [current]);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled || !weather}
      className="glass-panel bento-tile relative w-full h-full min-h-27.5 flex flex-col items-center justify-center gap-1.5 p-4 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyDay/70 disabled:cursor-default disabled:opacity-50 disabled:hover:scale-100"
    >
      {gradientStyle && (
        <div
          className="absolute inset-0 opacity-35 pointer-events-none"
          style={gradientStyle}
          aria-hidden="true"
        />
      )}

      <span className="relative font-body text-sm text-textPrimary">
        {city.name}
      </span>
      {current && Icon ? (
        <>
          <Icon
            size={22}
            strokeWidth={1.5}
            className="relative text-textPrimary/80"
            aria-hidden="true"
          />
          <span className="relative font-display text-xl text-textPrimary">
            {formatTemp(current.temp)}
          </span>
        </>
      ) : (
        <span className="relative font-mono text-xs text-textMuted animate-pulse">
          Cargando…
        </span>
      )}
    </button>
  );
}