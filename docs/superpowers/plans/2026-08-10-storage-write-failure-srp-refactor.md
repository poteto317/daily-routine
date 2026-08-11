# 書き込み失敗通知の単一責任リファクタリング 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `feature/storage-write-failure-notification` で追加・変更したコードを、1 ファイル 1 責務に整理する。

**Architecture:** 「エラーを理由に分類する」「失敗をイベントで伝える」「理由を文言にする」「バナーを出すか決める」「保存の失敗をどう扱うか」を、それぞれ独立した単位に切り出す。外から見た挙動は一切変えない。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library / Storybook

## 洗い出し

`main` からの変更ファイルを全件確認し、複数の責務を抱えている箇所を 5 件特定した。

| #   | 対象                                       | 抱えている責務                                                                                | 対応                       |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------- |
| 1   | `core-modules/storageWriteFailure.ts`      | ①エラーの分類（ブラウザ差の知識） ②イベントの伝播（再入ガード）                               | 2 ファイルに分割           |
| 2   | `components/StorageWriteFailureBanner.tsx` | ①理由→文言のマッピング ②描画                                                                  | ヘルパーに分離             |
| 3   | `components/ClientProviders.tsx`           | ①グローバル副作用の集約 ②失敗の購読 ③バナーの出し分け                                         | コンテナに分離             |
| 4   | `core-modules/storageIO.ts`                | 書き込み系 5 関数が「何を書くか」と「失敗をどう扱うか」の両方を持つ（同一 catch が 4 回重複） | 失敗の扱いを 1 箇所に      |
| 5   | `lib/storage/core.ts`                      | storage 層の外から使われない API を公開している                                               | re-export を絞る           |
| 6   | `hooks/useStorageWriteFailure.ts`          | 同じ失敗が続いても毎回状態を差し替え、再描画を起こす                                          | 同一内容なら状態を据え置く |

### 追加で判明した点（リファクタリング前に確認したもの）

**再入ガードは同期経路しか防いでいない。** `dispatchStorageWriteFailed` の JSDoc は「通知→書き込み→失敗→通知の連鎖を止める」と書いているが、実測すると防げているのはリスナーが同期的に再発火した場合だけだった。React の再描画はバッチされて `dispatchEvent` の呼び出しが終わったあとに走るため、再描画をきっかけにした書き込みの失敗はガードを素通りする。

```
発火キー: ["outer", "async-nested"]   ← queueMicrotask 経由の再発火は通っている
```

Task 1 でこのモジュールを書き直す際に、JSDoc の主張を実態に合わせる。連鎖そのものへの対策は Task 4（状態を `ClientProviders` から切り出して再描画の範囲を狭める）と Task 6（同一内容なら状態を据え置く）で行う。

### 対象外（変更していない既存の問題）

- `storageIO.ts` の `skipLocalDataUpdatedAt` 判定ブロックが 4 回重複している点。`main` 時点から存在し、今回の変更とは無関係。
- `storageIO.ts` 全体の責務分割（読み取り / 書き込み / バッチ / タイムスタンプ）。同上。
- `useStorageWriteFailure.ts`。購読と開閉状態だけを持っており、分割の必要はない。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは現在の `feature/storage-write-failure-notification` のまま。
- 外から見た挙動を変えない。既存テストは 1 件も書き換えずに通ること。
- 各タスクの終わりに `npx jest` 全件を通し、既存 4000 件が緑のままであることを確認する。
- ユーザー向け文言は `locales/ja.json` に置いたままにする。
- テストを追加する場合は RED を確認してから実装する。

## ファイル構成（変更後）

