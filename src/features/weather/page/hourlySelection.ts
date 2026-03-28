import type { HourlyWeatherForecast } from "@/types/routine";

export const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const isTodayForecastDate = (
  selectedDate: string | null,
  now: Date = new Date(),
): boolean => {
  if (!selectedDate) return false;

  return selectedDate === toLocalDateKey(now);
};

export const getDefaultSelectedForecastDate = (
  dates: string[],
  today: string = new Date().toISOString().split("T")[0] ?? "",
): string | null => {
  if (dates.length === 0) return null;
  return dates.includes(today) ? today : (dates[0] ?? null);
};

export const resolveSelectedForecastDate = (
  dates: string[],
  selectedDate: string | null,
  today: string = new Date().toISOString().split("T")[0] ?? "",
): string | null => {
  if (selectedDate && dates.includes(selectedDate)) {
    return selectedDate;
  }

  return getDefaultSelectedForecastDate(dates, today);
};

const limitHourlyForecasts = (
  hourly: HourlyWeatherForecast[],
): HourlyWeatherForecast[] => {
  return hourly.slice(0, 24);
};

export const getUpcomingHourlyForecasts = (
  hourly: HourlyWeatherForecast[],
  now: Date = new Date(),
): HourlyWeatherForecast[] => {
  return limitHourlyForecasts(
    hourly.filter((entry) => new Date(entry.time) >= now),
  );
};

export const getHourlyForecastsForSelectedDate = (
  hourly: HourlyWeatherForecast[],
  selectedDate: string,
): HourlyWeatherForecast[] => {
  return limitHourlyForecasts(
    hourly.filter(
      (entry) => toLocalDateKey(new Date(entry.time)) === selectedDate,
    ),
  );
};

export const getHourlyForecastsForDate = (
  hourly: HourlyWeatherForecast[] | undefined,
  selectedDate: string | null,
  now: Date = new Date(),
): HourlyWeatherForecast[] => {
  if (!hourly || !selectedDate) return [];

  if (isTodayForecastDate(selectedDate, now)) {
    return getUpcomingHourlyForecasts(hourly, now);
  }

  return getHourlyForecastsForSelectedDate(hourly, selectedDate);
};
