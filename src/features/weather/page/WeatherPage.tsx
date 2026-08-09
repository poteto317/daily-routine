"use client";

import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { WeatherDataView } from "./WeatherDataView";
import { useWeatherPageState } from "./useWeatherPageState";
import texts from "../locales/ja.json";

export const WeatherPage = () => {
  const {
    weatherData,
    isLoading,
    isLocationLoading,
    hasPreferredLocation,
    error,
    locationError,
    locationStatus,
    clearLocationError,
    handleUseCurrentLocation,
    handleResetPreferredLocation,
  } = useWeatherPageState();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 to-blue-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && <LoadingState locationStatus={locationStatus} />}
        {error && !isLoading && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}
        {weatherData && !isLoading && (
          <>
            {locationError && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-100 border border-yellow-300 rounded-lg flex items-center justify-between">
                <p className="text-sm text-yellow-800 dark:text-yellow-900">
                  {locationError}
                </p>
                <button
                  type="button"
                  onClick={clearLocationError}
                  className="ml-4 text-yellow-600 dark:text-yellow-800 hover:text-yellow-800 dark:hover:text-yellow-900 font-bold"
                  aria-label={texts.weatherPage.dismissLocationErrorLabel}
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            )}
            <WeatherDataView
              data={weatherData}
              isLocationLoading={isLocationLoading}
              hasPreferredLocation={hasPreferredLocation}
              onUseCurrentLocation={handleUseCurrentLocation}
              onResetPreferredLocation={handleResetPreferredLocation}
            />
          </>
        )}
      </main>
    </div>
  );
};
