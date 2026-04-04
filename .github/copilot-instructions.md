# 共通ルール

- **すべての返答・コードレビューコメント・提案は必ず日本語で行うこと。** ただしコードブロック・技術固有名詞・ライブラリ名はそのまま英語表記でよい。
- コードの修正や提案を行った後は、必ずターミナルで `npm run verify` を実行して動作確認を行うようにしてください。
- 修正内容に自信がある場合でも、検証ステップを省略しないでください。
- **`git commit` や `git push` は絶対に自動実行しないでください。** コミット・プッシュは必ずユーザーが確認・承認した上で行います。ユーザーから明示的に指示がある場合のみ実行してください。

# Daily Routine App - 開発ガイドライン

このドキュメントは、AIアシスタントや開発者がこのプロジェクトで作業する際のルールと規約を定義します。

## プロジェクト概要

- **アプリ名**: デイリールーティン管理アプリ
- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **バックエンド**: Firebase (Firestore, Authentication, Cloud Functions, Cloud Messaging)
- **デプロイ**: Vercel (フロントエンド), Firebase (Cloud Functions)
- **デモ URL**: https://daily-routine-murex.vercel.app/

### 主な機能

1. **ルーティン管理**: 日々の習慣・タスクを曜日・時間で管理
2. **ポモドーロタイマー**: 作業時間を管理するタイマー
3. **統計・達成度**: カレンダー表示と達成率の可視化
4. **予算管理**: 月次予算と支出の記録
5. **食事記録**: 毎日の食事の記録
6. **体重記録**: 体重の推移を追跡
7. **勤務記録**: 労働時間の記録
8. **天気情報**: 天気情報の表示
9. **日記**: 日々の記録
10. **Todoリスト**: 複数のTodoリストを管理
11. **PWA対応**: オフライン動作、ホーム画面追加
12. **プリセット管理**: ルーティンプリセットの管理
13. **アカウント管理**: ユーザーアカウント管理（管理者向け）

---

## コーディングルール

### 1. ストレージアクセスの一元化

**必須**: LocalStorageへのアクセスは各機能モジュールの `storage.ts` を通して行う。

```typescript
// ✅ 正しい（ルーティン機能）
import { getRoutines, saveRoutines } from "@/features/routine/storage";
const routines = getRoutines();

// ✅ 正しい（設定機能）
import { getSettings, saveSettings } from "@/features/settings/storage";
const settings = getSettings();

// ❌ 間違い（直接アクセス禁止）
const routines = JSON.parse(localStorage.getItem("daily-routines") || "[]");
```

各機能モジュールの `storage.ts` にストレージ関数が定義されている。詳細は各 `storage.ts` を参照。

### 2. 型定義

すべての型は `src/types/routine/` ディレクトリに定義する（`index.ts` から一括エクスポート）。

主要な型の詳細は `src/types/routine/` 配下の各ファイルを参照。

### 3. 祝日・曜日判定

祝日や曜日に基づくルーティン表示判定は、共通関数を使用する:

```typescript
import {
  shouldShowRoutineForDate,
  shouldShowRoutineToday,
} from "@/features/routine/storage";

// 特定の日付で判定
const shouldShow = shouldShowRoutineForDate(routine, new Date("2024-01-01"));

// 今日で判定
const shouldShow = shouldShowRoutineToday(routine);
```

### 4. Firebase同期

ルーティンの追加・更新・削除時は自動的にFirebaseに同期される。

`features/routine/hooks/routinePersistenceSync.ts` の `saveAndSyncRoutines()` 関数が以下を行う:

1. LocalStorageに保存（`saveRoutines()`）
2. Firebaseに非同期で同期（`syncRoutinesToFirebase()`）

**手動同期**（ヘッダーの同期ボタンから）:

- `uploadToFirestore()` - ローカル → クラウド
- `downloadFromFirestore()` - クラウド → ローカル

同期機能は `features/sync/` モジュールで管理されている。

### 5. 通知システム

通知はService Workerで一元管理（Cloud Functionsの`checkNotifications`は無効化済み）。

```typescript
import { scheduleNotifications } from "@/features/notification";

await scheduleNotifications(schedules);
```

### 6. 認証システム

Firebase匿名認証を使用してユーザーを識別する。

```typescript
import { useAuth } from "@/features/auth";

const { user, loading, error, logout } = useAuth();

// ユーザーがログインしているか確認
if (user) {
  // ログイン済み
}
```

**AuthGuard**: 認証が必要なページは `AuthGuard` でラップする。

```tsx
import { AuthGuard } from "@/components/AuthGuard";

<AuthGuard>
  <ProtectedComponent />
</AuthGuard>;
```

### 7. コンポーネント設計

- **'use client'**: クライアントコンポーネントには必ず宣言
- **ダークモード対応**: Tailwindの `dark:` プレフィックスを使用
- **アクセシビリティ**: `aria-label` を適切に設定
- **React の `key`**: リストレンダリングでは表示文言（label）を `key` に使わない。`undefined` になり得る値には固定フォールバック文字列（例: `"__default__"`）を使い、安定した識別子を `key` にする。

