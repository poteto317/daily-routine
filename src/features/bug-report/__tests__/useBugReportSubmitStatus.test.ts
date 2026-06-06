import { act, renderHook } from "@testing-library/react";
import { useBugReportSubmitStatus } from "../hooks/useBugReportSubmitStatus";

describe("useBugReportSubmitStatus", () => {
  it("初期状態は idle と空文字", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    expect(result.current.status).toBe("idle");
    expect(result.current.errorMessage).toBe("");
  });

  it("setStatus で submitting に変更できる", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    act(() => {
      result.current.setStatus("submitting");
    });
    expect(result.current.status).toBe("submitting");
  });

  it("setStatus で success に変更できる", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    act(() => {
      result.current.setStatus("success");
    });
    expect(result.current.status).toBe("success");
  });

  it("setStatus で error に変更できる", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    act(() => {
      result.current.setStatus("error");
    });
    expect(result.current.status).toBe("error");
  });

  it("setErrorMessage でエラーメッセージを更新できる", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    act(() => {
      result.current.setErrorMessage("ネットワークエラー");
    });
    expect(result.current.errorMessage).toBe("ネットワークエラー");
  });

  it("setErrorMessage で空文字に戻せる（クリア）", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    act(() => {
      result.current.setErrorMessage("エラー");
    });
    act(() => {
      result.current.setErrorMessage("");
    });
    expect(result.current.errorMessage).toBe("");
  });

  it("status と errorMessage は独立して更新される", () => {
    const { result } = renderHook(() => useBugReportSubmitStatus());
    act(() => {
      result.current.setStatus("error");
      result.current.setErrorMessage("詳細なエラー");
    });
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("詳細なエラー");
  });
});
