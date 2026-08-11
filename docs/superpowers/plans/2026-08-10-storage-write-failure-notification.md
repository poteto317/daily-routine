# localStorage 書き込み失敗の通知 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** localStorage への書き込みが失敗したとき、無言で握り潰さずユーザーに通知する。

**Architecture:** `storageIO.ts` の各 catch から `window` の CustomEvent を発火し、アプリ全体で 1 つのバナーがそれを受ける。既存の `LOCAL_DATA_UPDATED_AT_EVENT` と同じ伝播パターンを使うため、`setStorageItem` 系の呼び出し 46 箇所には一切手を入れない。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library / Storybook

## 背景

`src/lib/storage/core-modules/storageIO.ts` の書き込み系 5 関数はすべて失敗を握り潰している。

```ts
} catch {
  // Silently fail
}
```

このアプリは localStorage が実質のデータベース。書き込みが失敗しても UI 上は成功したように見え、リロードすると入力が消える。ユーザーには原因不明のデータ消失に映る。

`QuotaExceededError` の検知もユーザーへの通知も現状コード上に 1 件も存在しない（grep で確認済み）。テストマトリクス機能の初期データだけで 484KB あり、ルーティン・Todo・家計簿・勤怠が積み上がる構造のため、上限到達は現実的なシナリオ。

## 設計判断

**伝播方式: window イベント + グローバルバナー**

`setStorageItem` を `boolean` 返却にして呼び出し側で個別ハンドリングする案もあるが、46 箇所すべてに手が入り差分が巨大化する。イベント方式なら storage 層の中で完結し、既存の `LOCAL_DATA_UPDATED_AT_EVENT` と同じ慣習にも沿う。個々の操作との対応付けができない点は許容する。

**バナーの挙動: 閉じられるが、再発すると再表示**

閉じた直後に次の書き込みが失敗すればまた出る。容量超過が解消されていない間は書き込みのたびに再表示されることになるが、それは「問題が続いている」という事実の反映であり、意図した挙動とする。

**読み取りの失敗は対象外**

`getStorageItem` 系の catch はデフォルト値へフォールバックする正常な設計であり、データ消失ではない。今回は変更しない。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- `main` へ直接コミットしない。作業ブランチは `feature/storage-write-failure-notification`。
- ユーザー向け文言は `locales/ja.json` に置き、コンポーネントに直書きしない。
- 既存の 46 箇所の `setStorageItem` / `setUnscopedStorageItem` / `removeStorageItem` / `removeUnscopedStorageItem` 呼び出しは変更しない。
- 書き込み系 5 関数のシグネチャ（戻り値 `void`）は変更しない。
- テストは RED を確認してから実装する。

## ファイル構成

| ファイル                                                       | 責務                                        |
| -------------------------------------------------------------- | ------------------------------------------- |
| `src/lib/storage/core-modules/storageWriteFailure.ts`（新規）  | イベント名・detail 型・上限超過の判定・発火 |
| `src/lib/storage/core-modules/storageIO.ts`（変更）            | 書き込み系 5 関数の catch から発火を呼ぶ    |
| `src/lib/storage/core.ts`（変更）                              | 新モジュールの re-export                    |
| `src/hooks/useStorageWriteFailure.ts`（新規）                  | イベントの購読と開閉状態                    |
| `src/components/StorageWriteFailureBanner.tsx`（新規）         | 表示のみ（状態を持たない）                  |
| `src/components/StorageWriteFailureBanner.stories.tsx`（新規） | Storybook                                   |
| `src/components/locales/ja.json`（変更）                       | 文言                                        |
| `src/components/index.ts`（変更）                              | export                                      |
| `src/components/ClientProviders.tsx`（変更）                   | フックとバナーの結線                        |
| `docs/03-testing/test-matrix.md`（変更）                       | 手動確認項目                                |

バナーを「表示のみ」と「結線」に分けるのは、Storybook で両方の理由（容量超過 / それ以外）を出し分けられるようにするため。

---

## Task 1: 失敗イベントの土台

**Files:**

- Create: `src/lib/storage/core-modules/storageWriteFailure.ts`
- Test: `src/lib/storage/core-modules/__tests__/storageWriteFailure.test.ts`

