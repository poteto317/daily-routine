# クラウド同期セットアップガイド

Firebase Firestoreを使用したクラウド同期機能のセットアップ手順です。

## Firestoreセキュリティルール

Firebaseコンソールの「Firestore Database」→「ルール」タブで以下のルールを設定してください：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーデータ: 認証済みユーザーは自分のデータのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /syncSnapshots/{snapshotId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // ルーティンデータ: 認証済みユーザーは自分のデータのみ読み書き可能
    match /routines/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // アカウント管理: 自分のレコードは読み取り可能、管理者は全レコードの読み書き可能
    match /accounts/{accountId} {
      // 自分のアカウント情報は読み取り可能（管理者チェック用）
      allow read: if request.auth != null && request.auth.uid == accountId;
      // 自分のアカウント情報の作成（初回ログイン時）
      allow create: if request.auth != null && request.auth.uid == accountId;
      // 管理者は全アカウントの読み書き可能
      allow read, write: if request.auth != null
        && exists(/databases/$(database)/documents/accounts/$(request.auth.uid))
        && get(/databases/$(database)/documents/accounts/$(request.auth.uid)).data.isAdmin == true;
    }

    // 不具合報告: クライアントは自分の uid の報告を作成・読み取りのみ可能（status: pending 固定）
    // update / delete は Cloud Functions (Admin SDK) のみ
    match /bugReports/{reportId} {
      allow read: if request.auth != null
        && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.status == "pending"
        && request.resource.data.description is string
        && request.resource.data.description.matches('[\\s\\S]*[^\\s][\\s\\S]*')
        && request.resource.data.description.size() <= 2000
        && (!('title' in request.resource.data) || (request.resource.data.title is string && request.resource.data.title.size() <= 100))
        && (!('stepsToReproduce' in request.resource.data) || (request.resource.data.stepsToReproduce is string && request.resource.data.stepsToReproduce.size() <= 2000))
        && (!('meta' in request.resource.data) || (
          request.resource.data.meta is map
          && request.resource.data.meta.keys().hasOnly(['appVersion', 'userAgent', 'url', 'locale', 'timezone', 'createdAtClient'])
          && request.resource.data.meta.appVersion is string && request.resource.data.meta.appVersion.size() <= 50
          && request.resource.data.meta.userAgent is string && request.resource.data.meta.userAgent.size() <= 500
          && request.resource.data.meta.url is string && request.resource.data.meta.url.size() <= 2000
          && request.resource.data.meta.locale is string && request.resource.data.meta.locale.size() <= 20
          && request.resource.data.meta.timezone is string && request.resource.data.meta.timezone.size() <= 50
          && request.resource.data.meta.createdAtClient is string && request.resource.data.meta.createdAtClient.size() <= 30
        ))
        && request.resource.data.createdAt == request.time
        && request.resource.data.updatedAt == request.time
        && request.resource.data.keys().hasOnly([
          "uid", "status", "description", "title", "stepsToReproduce", "meta", "createdAt", "updatedAt"
        ]);
      allow update, delete: if false;
    }

    // AI エージェント向け API キー: ドキュメント ID はキーの SHA-256 ハッシュ。
    // 自分の uid のキーのみ作成・読み取り・削除できる。更新は禁止（再発行は削除+作成）。
    // API 側（Cloud Functions / Admin SDK）はルールの対象外。
    match /apiKeys/{keyHash} {
      allow create: if request.auth != null
        && keyHash.matches('^[0-9a-f]{64}$')
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.createdAt == request.time
        && request.resource.data.keys().hasOnly(["uid", "createdAt"]);
      allow read, delete: if request.auth != null
        && resource.data.uid == request.auth.uid;
      allow update: if false;
    }

    // その他のドキュメントはデフォルトで拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Authentication設定

1. Firebaseコンソールで「Authentication」を開く
2. 「Sign-in method」タブで「匿名」を有効化する

## 実装内容

### 主な機能

1. **匿名認証**
   - アプリ起動時に自動的に匿名ユーザーとして認証
   - 各デバイスに一意のユーザーIDが割り当てられる

2. **手動同期**
   - 設定画面から手動でアップロード/ダウンロード
   - アップロード: ローカルデータをクラウドに保存
   - ダウンロード: クラウドのデータをローカルに取得

3. **リアルタイム変更検知**
   - Firestoreのリスナーで他の端末からの変更を検知
   - 変更があった場合は通知とステータス表示
   - 自分の端末からの変更は無視

4. **同期ステータス**
   - 同期中/完了/エラーの状態を表示
   - 最終同期時刻を記録
   - リモート変更の有無を表示

5. **同期履歴・スナップショット復元**
   - 直近最大5件のスナップショットを自動保存
   - メニュー「同期履歴管理」からスナップショット一覧を確認・ワンクリック復元可能

### データ構造

Firestore（`users/{userId}`）に保存されるデータ：

```typescript
{
  routines: Routine[],
  dailyProgress: DailyProgress,
  dailyHistory: Record<string, DailyHistory>,
  settings: AppSettings,
  budgetData: BudgetData,
  budgetCategories: BudgetCategory[],
  budgetIncomeItems: BudgetIncomeItem[],
  budgetExpenseItems: BudgetExpenseItem[],
  journalHistory: Record<string, JournalEntry>,
  mealHistory: Record<string, MealRecord[]>,
  weightHistory: Record<string, WeightRecord>,
  workoutRecordHistory: Record<string, WorkoutRecord[]>,
  workoutExercises: WorkoutExercise[],
  pomodoroHistory: Record<string, number>,
  workSessionHistory: Record<string, WorkSession[]>,
  workTemplates: WorkTemplate[],
  presets: RoutinePreset[],
  todoLists: TodoList[],
  todoCategories: TodoCategory[],
  lastModified: number,
  deviceId: string,
  updatedAt: Timestamp
}
```

### 使い方

#### 初めての端末でデータをアップロード

1. ルーティンを登録
2. 設定画面を開く
3. 「クラウドにアップロード」ボタンをクリック

#### 別の端末でデータをダウンロード

1. アプリを開く
2. 設定画面を開く
3. 「クラウドからダウンロード」ボタンをクリック
4. ページが自動的にリロードされ、データが反映される

#### 既存の端末で変更を同期

1. データを変更した端末で「クラウドにアップロード」
2. 他の端末で変更通知が表示される
3. 「クラウドからダウンロード」で最新データを取得

### 注意事項

- 同期は手動で行う必要があります（自動同期はありません）
- アップロード時はクラウドデータが更新され、直前までのデータは `syncSnapshots` に最大5件自動バックアップされます
- ダウンロード時は全上書きではなく、クラウドに存在しないフィールドの手元のデータは保持され、当日のチェック進捗（`dailyProgress`）も誤消失しないよう保護マージされます
- 匿名認証のため、アプリのキャッシュをクリアするとユーザーIDが変わります
- バックアップとして定期的に設定画面のエクスポート機能も併用することをおすすめします

### トラブルシューティング

#### 「リモートデータが見つかりません」エラー

- まだクラウドにデータがアップロードされていません
- まず「クラウドにアップロード」を実行してください

#### 同期中のままになる

- ページをリロードしてください
- ネットワーク接続を確認してください
- Firebase Consoleでプロジェクトの状態を確認してください

#### 通知が表示されない

- ブラウザの通知権限を確認してください
- 設定画面の通知テストを実行してください
- Firebaseの設定（API Key等）を確認してください

---

## 📖 関連ドキュメント

- [システムアーキテクチャ設計](../02-development/architecture.md) - 同期モデルとデータ保護設計
- [セットアップチェックリスト](./SETUP_CHECKLIST.md) - 環境構築手順
- [機能リファレンス](../04-reference/features.md) - クラウド同期機能の詳細

---

[📖 ドキュメントトップに戻る](../)