| ファイル                                             | 責務                                                 |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `core-modules/storageWriteFailureReason.ts`（新規）  | エラーを理由に分類する。ブラウザ差の知識はここだけ   |
| `core-modules/storageWriteFailureEvent.ts`（新規）   | 失敗を window イベントで伝える。再入ガードはここだけ |
| `core-modules/storageWriteFailure.ts`（削除）        | 上記 2 つへ分割                                      |
| `core-modules/storageWrite.ts`（新規）               | 書き込みの失敗をどう扱うかの方針を 1 箇所に持つ      |
| `core-modules/storageIO.ts`（変更）                  | 各関数は「何を書くか」だけを持つ                     |
| `lib/storage/core.ts`（変更）                        | 外部に必要な分だけ re-export する                    |
| `components/storageWriteFailureHelpers.ts`（新規）   | 理由から文言を決める                                 |
| `components/StorageWriteFailureBanner.tsx`（変更）   | 描画だけ                                             |
| `components/StorageWriteFailureNotifier.tsx`（新規） | 購読結果からバナーを出すか決める                     |
| `components/ClientProviders.tsx`（変更）             | グローバルな仕掛けを並べるだけ                       |

`components/` にヘルパーを置くのは `TrainDelayNotification.tsx` + `trainDelayHelpers.ts` の先例に合わせる。`core-modules/` に小さなモジュールを並べるのは `userScope.ts`（48 行）`storageValueGuard.ts`（53 行）`time.ts`（33 行）の粒度に合わせる。

---

## Task 1: エラー分類とイベント伝播を分ける

**Files:**

- Create: `src/lib/storage/core-modules/storageWriteFailureReason.ts`
- Create: `src/lib/storage/core-modules/storageWriteFailureEvent.ts`
- Delete: `src/lib/storage/core-modules/storageWriteFailure.ts`
- Create: `src/lib/storage/core-modules/__tests__/storageWriteFailureReason.test.ts`
- Create: `src/lib/storage/core-modules/__tests__/storageWriteFailureEvent.test.ts`
- Delete: `src/lib/storage/core-modules/__tests__/storageWriteFailure.test.ts`
- Modify: `src/lib/storage/core-modules/storageIO.ts`（import 元の差し替えのみ）
- Modify: `src/lib/storage/core-modules/__tests__/storageIO.writeFailure.test.ts`（import 元の差し替えのみ）
- Modify: `src/lib/storage/core.ts`

**Interfaces:**

- `storageWriteFailureReason.ts` が produces:
  - `type StorageWriteFailureReason = "quota-exceeded" | "unknown"`
  - `isQuotaExceededError(error: unknown): boolean`
  - `toStorageWriteFailureReason(error: unknown): StorageWriteFailureReason`
- `storageWriteFailureEvent.ts` が produces:
  - `STORAGE_WRITE_FAILED_EVENT: "storage-write-failed"`
  - `type StorageWriteFailureDetail = { key: string; reason: StorageWriteFailureReason }`
  - `dispatchStorageWriteFailed(key: string, error: unknown): void`

分割の理由は「変わる理由が別」だから。ブラウザが新しい例外名を投げるようになったら分類側だけが変わり、通知の届け方を変えたいときは伝播側だけが変わる。

- [ ] **Step 1: 分類側のテストを書く**

`src/lib/storage/core-modules/__tests__/storageWriteFailureReason.test.ts`

```ts
import {
  isQuotaExceededError,
  toStorageWriteFailureReason,
} from "../storageWriteFailureReason";

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
    // name だけを見て判定すると、同じ名前を持つ普通の Error を
    // 誤って上限超過と扱ってしまう
    expect(isQuotaExceededError(new Error("QuotaExceededError"))).toBe(false);
    expect(isQuotaExceededError(undefined)).toBe(false);
  });
});

describe("toStorageWriteFailureReason", () => {
  it("上限超過は quota-exceeded になる", () => {
    expect(
      toStorageWriteFailureReason(
        new DOMException("full", "QuotaExceededError"),
      ),
    ).toBe("quota-exceeded");
  });

  it("それ以外は unknown になる", () => {
    expect(toStorageWriteFailureReason(new Error("boom"))).toBe("unknown");
    expect(toStorageWriteFailureReason(undefined)).toBe("unknown");
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWriteFailureReason.test.ts
```