**Interfaces:**

- Produces:
  - `STORAGE_WRITE_FAILED_EVENT: "storage-write-failed"`
  - `type StorageWriteFailureReason = "quota-exceeded" | "unknown"`
  - `type StorageWriteFailureDetail = { key: string; reason: StorageWriteFailureReason }`
  - `isQuotaExceededError(error: unknown): boolean`
  - `dispatchStorageWriteFailed(key: string, error: unknown): void`

- [ ] **Step 1: 失敗テストを書く**

`src/lib/storage/core-modules/__tests__/storageWriteFailure.test.ts`

```ts
import {
  STORAGE_WRITE_FAILED_EVENT,
  dispatchStorageWriteFailed,
  isQuotaExceededError,
  type StorageWriteFailureDetail,
} from "../storageWriteFailure";

/** 発火された detail を集めるリスナーを張る */
const listenFailures = () => {
  const details: StorageWriteFailureDetail[] = [];
  const handle = (event: Event) => {
    details.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
  };
  window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handle);
  return {
    details,
    cleanup: () =>
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handle),
  };
};

describe("isQuotaExceededError", () => {
  it("QuotaExceededError を上限超過と判定する（Chrome/Safari）", () => {
    expect(
      isQuotaExceededError(new DOMException("full", "QuotaExceededError")),
    ).toBe(true);
  });

  it("NS_ERROR_DOM_QUOTA_REACHED を上限超過と判定する（Firefox）", () => {
    expect(
      isQuotaExceededError(
        new DOMException("full", "NS_ERROR_DOM_QUOTA_REACHED"),
      ),
    ).toBe(true);
  });

  it("それ以外の DOMException は上限超過としない", () => {
    expect(
      isQuotaExceededError(new DOMException("denied", "SecurityError")),
    ).toBe(false);
  });

  it("DOMException 以外は上限超過としない", () => {
    expect(isQuotaExceededError(new Error("QuotaExceededError"))).toBe(false);
    expect(isQuotaExceededError(undefined)).toBe(false);
  });
});

describe("dispatchStorageWriteFailed", () => {
  it("キーと理由を載せてイベントを発火する", () => {
    const { details, cleanup } = listenFailures();

    dispatchStorageWriteFailed(
      "todo-lists",
      new DOMException("full", "QuotaExceededError"),
    );

    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("上限超過でないエラーは unknown として発火する", () => {
    const { details, cleanup } = listenFailures();

    dispatchStorageWriteFailed("routines", new Error("boom"));

    expect(details).toEqual([{ key: "routines", reason: "unknown" }]);
    cleanup();
  });

  it("リスナーの中から再度呼ばれても無限に連鎖しない", () => {
    // バナーの再描画をきっかけに別の書き込みが走って失敗すると、
    // 通知→書き込み→失敗→通知…と連鎖しうる。発火中の再入は無視する。
    const details: StorageWriteFailureDetail[] = [];
    const handle = (event: Event) => {
      details.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
      dispatchStorageWriteFailed("nested", new Error("boom"));
    };
    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handle);

    dispatchStorageWriteFailed("outer", new Error("boom"));

    expect(details).toHaveLength(1);
    expect(details[0].key).toBe("outer");
    window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handle);
  });

  it("再入を弾いたあとも次の発火は通常どおり行われる", () => {
    // 再入ガードのフラグが立ちっぱなしになると、以後の失敗が
    // 一切通知されなくなる
    const { details, cleanup } = listenFailures();

    dispatchStorageWriteFailed("first", new Error("boom"));
    dispatchStorageWriteFailed("second", new Error("boom"));

    expect(details.map((d) => d.key)).toEqual(["first", "second"]);
    cleanup();
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWriteFailure.test.ts
```

期待: `Cannot find module '../storageWriteFailure'` で失敗する。

- [ ] **Step 3: 実装する**

`src/lib/storage/core-modules/storageWriteFailure.ts`

