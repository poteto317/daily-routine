import { GEOLOCATION_MESSAGES } from "../texts";

export const getUserLocation = (
  setLocationStatus: (status: string) => void,
): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(GEOLOCATION_MESSAGES.notSupported));
      return;
    }

    setLocationStatus(GEOLOCATION_MESSAGES.loading);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn(GEOLOCATION_MESSAGES.consoleFailed, error);
        reject(error);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  });
};
