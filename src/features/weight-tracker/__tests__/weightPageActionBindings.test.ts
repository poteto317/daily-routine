import { createWeightPageActionBindings } from "../page/weightPageActionBindings";

describe("weightPageActionBindings", () => {
  it("weight tracker action 用の依存を束ねる", () => {
    const bindings = createWeightPageActionBindings({
      weightInput: "69.5",
      notesInput: "updated",
      setTodayRecord: jest.fn(),
      setWeightInput: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
      setRecentRecords: jest.fn(),
    });

    expect(bindings).toEqual(
      expect.objectContaining({
        weightInput: "69.5",
        notesInput: "updated",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は束ねない
    expect(bindings).not.toHaveProperty("today");
  });
});