期待: `Cannot find module '../storageWriteFailureReason'` で失敗する。

- [ ] **Step 3: 分類側を実装する**

`src/lib/storage/core-modules/storageWriteFailureReason.ts`

```ts
/** 書き込みが失敗した理由 */
export type StorageWriteFailureReason = "quota-exceeded" | "unknown";

/**
 * 保存領域の上限超過かどうかを判定する。
 *
 * ブラウザによって例外の name が異なるため両方を見る。
 * Chrome / Safari は QuotaExceededError、Firefox は
 * NS_ERROR_DOM_QUOTA_REACHED を投げる。
 *
 * DOMException であることを先に確かめるのは、同じ名前を持つだけの
 * 普通の Error を上限超過と誤認しないため。
 */
export const isQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) return false;

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
};

/** 捕捉した例外を、ユーザーに伝える理由へ変換する */
export const toStorageWriteFailureReason = (
  error: unknown,
): StorageWriteFailureReason =>
  isQuotaExceededError(error) ? "quota-exceeded" : "unknown";
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWriteFailureReason.test.ts
```

期待: 6 件 pass。

- [ ] **Step 5: 伝播側のテストを書く**

`src/lib/storage/core-modules/__tests__/storageWriteFailureEvent.test.ts`

```ts
import {
  STORAGE_WRITE_FAILED_EVENT,
  dispatchStorageWriteFailed,
  type StorageWriteFailureDetail,
} from "../storageWriteFailureEvent";

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

  it("リスナーが例外を投げても再入ガードは解除される", () => {
    // finally で戻さないと、1 度リスナーが落ちただけで
    // 以後の失敗が永久に通知されなくなる
    const throwing = () => {
      throw new Error("listener failed");
    };
    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, throwing);
    expect(() =>
      dispatchStorageWriteFailed("first", new Error("boom")),
    ).toThrow();
    window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, throwing);

    const { details, cleanup } = listenFailures();
    dispatchStorageWriteFailed("second", new Error("boom"));

    expect(details.map((d) => d.key)).toEqual(["second"]);
    cleanup();
  });
});
```

最後の 1 件は分割前には無かった観点。再入ガードが独立したモジュールになることで、ガードの解除漏れという固有のリスクが見えやすくなる。

> 注意: jsdom の `dispatchEvent` はリスナーの例外を再スローするか握り潰すかが実装依存。RED/GREEN の前にこのテスト単体を実行し、`toThrow()` が現実と合っているかを確認すること。合わない場合は `expect(() => ...).not.toThrow()` に読み替えたうえで、後続の発火が届くことの確認は残す。

- [ ] **Step 6: RED を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWriteFailureEvent.test.ts
```

期待: `Cannot find module '../storageWriteFailureEvent'` で失敗する。

- [ ] **Step 7: 伝播側を実装する**

`src/lib/storage/core-modules/storageWriteFailureEvent.ts`

```ts
import {
  toStorageWriteFailureReason,
  type StorageWriteFailureReason,
} from "./storageWriteFailureReason";

export const STORAGE_WRITE_FAILED_EVENT = "storage-write-failed";

