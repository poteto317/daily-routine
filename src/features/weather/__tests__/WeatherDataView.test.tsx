import { fireEvent, render, screen } from "@testing-library/react";
import { WeatherDataView } from "../page/WeatherDataView";

describe("WeatherDataView", () => {
  it("週間予報で日付を選ぶとその日の時間別予報を表示する", () => {
    render(
      <WeatherDataView
        data={{
          location: "東京",
          lastUpdated: "2026-02-13T00:00:00.000Z",
          forecasts: [
            {
              date: "2026-02-13",
              dayOfWeek: "金",
              weather: "sunny",
              temperature: { high: 10, low: 2 },
              precipitation: 0,
              description: "快晴",
            },
            {
              date: "2026-02-14",
              dayOfWeek: "土",
              weather: "cloudy",
              temperature: { high: 12, low: 4 },
              precipitation: 20,
              description: "くもり",
            },
          ],
          hourly: [
            {
              time: "2026-02-13T01:00:00.000Z",
              weather: "sunny",
              temperature: 6,
              precipitation: 0,
              humidity: 40,
              windSpeed: 2,
            },
            {
              time: "2026-02-14T02:00:00.000Z",
              weather: "cloudy",
              temperature: 8,
              precipitation: 20,
              humidity: 50,
              windSpeed: 3,
            },
          ],
        }}
        isLocationLoading={false}
        hasPreferredLocation={false}
        onUseCurrentLocation={() => undefined}
        onResetPreferredLocation={() => undefined}
      />,
    );

    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.queryByText("11:00")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /2\/14/ }));

    expect(screen.getByText("11:00")).toBeInTheDocument();
    expect(screen.queryByText("10:00")).not.toBeInTheDocument();
  });
});