```tsx
// ❌ 悪い例 — 文言変更や i18n 対応で key が変わり不要な再マウントが起きる
{
  items.map((item) => <button key={item.label} />);
}

// ✅ 良い例 — value は安定した識別子。undefined には固定フォールバックを使う
{
  items.map((item) => <button key={item.value ?? "__default__"} />);
}
```

```tsx
"use client";

export const MyComponent = () => {
  return (
    <div className="bg-white dark:bg-slate-100 text-gray-900 dark:text-black">
      {/* ... */}
    </div>
  );
};
```

### 8. テスト

- テストフレームワーク: Jest + React Testing Library
- テストファイルは各機能の `__tests__/` ディレクトリに配置
- ファイル名: `*.test.ts` または `*.test.tsx`

```bash
npm run test        # watchモード
npm run test:ci     # CI用（カバレッジ付き）
```

---

## 環境変数

`.env.local` に以下を設定:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
NEXT_PUBLIC_FUNCTIONS_URL=
```

---

## よくあるパターン

### ルーティンの追加

```typescript
import { useRoutines } from "@/features/routine";

const { addRoutine } = useRoutines();

addRoutine({
  title: "Morning Exercise",
  category: "health",
  startTime: "07:00",
  duration: 30,
  daysOfWeek: [1, 2, 3, 4, 5], // 月〜金
  isCompleted: false,
  sortOrder: 0,
});

// 祝日のみのルーティン
addRoutine({
  title: "Holiday Special",
  category: "hobby",
  startTime: "10:00",
  duration: 60,
  daysOfWeek: [7], // 祝日
  isCompleted: false,
  sortOrder: 1,
});
```

### 設定の変更

設定画面では変更が即時に自動保存される（保存ボタンは不要）。

`defaultNotificationMinutes` が `0` の場合は通知なしを意味する。

```typescript
import { getSettings, saveSettings } from "@/features/settings/storage";

const settings = getSettings();
saveSettings({ ...settings, theme: "dark" });
```

---

## アーキテクチャ原則

### Feature-based Architecture

このプロジェクトは機能ごとにモジュール化された **Feature-based Architecture** を採用しています。

各機能モジュール（`features/` 配下）は以下を含みます：

- **components/**: その機能固有のUIコンポーネント
- **storage.ts**: その機能のLocalStorage操作
- **hooks/**: その機能のカスタムフック（例: `useRoutines.ts`）
- **helpers.ts**: その機能のヘルパー関数
- **index.ts**: エクスポート定義
- \***\*tests**/\*\*: テスト

**メリット**:

- 機能ごとに独立しているため、変更の影響範囲が限定される
- コードの見通しが良い
- チーム開発で機能ごとに担当を分けやすい

### 共通モジュール

- **components/**: 複数の機能で使われる共通コンポーネント
- **hooks/**: 複数の機能で使われる共通カスタムフック
- **layouts/**: レイアウト関連のフック・コンポーネント
- **config/**: アプリ設定
- **services/**: 認証サービスなど
- **lib/**: Firebase初期化や祝日判定など、グローバルなユーティリティ

---

## 禁止事項

1. **直接のlocalStorageアクセス** - 必ず各機能の storage.ts の関数を使用
2. **機能間の直接的な依存** - 必ず各機能の index.ts を通して import
3. **重複した型定義** - types/routine/ に集約
4. **Cloud Functionsでの通知送信** - Service Workerで処理（checkNotificationsは無効化済み）
5. **isCompletedの永続化** - 一時的な状態なのでルーティンデータには保存しない
6. **`git commit` / `git push` の自動実行** - ユーザーの明示的な指示なしにコミット・プッシュを行わない

---

## デプロイ

```bash
# フロントエンド（Vercel）
vercel --prod

# Cloud Functions
firebase deploy --only functions
```

---

## 注意点

- **Node.js**: Cloud Functionsはv24を使用
- **PWA**: iOSではホーム画面に追加が必須
- **匿名認証**: ユーザーはFirebase匿名認証で識別され、デバイス間でルーティンを同期可能
- **Feature-based Architecture**: 新機能を追加する場合は `features/` 配下に新しいディレクトリを作成
- **ダークモード**: `dark:bg-slate-100` や `dark:text-black` などを使用してダークモード対応を維持
- **Firebase Messaging SW**: `public/firebase-messaging-sw.js` はビルド時に自動生成されるため直接編集しない。テンプレートは `public/firebase-messaging-sw.template.js` を編集する
- **ドキュメント更新の PR 方針**: 機能追加・修正と同じ PR にドキュメント更新（`docs/` 配下）を含めてよい。その場合、PR 説明にドキュメント変更の目的（例: 「仕様追記」「ストレージキー修正」など）を明記すること。ドキュメントのみの変更は専用の PR に分割することが望ましい。