export type StorageWriteFailureDetail = {
  /** 書き込もうとしたキー（ユーザースコープ適用前） */
  key: string;
  reason: StorageWriteFailureReason;
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
 * 発火中に同期的に呼び直された場合は無視する。リスナーの中で別の書き込みを
 * 行い、それも失敗したときの直接の連鎖を止めるため。
 *
 * 防げるのは同期的な再入だけである点に注意。React の再描画はバッチされて
 * この関数を抜けたあとに走るため、再描画をきっかけにした書き込みの失敗は
 * ここでは止まらない。そちらは購読側で「同じ失敗なら状態を据え置く」ことで
 * 再描画のループを断つ。
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
        detail: { key, reason: toStorageWriteFailureReason(error) },
      }),
    );
  } finally {
    isDispatching = false;
  }
};
```

- [ ] **Step 8: 旧モジュールを消し、参照を差し替える**

```bash
rm src/lib/storage/core-modules/storageWriteFailure.ts
rm src/lib/storage/core-modules/__tests__/storageWriteFailure.test.ts
```

`storageIO.ts` の import を差し替える。

```ts
import { dispatchStorageWriteFailed } from "./storageWriteFailureEvent";
```

`__tests__/storageIO.writeFailure.test.ts` の import を差し替える。

```ts
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailureDetail,
} from "../storageWriteFailureEvent";
```

- [ ] **Step 9: `core.ts` の re-export を差し替える**

Task 5 で絞り込むため、ここでは動く形にするだけでよい。

```ts
export { STORAGE_WRITE_FAILED_EVENT } from "./core-modules/storageWriteFailureEvent";
export type { StorageWriteFailureDetail } from "./core-modules/storageWriteFailureEvent";
export type { StorageWriteFailureReason } from "./core-modules/storageWriteFailureReason";
```

- [ ] **Step 10: 全体を確認**

```bash
npx jest
npx tsc --noEmit
```

期待: すべて pass。旧テスト 8 件が新テスト 11 件に置き換わる。

---

## Task 2: 書き込みの失敗の扱いを 1 箇所に集める

**Files:**

- Create: `src/lib/storage/core-modules/storageWrite.ts`
- Create: `src/lib/storage/core-modules/__tests__/storageWrite.test.ts`
- Modify: `src/lib/storage/core-modules/storageIO.ts`

**Interfaces:**

- Consumes: Task 1 の `dispatchStorageWriteFailed`
- Produces: `runStorageWrite(key: string, write: () => void): void`

現状、書き込み系 5 関数がそれぞれ「`window` があるか確かめる」「try で囲む」「catch で通知に変換する」を持っている。同じ catch が 4 回、同じ `typeof window` ガードが 5 回並んでいる。方針を 1 箇所に集め、各関数は「何を書くか」だけを持つようにする。

- [ ] **Step 1: 失敗テストを書く**

`src/lib/storage/core-modules/__tests__/storageWrite.test.ts`

```ts
import { runStorageWrite } from "../storageWrite";
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailureDetail,
} from "../storageWriteFailureEvent";

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

