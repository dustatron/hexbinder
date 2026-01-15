import type {
  WeatherState,
  WeatherCondition,
  Temperature,
  WindLevel,
  Season,
} from "~/models";
import { SeededRandom, createWeightedTable, type WeightedTable } from "./SeededRandom";

// Weather weights by season
const WEATHER_BY_SEASON: Record<Season, WeightedTable<WeatherCondition>> = {
  spring: createWeightedTable({
    clear: 25,
    cloudy: 25,
    overcast: 15,
    rain_light: 20,
    rain_heavy: 10,
    storm: 3,
    thunderstorm: 2,
    fog: 0,
    snow_light: 0,
    snow_heavy: 0,
    blizzard: 0,
  }),
  summer: createWeightedTable({
    clear: 40,
    cloudy: 20,
    overcast: 10,
    rain_light: 10,
    rain_heavy: 5,
    storm: 5,
    thunderstorm: 8,
    fog: 2,
    snow_light: 0,
    snow_heavy: 0,
    blizzard: 0,
  }),
  autumn: createWeightedTable({
    clear: 20,
    cloudy: 30,
    overcast: 20,
    rain_light: 15,
    rain_heavy: 8,
    storm: 3,
    thunderstorm: 2,
    fog: 2,
    snow_light: 0,
    snow_heavy: 0,
    blizzard: 0,
  }),
  winter: createWeightedTable({
    clear: 15,
    cloudy: 20,
    overcast: 20,
    rain_light: 5,
    rain_heavy: 0,
    storm: 0,
    thunderstorm: 0,
    fog: 5,
    snow_light: 20,
    snow_heavy: 10,
    blizzard: 5,
  }),
};

// Temperature weights by season
const TEMP_BY_SEASON: Record<Season, WeightedTable<Temperature>> = {
  spring: createWeightedTable({
    freezing: 5,
    cold: 15,
    cool: 35,
    mild: 35,
    warm: 10,
    hot: 0,
  }),
  summer: createWeightedTable({
    freezing: 0,
    cold: 0,
    cool: 10,
    mild: 25,
    warm: 40,
    hot: 25,
  }),
  autumn: createWeightedTable({
    freezing: 5,
    cold: 20,
    cool: 35,
    mild: 30,
    warm: 10,
    hot: 0,
  }),
  winter: createWeightedTable({
    freezing: 30,
    cold: 40,
    cool: 20,
    mild: 10,
    warm: 0,
    hot: 0,
  }),
};

// Wind weights (season-independent)
const WIND_WEIGHTS = createWeightedTable<WindLevel>({
  calm: 30,
  breeze: 40,
  wind: 25,
  gale: 5,
});

// Storm conditions increase wind
const STORM_CONDITIONS: WeatherCondition[] = [
  "storm",
  "thunderstorm",
  "blizzard",
];

// Temperature ranges in Fahrenheit [minLow, maxLow, minHigh, maxHigh]
const TEMP_RANGES: Record<Temperature, [number, number, number, number]> = {
  freezing: [-10, 15, 10, 32],
  cold: [20, 35, 35, 45],
  cool: [38, 50, 50, 62],
  mild: [50, 60, 62, 72],
  warm: [60, 72, 75, 88],
  hot: [72, 85, 88, 105],
};

export interface WeatherGeneratorOptions {
  seed: string;
  season: Season;
  day: number;
}

/**
 * Generate weather for a specific day.
 * Same seed + season + day = same weather.
 */
export function generateWeather(options: WeatherGeneratorOptions): WeatherState {
  const { seed, season, day } = options;
  const rng = new SeededRandom(`${seed}-weather-${day}`);

  const condition = rng.pickWeighted(WEATHER_BY_SEASON[season]);
  let temperature = rng.pickWeighted(TEMP_BY_SEASON[season]);
  let wind = rng.pickWeighted(WIND_WEIGHTS);

  // Storms always have at least wind
  if (STORM_CONDITIONS.includes(condition)) {
    if (wind === "calm" || wind === "breeze") {
      wind = "wind";
    }
    // Blizzards are always gale
    if (condition === "blizzard") {
      wind = "gale";
    }
  }

  // Snow requires cold temps
  if (condition === "snow_light" || condition === "snow_heavy" || condition === "blizzard") {
    if (temperature !== "freezing" && temperature !== "cold") {
      temperature = "cold";
    }
  }

  // Generate numeric temps from range
  const [minLow, maxLow, minHigh, maxHigh] = TEMP_RANGES[temperature];
  const tempLow = rng.between(minLow, maxLow);
  const tempHigh = rng.between(Math.max(minHigh, tempLow + 5), maxHigh);

  return {
    condition,
    temperature,
    tempLow,
    tempHigh,
    wind,
  };
}

/**
 * Get season from day number (90-day seasons, starting spring).
 */
export function getSeasonFromDay(day: number): Season {
  const dayOfYear = ((day - 1) % 360);
  if (dayOfYear < 90) return "spring";
  if (dayOfYear < 180) return "summer";
  if (dayOfYear < 270) return "autumn";
  return "winter";
}

/**
 * Get moon phase from day number (8-day cycle).
 */
export function getMoonPhase(day: number): "new" | "waxing" | "full" | "waning" {
  const phase = (day - 1) % 32;
  if (phase < 8) return "new";
  if (phase < 16) return "waxing";
  if (phase < 24) return "full";
  return "waning";
}
