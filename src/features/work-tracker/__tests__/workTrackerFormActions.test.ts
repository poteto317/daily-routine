import { createWorkTrackerResetFormAction } from "../page/workTrackerFormActions";

describe("workTrackerFormActions", () => {
  it("reset action がフォーム状態を初期化する", () => {
    const params = {
      setWorkName: jest.fn(),
      setNotes: jest.fn(),
      setSelectedMood: jest.fn(),
      setSelectedTemplate: jest.fn(),
      setElapsedTime: jest.fn(),
      setShowInputForm: jest.fn(),
      setShowTemplateDropdown: jest.fn(),
      clearStartTime: jest.fn(),
    };

    createWorkTrackerResetFormAction(params)();

    expect(params.setWorkName).toHaveBeenCalledWith("");
    expect(params.setNotes).toHaveBeenCalledWith("");
    expect(params.setSelectedMood).toHaveBeenCalledWith("normal");
    expect(params.setSelectedTemplate).toHaveBeenCalledWith(null);
    expect(params.setElapsedTime).toHaveBeenCalledWith(0);
    expect(params.setShowInputForm).toHaveBeenCalledWith(false);
    expect(params.setShowTemplateDropdown).toHaveBeenCalledWith(false);
    expect(params.clearStartTime).toHaveBeenCalled();
  });
});
