import { act, renderHook } from "@testing-library/react";
import { useBugReportForm } from "../hooks/useBugReportForm";
import texts from "../locales/ja.json";

const createFile = (name: string, type = "image/png"): File =>
  new File([new Uint8Array(8)], name, { type });

describe("useBugReportForm", () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => "blob:preview");
    URL.revokeObjectURL = jest.fn();
  });

  it("バリデーションエラー時は送信せずエラーを表示し、選択済みの画像も保持する", async () => {
    const submit = jest.fn().mockResolvedValue("id");
    const { result } = renderHook(() => useBugReportForm({ submit }));
    const file = createFile("1.png");

    act(() => {
      result.current.imageAttachments.addImages([file]);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(
      texts.validation.descriptionRequired,
    );
    expect(result.current.imageAttachments.images).toEqual([file]);
  });

  it("送信成功時は status:success にし入力をクリアする（画像なしでは空配列が第2引数に渡る）", async () => {
    const submit = jest.fn().mockResolvedValue("report-1");
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("不具合の内容");
      result.current.setStepsToReproduce("手順");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).toHaveBeenCalledWith(
      {
        description: "不具合の内容",
        stepsToReproduce: "手順",
      },
      [],
    );
    expect(result.current.status).toBe("success");
    expect(result.current.description).toBe("");
    expect(result.current.stepsToReproduce).toBe("");
  });

  it("画像を添付して送信すると第2引数に画像配列が渡り、成功後に画像がクリアされる", async () => {
    const submit = jest.fn().mockResolvedValue("report-img");
    const { result } = renderHook(() => useBugReportForm({ submit }));
    const f1 = createFile("1.png");
    const f2 = createFile("2.jpg", "image/jpeg");

    act(() => {
      result.current.setDescription("画像つき報告");
      result.current.imageAttachments.addImages([f1, f2]);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).toHaveBeenCalledWith(
      {
        description: "画像つき報告",
        stepsToReproduce: "",
      },
      [f1, f2],
    );
    expect(result.current.status).toBe("success");
    expect(result.current.imageAttachments.images).toEqual([]);
    expect(result.current.imageAttachments.previews).toEqual([]);
  });

  it("送信失敗時は status:error にしエラーメッセージを表示し、入力と画像選択を保持する", async () => {
    const submit = jest.fn().mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useBugReportForm({ submit }));
    const file = createFile("1.png");

    act(() => {
      result.current.setDescription("不具合の内容");
      result.current.imageAttachments.addImages([file]);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(texts.status.submitError);
    // 入力と画像は保持される
    expect(result.current.description).toBe("不具合の内容");
    expect(result.current.imageAttachments.images).toEqual([file]);
  });

  it("送信中は status が submitting になる", async () => {
    let resolveSubmit!: (id: string) => void;
    const submit = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveSubmit = resolve;
        }),
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

  it("送信処理中に再度 handleSubmit を呼び出しても重複して submit が実行されない", async () => {
    let resolveSubmit!: (id: string) => void;
    const submit = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("不具合の内容");
    });

    // 1 回目の送信開始
    act(() => {
      void result.current.handleSubmit();
    });
    expect(submit).toHaveBeenCalledTimes(1);

    // 送信完了前に 2 回目を呼び出す
    act(() => {
      void result.current.handleSubmit();
    });
    expect(submit).toHaveBeenCalledTimes(1);

    // 1 回目の完了を待つ
    await act(async () => {
      resolveSubmit("id");
    });
    expect(result.current.status).toBe("success");
    expect(submit).toHaveBeenCalledTimes(1);
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
    expect(result.current.errorMessage).toBe(
      texts.validation.descriptionTooLong,
    );
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

    act(() => {
      result.current.setDescription("内容");
    });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.status).toBe("success");
    // 成功後フォームがクリアされるため、そのまま再送信するとバリデーションエラー
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(
      texts.validation.descriptionRequired,
    );
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("エラー後に再送信すると errorMessage がクリアされ成功する", async () => {
    const submit = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue("id");
    const { result } = renderHook(() => useBugReportForm({ submit }));

    act(() => {
      result.current.setDescription("内容");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).not.toBe("");

    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.status).toBe("success");
    expect(result.current.errorMessage).toBe("");
  });
});
