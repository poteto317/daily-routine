import { act, renderHook } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  DEFAULT_SETTINGS,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/features/settings/storage";
import { getUserScopedKey } from "@/lib/storage/core";
import type { AppSettings } from "@/types/routine";
import { useSwipeActionSetting } from "../state/useSwipeActionSetting";

// 設定の保存（saveSettings）・読み出し（getSettings）と localStorage は本物を使う。
// フックが「保存された値を読む」「保存の通知で読み直す」ことを、モックを挟まずに確かめるため。

type SwipeAction = AppSettings["swipeAction"];

/** 保存された設定を、イベントを出さずに直接書く */
const writeStoredSettings = (swipeAction: SwipeAction) => {
  localStorage.setItem(
    getUserScopedKey("app-settings"),
    JSON.stringify({ ...DEFAULT_SETTINGS, swipeAction }),
  );
};

/** フックの戻り値をそのまま文字にして描画する（サーバーでの描画とハイドレーションの確認用） */
const SwipeActionProbe = () => <span>{useSwipeActionSetting()}</span>;

/** 別のタブが設定を書いたときと同じ形: localStorage を直接書き、storage イベントを出す */
const writeSettingsFromAnotherTab = (swipeAction: SwipeAction) => {
  writeStoredSettings(swipeAction);
  act(() => {
    // jsdom は同じウィンドウへ storage イベントを出さないので、手で出す
    window.dispatchEvent(new StorageEvent("storage"));
  });
};

describe("useSwipeActionSetting", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("保存された設定が無いときは、既定値（delete）を返す", () => {
    const { result } = renderHook(() => useSwipeActionSetting());

    expect(result.current).toBe("delete");
  });

  it("保存された設定があるときは、その値を返す", () => {
    writeStoredSettings("edit");

    const { result } = renderHook(() => useSwipeActionSetting());

    expect(result.current).toBe("edit");
  });

  it("同じタブで saveSettings() が呼ばれると、新しい値を返す", () => {
    const { result } = renderHook(() => useSwipeActionSetting());
    expect(result.current).toBe("delete");

    act(() => {
      saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
    });

    expect(result.current).toBe("edit");
  });

  it("別のタブが設定を書いて storage イベントが来ると、新しい値を返す", () => {
    const { result } = renderHook(() => useSwipeActionSetting());
    expect(result.current).toBe("delete");

    writeSettingsFromAnotherTab("edit");

    expect(result.current).toBe("edit");
  });

  it("アンマウントで、購読した 2 つのイベントのリスナーを両方とも外す", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useSwipeActionSetting());

    const subscribed = addSpy.mock.calls.filter(
      ([type]) => type === SETTINGS_UPDATED_EVENT || type === "storage",
    );
    // 期待値は定数を参照せず、イベント名をそのまま書く
    expect(subscribed.map(([type]) => type).sort()).toEqual([
      "settings-updated",
      "storage",
    ]);

    unmount();

    for (const [type, listener] of subscribed) {
      expect(removeSpy).toHaveBeenCalledWith(type, listener);
    }
  });

  it("StrictMode（購読 → 解除 → 購読）でも、設定の変更に追従する", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StrictMode>{children}</StrictMode>
    );
    const { result } = renderHook(() => useSwipeActionSetting(), { wrapper });
    expect(result.current).toBe("delete");

    act(() => {
      saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
    });
    expect(result.current).toBe("edit");

    writeSettingsFromAnotherTab("delete");
    expect(result.current).toBe("delete");
  });

  it.each([
    ["オブジェクト", { a: 1 }],
    ["配列", ["edit"]],
    ["null", null],
    ["知らない文字列", "unknown-action"],
    // 受け付ける値の一覧（オブジェクト）を in で調べる実装だと、プロトタイプにある名前を通してしまう
    ["プロトタイプにある名前", "constructor"],
  ])(
    "保存された swipeAction が壊れている（%s）ときも、描画が止まらず edit を返す",
    (_label, brokenValue) => {
      // オブジェクトや配列をそのままスナップショットにすると、読むたびに参照が変わり、
      // useSyncExternalStore が再描画を繰り返して「Maximum update depth exceeded」になる。
      // 受け付ける値（delete・edit）でないときは、edit として扱う
      // （スワイプの実行の createSwipeHandler が、delete 以外を編集として扱うのに合わせている）
      localStorage.setItem(
        getUserScopedKey("app-settings"),
        JSON.stringify({ ...DEFAULT_SETTINGS, swipeAction: brokenValue }),
      );

      const { result } = renderHook(() => useSwipeActionSetting());

      expect(result.current).toBe("edit");
    },
  );

  it("サーバーでの描画では、保存された値ではなく既定値（delete）を返す", () => {
    writeStoredSettings("edit");

    const html = renderToString(<SwipeActionProbe />);

    expect(html).toBe("<span>delete</span>");
  });

  it("ハイドレーションでは、不一致を起こさずに既定値で始め、その後に保存された値へ追従する", async () => {
    // サーバーは localStorage を持たないので、保存する前に HTML を作る（本番と同じ順序）。
    // 先に保存すると、サーバー側のスナップショットが保存された値を読む実装でも、
    // HTML とクライアントの最初の描画が同じ値になり、不一致を検出できない
    const container = document.createElement("div");
    container.innerHTML = renderToString(<SwipeActionProbe />);
    expect(container.textContent).toBe("delete");
    writeStoredSettings("edit");
    const onRecoverableError = jest.fn();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const root = await act(async () =>
      hydrateRoot(container, <SwipeActionProbe />, { onRecoverableError }),
    );

    expect(container.textContent).toBe("edit");
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    act(() => root.unmount());
  });
});
