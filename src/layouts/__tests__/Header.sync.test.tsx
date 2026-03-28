import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  cleanupHeaderTestDefaults,
  mockDownloadFromFirestore,
  mockUploadToFirestore,
  renderHeader,
  setupHeaderTestDefaults,
} from "./Header.test-setup";

describe("Header sync", () => {
  beforeEach(() => {
    setupHeaderTestDefaults();
  });

  afterEach(() => {
    cleanupHeaderTestDefaults();
  });

  it("アップロード押下でアップロードを実行する", () => {
    renderHeader();

    fireEvent.click(screen.getByLabelText("クラウドへアップロード"));

    expect(mockUploadToFirestore).toHaveBeenCalledTimes(1);
  });

  it("同期結果がuploadedのときアップロード完了メッセージを表示する", async () => {
    const alertSpy = jest.spyOn(window, "alert");

    renderHeader();
    fireEvent.click(screen.getByLabelText("クラウドへアップロード"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "現在のローカルデータをクラウドへアップロードしました。",
      );
    });
  });

  it("ダウンロード押下でクラウドから反映する", async () => {
    const alertSpy = jest.spyOn(window, "alert");

    renderHeader();
    fireEvent.click(screen.getByLabelText("クラウドからダウンロード"));

    await waitFor(() => {
      expect(mockDownloadFromFirestore).toHaveBeenCalledWith({ reload: false });
      expect(alertSpy).toHaveBeenCalledWith(
        "最後にアップロードされたクラウドデータをダウンロードして反映します。",
      );
    });
  });
});
