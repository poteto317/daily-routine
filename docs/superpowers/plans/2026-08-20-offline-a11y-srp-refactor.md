# オフライン有効化・a11y・インポート検証 SRPリファクタリング プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブランチ `feat/enable-offline-sw` で main から変更された箇所を、単一責任の観点で整理する。

**Architecture:** 今回の変更は 3 つの独立した目的（オフライン有効化 / 入力欄のアクセシブル名 / インポート検証）を 1 ブランチで進めたため、既存ファイルに機能を足す形になった箇所がある。特に `pwaInstallerActions.ts` は「Service Worker の登録」と「通知のスケジュール」という無関係な 2 つを抱えたまま名前が実態と合わなくなり、`LabeledField` は「ラベルに飾りが付く」形に対応できず呼び出し側が手書きの紐付けに逃げている。責務ごとにファイルを分け、共通化した部品が本来吸収すべき変種を吸収できるようにする。

**Tech Stack:** TypeScript / React 19 / Jest + Testing Library / Playwright（既存踏襲、追加ライブラリなし）

## 変更対象の洗い出し

main からの差分（docs 除く）と、それぞれの SRP 上の問題:

| ファイル | 変更 | 問題 |
| --- | --- | --- |
| `src/hooks/pwaInstallerActions.ts` | SW 登録を委譲、環境判定を追加 | **問題1**: 「SW 登録」と「通知スケジュール」の 2 つを抱える。**問題2**: `registerMessagingServiceWorkerOnce` が FCM 以外も登録するようになり名前が実態と合わない。**問題3**: `resetServiceWorkerRegisterPromiseForTest` が利用者ゼロの素通し |
| `src/hooks/serviceWorkerRegistration.ts` | 新規 | **問題4**: 「登録」と「FCM 登録の取得」が同居。後者の利用者は `messaging.ts` のみ |
| `src/features/routine/components/RoutineFormOptionalFields.tsx` | `LabeledField` 導入 + `useId` 直書き | **問題5**: 同じファイル内でラベル紐付けの書き方が 2 通りに分かれた。`LabeledField` が「ラベル横に BETA バッジ」を表現できないため |
| `src/features/routine/components/RoutineFormTimeFields.tsx` | `LabeledField` 導入 | **問題6**: 「開始時間」「所要時間」に加えて「重複警告リスト」の描画を抱えている |
| `src/components/LabeledField.tsx` | 新規 | 問題5 の裏返し。飾り付きラベルを受け取れない |
| `src/features/routine/components/RoutineFormCoreFields.tsx` | タイトル欄を `LabeledField` 化 | **問題7**: 同じファイルに、何も指していない `<label>` が 2 つ残った（曜日選択・カテゴリ選択）。入力欄ではなくボタン群の見出しのため `LabeledField` の対象外だが、`<label>` のまま放置すると「紐付いていない label」が再び増える |
| `src/features/statistics/helpers.ts` | 定数 2 件追加 | 既存の置き場所の慣例どおり。問題なし |
| `src/features/settings/state/transferPayloadRestore.ts` | `arrayField` に要素検証を追加 | 問題なし（任意オプションで既定の振る舞いは不変） |
| `src/features/settings/state/routineShapeValidation.ts` | 新規 | 問題なし |
| `src/features/settings/components/NumberInputField.tsx` | `useId` + `htmlFor` | 問題なし |
| `src/features/preset/presetRoutineGrouping.ts` | `toDaysOfWeek` 追加 | 問題なし |
| `src/service-worker/custom-sw.js` | `warmDocumentCache` 追加 | 問題なし（責務は外出し済み） |
| `src/lib/firebase-modules/messaging.ts` | 登録取得を差し替え | 問題なし |

### 対応しない

- `src/features/statistics/page/components/StatisticsPeriodControls.tsx` の `aria-label` 追加 — 既存構造のまま属性を足しただけ
- テストファイル群 — 観点の追加のみ

## Global Constraints

- 振る舞いを変えない。オフライン動作・アクセシブル名・インポート検証の結果はいずれも現状を維持する
- 既存のテストは 1 件も削除・弱体化させない
- 各タスクの終わりに `npm test` が green であることを確認する
- リファクタリングの正しさは mutation で確認する
- **自動コミットはしない。** 各タスクの終わりに変更内容を報告し、コミットの指示を待つ

