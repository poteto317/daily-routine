import { WEATHER_CONSOLE_MESSAGES } from "../texts";

const getFallbackLocation = (latitude: number, longitude: number) =>
  `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

export const getLocationName = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ja`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DailyRoutineApp/1.0",
      },
    });

    if (!response.ok) return getFallbackLocation(latitude, longitude);

    const data = await response.json();
    const address = data.address;

    if (address) {
      return (
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        getFallbackLocation(latitude, longitude)
      );
    }

    return getFallbackLocation(latitude, longitude);
  } catch (error) {
    console.error(WEATHER_CONSOLE_MESSAGES.locationFetchFailed, error);
    return getFallbackLocation(latitude, longitude);
  }
};
