# 通知権限とFCMトークン取得のSRPリファクタリング実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通知権限ポリシーとFCMトークン取得を別の責務へ分離し、通常のルーティン同期が通知未許可時にトークン取得へ進まない構造にする。

**Architecture:** `syncRoutinesToFirebase` がルーティン同期の前提条件として通知許可を判定し、未許可なら同期を終了する。Firebase Messaging 12.8の `getToken()` は通知権限が未選択だと内部で許可要求するため、`getFCMToken` 自身もSDK呼び出し直前に非要求型の前提条件を検証する。通知許可を要求するかのポリシーはnotification featureに集約し、設定画面の通知テストだけがユーザー操作に応じて許可を要求する。

**Tech Stack:** TypeScript / React 19 / Next.js 16 / Firebase Messaging 12 / Jest 30 / Testing Library

**Spec:** `docs/superpowers/plans/2026-08-27-routine-delete-notification-permission.md#調査結果`

## Global Constraints

- 対象は `main` から変更された箇所と、その責務移動に直接必要な依存箇所だけに限定する。
- 通知権限要求は設定画面の通知テストからのみ実行する。
- ルーティン同期は通知未許可時に `false` を返し、ローカル保存を妨げない。
- Firebase Functions の `/syncRoutines` API、リクエスト形式、Service Worker登録方式は変更しない。
- 公開関数 `getFCMToken(): Promise<string>` と `syncRoutinesToFirebase(routines, functionsUrl?): Promise<boolean>` のシグネチャは変更しない。
- テストを先に変更して意図した失敗を確認してから、実装を変更する。
- 自動コミットは行わない。

---

## `main` 差分の全件監査

| 差分ファイル                                                                  | 現在の責務                                                 | SRP判定  | 対応                                                                               |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `src/lib/firebase-modules/messaging.ts`                                       | FCMトークン取得、Foregroundメッセージ購読、SDK副作用の防御 | **対象** | 権限要求ポリシーを除去し、SDKの自動要求を防ぐ非要求型preconditionだけを残す        |
| `src/lib/firebase-modules/__tests__/messaging.test.ts`                        | `getFCMToken` の前提条件・トークン取得テスト               | **対象** | 未許可時にSDKへ到達しないことと、Messagingの取得・失敗変換を検証する               |
| `src/features/routine/__tests__/routineHelpers.sync.test.ts`                  | ルーティン同期の成功・失敗条件                             | **対象** | 「トークン取得後の権限エラー」ではなく「未許可ならトークンを取得しない」を検証する |
| `src/features/settings/__tests__/useNotificationTestAction.test.tsx`          | 設定画面の通知テスト操作                                   | 対象外   | 明示的なユーザー操作で権限要求する責務に閉じているため維持する                     |
| `docs/superpowers/plans/2026-08-27-routine-delete-notification-permission.md` | 原因調査と修正計画                                         | 対象外   | 最終設計との混同を防ぐSuperseded注記のみ追加する                                   |

責務移動により、次の既存ファイルを追加で変更する。

| 追加変更ファイル                      | 役割                                 |
| ------------------------------------- | ------------------------------------ |
| `src/features/routine/helpersSync.ts` | 通知許可を同期前提条件として判定する |

## 設計判断

### 採用: 権限ポリシーをルーティン同期へ移す

- `hasNotificationPermission()` はブラウザAPI非対応、`default`、`denied` を既に一元判定している。
- ルーティン同期は「通知用バックエンドへ同期できるか」を判断する責務を持つため、通知許可はその前提条件として自然である。
- 呼び出し側の判定により通常経路を早期終了し、`getFCMToken` の前提条件はFirebase SDKの隠れた許可要求を遮断する防御に限定する。

### 不採用: `messaging.ts` に許可要求ポリシーを持たせる

Firebase層は許可を要求せず、許可状態に応じた利用フローも決定しない。ただしFirebase Messaging 12.8の `getToken()` が `default` で `Notification.requestPermission()` を呼ぶため、SDK直前の非要求型preconditionは公開関数の安全契約として必要である。

### 不採用: `messaging.ts` から `hasNotificationPermission` を呼ぶ

権限判定の重複はなくなるが、FCMトークン取得が引き続き通知権限ポリシーへ依存する。通常同期と設定画面で権限の扱いが異なるため、呼び出し側がポリシーを選ぶ構造の方が明確である。

---

### Task 1: ルーティン同期が通知権限ポリシーを所有する

**Files:**

- Modify: `src/features/routine/__tests__/routineHelpers.sync.test.ts`
- Modify: `src/features/routine/helpersSync.ts`

**Interfaces:**

- Consumes: `hasNotificationPermission(): boolean`, `getFCMToken(): Promise<string>`
- Produces: `syncRoutinesToFirebase(routines: Routine[], functionsUrl?: string): Promise<boolean>`。通知未許可ならFCMトークン取得とHTTP送信を行わず `false` を返す。

