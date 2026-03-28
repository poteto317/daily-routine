# クラウド同期セットアップガイド

Firebase Firestoreを使用したクラウド同期機能のセットアップ手順です。

## Firestoreセキュリティルール

Firebaseコンソールの「Firestore Database」→「ルール」タブで以下のルールを設定してください：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のドキュメントのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
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

---

## 📖 関連ドキュメント

- [セットアップチェックリスト](./SETUP_CHECKLIST.md) - 環境構築手順
- [機能リファレンス](../04-reference/features.md) - クラウド同期機能の詳細

---

[📖 ドキュメントトップに戻る](../)

---

**最終更新日**: 2026年2月17日

- ページをリロードしてください
- Firebaseの設定（API Key等）を確認してください

#### 通知が表示されない

- ブラウザの通知権限を確認してください
- 設定画面の通知テストを実行してください

## プロジェクト情報

### 現在のFirebaseプロジェクト

- **プロジェクトID**: `your-project-id`
- **プロジェクト番号**: `your-project-number`
- **リージョン**: asia-northeast1（東京）推奨

### 必要な Firebase サービス

1. **Firebase Authentication**
   - 匿名認証を有効化
   - Firebase Console → Authentication → Sign-in method → 匿名

2. **Firestore Database**
   - 本番モードで作成
   - セキュリティルールを上記のように設定
   - Firebase Console → Firestore Database

3. **Firebase Cloud Messaging (FCM)**
   - Webプッシュ通知用
   - VAPIDキーを生成して`.env.local`に設定
   - Firebase Console → Project Settings → Cloud Messaging

4. **Cloud Functions**
   - Blazeプラン（従量課金）が必要
   - Firebase Console → Functions

### 環境変数の確認

`.env.local`ファイルに以下が設定されているか確認：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=（生成したVAPIDキー）
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://asia-northeast1-your-project-id.cloudfunctions.net
```

`public/firebase-messaging-sw.js` は tracked file ではなく、`npm run dev` / `npm run build` / `npm start` の実行時に `.env.local` から自動生成されます。
通知機能を使う場合は、上記の Firebase 環境変数を事前に設定してください。
