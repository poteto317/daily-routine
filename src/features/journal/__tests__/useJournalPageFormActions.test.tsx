import { renderHook } from "@testing-library/react";

jest.mock("../journalPageFormActions", () => ({
  createCancelJournalFormHandler: jest.fn(),
  createOpenJournalFormAction: jest.fn(),
  createOpenEditJournalFormAction: jest.fn(),
}));

import {
  createCancelJournalFormHandler,
  createOpenJournalFormAction,
  createOpenEditJournalFormAction,
} from "../journalPageFormActions";
import { useJournalPageFormActions } from "../useJournalPageFormActions";

describe("useJournalPageFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("journal form action を組み立てる", () => {
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const openEditForm = jest.fn();
    const params = {
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setShowForm: jest.fn(),
      setEditingEntry: jest.fn(),
    };

    (createCancelJournalFormHandler as jest.Mock).mockReturnValue(
      handleCancelForm,
    );
    (createOpenJournalFormAction as jest.Mock).mockReturnValue(openForm);
    (createOpenEditJournalFormAction as jest.Mock).mockReturnValue(
      openEditForm,
    );

    const { result } = renderHook(() => useJournalPageFormActions(params));

    expect(createCancelJournalFormHandler).toHaveBeenCalledWith({
      setTitleInput: params.setTitleInput,
      setContentInput: params.setContentInput,
      setShowForm: params.setShowForm,
      setEditingEntry: params.setEditingEntry,
    });
    expect(createOpenJournalFormAction).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
    });
    expect(createOpenEditJournalFormAction).toHaveBeenCalledWith({
      setTitleInput: params.setTitleInput,
      setContentInput: params.setContentInput,
      setShowForm: params.setShowForm,
      setEditingEntry: params.setEditingEntry,
    });
    expect(result.current).toEqual({
      handleCancelForm,
      openForm,
      openEditForm,
    });
  });
});
