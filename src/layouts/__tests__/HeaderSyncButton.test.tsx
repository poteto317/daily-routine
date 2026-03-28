import { render, screen } from "@testing-library/react";
import { HeaderSyncButton } from "../HeaderSyncButton";

describe("HeaderSyncButton", () => {
  it("ローカルに新しい更新があるときアップロードボタンを強調表示する", () => {
    const { container } = render(
      <HeaderSyncButton
        mode="upload"
        syncStatus={{
          isSyncing: false,
          lastSyncTime: null,
          localLastModified: Date.parse("2026-03-12T10:00:00.000Z"),
          remoteLastModified: Date.parse("2026-03-12T09:00:00.000Z"),
          hasRemoteChanges: false,
          hasLocalChanges: true,
          error: null,
        }}
        onSyncAction={() => undefined}
      />,
    );

    const button = screen.getByLabelText("クラウドへアップロード");

    expect(button.getAttribute("title")).toContain(
      "ローカルに新しい更新があります。アップロードできます。",
    );
    expect(container.querySelector(".bg-amber-500")).not.toBeNull();
  });

  it("クラウドに新しい更新があるときダウンロードボタンを強調表示する", () => {
    const { container } = render(
      <HeaderSyncButton
        mode="download"
        syncStatus={{
          isSyncing: false,
          lastSyncTime: null,
          localLastModified: Date.parse("2026-03-12T09:00:00.000Z"),
          remoteLastModified: Date.parse("2026-03-12T10:00:00.000Z"),
          hasRemoteChanges: true,
          hasLocalChanges: false,
          error: null,
        }}
        onSyncAction={() => undefined}
      />,
    );

    const button = screen.getByLabelText("クラウドからダウンロード");

    expect(button.getAttribute("title")).toContain(
      "クラウドに新しい更新があります。ダウンロードできます。",
    );
    expect(container.querySelector(".bg-amber-500")).not.toBeNull();
  });

  it("同期中はダウンロード必要フラグがあっても強調マークを表示しない", () => {
    const { container } = render(
      <HeaderSyncButton
        mode="download"
        syncStatus={{
          isSyncing: true,
          lastSyncTime: null,
          localLastModified: Date.parse("2026-03-12T09:00:00.000Z"),
          remoteLastModified: Date.parse("2026-03-12T10:00:00.000Z"),
          hasRemoteChanges: true,
          hasLocalChanges: false,
          error: null,
        }}
        onSyncAction={() => undefined}
      />,
    );

    expect(container.querySelector(".bg-amber-500")).toBeNull();
  });
});
