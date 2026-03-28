import { AVAILABLE_LINES } from "../state/constants";
import { createTrainDelayStateResult } from "../state/trainDelayStateResult";

describe("trainDelayStateResult", () => {
  it("train delay state の公開 shape を組み立てる", () => {
    const setTrainDelayEnabled = jest.fn();
    const setSelectedLineInput = jest.fn();
    const handleAddLine = jest.fn();
    const handleRemoveLine = jest.fn();

    expect(
      createTrainDelayStateResult({
        trainDelayEnabled: true,
        setTrainDelayEnabled,
        selectedLineInput: "yamanote",
        setSelectedLineInput,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
        handleAddLine,
        handleRemoveLine,
        availableLines: AVAILABLE_LINES,
      }),
    ).toEqual({
      trainDelayEnabled: true,
      setTrainDelayEnabled,
      selectedLineInput: "yamanote",
      setSelectedLineInput,
      monitoredLines: [
        {
          lineId: "yamanote",
          lineName: "山手線",
          company: "JR東日本",
        },
      ],
      handleAddLine,
      handleRemoveLine,
      availableLines: AVAILABLE_LINES,
    });
  });
});
