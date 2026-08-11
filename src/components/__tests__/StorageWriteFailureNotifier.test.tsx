import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  STORAGE_WRITE_FAILED_EVENT,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "@/lib/storage/core";
import { StorageWriteFailureNotifier } from "../StorageWriteFailureNotifier";

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

describe("StorageWriteFailureNotifier", () => {
  afterEach(() => {
    // 取りこぼし用のバッファがテスト間で持ち越されないようにする
    replayLastStorageWriteFailure();
  });

  it("失敗が起きるまで何も描画しない", () => {
    render(<StorageWriteFailureNotifier />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("失敗を受け取るとバナーを出す", () => {
    render(<StorageWriteFailureNotifier />);

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(
      screen.getByText(/保存できる容量の上限に達したため/),
    ).toBeInTheDocument();
  });

  it("理由に応じて文言を出し分ける", () => {
    render(<StorageWriteFailureNotifier />);

    emitFailure({ key: "routines", reason: "unknown" });

    expect(screen.getByText(/データの保存に失敗しました/)).toBeInTheDocument();
  });

  it("閉じるとバナーが消える", () => {
    render(<StorageWriteFailureNotifier />);
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("閉じたあとに再び失敗すると再表示される", () => {
    // 容量超過は解消されない限り書き込みのたびに起きる。
    // 一度閉じたきり二度と出ないと、消え続けるデータに気づけない。
    render(<StorageWriteFailureNotifier />);
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    emitFailure({ key: "routines", reason: "unknown" });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
