export const buildForecastUrl = (
  latitude: number,
  longitude: number,
  includeHourly: boolean,
) => {
  const hourlyParams = includeHourly
    ? "&hourly=temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m,weather_code"
    : "";

  return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=7&timezone=auto${hourlyParams}`;
};
