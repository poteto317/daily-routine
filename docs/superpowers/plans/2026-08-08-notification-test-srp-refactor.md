# notification テストの単一責任リファクタ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans（このプランは1タスクのみのため、subagent-driven-developmentは不要）。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** main ブランチから変更されている箇所を対象に単一責任原則（SRP）の観点で洗い出し、違反箇所をリファクタする。リファクタ対象コードのユニットテストも拡充する。

**Architecture:** 洗い出しの結果、SRP改善が必要なのは `notification-messaging.test.ts` 1ファイルのみ。ブラウザAPI（MessageChannel / ServiceWorker）のモックインフラと、`scheduleNotifications` / `clearNotificationSchedules` の振る舞い検証が同一ファイルに同居しているため、既存の `*.test.setup.ts` パターン（例: `src/features/routine/__tests__/helpers.test.setup.ts`）に倣ってモックインフラを分離する。

**Tech Stack:** Jest, TypeScript

## Global Constraints

- 既存の `*.test.setup.ts` 命名規則（テスト対象ファイル名 + `.test.setup.ts`）に従うこと
- リファクタは振る舞いを変えない。既存13件のテスト（permission 6件 + messaging 7件）はすべて元のアサーション内容のまま通過すること
- 自動コミットはしない

---

## 洗い出し結果

main ブランチとの差分ファイル一覧と、SRP観点での判定:

| ファイル | 種別 | 判定 |
| --- | --- | --- |
| `.github/workflows/ci.yml` | CI設定 | 対象外（ジョブ定義のみの単一責任） |
| `.gitignore` | 設定 | 対象外 |
| `docs/03-testing/README.md` | ドキュメント | 対象外 |
| `docs/03-testing/test-matrix.md` | ドキュメント | 対象外 |
| `docs/04-reference/features.md` | ドキュメント | 対象外 |
| `jest.config.ts` | 設定 | 対象外（1行追加のみ） |
| `package.json` / `package-lock.json` | 依存関係 | 対象外 |
| `playwright.config.ts` | 設定 | 対象外（Playwright設定定義のみの単一責任） |
| `e2e/routine-creation.spec.ts` | E2Eテスト | 対象外（単一シナリオ、責務単一） |
| `src/features/notification/__tests__/notification-permission.test.ts` | ユニットテスト | 対象外（テスト本体のみ、モックインフラの混在なし） |
| `src/features/notification/__tests__/notification-messaging.test.ts` | ユニットテスト | **対象**（下記参照） |

### `notification-messaging.test.ts` のSRP違反

以下2つの責務が1ファイルに同居している:

1. **モックインフラの定義**: `FakeMessagePort` / `FakeMessageChannel` クラス、`setServiceWorker` ヘルパー、グローバル `MessageChannel` の差し替え（1〜39行目）
2. **振る舞いの検証**: `scheduleNotifications` / `clearNotificationSchedules` のテストケース本体（41〜152行目）

既存コードベースには `src/features/routine/__tests__/helpers.test.setup.ts` のように、モック定義・フィクスチャを `<対象ファイル名>.test.setup.ts` に分離する確立されたパターンがある。このパターンに倣う。

### テスト拡充対象

`clearNotificationSchedules` のテストケースが `scheduleNotifications` に比べて手薄（`scheduleNotifications` 5件に対し2件のみ）。内部実装は共通の `postMessageToActiveServiceWorker` を使っており同じ分岐を持つため、以下3ケースを追加する:

- activeなService Workerがなければfalseを返す
- 失敗応答を受け取るとfalseを返す
- Service Worker取得中に例外が起きるとfalseを返す

---

### Task 1: notification-messaging.test.ts のモックインフラ分離とテスト拡充

**Files:**
- Create: `src/features/notification/__tests__/notification-messaging.test.setup.ts`
- Modify: `src/features/notification/__tests__/notification-messaging.test.ts`

**Interfaces:**
- `notification-messaging.test.setup.ts` が export するもの:
  - `setServiceWorker(value: unknown): void` — `global.navigator.serviceWorker` を差し替えるヘルパー
  - `originalServiceWorker: unknown` — テスト前の `navigator.serviceWorker` の値（`afterEach` での復元用）
  - モジュール読み込み時に `global.MessageChannel` を `FakeMessageChannel` に差し替える副作用を持つ（`notification-messaging.test.ts` の先頭で import するだけで有効になる）

- [x] **Step 1: `notification-messaging.test.setup.ts` を作成する**

`notification-messaging.test.ts` の1〜39行目にある以下の内容をそのまま新規ファイルへ移す。

