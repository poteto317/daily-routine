import { createWeightPageActionBindings } from "../page/weightPageActionBindings";

describe("weightPageActionBindings", () => {
  it("weight tracker action 用の依存を束ねる", () => {
    const bindings = createWeightPageActionBindings({
      today: "2024-01-12",
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
        today: "2024-01-12",
        weightInput: "69.5",
        notesInput: "updated",
      }),
    );
  });
});