---

### Task 1: `LabeledField` が飾り付きラベルを扱えるようにする

**問題:** `RoutineFormOptionalFields.tsx` は説明欄で `LabeledField` を使う一方、通知欄ではラベル横に BETA バッジを置く必要から `useId` を直に呼んで `htmlFor`/`id` を手書きしている。ラベルと入力欄の紐付けを 1 か所で保証するために作った部品なのに、変種を吸収できず呼び出し側が独自配線に戻っている。

**方針:** ラベルの右に任意のノードを置ける口を開ける。呼び出し側は `LabeledField` だけを使えばよくなる。

**Files:**
- Modify: `src/components/LabeledField.tsx`
- Modify: `src/components/__tests__/LabeledField.test.tsx`
- Modify: `src/features/routine/components/RoutineFormOptionalFields.tsx`

**Interfaces:**
- Produces: `LabeledField` に `labelAdornment?: ReactNode` を追加（既存の呼び出しはそのまま動く）

- [ ] **Step 1: 失敗するテストを書く**

`src/components/__tests__/LabeledField.test.tsx` に追加する:

```typescript
it("ラベルの横に飾りを置ける", () => {
  render(
    <LabeledField label="通知" labelAdornment={<span>BETA</span>}>
      {(id) => <input id={id} type="number" />}
    </LabeledField>,
  );

  expect(screen.getByText("BETA")).toBeInTheDocument();
});

it("飾りを置いてもラベルと入力欄の紐付けは保たれる", () => {
  // 飾りのぶんだけ構造が変わっても、ラベルで入力欄を引けること
  render(
    <LabeledField label="通知" labelAdornment={<span>BETA</span>}>
      {(id) => <input id={id} type="number" />}
    </LabeledField>,
  );

  const input = screen.getByLabelText("通知");
  expect(screen.getByText("通知")).toHaveAttribute("for", input.id);
});

it("飾りはアクセシブル名に混ざらない", () => {
  // バッジの文字までラベルとして読み上げると、項目名が濁る
  render(
    <LabeledField label="通知" labelAdornment={<span>BETA</span>}>
      {(id) => <input id={id} type="number" />}
    </LabeledField>,
  );

  expect(screen.getByLabelText("通知")).toBeInTheDocument();
  expect(screen.queryByLabelText("通知 BETA")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/components/__tests__/LabeledField.test.tsx`
Expected: `labelAdornment` が未対応のため「ラベルの横に飾りを置ける」で FAIL

- [ ] **Step 3: 実装する**

`src/components/LabeledField.tsx` を変更する。飾りがあるときだけラベルを横並びの行で包む:

```tsx
type LabeledFieldProps = {
  label: string;
  /** 受け取った id を入力欄に付けること。ラベルとの紐付けに使う */
  children: (inputId: string) => ReactNode;
  labelClassName?: string;
  /** ラベルの右に置くバッジなど。アクセシブル名には含めない */
  labelAdornment?: ReactNode;
};
```

本体では、`labelAdornment` があるときにラベルと飾りを `<div className="flex items-center gap-2 mb-1">` で包む。`<label>` 自体は飾りを含めない（含めると読み上げ名にバッジの文字が混ざる）。

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/components/__tests__/LabeledField.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: `RoutineFormOptionalFields.tsx` を `LabeledField` に寄せる**

通知欄の `useId` 直書きと手書きの `<label htmlFor>` を、`labelAdornment` を使った `LabeledField` に置き換える。`useId` の import と `notificationInputId` の宣言を削除する。

- [ ] **Step 6: 既存テストが通ることを確認する**

Run: `npm test`
Expected: 全件 PASS

- [ ] **Step 7: mutation で確認する**

1. `labelAdornment` を描画しないようにする → 「ラベルの横に飾りを置ける」が落ちること
2. `<label>` の中に飾りを入れる → 「飾りはアクセシブル名に混ざらない」が落ちること

いずれも確認後に必ず元へ戻す。

- [ ] **Step 8: 実ブラウザで確認する**

`npm run dev` で起動し、ルーティン作成フォームで以下を確認する:

1. 通知欄のラベル横に BETA バッジが元どおり出ていること
2. 名前の無い操作要素が 0 件のままであること（`document.querySelectorAll` でアクセシブル名の空を数える）