```ts
export const STORAGE_WRITE_FAILED_EVENT = "storage-write-failed";

/** 書き込みが失敗した理由 */
export type StorageWriteFailureReason = "quota-exceeded" | "unknown";

export type StorageWriteFailureDetail = {
  /** 書き込もうとしたキー（ユーザースコープ適用前） */
  key: string;
  reason: StorageWriteFailureReason;
};

/**
 * 保存領域の上限超過かどうかを判定する。
 *
 * ブラウザによって例外の name が異なるため両方を見る。
 * Chrome / Safari は QuotaExceededError、Firefox は
 * NS_ERROR_DOM_QUOTA_REACHED を投げる。
 */
export const isQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) return false;

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
};

// 発火中フラグ。リスナーの中で再び書き込みが失敗したときの連鎖を止める。
let isDispatching = false;

/**
 * 書き込み失敗を window イベントで通知する。
 *
 * setStorageItem 系の呼び出しはアプリ全体で 46 箇所あり、戻り値で失敗を
 * 伝える形にすると全箇所に手が入る。既存の LOCAL_DATA_UPDATED_AT_EVENT と
 * 同じく CustomEvent で伝播させ、受け手を 1 つに集約する。
 *
 * リスナーの中から再び呼ばれた場合は無視する。通知をきっかけに再描画が走り、
 * その中の書き込みがまた失敗すると、通知→書き込み→失敗→通知…と
 * 止まらなくなるため。
 */
export const dispatchStorageWriteFailed = (
  key: string,
  error: unknown,
): void => {
  if (typeof window === "undefined") return;
  if (isDispatching) return;

  isDispatching = true;
  try {
    window.dispatchEvent(
      new CustomEvent<StorageWriteFailureDetail>(STORAGE_WRITE_FAILED_EVENT, {
        detail: {
          key,
          reason: isQuotaExceededError(error) ? "quota-exceeded" : "unknown",
        },
      }),
    );
  } finally {
    isDispatching = false;
  }
};
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWriteFailure.test.ts
```

期待: 8 件すべて pass。

- [ ] **Step 5: コミットせずに次のタスクへ**

自動コミットはしない。

---

## Task 2: storageIO の 5 関数を配線する

**Files:**

- Modify: `src/lib/storage/core-modules/storageIO.ts`
- Modify: `src/lib/storage/core.ts`
- Test: `src/lib/storage/core-modules/__tests__/storageIO.writeFailure.test.ts`（新規）

**Interfaces:**

- Consumes: Task 1 の `dispatchStorageWriteFailed` / `STORAGE_WRITE_FAILED_EVENT` / `StorageWriteFailureDetail`
- Produces: `src/lib/storage/core` から Task 1 の公開 API を re-export

対象の catch は 5 箇所（行番号は変更前のもの）。

| 関数                        | 行  |
| --------------------------- | --- |
| `setLocalDataUpdatedAt`     | 75  |
| `setStorageItem`            | 134 |
| `setUnscopedStorageItem`    | 159 |
| `removeStorageItem`         | 181 |
| `removeUnscopedStorageItem` | 202 |

読み取り系（`getLocalDataUpdatedAt` / `getStorageItem` / `getUnscopedStorageItem` / `getRawUnscopedStorageItem`）の catch は変更しない。

- [ ] **Step 1: 失敗テストを書く**

`src/lib/storage/core-modules/__tests__/storageIO.writeFailure.test.ts`

