import { renderHook } from "@testing-library/react";
import { useTrainDelays } from "../useTrainDelays";
import * as settingsStorage from "@/features/settings/storage";

jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(),
}));

const mockGetSettings = settingsStorage.getSettings as jest.MockedFunction<
  typeof settingsStorage.getSettings
>;

describe("useTrainDelays", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("遅延設定が無効なら空配列を返す", () => {
    mockGetSettings.mockReturnValue({
      trainDelay: { enabled: false, monitoredLines: [] },
    } as never);

    const { result } = renderHook(() => useTrainDelays());

    expect(result.current).toEqual([]);
  });

  it("監視路線があり乱数条件を満たせば遅延情報を返す", () => {
    mockGetSettings.mockReturnValue({
      trainDelay: {
        enabled: true,
        monitoredLines: [
          { lineId: "l1", lineName: "山手線", company: "JR" },
          { lineId: "l2", lineName: "中央線", company: "JR" },
        ],
      },
    } as never);

    const randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const { result } = renderHook(() => useTrainDelays());

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      lineId: "l1",
      lineName: "山手線",
      company: "JR",
    });

    randomSpy.mockRestore();
  });
});