- [ ] **Step 9: 変更内容を報告する（コミットはしない）**

---

### Task 2: Service Worker の登録と通知スケジュールを分ける

**問題:** `pwaInstallerActions.ts` が「Service Worker の登録」と「ルーティン通知のスケジュール」という無関係な 2 つを持っている。2 つの export はそれぞれ別のフックからしか使われておらず、同居する理由がない。さらに `registerMessagingServiceWorkerOnce` は FCM 以外（アプリ本体の SW）も登録するようになったため名前が実態と合っておらず、`resetServiceWorkerRegisterPromiseForTest` は利用者ゼロの素通しになっている。

**Files:**
- Create: `src/hooks/routineNotificationScheduling.ts`
- Create: `src/hooks/__tests__/routineNotificationScheduling.test.ts`
- Delete: `src/hooks/pwaInstallerActions.ts`
- Modify: `src/hooks/serviceWorkerRegistration.ts`（環境判定の受け入れ）
- Modify: `src/hooks/useMessagingServiceWorkerRegistration.ts`
- Modify: `src/hooks/useRoutineNotificationScheduling.ts`
- Modify: `src/hooks/__tests__/useMessagingServiceWorkerRegistration.test.tsx`
- Modify: `src/hooks/__tests__/useRoutineNotificationScheduling.test.tsx`

**Interfaces:**
- Produces: `registerAppServiceWorkers(): Promise<void>`（`serviceWorkerRegistration.ts` に置く。環境判定を内側に閉じる）
- Produces: `scheduleRoutineNotificationsIfPermitted(): Promise<void>`（`routineNotificationScheduling.ts` へ移設。名前と中身は変えない）
- 削除: `registerMessagingServiceWorkerOnce` / `resetServiceWorkerRegisterPromiseForTest`

- [ ] **Step 1: 通知スケジュールのテストを新設する**

`src/hooks/__tests__/routineNotificationScheduling.test.ts` を作成する。移設先が同じ振る舞いであることを固定する:

```typescript
import { scheduleRoutineNotificationsIfPermitted } from "../routineNotificationScheduling";
import {
  createNotificationSchedules,
  hasNotificationPermission,
  scheduleNotifications,
} from "@/features/notification";
import { getRoutines } from "@/lib/storage";

jest.mock("@/features/notification", () => ({
  createNotificationSchedules: jest.fn(),
  hasNotificationPermission: jest.fn(),
  scheduleNotifications: jest.fn(),
}));
jest.mock("@/lib/storage", () => ({ getRoutines: jest.fn() }));

const mockHasPermission = hasNotificationPermission as jest.Mock;
const mockCreate = createNotificationSchedules as jest.Mock;
const mockSchedule = scheduleNotifications as jest.Mock;
const mockGetRoutines = getRoutines as jest.Mock;

describe("scheduleRoutineNotificationsIfPermitted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRoutines.mockReturnValue([]);
  });

  it("許可が無ければ何もしない", async () => {
    mockHasPermission.mockReturnValue(false);

    await scheduleRoutineNotificationsIfPermitted();

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("許可があれば保存済みルーティンから予定を作って登録する", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetRoutines.mockReturnValue([{ id: "r1" }]);
    mockCreate.mockReturnValue([{ id: "s1" }]);

    await scheduleRoutineNotificationsIfPermitted();

    expect(mockCreate).toHaveBeenCalledWith([{ id: "r1" }]);
    expect(mockSchedule).toHaveBeenCalledWith([{ id: "s1" }]);
  });

  it("予定が0件なら登録しない", async () => {
    // 空配列を送ると、Service Worker 側で登録済みの予定を消してしまう
    mockHasPermission.mockReturnValue(true);
    mockCreate.mockReturnValue([]);

    await scheduleRoutineNotificationsIfPermitted();

    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/hooks/__tests__/routineNotificationScheduling.test.ts`
Expected: `Cannot find module '../routineNotificationScheduling'` で FAIL

- [ ] **Step 3: 通知スケジュールを移設する**

`src/hooks/routineNotificationScheduling.ts` を作成し、`pwaInstallerActions.ts` の `scheduleRoutineNotificationsIfPermitted` をそのまま移す（中身は変えない）。

