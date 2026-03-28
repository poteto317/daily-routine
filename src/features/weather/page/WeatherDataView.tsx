import { useState } from "react";
import { WeatherData } from "../api";
import { HourlyForecastSection } from "./HourlyForecastSection";
import { TodayWeatherCard } from "./TodayWeatherCard";
import { WeatherFooter } from "./WeatherFooter";
import { WeatherHeader } from "./WeatherHeader";
import { WeeklyForecastSection } from "./WeeklyForecastSection";
import { WeatherPanel } from "./WeatherPanel";
import { formatDate } from "./format";
import {
  getHourlyForecastsForDate,
  resolveSelectedForecastDate,
} from "./hourlySelection";

interface WeatherDataViewProps {
  data: WeatherData;
  isLocationLoading: boolean;
  hasPreferredLocation: boolean;
  onUseCurrentLocation: () => void;
  onResetPreferredLocation: () => void;
}

export const WeatherDataView = ({
  data,
  isLocationLoading,
  hasPreferredLocation,
  onUseCurrentLocation,
  onResetPreferredLocation,
}: WeatherDataViewProps) => {
  const forecastDates = data.forecasts.map((forecast) => forecast.date);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    resolveSelectedForecastDate(forecastDates, null),
  );
  const effectiveSelectedDate = resolveSelectedForecastDate(
    forecastDates,
    selectedDate,
  );

  const selectedForecast =
    data.forecasts.find(
      (forecast) => forecast.date === effectiveSelectedDate,
    ) ?? data.forecasts[0];
  const selectedHourly = getHourlyForecastsForDate(
    data.hourly,
    effectiveSelectedDate,
  );

  return (
    <WeatherPanel>
      <WeatherHeader
        location={data.location}
        isLocationLoading={isLocationLoading}
        hasPreferredLocation={hasPreferredLocation}
        onUseCurrentLocation={onUseCurrentLocation}
        onResetPreferredLocation={onResetPreferredLocation}
      />
      <TodayWeatherCard forecast={data.forecasts[0]} />
      {data.hourly && (
        <HourlyForecastSection
          hourly={selectedHourly}
          selectedDateLabel={
            selectedForecast
              ? `${formatDate(selectedForecast.date)} ${selectedForecast.dayOfWeek}`
              : undefined
          }
        />
      )}
      <WeeklyForecastSection
        forecasts={data.forecasts}
        selectedDate={effectiveSelectedDate}
        onSelectDate={setSelectedDate}
      />
      <WeatherFooter lastUpdated={data.lastUpdated} />
    </WeatherPanel>
  );
};
