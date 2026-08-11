import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import {
  STORAGE_WRITE_FAILED_EVENT,
  setStorageItem,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "@/lib/storage/core";
import { ClientProviders } from "../ClientProviders";

jest.mock("@/hooks/useThemeEffect", () => ({
  useThemeEffect: jest.fn(),
}));
jest.mock("@/hooks/usePWAInstaller", () => ({
  usePWAInstaller: jest.fn(),
}));

/** 書き込み失敗イベントを発火する */
const emitFailure = (detail: StorageWriteFailureDetail) => {
  act(() => {
    window.dispatchEvent(
      new CustomEvent<StorageWriteFailureDetail>(STORAGE_WRITE_FAILED_EVENT, {
        detail,
      }),
    );
  });
};

/** マウント時に localStorage へ書き込む子要素 */
const ChildWritingOnMount = () => {
  useEffect(() => {
    setStorageItem("todo-lists", [{ id: "1" }]);
  }, []);
  return <p>本文</p>;
};

describe("ClientProviders", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    replayLastStorageWriteFailure();
  });

  it("子のマウント処理で保存に失敗してもバナーを出す", () => {
    // React は子の effect を親より先に実行するため、この時点では
    // ClientProviders のリスナーはまだ張られていない。
    // 起動直後の書き込み（移行処理や既定値の書き込み）はこの経路を通る。
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    render(
      <ClientProviders>
        <ChildWritingOnMount />
      </ClientProviders>,
    );

    expect(
      screen.getByText(/保存できる容量の上限に達したため/),
    ).toBeInTheDocument();
  });

  it("子要素を描画する", () => {
    render(
      <ClientProviders>
        <p>本文</p>
      </ClientProviders>,
    );
    expect(screen.getByText("本文")).toBeInTheDocument();
  });

  it("書き込み失敗が起きるまでバナーを出さない", () => {
    render(
      <ClientProviders>
        <p>本文</p>
      </ClientProviders>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("書き込み失敗を受け取るとバナーを出す", () => {
    render(
      <ClientProviders>
        <p>本文</p>
      </ClientProviders>,
    );

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/保存できる容量の上限に達したため/),
    ).toBeInTheDocument();
  });

  it("バナーを出しても子要素は描画したままにする", () => {
    // 保存に失敗しても操作自体は続けられる必要がある
    render(
      <ClientProviders>
        <p>本文</p>
      </ClientProviders>,
    );

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(screen.getByText("本文")).toBeInTheDocument();
  });
});