```ts
// jsdomテスト環境にはMessageChannelがグローバル定義されていないため、
// port1↔port2間で同期的にメッセージを受け渡す最小限のモックで補う
// （node:worker_threadsのMessageChannelはjestプロセスをハングさせるため使用しない）
class FakeMessagePort {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  other: FakeMessagePort | null = null;

  postMessage(data: unknown): void {
    this.other?.onmessage?.({ data });
  }
}

class FakeMessageChannel {
  port1 = new FakeMessagePort();
  port2 = new FakeMessagePort();

  constructor() {
    this.port1.other = this.port2;
    this.port2.other = this.port1;
  }
}

global.MessageChannel =
  FakeMessageChannel as unknown as typeof globalThis.MessageChannel;

export const setServiceWorker = (value: unknown) => {
  Object.defineProperty(global.navigator, "serviceWorker", {
    value,
    writable: true,
  });
};

export const originalServiceWorker = global.navigator.serviceWorker;
```

（元のファイルとの差分は `setServiceWorker` と `originalServiceWorker` に `export` を付けた点のみ）

- [x] **Step 2: `notification-messaging.test.ts` からモックインフラを削除し、setup ファイルから import する**

ファイル冒頭を以下に置き換える:

```ts
import {
  clearNotificationSchedules,
  scheduleNotifications,
} from "../notification-messaging";
import type { NotificationSchedule } from "../notification-types";
import {
  originalServiceWorker,
  setServiceWorker,
} from "./notification-messaging.test.setup";
```

`FakeMessagePort` / `FakeMessageChannel` クラス定義、`setServiceWorker` 関数定義、`originalServiceWorker` 定義（旧1〜39行目）は削除する。`describe("notification-messaging", ...)` 以降の本体はそのまま変更しない。

- [x] **Step 3: 既存テストが全件通過することを確認する**

Run: `npx jest src/features/notification/__tests__/notification-messaging.test.ts --no-coverage`
Expected: 既存7件すべてPASS（振る舞いは変えていないため）

- [x] **Step 4: `clearNotificationSchedules` に不足しているテストケースを追加する**

`describe("clearNotificationSchedules", ...)` ブロック内、既存の2件（成功応答／タイムアウト）に加えて以下3件を追加する。`scheduleNotifications` の対応するテストケースと同じ構造で、payloadだけ `CLEAR_SCHEDULES`（引数なし）に合わせる。

```ts
    it("activeなService Workerがなければfalseを返す", async () => {
      setServiceWorker({ ready: Promise.resolve({ active: null }) });

      await expect(clearNotificationSchedules()).resolves.toBe(false);
    });
```

```ts
    it("失敗応答を受け取るとfalseを返す", async () => {
      const postMessage = jest.fn((message, transfer) => {
        const [port2] = transfer as [MessagePort];
        port2.postMessage({ success: false });
      });
      setServiceWorker({
        ready: Promise.resolve({ active: { postMessage } }),
      });

      await expect(clearNotificationSchedules()).resolves.toBe(false);
    });
```

```ts
    it("Service Worker取得中に例外が起きるとfalseを返す", async () => {
      setServiceWorker({
        get ready() {
          throw new Error("unavailable");
        },
      });

      await expect(clearNotificationSchedules()).resolves.toBe(false);
    });
```

配置順は既存の「成功応答」の直後、「タイムアウト」の前でよい（`scheduleNotifications` 側と項目の並びを揃える）。

- [x] **Step 5: 追加したテストが失敗せず通ることを確認する**

Run: `npx jest src/features/notification/__tests__/notification-messaging.test.ts --no-coverage`
Expected: 10件すべてPASS（既存7件 + 新規3件）

- [x] **Step 6: notification ディレクトリ全体・lint・型チェックを実行する**

Run:
```bash
npx jest src/features/notification --no-coverage
npx eslint src/features/notification/ --quiet
npx tsc --noEmit -p tsconfig.test.json
```
Expected: すべてエラーなし

- [ ] **Step 7: コミット（ユーザーに確認の上で実行）**

このプランは「自動コミットはしないでください」という指示のもと実行されるため、Step 6 まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

```bash
git add src/features/notification/__tests__/notification-messaging.test.ts src/features/notification/__tests__/notification-messaging.test.setup.ts
git commit -m "$(cat <<'EOF'
test(notification): notification-messaging.test.tsのモックインフラをtest.setupに分離し、clearNotificationSchedulesのテストを拡充

EOF
)"
```

---

## Self-Review

- **Spec coverage**: 洗い出した対象ファイル11件すべてに判定を記載。SRP対象は1件のみで、そのリファクタとテスト拡充をTask 1に網羅した。
- **Placeholder scan**: なし。すべてのコードブロックは実際に貼り付け可能な完全な内容。
- **Type consistency**: `setServiceWorker` / `originalServiceWorker` の型はいずれも既存コードの推論結果をそのまま踏襲（明示的な型注釈なし、`unknown` 引数のみ明示）。
