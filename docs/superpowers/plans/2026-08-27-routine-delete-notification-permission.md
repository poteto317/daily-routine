# ルーティン削除時の通知権限要求を防ぐ実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Superseded:** この文書は初回の原因調査と方針比較を記録したものです。実装手順と最終設計は `docs/superpowers/plans/2026-08-28-notification-permission-srp-refactor.md` を正としてください。

**Goal:** ルーティンの削除・追加・編集など通常のデータ操作では通知権限を要求せず、設定画面の通知テストをユーザーが実行したときだけ通知権限を要求する。

**Architecture:** 通知権限の取得と FCM トークンの取得を分離する。`getFCMToken` は `Notification.permission === "granted"` を前提条件として検証するだけにし、権限要求は既存の `useNotificationTestAction` に集約する。ルーティン同期は未許可時のトークン取得失敗を従来どおり `false` として扱い、ローカル保存を妨げない。

**Tech Stack:** TypeScript / React 19 / Next.js 16 / Firebase Messaging 12 / Jest 30 / Testing Library

**Spec:** `docs/superpowers/plans/2026-08-27-routine-delete-notification-permission.md#調査結果`

## Global Constraints

- 通知権限要求は、設定画面の「通知テスト」操作からのみ実行する。
- ルーティンのローカル保存と `routines-saved` イベント発火は変更しない。
- Firebase Functions の `/syncRoutines` API とリクエスト形式は変更しない。
- 通知未許可時はサーバー同期をスキップして `false` を返し、ユーザー操作は失敗扱いにしない。
- Service Worker の登録・通知スケジュール更新ロジックは変更しない。
- 実装はテストを先に追加し、失敗を確認してから最小修正を行う。
- コミットはユーザーから明示的な指示があった場合だけ行う。

---

## 調査結果

### 再現条件

1. 対象サイトの通知権限を `default`（未選択、ブラウザ表示では「確認する」）にする。
2. ルーティン一覧で削除操作を行う。
3. 削除確認を承認する。
4. ルーティン保存に続く Firebase 同期から `Notification.requestPermission()` が呼ばれ、通知許可ポップアップが表示される。

### 呼び出し経路

```text
削除ボタン
  -> deleteRoutineWithConfirmation
  -> useRoutineCrudMutations.deleteRoutine / deleteRoutineGroup
  -> createRoutineMutationRunner
  -> saveAndSyncRoutines
  -> syncRoutinesToFirebase
  -> getFCMToken
  -> Notification.requestPermission  // 意図しない権限要求
```

根拠となる実装箇所:

- `src/features/routine/hooks/routineCrudViewStateActions.ts`: 確認後に削除 mutation を実行する。
- `src/features/routine/hooks/routineMutationCoordinator.ts`: mutation 後に必ず `saveAndSync` を実行する。
- `src/features/routine/hooks/routinePersistenceSync.ts:31`: ローカル保存後に `syncRoutines` を起動する。
- `src/features/routine/helpersSync.ts:8`: 同期のたびに `getFCMToken()` を呼ぶ。
- `src/lib/firebase-modules/messaging.ts:22`: `getFCMToken()` が無条件に `Notification.requestPermission()` を呼ぶ。
- `src/features/settings/state/useNotificationTestAction.ts:36`: 設定画面には、ユーザー操作に応じて権限を要求する専用フローが既にある。

### 根本原因

`getFCMToken` が「通知権限を要求する」と「許可済み環境で FCM トークンを取得する」の2責務を持っている。ルーティン同期は削除を含む全 mutation から呼ばれるため、単なるデータ操作がブラウザ権限要求という別の副作用を発生させる。

この問題は削除固有ではない。`createRoutineMutationRunner` を使う追加・編集・グループ削除・プリセット上書きでも同じ経路に入る。削除は確認ボタンのクリック直後に同期されるため、ブラウザがユーザー操作に紐づく権限要求として受理し、症状が目立っている。

### 方針比較

1. **FCM トークン取得から権限要求を分離する（採用）**
   - 通常操作からの意図しない副作用を根本で防ぐ。
   - 今後 `getFCMToken` の呼び出し元が増えても、勝手に権限要求されない。
   - 既存の設定画面が権限要求を明示的に担当しているため、責務境界と一致する。
2. ルーティン削除時だけ Firebase 同期を止める
   - 削除後のサーバー側ルーティンが古いまま残る。
   - 追加・編集など同じ mutation 経路の問題が残るため不採用。
3. `syncRoutinesToFirebase` の直前だけ権限を確認する
   - 現象は止まるが、`getFCMToken` の副作用は残り、別の呼び出し元から再発できるため単独採用しない。

## ファイル構成

