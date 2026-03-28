import { renderHook } from "@testing-library/react";

jest.mock("../journalPageFormActions", () => ({
  createCancelJournalFormHandler: jest.fn(),
  createOpenJournalFormAction: jest.fn(),
}));

import {
  createCancelJournalFormHandler,
  createOpenJournalFormAction,
} from "../journalPageFormActions";
import { useJournalPageFormActions } from "../useJournalPageFormActions";

describe("useJournalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("journal form action を組み立てる", () => {
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const params = {
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setShowForm: jest.fn(),
    };

    (createCancelJournalFormHandler as jest.Mock).mockReturnValue(
      handleCancelForm,
    );
    (createOpenJournalFormAction as jest.Mock).mockReturnValue(openForm);

    const { result } = renderHook(() => useJournalPageFormActions(params));

    expect(createCancelJournalFormHandler).toHaveBeenCalledWith({
      setTitleInput: params.setTitleInput,
      setContentInput: params.setContentInput,
      setShowForm: params.setShowForm,
    });
    expect(createOpenJournalFormAction).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
    });
    expect(result.current).toEqual({
      handleCancelForm,
      openForm,
    });
  });
});