- [ ] **Step 4: 登録側に環境判定を寄せる**

`src/hooks/serviceWorkerRegistration.ts` に、環境判定を内側に閉じた入口を足す:

```typescript
/**
 * アプリ本体の Service Worker は本番ビルドでしか生成されない
 * （next.config.ts の InjectManifest が `!dev` のときだけ動く）。
 * 開発中に登録すると、前回のビルドで残った古い sw.js が存在しないチャンクを
 * 先読みしてしまうため、本番だけで有効にする。
 */
export const registerAppServiceWorkers = (): Promise<void> =>
  registerServiceWorkers({
    enableAppShell: process.env.NODE_ENV === "production",
  });
```

既存の `registerServiceWorkers` は引数で切り替えられるまま残す（テストから環境変数に触らず両方の分岐を確かめられるため）。

- [ ] **Step 5: 呼び出し側を差し替え、`pwaInstallerActions.ts` を削除する**

- `useMessagingServiceWorkerRegistration.ts`: `registerMessagingServiceWorkerOnce` → `registerAppServiceWorkers`（import 元も変更）
- `useRoutineNotificationScheduling.ts`: import 元を `./routineNotificationScheduling` へ
- 各フックのテストの `jest.mock` 対象パスも合わせて変更する
- `src/hooks/pwaInstallerActions.ts` を削除する

**注意:** `useMessagingServiceWorkerRegistration` というフック名も FCM 専用に見えるが、フック名の変更は呼び出し側（`usePWAInstaller`）とそのテストにも波及する。今回は import 先と関数名だけを実態に合わせ、フック名の変更は行わない（差分を必要以上に広げないため）。

- [ ] **Step 6: 参照が残っていないことを確認する**

Run: `grep -rn "pwaInstallerActions\|registerMessagingServiceWorkerOnce\|resetServiceWorkerRegisterPromiseForTest" src`
Expected: 出力なし

- [ ] **Step 7: テストが通ることを確認する**

Run: `npm test`
Expected: 全件 PASS

- [ ] **Step 8: mutation で確認する**

1. `registerAppServiceWorkers` の `enableAppShell` を常に `false` にする → `serviceWorkerRegistration.test.ts` の登録テスト、またはフックのテストが落ちること
2. `scheduleRoutineNotificationsIfPermitted` の許可チェックを外す → 新テストの「許可が無ければ何もしない」が落ちること

いずれも確認後に必ず元へ戻す。

- [ ] **Step 9: 本番ビルドでオフラインが壊れていないことを確認する**

Run: `npm run build`
Run: `npx next start -p 3100`（`NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true`）

実ブラウザで以下を確認する:

1. `/sw.js`（スコープ `/`）と `/firebase-messaging-sw.js`（FCM 専用スコープ）の 2 つが登録されること
2. `navigator.serviceWorker.controller` が `/sw.js` であること
3. 初回訪問のあと機内モードにしてリロードし、アプリが表示されること

- [ ] **Step 10: 変更内容を報告する（コミットはしない）**

---

### Task 3: 時刻フィールドから重複警告の描画を切り出す

**問題:** `RoutineFormTimeFields.tsx` が「開始時間の入力」「所要時間の入力」に加えて「重複しているルーティンの一覧表示」まで抱えている。警告の見せ方を変えたいときと、入力欄の並びを変えたいときで、同じファイルを触ることになる。

**Files:**
- Create: `src/features/routine/components/RoutineTimeConflictWarning.tsx`
- Create: `src/features/routine/components/__tests__/RoutineTimeConflictWarning.test.tsx`
- Modify: `src/features/routine/components/RoutineFormTimeFields.tsx`

**Interfaces:**
- Consumes: `conflictInfo`（`RoutineFormTimeFields` の props と同じ型）、`formatConflictRoutineLabel`
- Produces: `RoutineTimeConflictWarning` コンポーネント

- [ ] **Step 1: 既存の型と文言を確認する**

Run: `grep -n "conflictInfo\|ConflictInfo" src/features/routine/components/RoutineFormTimeFields.tsx`

`conflictInfo` の型（`hasConflict` と `conflictingRoutines`）を確認し、切り出し先の props に使う。型が別ファイルで定義されているならそれを import する。

- [ ] **Step 2: 失敗するテストを書く**