- [ ] **Step 1: 通知許可モックを同期テスト内へ追加する**

`src/features/routine/__tests__/routineHelpers.sync.test.ts` に通知モジュールのモックを追加する。同期以外のテストも利用する共通 `routineHelpers.test.setup.ts` は変更しない。

```ts
jest.mock("@/features/notification", () => ({
  hasNotificationPermission: jest.fn(),
}));

import { hasNotificationPermission } from "@/features/notification";

const mockHasNotificationPermission =
  hasNotificationPermission as jest.MockedFunction<
    typeof hasNotificationPermission
  >;

beforeEach(() => {
  setupRoutineHelpersDefaults();
  mockHasNotificationPermission.mockReturnValue(true);
});
```

既存の `@/lib/firebase` モック、`baseRoutine`、`mockGetFCMToken` は共通セットアップから引き続き利用する。

- [ ] **Step 2: 未許可時にトークン取得へ進まない回帰テストへ置き換える**

`src/features/routine/__tests__/routineHelpers.sync.test.ts` の追加済みテストを次に置き換える。

```ts
it("通知未許可ならトークン取得と送信を行わずfalseを返す", async () => {
  mockHasNotificationPermission.mockReturnValue(false);

  await expect(
    syncRoutinesToFirebase([baseRoutine], "http://test.com"),
  ).resolves.toBe(false);

  expect(mockGetFCMToken).not.toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
});
```

- [ ] **Step 3: REDを確認する**

```bash
npx jest src/features/routine/__tests__/routineHelpers.sync.test.ts --runInBand
```

期待: 現行の `syncRoutinesToFirebase` が `hasNotificationPermission` を参照せず `getFCMToken` を呼ぶため、`mockGetFCMToken` の未呼び出しアサーションでFAILする。

- [ ] **Step 4: 同期前に通知許可を判定する**

`src/features/routine/helpersSync.ts` を次の構成にする。

