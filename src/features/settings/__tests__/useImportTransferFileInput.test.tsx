import { act, renderHook } from "@testing-library/react";
import { useImportTransferFileInput } from "../state/useImportTransferFileInput";

describe("useImportTransferFileInput", () => {
  it("import クリックで file input を開く", () => {
    const { result } = renderHook(() => useImportTransferFileInput());
    const click = jest.fn();

    result.current.fileInputRef.current = {
      click,
    } as unknown as HTMLInputElement;

    act(() => {
      result.current.handleImportClick();
    });

    expect(click).toHaveBeenCalled();
  });
});