`src/features/routine/components/__tests__/RoutineTimeConflictWarning.test.tsx` を作成する:

```typescript
import { render, screen } from "@testing-library/react";
import { RoutineTimeConflictWarning } from "../RoutineTimeConflictWarning";

const routine = {
  id: "r1",
  title: "朝食",
  startTime: "07:00",
  duration: 30,
  category: "life" as const,
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("RoutineTimeConflictWarning", () => {
  it("重複が無ければ何も表示しない", () => {
    const { container } = render(
      <RoutineTimeConflictWarning
        conflictInfo={{ hasConflict: false, conflictingRoutines: [] }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("重複しているルーティンを一覧で表示する", () => {
    render(
      <RoutineTimeConflictWarning
        conflictInfo={{
          hasConflict: true,
          conflictingRoutines: [{ routine, commonDays: [1] }],
        }}
      />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText(/朝食/)).toBeInTheDocument();
  });

  it("重複が複数あれば件数分の項目を出す", () => {
    render(
      <RoutineTimeConflictWarning
        conflictInfo={{
          hasConflict: true,
          conflictingRoutines: [
            { routine, commonDays: [1] },
            { routine: { ...routine, id: "r2", title: "運動" }, commonDays: [2] },
          ],
        }}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
```

- [ ] **Step 3: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/components/__tests__/RoutineTimeConflictWarning.test.tsx`
Expected: `Cannot find module '../RoutineTimeConflictWarning'` で FAIL

- [ ] **Step 4: コンポーネントを切り出す**

`RoutineFormTimeFields.tsx` の開始時間側にある警告ブロック（`conflictInfo.hasConflict && (...)` の `<div>` 一式）をそのまま新ファイルへ移す。`hasConflict` が false のときは `null` を返す。文言定数（`ROUTINE_FORM_CONFLICT_TITLE`）と `formatConflictRoutineLabel` の import も移す。

- [ ] **Step 5: `RoutineFormTimeFields.tsx` を差し替える**

開始時間の `LabeledField` の中を、入力欄と `<RoutineTimeConflictWarning conflictInfo={conflictInfo} />` の 2 つにする。不要になった import（`ROUTINE_FORM_CONFLICT_TITLE`、`formatConflictRoutineLabel`）を削除する。

所要時間側の 1 行の警告（`ROUTINE_FORM_DURATION_CONFLICT_LABEL`）は所要時間の説明に付随するものなのでそのまま残す。

- [ ] **Step 6: 既存テストが通ることを確認する**

Run: `npm test`
Expected: 全件 PASS。特に `RoutineForm` 系の既存テストが変更なしで通ること

- [ ] **Step 7: mutation で確認する**

1. `hasConflict` が false でも一覧を描く → 「重複が無ければ何も表示しない」が落ちること
2. `conflictingRoutines` の先頭 1 件だけ描く → 「件数分の項目を出す」が落ちること

いずれも確認後に必ず元へ戻す。

- [ ] **Step 8: 変更内容を報告する（コミットはしない）**

---

### Task 4: FCM 登録の取得を FCM 側へ寄せるか判断する

**問題:** `serviceWorkerRegistration.ts` が「登録する」ことに加えて「FCM の登録を引く」という取得の役割も持っている。後者の利用者は `messaging.ts` だけ。

**調査結果（プラン作成時に確認済み）:** `FCM_SW_SCOPE` の参照は `serviceWorkerRegistration.ts` 自身とそのテストだけで、ほかの feature からは参照されていない。`getFcmServiceWorkerRegistration` の利用者は `messaging.ts` のみ。

**判断: 移動しない。** 取得だけを別ファイルへ移すと `FCM_SW_SCOPE` を export して 2 ファイルにまたがる形になり、「どのスコープに登録し、どのスコープから引くか」が離れて追いにくくなる。スコープという 1 つの知識に紐づく登録と取得は同居させたほうが変更理由がそろう。

代わりに、なぜ同居しているのかがファイルを開いた人に伝わるようにする。

- [ ] **Step 1: ファイル冒頭に意図を書く**

`src/hooks/serviceWorkerRegistration.ts` の先頭に、このファイルが持つ責務を 1 か所にまとめた説明を加える:

```typescript
/**
 * Service Worker をどのスコープに置くかを決め、登録と取得をまとめて扱う。
 *
 * 登録と取得を分けないのは、どちらも「どのスコープに置いたか」という同じ
 * 知識に依存するため。離すとスコープ定数だけが 2 ファイルにまたがり、
 * 置き場所を変えたときに片方だけ直す事故が起きる。
 */