```ts
import {
  removeStorageItem,
  removeUnscopedStorageItem,
  setLocalDataUpdatedAt,
  setStorageItem,
  setUnscopedStorageItem,
} from "../storageIO";
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailureDetail,
} from "../storageWriteFailure";

/** 発火された detail を集めるリスナーを張る */
const listenFailures = () => {
  const details: StorageWriteFailureDetail[] = [];
  const handle = (event: Event) => {
    details.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
  };
  window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handle);
  return {
    details,
    cleanup: () =>
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handle),
  };
};

/** localStorage.setItem を必ず失敗させる */
const breakSetItem = (error: unknown) =>
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw error;
  });

/** localStorage.removeItem を必ず失敗させる */
const breakRemoveItem = (error: unknown) =>
  jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw error;
  });

describe("storageIO の書き込み失敗通知", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("setStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakSetItem(new DOMException("full", "QuotaExceededError"));

    setStorageItem("todo-lists", [{ id: "1" }]);

    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("setUnscopedStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakSetItem(new DOMException("full", "QuotaExceededError"));

    setUnscopedStorageItem("theme", "dark");

    expect(details).toEqual([{ key: "theme", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("removeStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakRemoveItem(new Error("boom"));

    removeStorageItem("todo-lists");

    expect(details).toEqual([{ key: "todo-lists", reason: "unknown" }]);
    cleanup();
  });

  it("removeUnscopedStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakRemoveItem(new Error("boom"));

    removeUnscopedStorageItem("theme");

    expect(details).toEqual([{ key: "theme", reason: "unknown" }]);
    cleanup();
  });

  it("setLocalDataUpdatedAt が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakSetItem(new DOMException("full", "QuotaExceededError"));

    setLocalDataUpdatedAt(1234567890);

    expect(details).toHaveLength(1);
    expect(details[0].reason).toBe("quota-exceeded");
    cleanup();
  });

  it("書き込みが成功したときは通知しない", () => {
    const { details, cleanup } = listenFailures();

    setStorageItem("todo-lists", [{ id: "1" }]);

    expect(details).toEqual([]);
    cleanup();
  });

  it("読み取りの失敗では通知しない（デフォルト値へのフォールバックは正常系）", () => {
    // 読み取りは既定値に落ちるだけでデータ消失ではないため、
    // バナーを出す対象にしない
    const { details, cleanup } = listenFailures();
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("boom");
    });

    const { getStorageItem } =
      jest.requireActual<typeof import("../storageIO")>("../storageIO");
    expect(getStorageItem("todo-lists", [])).toEqual([]);

    expect(details).toEqual([]);
    cleanup();
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageIO.writeFailure.test.ts
```

期待: 通知系の 5 件が「received `[]`」で失敗する（成功時と読み取り時の 2 件は最初から pass）。

- [ ] **Step 3: 実装する**

`src/lib/storage/core-modules/storageIO.ts` の先頭に import を追加する。

```ts
import { dispatchStorageWriteFailed } from "./storageWriteFailure";
```

5 箇所の catch を書き換える。`setLocalDataUpdatedAt` は次のようにする。

```ts
  } catch (error) {
    // 保存できていないことをユーザーに伝える。握り潰すとデータが
    // 消えたことに気づけない。
    dispatchStorageWriteFailed(LOCAL_DATA_UPDATED_AT_KEY, error);
  }
```

`setStorageItem` / `setUnscopedStorageItem` / `removeStorageItem` / `removeUnscopedStorageItem` はいずれも次の形にする。

```ts
  } catch (error) {
    dispatchStorageWriteFailed(key, error);
  }
```

`src/lib/storage/core.ts` に re-export を追加する。

```ts
export {
  STORAGE_WRITE_FAILED_EVENT,
  dispatchStorageWriteFailed,
  isQuotaExceededError,
} from "./core-modules/storageWriteFailure";
export type {
  StorageWriteFailureDetail,
  StorageWriteFailureReason,
} from "./core-modules/storageWriteFailure";
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/lib/storage
```

期待: 新規 7 件を含め、`src/lib/storage` 配下がすべて pass。

- [ ] **Step 5: 既存テストへの影響を確認**

```bash
npx jest
```

期待: 既存テストの失敗が 0 件。`setStorageItem` のシグネチャは変えていないため、呼び出し側への影響は無い想定。

---

## Task 3: 購読フック

**Files:**

- Create: `src/hooks/useStorageWriteFailure.ts`
- Test: `src/hooks/__tests__/useStorageWriteFailure.test.ts`

**Interfaces:**

- Consumes: `STORAGE_WRITE_FAILED_EVENT` / `StorageWriteFailureDetail`（`@/lib/storage/core` 経由）
- Produces: `useStorageWriteFailure(): { failure: StorageWriteFailureDetail | null; dismiss: () => void }`

- [ ] **Step 1: 失敗テストを書く**

`src/hooks/__tests__/useStorageWriteFailure.test.ts`

