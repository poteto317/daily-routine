import { applyHeaderSyncFeedback } from "@/hooks/headerSyncFeedback";

describe("applyHeaderSyncFeedback", () => {
  it("uploaded は alert のみ表示する", () => {
    const showAlert = jest.fn();
    const reload = jest.fn();

    applyHeaderSyncFeedback({
      result: "uploaded",
      showAlert,
      reload,
    });

    expect(showAlert).toHaveBeenCalledWith(
      "現在のローカルデータをクラウドへアップロードしました。",
    );
    expect(reload).not.toHaveBeenCalled();
  });

  it("downloaded は alert 後に reload する", () => {
    const showAlert = jest.fn();
    const reload = jest.fn();

    applyHeaderSyncFeedback({
      result: "downloaded",
      showAlert,
      reload,
    });

    expect(showAlert).toHaveBeenCalledWith(
      "最後にアップロードされたクラウドデータをダウンロードして反映します。",
    );
    expect(reload).toHaveBeenCalled();
  });

  it("skipped は何もしない", () => {
    const showAlert = jest.fn();
    const reload = jest.fn();

    applyHeaderSyncFeedback({
      result: "skipped",
      showAlert,
      reload,
    });

    expect(showAlert).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});