```

- [ ] **Step 2: 変更が説明の追加だけであることを確認する**

Run: `npm test`
Expected: 全件 PASS（振る舞いは変わらない）

- [ ] **Step 3: 変更内容を報告する（コミットはしない）**

---

### Task 5: ボタン群の見出しを `<label>` から切り離す

**問題:** `RoutineFormCoreFields.tsx` のタイトル欄を `LabeledField` に寄せた一方で、曜日選択とカテゴリ選択の見出しは `<label>` のまま残った。どちらもボタンの集まりであって入力欄ではないため、`<label>` は何も指していない。実測でも支援技術に名前は届いていたが、内訳を見ると別々の理由だった:

- **曜日選択**: 直後の `<div>` に `role="group" aria-label={ROUTINE_FORM_DAYS_LABEL}` があり名前は届く。ただし見出しの `<label>` と `aria-label` に同じ文言が二重にあり、読み上げで同じ語が続く
- **カテゴリ選択**: グループに `role` も `aria-label` も無い。ボタン自体に絵文字とラベルの文字があるため個々の名前は届くが、「これはカテゴリを選ぶ集まり」という結び付きが無い

**方針:** 見出しは `<label>` をやめて `<p>` にし、`role="group"` の `aria-labelledby` でその見出しを指す。文言は 1 か所に置き、`aria-label` との二重掲載をやめる。

**Files:**
- Create: `src/components/FieldGroup.tsx`
- Create: `src/components/__tests__/FieldGroup.test.tsx`
- Modify: `src/components/index.ts`
- Modify: `src/features/routine/components/RoutineFormCoreFields.tsx`

**Interfaces:**
- Produces: `FieldGroup`（見出し付きのボタン群。`useId` で見出しと `role="group"` を `aria-labelledby` で結ぶ）

- [ ] **Step 1: 失敗するテストを書く**

`src/components/__tests__/FieldGroup.test.tsx` を作成する:

```typescript
import { render, screen } from "@testing-library/react";
import { FieldGroup } from "../FieldGroup";