```ts
import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailureDetail,
} from "@/lib/storage/core";
import { useStorageWriteFailure } from "../useStorageWriteFailure";

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

describe("useStorageWriteFailure", () => {
  it("初期状態では失敗を保持していない", () => {
    const { result } = renderHook(() => useStorageWriteFailure());
    expect(result.current.failure).toBeNull();
  });

  it("イベントを受け取ると failure に反映する", () => {
    const { result } = renderHook(() => useStorageWriteFailure());

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(result.current.failure).toEqual({
      key: "todo-lists",
      reason: "quota-exceeded",
    });
  });

  it("dismiss で消える", () => {
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    act(() => result.current.dismiss());

    expect(result.current.failure).toBeNull();
  });

  it("dismiss したあとに再び失敗すると再表示される", () => {
    // 容量超過は解消されない限り書き込みのたびに起きる。
    // 一度閉じたきり二度と出ないと、消え続けるデータに気づけない。
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
    act(() => result.current.dismiss());

    emitFailure({ key: "routines", reason: "unknown" });

    expect(result.current.failure).toEqual({
      key: "routines",
      reason: "unknown",
    });
  });

  it("アンマウント後はリスナーを解除する", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useStorageWriteFailure());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      STORAGE_WRITE_FAILED_EVENT,
      expect.any(Function),
    );
    removeSpy.mockRestore();
  });

  it("StrictMode の二重マウントでも二重に反映しない", () => {
    // 開発時の StrictMode ではマウント→クリーンアップ→マウントが走る。
    // 解除漏れがあるとリスナーが二重に張られる。
    const { result } = renderHook(() => useStorageWriteFailure(), {
      wrapper: StrictMode,
    });

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(result.current.failure).toEqual({
      key: "todo-lists",
      reason: "quota-exceeded",
    });
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/hooks/__tests__/useStorageWriteFailure.test.ts
```

期待: `Cannot find module '../useStorageWriteFailure'` で失敗する。

- [ ] **Step 3: 実装する**

`src/hooks/useStorageWriteFailure.ts`

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailureDetail,
} from "@/lib/storage/core";

/**
 * localStorage への書き込み失敗を購読する。
 *
 * dismiss で閉じたあとも、次に書き込みが失敗すればまた failure が入る。
 * 容量超過は解消されない限り書き込みのたびに起きるため、一度閉じたきり
 * 二度と出ない作りにすると、消え続けるデータにユーザーが気づけない。
 */
export const useStorageWriteFailure = () => {
  const [failure, setFailure] = useState<StorageWriteFailureDetail | null>(
    null,
  );

  useEffect(() => {
    const handleFailure = (event: Event) => {
      setFailure((event as CustomEvent<StorageWriteFailureDetail>).detail);
    };

    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handleFailure);
    return () => {
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handleFailure);
    };
  }, []);

  const dismiss = useCallback(() => setFailure(null), []);

  return { failure, dismiss };
};
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/hooks/__tests__/useStorageWriteFailure.test.ts
```

期待: 6 件すべて pass。

---

## Task 4: バナーコンポーネント

**Files:**

- Create: `src/components/StorageWriteFailureBanner.tsx`
- Create: `src/components/StorageWriteFailureBanner.stories.tsx`
- Modify: `src/components/locales/ja.json`
- Modify: `src/components/index.ts`
- Test: `src/components/__tests__/StorageWriteFailureBanner.test.tsx`

**Interfaces:**

- Consumes: `StorageWriteFailureReason`（`@/lib/storage/core` 経由）
- Produces: `StorageWriteFailureBanner({ reason, onDismiss }: { reason: StorageWriteFailureReason; onDismiss: () => void })`

状態は持たない。表示するかどうかは呼び出し側（Task 5）が決める。

- [ ] **Step 1: 文言を追加する**

`src/components/locales/ja.json` の `rootErrorBoundary` の次に追加する。

```json
  "storageWriteFailure": {
    "quotaExceeded": "保存できる容量の上限に達したため、データを保存できませんでした。設定画面から不要なデータを削除してください。",
    "unknown": "データの保存に失敗しました。ブラウザの設定で保存が制限されている可能性があります。",
    "dismissLabel": "閉じる"
  }
