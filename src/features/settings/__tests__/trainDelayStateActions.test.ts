import { AVAILABLE_LINES } from "../state/constants";
import {
  addTrainDelayLine,
  createTrainDelayInitialState,
  removeTrainDelayLine,
} from "../state/trainDelayStateActions";

describe("trainDelayStateActions", () => {
  it("settings から初期状態を作る", () => {
    expect(
      createTrainDelayInitialState({
        defaultDurationMinutes: 30,
        defaultNotificationMinutes: 0,
        theme: "light",
        swipeAction: "delete",
        pomodoroFocusMinutes: 25,
        pomodoroBreakMinutes: 5,
        trainDelay: {
          enabled: true,
          monitoredLines: [
            {
              lineId: "yamanote",
              lineName: "山手線",
              company: "JR東日本",
            },
          ],
        },
      }),
    ).toEqual({
      trainDelayEnabled: true,
      monitoredLines: [
        {
          lineId: "yamanote",
          lineName: "山手線",
          company: "JR東日本",
        },
      ],
    });
  });

  it("trainDelay がなくても安全な初期状態を返す", () => {
    expect(
      createTrainDelayInitialState({
        defaultDurationMinutes: 30,
        defaultNotificationMinutes: 0,
        theme: "light",
        swipeAction: "delete",
        pomodoroFocusMinutes: 25,
        pomodoroBreakMinutes: 5,
      }),
    ).toEqual({
      trainDelayEnabled: false,
      monitoredLines: [],
    });
  });

  it("選択中の路線を追加して入力をリセットする", () => {
    expect(
      addTrainDelayLine({
        selectedLineInput: "yamanote",
        monitoredLines: [],
        availableLines: AVAILABLE_LINES,
        duplicateMessage: "duplicate",
      }),
    ).toEqual({
      added: true,
      nextMonitoredLines: [
        {
          lineId: "yamanote",
          lineName: "山手線",
          company: "JR東日本",
        },
      ],
      nextSelectedLineInput: "",
    });
  });

  it("未選択なら何もしない", () => {
    expect(
      addTrainDelayLine({
        selectedLineInput: "",
        monitoredLines: [],
        availableLines: AVAILABLE_LINES,
        duplicateMessage: "duplicate",
      }),
    ).toEqual({
      added: false,
      nextMonitoredLines: [],
      nextSelectedLineInput: "",
    });
  });

  it("不正な路線IDなら何もしない", () => {
    expect(
      addTrainDelayLine({
        selectedLineInput: "unknown",
        monitoredLines: [],
        availableLines: AVAILABLE_LINES,
        duplicateMessage: "duplicate",
      }),
    ).toEqual({
      added: false,
      nextMonitoredLines: [],
      nextSelectedLineInput: "unknown",
    });
  });

  it("重複時は alert して追加しない", () => {
    const alertFn = jest.fn();
    const monitoredLines = [
      {
        lineId: "yamanote",
        lineName: "山手線",
        company: "JR東日本",
      },
    ];

    expect(
      addTrainDelayLine({
        selectedLineInput: "yamanote",
        monitoredLines,
        availableLines: AVAILABLE_LINES,
        duplicateMessage: "duplicate",
        alertFn,
      }),
    ).toEqual({
      added: false,
      nextMonitoredLines: monitoredLines,
      nextSelectedLineInput: "yamanote",
    });
    expect(alertFn).toHaveBeenCalledWith("duplicate");
  });

  it("路線を削除する", () => {
    expect(
      removeTrainDelayLine(
        [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
          {
            lineId: "chuo",
            lineName: "中央線",
            company: "JR東日本",
          },
        ],
        "yamanote",
      ),
    ).toEqual([
      {
        lineId: "chuo",
        lineName: "中央線",
        company: "JR東日本",
      },
    ]);
  });
});
