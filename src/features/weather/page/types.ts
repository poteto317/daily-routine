import { type WeatherData } from "../api";

export interface WeatherPageState {
  weatherData: WeatherData | null;
  isLoading: boolean;
  isLocationLoading: boolean;
  hasPreferredLocation: boolean;
  error: string | null;
  locationError: string | null;
  locationStatus: string;
  clearLocationError: () => void;
  handleUseCurrentLocation: () => Promise<void>;
  handleResetPreferredLocation: () => Promise<void>;
}