```

- [ ] **Step 2: 失敗テストを書く**

`src/components/__tests__/StorageWriteFailureBanner.test.tsx`

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { StorageWriteFailureBanner } from "../StorageWriteFailureBanner";

const defaultProps = {
  reason: "quota-exceeded" as const,
  onDismiss: jest.fn(),
};

describe("StorageWriteFailureBanner", () => {
  beforeEach(() => {
    defaultProps.onDismiss.mockClear();
  });

  it("容量超過のときは対処方法まで含めて伝える", () => {
    render(<StorageWriteFailureBanner {...defaultProps} />);

    expect(
      screen.getByText(/保存できる容量の上限に達したため/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/設定画面から不要なデータを削除してください/),
    ).toBeInTheDocument();
  });

  it("原因が不明なときは別の文言を出す", () => {
    render(<StorageWriteFailureBanner {...defaultProps} reason="unknown" />);

    expect(screen.getByText(/データの保存に失敗しました/)).toBeInTheDocument();
  });

  it("スクリーンリーダーに読み上げさせるため role=alert を持つ", () => {
    // データが消えている状況なので、視覚以外の経路でも伝わる必要がある
    render(<StorageWriteFailureBanner {...defaultProps} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("閉じるボタンで onDismiss が呼ばれる", () => {
    render(<StorageWriteFailureBanner {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: RED を確認**

```bash
npx jest src/components/__tests__/StorageWriteFailureBanner.test.tsx
```

期待: `Cannot find module '../StorageWriteFailureBanner'` で失敗する。

- [ ] **Step 4: 実装する**

`src/components/StorageWriteFailureBanner.tsx`

```tsx
"use client";

import type { StorageWriteFailureReason } from "@/lib/storage/core";
import texts from "./locales/ja.json";

type StorageWriteFailureBannerProps = {
  reason: StorageWriteFailureReason;
  onDismiss: () => void;
};

/**
 * localStorage への書き込みが失敗したことを知らせるバナー。
 *
 * 表示するかどうかは呼び出し側が決める。ここは表示だけを担う。
 */
