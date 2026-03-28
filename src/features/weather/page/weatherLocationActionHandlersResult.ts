type CreateWeatherLocationActionHandlersResultArgs = {
  clearLocationError: () => void;
  handleResetPreferredLocation: () => Promise<void>;
  handleUseCurrentLocation: () => Promise<void>;
};

export const createWeatherLocationActionHandlersResult = ({
  clearLocationError,
  handleResetPreferredLocation,
  handleUseCurrentLocation,
}: CreateWeatherLocationActionHandlersResultArgs) => ({
  clearLocationError,
  handleResetPreferredLocation,
  handleUseCurrentLocation,
});