| ファイル                                                                     | 責務                                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/firebase-modules/messaging.ts`（変更）                              | 許可済みかを検証し、FCM トークン取得だけを行う                     |
| `src/lib/firebase-modules/__tests__/messaging.test.ts`（新規）               | 権限未許可時に要求しないことと、許可済み時の取得を検証する         |
| `src/features/routine/__tests__/routineHelpers.sync.test.ts`（変更）         | 権限未許可相当のトークン取得失敗を同期が静かに扱うことを検証する   |
| `src/features/settings/__tests__/useNotificationTestAction.test.tsx`（変更） | 明示的な通知テストでは権限要求後にトークン取得へ進むことを検証する |

---

### Task 1: FCM トークン取得の責務を限定する

**Files:**

- Create: `src/lib/firebase-modules/__tests__/messaging.test.ts`
- Modify: `src/lib/firebase-modules/messaging.ts:21-29`

**Interfaces:**

- Consumes: `Notification.permission`, `getFirebaseState()`, `getFcmServiceWorkerRegistration()`, Firebase SDK の `getToken()`
- Produces: 既存シグネチャ `getFCMToken(): Promise<string>`。権限が `granted` でなければ `FirebaseError`（`code: "permission-denied"`）を投げるが、`Notification.requestPermission()` は呼ばない。

- [ ] **Step 1: 権限要求が起きることを示す失敗テストを書く**

`src/lib/firebase-modules/__tests__/messaging.test.ts` を新規作成する。

```ts
import { getToken } from "firebase/messaging";
import { getFcmServiceWorkerRegistration } from "@/hooks/serviceWorkerRegistration";
import { getFirebaseState } from "../state";
import { getFCMToken } from "../messaging";

jest.mock("firebase/messaging", () => ({
  getToken: jest.fn(),
  onMessage: jest.fn(),
}));

jest.mock("@/hooks/serviceWorkerRegistration", () => ({
  getFcmServiceWorkerRegistration: jest.fn(),
}));

jest.mock("../state", () => ({
  getFirebaseState: jest.fn(),
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockGetRegistration =
  getFcmServiceWorkerRegistration as jest.MockedFunction<
    typeof getFcmServiceWorkerRegistration
  >;
const mockGetFirebaseState = getFirebaseState as jest.MockedFunction<
  typeof getFirebaseState
>;

const setPermission = (permission: NotificationPermission) => {
  Object.defineProperty(global.Notification, "permission", {
    configurable: true,
    value: permission,
  });
};

describe("getFCMToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirebaseState.mockReturnValue({
      app: null,
      auth: null,
      firestore: null,
      messaging: {} as ReturnType<typeof getFirebaseState>["messaging"],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setPermission("default");
  });

  it.each(["default", "denied"] as const)(
    "permission=%s では許可を要求せず permission-denied を投げる",
    async (permission) => {
      setPermission(permission);
      const requestPermission = jest.spyOn(
        global.Notification,
        "requestPermission",
      );

      await expect(getFCMToken()).rejects.toMatchObject({
        name: "FirebaseError",
        code: "permission-denied",
      });

      expect(requestPermission).not.toHaveBeenCalled();
      expect(mockGetRegistration).not.toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    },
  );

  it("permission=granted なら FCM 用 Service Worker でトークンを取得する", async () => {
    setPermission("granted");
    const registration = {} as ServiceWorkerRegistration;
    mockGetRegistration.mockResolvedValue(registration);
    mockGetToken.mockResolvedValue("token-123");

    await expect(getFCMToken()).resolves.toBe("token-123");

    expect(mockGetRegistration).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ serviceWorkerRegistration: registration }),
    );
  });
});
```

- [ ] **Step 2: RED を確認する**

```bash
npx jest src/lib/firebase-modules/__tests__/messaging.test.ts --runInBand
```

期待: `default` / `denied` のケースで `requestPermission` が呼ばれ、`permission-denied` にならないため失敗する。

- [ ] **Step 3: `getFCMToken` から権限要求を除去する**

`src/lib/firebase-modules/messaging.ts` の権限処理を次に置き換える。

```ts
const permission =
  typeof Notification === "undefined" ? "denied" : Notification.permission;