export const StorageWriteFailureBanner = ({
  reason,
  onDismiss,
}: StorageWriteFailureBannerProps) => {
  const message =
    reason === "quota-exceeded"
      ? texts.storageWriteFailure.quotaExceeded
      : texts.storageWriteFailure.unknown;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-50 bg-red-50 dark:bg-red-100 border-b border-red-200 dark:border-red-300 px-4 py-3"
    >
      <div className="flex items-start gap-3 max-w-3xl mx-auto">
        <span className="text-xl shrink-0" aria-hidden="true">
          ⚠️
        </span>
        <p className="flex-1 text-sm text-red-800 dark:text-red-900">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-red-600 dark:text-red-700 font-medium hover:text-red-800 dark:hover:text-red-900 underline shrink-0"
        >
          {texts.storageWriteFailure.dismissLabel}
        </button>
      </div>
    </div>
  );
};
```

`src/components/index.ts` に追加する。

```ts
export { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";
```

- [ ] **Step 5: GREEN を確認**

```bash
npx jest src/components/__tests__/StorageWriteFailureBanner.test.tsx
```

期待: 4 件すべて pass。

- [ ] **Step 6: Storybook を追加する**

`src/components/StorageWriteFailureBanner.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";

const meta = {
  title: "Components/StorageWriteFailureBanner",
  component: StorageWriteFailureBanner,
  args: {
    onDismiss: () => {},
  },
} satisfies Meta<typeof StorageWriteFailureBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 保存容量の上限に達した場合。対処方法まで案内する */
export const QuotaExceeded: Story = {
  args: { reason: "quota-exceeded" },
};

/** 原因が特定できない場合 */
export const Unknown: Story = {
  args: { reason: "unknown" },
};
```

既存の `.stories.tsx` と import 元・記法が揃っているかを確認してから書くこと（`src/components/ErrorAlert.stories.tsx` を参照）。

---

## Task 5: グローバル配置

**Files:**

- Modify: `src/components/ClientProviders.tsx`
- Test: `src/components/__tests__/ClientProviders.test.tsx`（新規）

**Interfaces:**

- Consumes: Task 3 の `useStorageWriteFailure`、Task 4 の `StorageWriteFailureBanner`

`ClientProviders` は `src/app/layout.tsx` で `RootErrorBoundary` の内側・`AuthProvider` の外側に置かれている。ログイン前を含む全画面でバナーが出る。

- [ ] **Step 1: 失敗テストを書く**

`src/components/__tests__/ClientProviders.test.tsx`

```tsx
import { act, render, screen } from "@testing-library/react";
import {
  STORAGE_WRITE_FAILED_EVENT,
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

describe("ClientProviders", () => {
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
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/components/__tests__/ClientProviders.test.tsx
```

期待: 3 件目・4 件目が「role=alert が見つからない」で失敗する（1 件目・2 件目は最初から pass）。

- [ ] **Step 3: 実装する**

`src/components/ClientProviders.tsx`

```tsx
"use client";

import type { ReactNode } from "react";
import { usePWAInstaller } from "@/hooks/usePWAInstaller";
import { useStorageWriteFailure } from "@/hooks/useStorageWriteFailure";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";

type ClientProvidersProps = {
  children: ReactNode;
};

export const ClientProviders = ({ children }: ClientProvidersProps) => {
  useThemeEffect();
  usePWAInstaller();
  // 保存失敗はどの画面でも起きうるため、アプリ全体で 1 つのバナーが受ける
  const { failure, dismiss } = useStorageWriteFailure();

  return (
    <>
      {failure && (
        <StorageWriteFailureBanner
          reason={failure.reason}
          onDismiss={dismiss}
        />
      )}
      {children}
    </>
  );
};
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/components/__tests__/ClientProviders.test.tsx
```

期待: 4 件すべて pass。

---

## Task 6: 全体検証とドキュメント

**Files:**

- Modify: `docs/03-testing/test-matrix.md`

- [ ] **Step 1: 手動確認項目を追加する**

`docs/03-testing/test-matrix.md` の共通機能のセクションに次の行を足す。番号は既存の最大値の次を使うこと。

```
| 共通-N | 保存に失敗したときに警告バナーが出る | 🔶   | ⬜  | ⬜  | DevTools で localStorage を上限まで埋めてから任意のデータを保存し、バナーと文言を確認。閉じたあと再び保存すると再表示されること |
```

- [ ] **Step 2: 全体を検証する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npx prettier --check <変更したファイル>
```

期待: すべてクリーン。ユニットテストは既存 3971 件 + 新規 21 件。

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

テストが実装の欠落を本当に捉えているかを確かめる。以下をそれぞれ一時的に適用し、対応するテストが落ちることを確認したうえで元に戻す。

| 壊し方                                                   | 落ちるべきテスト                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `storageIO.ts` の `setStorageItem` の catch を空に戻す   | `storageIO.writeFailure.test.ts` の「setStorageItem が失敗したら通知する」 |
| `useStorageWriteFailure` の `removeEventListener` を消す | `useStorageWriteFailure.test.ts` の「アンマウント後はリスナーを解除する」  |
| `ClientProviders` からバナーの描画を消す                 | `ClientProviders.test.tsx` の「書き込み失敗を受け取るとバナーを出す」      |
| `isQuotaExceededError` を常に `false` にする             | `storageWriteFailure.test.ts` の上限超過判定 2 件                          |

- [ ] **Step 4: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動が変わる箇所

- localStorage への書き込み・削除が失敗すると、画面上部に警告バナーが出る
- 保存が成功している限り、見た目・挙動は一切変わらない

### 変わらない箇所

- `setStorageItem` 系の戻り値は `void` のまま。呼び出し 46 箇所は無変更
- 読み取り系の catch は無変更（デフォルト値へのフォールバックは正常系）
- 同期・認証・ルーティングには触れない

### リスク

- **バナーが繰り返し出る**: 容量超過が解消されない間は、書き込みのたびに再表示される。閉じても消えないように見える可能性があるが、問題が続いていることの反映として意図した挙動とする。解消の導線（不要データの削除）は文言で案内する。
- **通知の連鎖**: バナーの再描画をきっかけに別の書き込みが失敗すると連鎖しうるため、`dispatchStorageWriteFailed` に再入ガードを入れる（Task 1 でテスト済み）。
- **どの操作が失敗したかは分からない**: イベント方式の割り切り。キーは detail に載せているので、将来必要になれば表示に使える。

### 今回のスコープ外

- 容量の使用状況の可視化、古いデータの自動削除
- オフライン検知（別途プランを立てる）