```ts
import { hasNotificationPermission } from "@/features/notification";
import { getFCMToken } from "@/lib/firebase";
import { type Routine } from "@/types/routine";

export const syncRoutinesToFirebase = async (
  routines: Routine[],
  functionsUrl?: string,
): Promise<boolean> => {
  if (!hasNotificationPermission()) return false;

  const fcmToken = await getFCMToken().catch(() => null);
  if (!fcmToken) return false;

  const url = functionsUrl || process.env.NEXT_PUBLIC_FUNCTIONS_URL;
  if (!url) return false;

  try {
    const response = await fetch(`${url}/syncRoutines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: fcmToken,
        routines,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
};
```

- [ ] **Step 5: GREENを確認する**

```bash
npx jest src/features/routine/__tests__/routineHelpers.sync.test.ts --runInBand
```

期待: 既存ケースを含む全テストがPASSする。

---

### Task 2: FCMトークン取得をFirebase Messaging操作へ限定する

**Files:**

- Modify: `src/lib/firebase-modules/__tests__/messaging.test.ts`
- Modify: `src/lib/firebase-modules/messaging.ts:21-29`

**Interfaces:**

- Consumes: `Notification.permission`, `getFirebaseState()`, `getFcmServiceWorkerRegistration()`, Firebase SDKの `getToken()`
- Produces: `getFCMToken(): Promise<string>`。未許可ならSDKを呼ばず `permission-denied`、Messaging未初期化、空トークン、Firebase SDK例外は既存の `FirebaseError` コードへ変換する。通知権限は要求しない。

- [ ] **Step 1: SDKの自動許可要求を遮断するテストを追加する**

各トークン取得ケースは `Notification.permission = "granted"` を前提にする。加えて `default` / `denied` では `permission-denied` を投げ、`requestPermission`、Service Worker取得、Firebase SDKの `getToken` のいずれも呼ばないことを検証する。テストは次の6ケースにする。

```ts
describe("getFCMToken", () => {
  const messaging = {} as Messaging;
  const originalNotification = global.Notification;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, "Notification", {
      configurable: true,
      value: { permission: "granted", requestPermission: jest.fn() },
    });
    mockGetFirebaseState.mockReturnValue({
      app: null,
      auth: null,
      firestore: null,
      messaging,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "Notification", {
      configurable: true,
      value: originalNotification,
    });
  });

  it("Messaging未初期化ならmessaging-not-availableを投げる", async () => {
    mockGetFirebaseState.mockReturnValue({
      app: null,
      auth: null,
      firestore: null,
      messaging: null,
    });

    await expect(getFCMToken()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "messaging-not-available",
    });
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it.each(["default", "denied"] as const)(
    "通知権限が%sなら許可を要求せずpermission-deniedを投げる",
    async (permission) => {
      const requestPermission = jest.fn();
      Object.defineProperty(global, "Notification", {
        configurable: true,
        value: { permission, requestPermission },
      });

      await expect(getFCMToken()).rejects.toMatchObject({
        name: "FirebaseError",
        code: "permission-denied",
      });
      expect(requestPermission).not.toHaveBeenCalled();
      expect(mockGetRegistration).not.toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    },
  );

  it("FCM用Service Workerでトークンを取得する", async () => {
    const registration = {} as ServiceWorkerRegistration;
    mockGetRegistration.mockResolvedValue(registration);
    mockGetToken.mockResolvedValue("token-123");

    await expect(getFCMToken()).resolves.toBe("token-123");
    expect(mockGetToken).toHaveBeenCalledWith(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  });

  it("Firebase SDKが空トークンを返したらtoken-not-generatedを投げる", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockGetToken.mockResolvedValue("");

    await expect(getFCMToken()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "token-not-generated",
    });
  });

  it("Firebase SDK例外をtoken-retrieval-failedへ変換する", async () => {
    mockGetRegistration.mockResolvedValue(undefined);
    mockGetToken.mockRejectedValue(new Error("network down"));

    await expect(getFCMToken()).rejects.toMatchObject({
      name: "FirebaseError",
      code: "token-retrieval-failed",
    });
  });
});
```

- [ ] **Step 2: REDを確認する**

```bash
npx jest src/lib/firebase-modules/__tests__/messaging.test.ts --runInBand
```

期待: 現行実装が権限を検証せずSDKへ進むため、`default` / `denied` が `permission-denied` ではなく `token-not-generated` となりFAILする。

- [ ] **Step 3: SDK直前に非要求型preconditionを追加する**

`src/lib/firebase-modules/messaging.ts` でFirebase SDKを呼ぶ前に次の前提条件を検証する。

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

この検証は許可を要求せず、Firebase SDK 12.8の隠れた `Notification.requestPermission()` へ到達しないための防御だけを担当する。

- [ ] **Step 4: GREENを確認する**

```bash
npx jest src/lib/firebase-modules/__tests__/messaging.test.ts --runInBand
```

期待: 6ケースすべてPASSする。

---

### Task 3: 権限要求と同期の境界をまとめて回帰確認する

**Files:**

- Test: `src/features/notification/__tests__/notification-permission.test.ts`
- Test: `src/features/routine/__tests__/routineHelpers.sync.test.ts`
- Test: `src/features/settings/__tests__/useNotificationTestAction.test.tsx`
- Test: `src/lib/firebase-modules/__tests__/messaging.test.ts`

**Interfaces:**

- Consumes: Task 1・2で分離した通知権限、ルーティン同期、FCMトークン取得の各責務。
- Produces: 「設定画面だけが権限要求する」「通常同期は未許可時に終了する」「Firebase層はSDKの自動要求を遮断してトークン取得を行う」という回帰証跡。

- [ ] **Step 1: 関連4スイートを実行する**

```bash
npx jest \
  src/features/notification/__tests__/notification-permission.test.ts \
  src/features/routine/__tests__/routineHelpers.sync.test.ts \
  src/features/settings/__tests__/useNotificationTestAction.test.tsx \
  src/lib/firebase-modules/__tests__/messaging.test.ts \
  --runInBand
```

期待: 全テストPASS。`useNotificationTestAction` の既存追加ケースにより、`default` では明示的に `requestPermission` が1回呼ばれることも維持される。

- [ ] **Step 2: 静的検証を実行する**

```bash
npm run lint
npm run typecheck
npx prettier --check \
  src/features/routine/helpersSync.ts \
  src/features/routine/__tests__/routineHelpers.sync.test.ts \
  src/lib/firebase-modules/messaging.ts \
  src/lib/firebase-modules/__tests__/messaging.test.ts
```

期待: すべて終了コード0。

- [ ] **Step 3: 全ユニットテストを実行する**

隔離worktree内ではパス自体に `.worktrees` が含まれるため、追加の `.worktrees` 除外パターンは指定しない。

```bash
npm test -- --runInBand --silent --verbose=false
```

期待: 全テストPASS。

- [ ] **Step 4: 差分と未コミット状態を確認する**

```bash
git diff --check
git status --short --branch
git diff --stat main
```

期待: ブランチは `codex/fix-routine-delete-notification-permission`。変更は未コミットで、意図した実装・テスト・計画書だけが表示される。

## 変更後の責務

| 単位                           | 単一の責務                                                    |
| ------------------------------ | ------------------------------------------------------------- |
| `notification-permission.ts`   | ブラウザ通知権限の要求・状態判定                              |
| `helpersSync.ts`               | 通知可能な端末のルーティンをバックエンドへ同期                |
| `messaging.ts#getFCMToken`     | Firebase MessagingからFCMトークンを取得し、取得エラーを正規化 |
| `useNotificationTestAction.ts` | ユーザーが開始した通知テストの状態遷移を調整                  |

## 自動コミットについて

このプランにはコミット手順を含めない。実装後も変更を未コミットで保持し、ユーザーから明示的なコミット指示があった場合だけ実行する。