if (permission !== "granted") {
  throw new FirebaseError(
    getPermissionDeniedMessage(permission),
    "permission-denied",
  );
}
```

`Notification.requestPermission()` はこの関数から完全に削除する。FCM 用 Service Worker と `getToken()` の処理は変更しない。

- [ ] **Step 4: GREEN を確認する**

```bash
npx jest src/lib/firebase-modules/__tests__/messaging.test.ts --runInBand
```

期待: 追加した3ケースがすべて PASS する。

- [ ] **Step 5: 明示的な指示がある場合だけコミットする**

```bash
git add src/lib/firebase-modules/messaging.ts src/lib/firebase-modules/__tests__/messaging.test.ts
git commit -m "fix(notification): 通常操作で権限要求しない"
```

---

### Task 2: 通常同期と明示的な通知テストの境界を回帰テストで固定する

**Files:**

- Modify: `src/features/routine/__tests__/routineHelpers.sync.test.ts`
- Modify: `src/features/settings/__tests__/useNotificationTestAction.test.tsx`

**Interfaces:**

- Consumes: `syncRoutinesToFirebase(routines, functionsUrl)`, `useNotificationTestAction().handleTestNotification()`
- Produces: 通常同期はトークン取得失敗を `false` に変換し、通知テストは `default` から明示的に権限を要求してトークン取得へ進むという境界。

- [ ] **Step 1: ルーティン同期が未許可状態を静かに扱うテストを追加する**

`src/features/routine/__tests__/routineHelpers.sync.test.ts` に追加する。

```ts
it("通知未許可でトークンを取得できない場合は送信せずfalseを返す", async () => {
  mockGetFCMToken.mockRejectedValueOnce(
    Object.assign(new Error("通知権限が拒否されました(default)"), {
      code: "permission-denied",
    }),
  );

  await expect(
    syncRoutinesToFirebase([baseRoutine], "http://test.com"),
  ).resolves.toBe(false);

  expect(global.fetch).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: 通知テストだけが権限要求するテストを追加する**

`src/features/settings/__tests__/useNotificationTestAction.test.tsx` に追加する。

```tsx
it("通知権限がdefaultなら明示的に許可を要求してからトークンを取得する", async () => {
  const requestPermission = jest.fn().mockResolvedValue("granted");
  const showNotification = jest.fn(async () => undefined);
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: { permission: "default", requestPermission },
  });
  setServiceWorker({
    addEventListener: jest.fn(),
    ready: Promise.resolve({ showNotification }),
  });
  (getFCMToken as jest.Mock).mockResolvedValue("token-123");

  const { result } = renderHook(() =>
    useNotificationTestAction({ startLogCapture: jest.fn() }),
  );

  await act(async () => {
    await result.current.handleTestNotification();
  });

  expect(requestPermission).toHaveBeenCalledTimes(1);
  expect(getFCMToken).toHaveBeenCalledTimes(1);
  expect(showNotification).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 3: 対象テストを実行する**

```bash
npx jest \
  src/lib/firebase-modules/__tests__/messaging.test.ts \
  src/features/routine/__tests__/routineHelpers.sync.test.ts \
  src/features/settings/__tests__/useNotificationTestAction.test.tsx \
  --runInBand
```

期待: 全ケース PASS。通常同期のテストでは `fetch` が0回、通知テストでは `requestPermission` が1回となる。

- [ ] **Step 4: 明示的な指示がある場合だけコミットする**

```bash
git add src/features/routine/__tests__/routineHelpers.sync.test.ts src/features/settings/__tests__/useNotificationTestAction.test.tsx
git commit -m "test(notification): 権限要求の境界を固定する"
```

---

### Task 3: 回帰検証と手動確認

**Files:**

- Modify: none

**Interfaces:**

- Consumes: Task 1・2 の実装とテスト。
- Produces: 型・Lint・全ユニットテスト、および実ブラウザの権限表示に関する検証結果。

- [ ] **Step 1: 静的検証を実行する**

```bash
npm run lint
npm run typecheck
```

期待: 両方とも終了コード0。

- [ ] **Step 2: ソース全体のユニットテストを実行する**

```bash
npm test -- --runInBand --testPathIgnorePatterns='/e2e/' '/\.worktrees/' '/firebase-functions/lib/'
```

期待: 全テスト PASS。

- [ ] **Step 3: ブラウザで削除時の権限表示を確認する**

1. ブラウザのサイト設定で通知権限を「確認する」に戻す。
2. アプリを開き、通知が設定されたルーティンを1件作成する。
3. そのルーティンを削除し、削除確認を承認する。
4. 削除確認以外のポップアップが表示されず、ルーティンが削除されることを確認する。
5. 再読み込み後も削除状態が保持されることを確認する。

- [ ] **Step 4: 明示的な通知テストでは権限要求されることを確認する**

1. 通知権限を再度「確認する」に戻す。
2. 設定画面の通知テストを実行する。
3. この操作では通知許可ポップアップが表示されることを確認する。
4. 許可後、テスト通知が送信されることを確認する。

## 影響範囲

- **改善される操作:** ルーティン削除、グループ削除、追加、編集、プリセット上書きなど、ルーティン mutation 後に Firebase 同期される通常操作。
- **維持される操作:** 設定画面の通知テストは、ユーザーが明示的に実行した場合のみ権限を要求する。
- **ローカルデータ:** 保存処理とイベント通知は変更しないため影響なし。
- **バックエンド通知:** 通知未許可時は従来どおり FCM トークンが得られず同期されない。許可済みの場合は従来どおり `/syncRoutines` へ送信する。
- **Service Worker:** 登録方式、スコープ、通知スケジュールのメッセージ形式は変更しない。

## スコープ外

- 通知未許可ユーザー向けのサーバー同期識別子を FCM トークン以外へ変更すること。
- 過去に許可済みだった通知を取り消した際、サーバー上の古い FCM トークンデータを削除する仕組み。
- ブラウザ独自の通知許可 UI の文言や表示位置の制御。