describe("runStorageWrite", () => {
  it("渡した書き込みを実行する", () => {
    const write = jest.fn();

    runStorageWrite("todo-lists", write);

    expect(write).toHaveBeenCalledTimes(1);
  });

  it("成功したときは通知しない", () => {
    const { details, cleanup } = listenFailures();

    runStorageWrite("todo-lists", () => {});

    expect(details).toEqual([]);
    cleanup();
  });

  it("書き込みが投げた例外を通知に変換する", () => {
    const { details, cleanup } = listenFailures();

    runStorageWrite("todo-lists", () => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("例外を呼び出し元へ再スローしない", () => {
    // 保存に失敗しても操作自体は続けられる必要がある。
    // 例外が漏れると呼び出し側の処理が途中で止まる。
    expect(() =>
      runStorageWrite("todo-lists", () => {
        throw new Error("boom");
      }),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWrite.test.ts
```

期待: `Cannot find module '../storageWrite'` で失敗する。

- [ ] **Step 3: 実装する**

`src/lib/storage/core-modules/storageWrite.ts`

```ts
import { dispatchStorageWriteFailed } from "./storageWriteFailureEvent";

/**
 * localStorage への書き込みを実行し、失敗したら通知に変換する。
 *
 * 「保存に失敗しても例外は投げず、通知に変えてユーザーに伝える」という
 * 方針をここだけが持つ。呼び出し側は何を書くかだけを書けばよい。
 *
 * 例外を握り潰さず通知するのは、UI 上は成功したように見えたまま
 * データが消えるのを防ぐため。再スローしないのは、保存に失敗しても
 * 操作自体は続けられる必要があるため。
 */
export const runStorageWrite = (key: string, write: () => void): void => {
  if (typeof window === "undefined") return;

  try {
    write();
  } catch (error) {
    dispatchStorageWriteFailed(key, error);
  }
};
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/lib/storage/core-modules/__tests__/storageWrite.test.ts
```

期待: 4 件 pass。

- [ ] **Step 5: `storageIO.ts` の書き込み系 5 関数を置き換える**

import を追加する。

```ts
import { runStorageWrite } from "./storageWrite";
```

`dispatchStorageWriteFailed` の import は不要になるので消す。

5 関数を次の形にする。本体（何を書くか）は一切変えない。

```ts
export const setLocalDataUpdatedAt = (timestamp: number): void => {
  runStorageWrite(LOCAL_DATA_UPDATED_AT_KEY, () => {
    const scopedKey = getUserScopedKey(LOCAL_DATA_UPDATED_AT_KEY);
    localStorage.setItem(scopedKey, String(timestamp));
    window.dispatchEvent(
      new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT, {
        detail: { timestamp },
      }),
    );
  });
};

export const setStorageItem = <T>(
  key: string,
  value: T,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    const scopedKey = getResolvedStorageKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};

export const setUnscopedStorageItem = <T>(
  key: string,
  value: T,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.setItem(
      getResolvedStorageKey(key, false),
      JSON.stringify(value),
    );

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};

export const removeStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    const scopedKey = getResolvedStorageKey(key);
    localStorage.removeItem(scopedKey);

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};

export const removeUnscopedStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.removeItem(getResolvedStorageKey(key, false));

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};
```

`skipLocalDataUpdatedAt` の判定ブロックが 4 回重複している点は `main` 時点から存在する既存の問題であり、今回は触らない。

- [ ] **Step 6: 全体を確認**

```bash
npx jest
npx tsc --noEmit
```

期待: すべて pass。`storageIO.writeFailure.test.ts` の 7 件を含め、既存テストを 1 件も書き換えずに通ること。書き換えが必要になったら挙動が変わっている。

---

## Task 3: バナーから文言の決定を切り出す

**Files:**

- Create: `src/components/storageWriteFailureHelpers.ts`
- Create: `src/components/__tests__/storageWriteFailureHelpers.test.ts`
- Modify: `src/components/StorageWriteFailureBanner.tsx`

**Interfaces:**

- Consumes: `StorageWriteFailureReason`
- Produces: `getStorageWriteFailureMessage(reason: StorageWriteFailureReason): string`

`trainDelayHelpers.ts` と同じ形。理由が増えたときに触るのはヘルパーだけになる。

- [ ] **Step 1: 失敗テストを書く**

`src/components/__tests__/storageWriteFailureHelpers.test.ts`

```ts
import { getStorageWriteFailureMessage } from "../storageWriteFailureHelpers";

describe("getStorageWriteFailureMessage", () => {
  it("上限超過のときは対処方法まで含めた文言を返す", () => {
    const message = getStorageWriteFailureMessage("quota-exceeded");

    expect(message).toContain("保存できる容量の上限に達したため");
    expect(message).toContain(
      "不要な記録を削除してから、もう一度お試しください",
    );
  });

  it("原因が不明なときは別の文言を返す", () => {
    expect(getStorageWriteFailureMessage("unknown")).toContain(
      "データの保存に失敗しました",
    );
  });

  it("理由ごとに異なる文言を返す", () => {
    // 同じ文言を返してしまうと、出し分けの意味がなくなる
    expect(getStorageWriteFailureMessage("quota-exceeded")).not.toBe(
      getStorageWriteFailureMessage("unknown"),
    );
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/components/__tests__/storageWriteFailureHelpers.test.ts
```

期待: `Cannot find module '../storageWriteFailureHelpers'` で失敗する。

- [ ] **Step 3: 実装する**

`src/components/storageWriteFailureHelpers.ts`

```ts
import type { StorageWriteFailureReason } from "@/lib/storage/core";
import texts from "./locales/ja.json";

/**
 * 保存に失敗した理由から、ユーザーに見せる文言を決める。
 *
 * 上限超過はユーザー自身が解消できるため、対処方法まで案内する。
 */
export const getStorageWriteFailureMessage = (
  reason: StorageWriteFailureReason,
): string =>
  reason === "quota-exceeded"
    ? texts.storageWriteFailure.quotaExceeded
    : texts.storageWriteFailure.unknown;
```

- [ ] **Step 4: バナーから文言の決定を外す**

`src/components/StorageWriteFailureBanner.tsx` の `message` の算出を差し替える。

```tsx
import { getStorageWriteFailureMessage } from "./storageWriteFailureHelpers";
```

```tsx
const message = getStorageWriteFailureMessage(reason);
```

- [ ] **Step 5: GREEN を確認**

```bash
npx jest src/components
```

期待: ヘルパー 3 件が pass し、既存のバナーテスト 4 件も書き換えずに通ること。

---

## Task 4: バナーの出し分けを ClientProviders から切り出す

**Files:**

- Create: `src/components/StorageWriteFailureNotifier.tsx`
- Create: `src/components/__tests__/StorageWriteFailureNotifier.test.tsx`
- Modify: `src/components/ClientProviders.tsx`

**Interfaces:**

- Consumes: `useStorageWriteFailure`、`StorageWriteFailureBanner`
- Produces: `StorageWriteFailureNotifier()` — props なし

`ClientProviders` は「アプリ全体に効く仕掛けを並べる場所」。そこに購読とバナーの出し分けまで持たせると、仕掛けが増えるたびに膨らむ。出し分けを 1 コンポーネントに閉じる。

- [ ] **Step 1: 失敗テストを書く**

`src/components/__tests__/StorageWriteFailureNotifier.test.tsx`

```tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  STORAGE_WRITE_FAILED_EVENT,
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
```

「閉じる」と「再発で再表示」は、これまでフックのテストでしか確かめていなかった。結線後の実際の画面で確かめる観点を足す。

- [ ] **Step 2: RED を確認**

```bash
npx jest src/components/__tests__/StorageWriteFailureNotifier.test.tsx
```

期待: `Cannot find module '../StorageWriteFailureNotifier'` で失敗する。

- [ ] **Step 3: 実装する**

`src/components/StorageWriteFailureNotifier.tsx`

```tsx
"use client";

import { useStorageWriteFailure } from "@/hooks/useStorageWriteFailure";
import { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";

/**
 * 保存の失敗を購読し、バナーを出すかどうかを決める。
 *
 * 保存の失敗はどの画面でも起きうるため、アプリ全体で 1 つだけ置く。
 */
export const StorageWriteFailureNotifier = () => {
  const { failure, dismiss } = useStorageWriteFailure();

  if (!failure) return null;

  return (
    <StorageWriteFailureBanner reason={failure.reason} onDismiss={dismiss} />
  );
};
```

- [ ] **Step 4: `ClientProviders` を戻す**

```tsx
"use client";

import type { ReactNode } from "react";
import { usePWAInstaller } from "@/hooks/usePWAInstaller";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { StorageWriteFailureNotifier } from "./StorageWriteFailureNotifier";

type ClientProvidersProps = {
  children: ReactNode;
};

export const ClientProviders = ({ children }: ClientProvidersProps) => {
  useThemeEffect();
  usePWAInstaller();

  return (
    <>
      <StorageWriteFailureNotifier />
      {children}
    </>
  );
};
```

`src/components/index.ts` には追加しない。バレルには外から使われるものだけを載せる慣習になっており（`AuthGuard` / `ClientProviders` / `RootErrorBoundary` は未掲載）、`StorageWriteFailureNotifier` は同じディレクトリの `ClientProviders` からしか使われない。

- [ ] **Step 5: GREEN を確認**

```bash
npx jest src/components
```

期待: 新規 5 件が pass し、`ClientProviders.test.tsx` の 4 件も書き換えずに通ること。

---

## Task 5: `core.ts` の公開範囲を絞る

**Files:**

- Modify: `src/lib/storage/core.ts`

storage 層の外から使われているのは `STORAGE_WRITE_FAILED_EVENT` / `StorageWriteFailureDetail` / `StorageWriteFailureReason` の 3 つだけ。`dispatchStorageWriteFailed` と `isQuotaExceededError` は層の外から 1 度も参照されていない（grep 済み）。使われない API を公開すると、層の外から直接発火できてしまい、通知の経路が storage 層に閉じなくなる。

- [ ] **Step 1: 参照範囲を再確認する**

```bash
grep -rn "dispatchStorageWriteFailed\|isQuotaExceededError" src --include='*.ts' --include='*.tsx' \
  | grep -v "src/lib/storage/"
```

期待: 出力が空。

- [ ] **Step 2: re-export を絞る**

`src/lib/storage/core.ts` の該当箇所を次の 3 行だけにする。

```ts
export { STORAGE_WRITE_FAILED_EVENT } from "./core-modules/storageWriteFailureEvent";
export type { StorageWriteFailureDetail } from "./core-modules/storageWriteFailureEvent";
export type { StorageWriteFailureReason } from "./core-modules/storageWriteFailureReason";
```

- [ ] **Step 3: 確認**

```bash
npx tsc --noEmit
npx jest
```

期待: すべて pass。storage 層内のテストは相対パスで直接 import しているため影響しない。

---

## Task 6: 同じ失敗が続くときの再描画を止める

**Files:**

- Modify: `src/hooks/useStorageWriteFailure.ts`
- Modify: `src/hooks/__tests__/useStorageWriteFailure.test.ts`

現状は失敗イベントを受けるたびに新しいオブジェクトを状態に入れるため、同じ失敗が繰り返されると毎回再描画が走る。容量超過は解消されない限り書き込みのたびに起きるので、繰り返しは例外ではなく常態。

再描画が起きなければ「再描画→書き込み→失敗→再描画」の連鎖も始まらない。上で確認したとおり `dispatchStorageWriteFailed` の再入ガードはこの経路を防げないため、購読側で断つ。

画面に出る内容は変わらない。同じ理由の失敗が続いている間、同じバナーが出たままになる。

- [ ] **Step 1: 失敗テストを書く**

`src/hooks/__tests__/useStorageWriteFailure.test.ts` に追加する。

```ts
it("同じ内容の失敗が続いても状態を差し替えない", () => {
  // 容量超過は解消されない限り書き込みのたびに起きる。
  // 毎回状態を差し替えると再描画が走り続け、その再描画中の書き込みが
  // また失敗すると連鎖が止まらなくなる。
  const { result } = renderHook(() => useStorageWriteFailure());
  emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
  const first = result.current.failure;

  emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

  expect(result.current.failure).toBe(first);
});

it("キーが変わったら状態を差し替える", () => {
  const { result } = renderHook(() => useStorageWriteFailure());
  emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
  const first = result.current.failure;

  emitFailure({ key: "routines", reason: "quota-exceeded" });

  expect(result.current.failure).not.toBe(first);
  expect(result.current.failure?.key).toBe("routines");
});

it("理由が変わったら状態を差し替える", () => {
  const { result } = renderHook(() => useStorageWriteFailure());
  emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
  const first = result.current.failure;

  emitFailure({ key: "todo-lists", reason: "unknown" });

  expect(result.current.failure).not.toBe(first);
  expect(result.current.failure?.reason).toBe("unknown");
});
```

既存の「dismiss したあとに再び失敗すると再表示される」は据え置き判定と両立する。閉じた直後は `null` なので、同じ内容の失敗でも差し替えが起きる。

- [ ] **Step 2: RED を確認**

```bash
npx jest src/hooks/__tests__/useStorageWriteFailure.test.ts
```

期待: 「同じ内容の失敗が続いても状態を差し替えない」が失敗する（毎回新しいオブジェクトが入るため）。残り 2 件は最初から pass する。

- [ ] **Step 3: 実装する**

`src/hooks/useStorageWriteFailure.ts` の `handleFailure` を差し替える。

```ts
const handleFailure = (event: Event) => {
  const detail = (event as CustomEvent<StorageWriteFailureDetail>).detail;
  setFailure((current) => {
    // 同じ失敗が続く間は状態を据え置き、再描画を起こさない
    if (
      current &&
      current.key === detail.key &&
      current.reason === detail.reason
    ) {
      return current;
    }
    return detail;
  });
};
```

- [ ] **Step 4: GREEN を確認**

```bash
npx jest src/hooks/__tests__/useStorageWriteFailure.test.ts
```

期待: 9 件すべて pass。既存 6 件は書き換えずに通ること。

---

## Task 7: 全体検証

- [ ] **Step 1: 一括で確認する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npx prettier --check <変更したファイル>
```

期待: すべてクリーン。ユニットテストは 4000 件 + 新規分 − 置き換え分。

- [ ] **Step 2: 挙動が変わっていないことを確認する**

既存テストを 1 件も書き換えずに通ったかを確認する。書き換えが必要だった箇所があれば、それは挙動が変わっている可能性が高いので内容を精査する。

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

以下をそれぞれ一時的に適用し、対応するテストが落ちることを確認したうえで元に戻す。

| 壊し方                                                              | 落ちるべきテスト                                                                             |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `runStorageWrite` の catch を空にする                               | `storageWrite.test.ts` の「書き込みが投げた例外を通知に変換する」                            |
| `runStorageWrite` で catch した例外を再スローする                   | `storageWrite.test.ts` の「例外を呼び出し元へ再スローしない」                                |
| `toStorageWriteFailureReason` を常に `"unknown"` にする             | `storageWriteFailureReason.test.ts` の 2 件                                                  |
| `getStorageWriteFailureMessage` を常に同じ文言にする                | `storageWriteFailureHelpers.test.ts` の「理由ごとに異なる文言を返す」                        |
| `StorageWriteFailureNotifier` の `if (!failure) return null` を消す | `StorageWriteFailureNotifier.test.tsx` の「失敗が起きるまで何も描画しない」                  |
| `useStorageWriteFailure` の据え置き判定を消す                       | `useStorageWriteFailure.test.ts` の「同じ内容の失敗が続いても状態を差し替えない」            |
| バナーを `fixed bottom-0` から `fixed top-0` に戻す                 | `e2e/storage-write-failure.spec.ts` の「保存に失敗すると警告バナーが見える状態で表示される」 |

- [ ] **Step 4: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動

変わらない。すべて内部構造の整理であり、外から見た振る舞いは同一。既存テストを書き換えずに通ることで担保する。

### ファイル

- 新規 5 ファイル（実装 4・ヘルパー 1）＋ テスト 4 ファイル
- 削除 2 ファイル（`storageWriteFailure.ts` とそのテスト）
- 変更 4 ファイル（`storageIO.ts` / `core.ts` / `StorageWriteFailureBanner.tsx` / `ClientProviders.tsx`）

### リスク

- **Task 2 の影響範囲が広い**: `setStorageItem` はアプリ全体から 46 箇所呼ばれる。本体を変えずに包むだけだが、既存 4000 件のテストで担保する。
- **`typeof window` ガードの位置が変わる**: 各関数の先頭から `runStorageWrite` の中へ移る。サーバー側で呼ばれたときに何もしない点は同じだが、`storageIO` のテストで確認する。