describe("FieldGroup", () => {
  it("見出しの文字列でグループを引ける", () => {
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getByRole("group", { name: "カテゴリ" })).toBeInTheDocument();
  });

  it("見出しを label 要素にしない", () => {
    // 何も指していない <label> は、紐付いていない label を増やすだけになる
    const { container } = render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(container.querySelector("label")).toBeNull();
  });

  it("見出しの文言はひとつだけ置く", () => {
    // aria-label と見出しの両方に同じ文言を置くと、読み上げで同じ語が続く
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getAllByText("カテゴリ")).toHaveLength(1);
  });

  it("複数並べても見出しの id が衝突しない", () => {
    render(
      <>
        <FieldGroup label="1つ目">
          <button type="button">A</button>
        </FieldGroup>
        <FieldGroup label="2つ目">
          <button type="button">B</button>
        </FieldGroup>
      </>,
    );

    expect(screen.getByRole("group", { name: "1つ目" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "2つ目" })).toBeInTheDocument();
  });

  it("中のボタンをそのまま描く", () => {
    render(
      <FieldGroup label="カテゴリ">
        <button type="button">仕事</button>
        <button type="button">健康</button>
      </FieldGroup>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("グループの並びにクラスを渡せる", () => {
    render(
      <FieldGroup label="カテゴリ" groupClassName="grid grid-cols-3 gap-2">
        <button type="button">仕事</button>
      </FieldGroup>,
    );

    expect(screen.getByRole("group", { name: "カテゴリ" })).toHaveClass(
      "grid-cols-3",
    );
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/components/__tests__/FieldGroup.test.tsx`
Expected: `Cannot find module '../FieldGroup'` で FAIL

- [ ] **Step 3: 実装する**

`src/components/FieldGroup.tsx` を作成する:

```tsx
"use client";

import { useId, type ReactNode } from "react";

type FieldGroupProps = {
  label: string;
  children: ReactNode;
  labelClassName?: string;
  groupClassName?: string;
};

const DEFAULT_LABEL_CLASS_NAME =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

/**
 * 見出し付きのボタン群。曜日やカテゴリのように、入力欄ではなく選択肢が
 * 並ぶ場所で使う。
 *
 * 見出しは `<label>` にしない。label は入力欄を指すための要素で、指す先が
 * 無いまま置くと紐付いていない label が増えるだけになる。代わりに
 * `role="group"` から `aria-labelledby` で見出しを指し、文言は 1 か所に置く。
 */
export const FieldGroup = ({
  label,
  children,
  labelClassName,
  groupClassName,
}: FieldGroupProps) => {
  const labelId = useId();

  return (
    <div>
      <p id={labelId} className={labelClassName ?? DEFAULT_LABEL_CLASS_NAME}>
        {label}
      </p>
      <div role="group" aria-labelledby={labelId} className={groupClassName}>
        {children}
      </div>
    </div>
  );
};
```

`src/components/index.ts` に `export { FieldGroup } from "./FieldGroup";` を追加する。

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/components/__tests__/FieldGroup.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: `RoutineFormCoreFields.tsx` を差し替える**

曜日選択とカテゴリ選択の `<div>` + `<label>` + `<div>` を、それぞれ `FieldGroup` に置き換える。曜日側は既存の `role="group" aria-label={...}` を削除する（`FieldGroup` が `aria-labelledby` で担うため）。`groupClassName` にはそれぞれ元の `grid grid-cols-4 gap-2` / `grid grid-cols-3 gap-2` を渡す。

- [ ] **Step 6: 既存テストが通ることを確認する**

Run: `npm test`
Expected: 全件 PASS

- [ ] **Step 7: mutation で確認する**

1. `aria-labelledby` を外す → 「見出しの文字列でグループを引ける」が落ちること
2. 見出しを `<p>` から `<label>` に戻す → 「見出しを label 要素にしない」が落ちること

いずれも確認後に必ず元へ戻す。

- [ ] **Step 8: 実ブラウザで確認する**

`npm run dev` で起動し、ルーティン作成フォームで以下を確認する:

1. 曜日選択・カテゴリ選択の見出しと並びが元どおりに見えること
2. 名前の無い操作要素が 0 件のままであること
3. 何も指していない `<label>`（`htmlFor` を持たず、中に入力欄も持たない `<label>`）が 0 件であること

- [ ] **Step 9: 変更内容を報告する（コミットはしない）**

---

## 完了条件

- `LabeledField` が飾り付きラベルを扱え、`RoutineFormOptionalFields` から手書きの `useId` 紐付けが消えている
- `pwaInstallerActions.ts` が無くなり、Service Worker の登録と通知スケジュールが別ファイルに分かれている
- 利用者ゼロの `resetServiceWorkerRegisterPromiseForTest` が消えている
- `RoutineFormTimeFields` から重複警告の描画が切り出されている
- ボタン群の見出しが `<label>` でなくなり、`role="group"` から `aria-labelledby` で結ばれている。文言の二重掲載も解消されている
- 既存テストを 1 件も削らずに全件 green（`npm test`）
- E2E 全件 green（既知フレークの `data-transfer` を除く）
- `npm run lint` / `npm run typecheck` / `npm run build` / `npm run tailwind:scan` / `npx prettier --check`（変更ファイル）がクリーン
- 本番ビルドでオフライン動作が維持されている（実ブラウザで確認）
- 名前の無い操作要素が全画面 0 件のまま（実ブラウザで確認）

## 別途の申し送り（今回のスコープ外）

- `useMessagingServiceWorkerRegistration` というフック名が FCM 専用に見えるが、実態はアプリ本体の SW も登録する。名前の変更は `usePWAInstaller` とそのテストにも波及するため別途
- `src/features/statistics/page/components/StatisticsCategoryDetailList.tsx` に、`getCategoryInfo` を使わないインラインのカテゴリ解決が残っている（前ブランチからの申し送り）
- `getCategoryInfo` のフォールバックが `ROUTINE_CATEGORIES[5]` というマジックインデックスに依存している（前ブランチからの申し送り）
- Service Worker の更新検知（`updatefound` / 更新通知 UI）が無い。キャッシュが効くようになったため、古い版が残る余地が生まれている
