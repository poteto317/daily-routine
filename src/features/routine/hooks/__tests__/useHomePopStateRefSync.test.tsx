import { renderHook } from "@testing-library/react";

jest.mock("../homePopStateActions", () => ({
  syncHomePopStateRefs: jest.fn(),
}));

import { syncHomePopStateRefs } from "../homePopStateActions";
import { useHomePopStateRefSync } from "../useHomePopStateRefSync";

describe("useHomePopStateRefSync", () => {
  it("依存値の変更ごとに ref sync action を委譲する", () => {
    const refs = {
      showFormRef: { current: false },
      closeFormActionRef: { current: jest.fn() },
      setCurrentPageActionRef: { current: jest.fn() },
    };
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    const { rerender } = renderHook(
      ({ showForm, nextCloseFormAction, nextSetCurrentPageAction }) =>
        useHomePopStateRefSync({
          showForm,
          closeFormAction: nextCloseFormAction,
          setCurrentPageAction: nextSetCurrentPageAction,
          refs,
        }),
      {
        initialProps: {
          showForm: false,
          nextCloseFormAction: closeFormAction,
          nextSetCurrentPageAction: setCurrentPageAction,
        },
      },
    );

    expect(syncHomePopStateRefs).toHaveBeenCalledWith({
      showForm: false,
      closeFormAction,
      setCurrentPageAction,
      refs,
    });

    const updatedCloseFormAction = jest.fn();
    const updatedSetCurrentPageAction = jest.fn();

    rerender({
      showForm: true,
      nextCloseFormAction: updatedCloseFormAction,
      nextSetCurrentPageAction: updatedSetCurrentPageAction,
    });

    expect(syncHomePopStateRefs).toHaveBeenLastCalledWith({
      showForm: true,
      closeFormAction: updatedCloseFormAction,
      setCurrentPageAction: updatedSetCurrentPageAction,
      refs,
    });
  });
});
