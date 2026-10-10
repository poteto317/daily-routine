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

### データ構造

Firestoreに保存されるデータ：

```typescript
{
  routines: Routine[],
  dailyHistory: Record<string, DailyHistory>,
  settings: AppSettings,
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
- アップロード時は既存のクラウドデータが上書きされます
- ダウンロード時は既存のローカルデータが上書きされます
- 匿名認証のため、アプリのキャッシュをクリアするとユーザーIDが変わります
- バックアップとして定期的にエクスポート機能も併用することをおすすめします

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

- [セットアップチェックリスト](./SETUP_CHECKLIST.md) - 環境構築手順
- [機能リファレンス](../04-reference/features.md) - クラウド同期機能の詳細

---

[📖 ドキュメントトップに戻る](../)
