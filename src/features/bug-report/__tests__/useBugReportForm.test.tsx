import { act, renderHook } from "@testing-library/react";
import { useBugReportForm } from "../hooks/useBugReportForm";
import texts from "../locales/ja.json";

describe("useBugReportForm", () => {
  it("バリデーションエラー時は送信せずエラーを表示する", async () => {
    const submit = jest.fn().mockResolvedValue("id");
    const { result } = renderHook(() => useBugReportForm({ submit }));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(
      texts.validation.descriptionRequired,
    );
  });

  it("送信成功時は status:success にし入力をクリアする", async () => {
    const submit = jest.fn().mockResolvedValue("report-1");
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setTitle("件名");
      result.current.setDescription("不具合の内容");
      result.current.setStepsToReproduce("手順");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).toHaveBeenCalledWith({
      title: "件名",
      description: "不具合の内容",
      stepsToReproduce: "手順",
    });
    expect(result.current.status).toBe("success");
    expect(result.current.title).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.stepsToReproduce).toBe("");
  });

  it("送信失敗時は status:error にしエラーメッセージを表示する", async () => {
    const submit = jest.fn().mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("不具合の内容");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(texts.status.submitError);
    // 入力は保持される
    expect(result.current.description).toBe("不具合の内容");
  });

  it("送信中は status が submitting になる", async () => {
    let resolveSubmit!: (id: string) => void;
    const submit = jest.fn(
      () => new Promise<string>((resolve) => { resolveSubmit = resolve; }),
    );
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("不具合の内容");
    });

    act(() => {
      void result.current.handleSubmit();
    });

    expect(result.current.status).toBe("submitting");

    await act(async () => {
      resolveSubmit("id");
    });
    expect(result.current.status).toBe("success");
  });

  it("タイトルが101文字以上ならバリデーションエラーになる", async () => {
    const submit = jest.fn();
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setTitle("あ".repeat(101));
      result.current.setDescription("本文");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(texts.validation.titleTooLong);
  });

  it("説明が2001文字以上ならバリデーションエラーになる", async () => {
    const submit = jest.fn();
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("あ".repeat(2001));
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(texts.validation.descriptionTooLong);
  });

  it("再現手順が2001文字以上ならバリデーションエラーになる", async () => {
    const submit = jest.fn();
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("本文");
      result.current.setStepsToReproduce("あ".repeat(2001));
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(texts.validation.stepsTooLong);
  });

  it("成功後に入力なしで再送信するとバリデーションエラーになる", async () => {
    const submit = jest.fn().mockResolvedValue("id");
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => { result.current.setDescription("内容"); });
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.status).toBe("success");
    // 成功後フォームがクリアされるため、そのまま再送信するとバリデーションエラー
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(texts.validation.descriptionRequired);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("エラー後に再送信すると errorMessage がクリアされ成功する", async () => {
    const submit = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue("id");
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => { result.current.setDescription("内容"); });

    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).not.toBe("");

    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.status).toBe("success");
    expect(result.current.errorMessage).toBe("");
  });
});
