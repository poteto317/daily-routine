# セットアップチェックリスト

このチェックリストを使用して、プロジェクトのセットアップが完了しているか確認してください。

> 💡 詳細なセットアップ手順は [README.md](../README.md) を参照してください。

## ✅ 完了済み

- [x] Node.js インストール（v22.22.0）
- [x] npm インストール（11.6.2）
- [x] ルートディレクトリで `npm install` 実行
- [x] functions ディレクトリで `npm install` 実行
- [x] Firebase CLI インストール（15.5.1）
- [x] Firebase ログイン
- [x] Vercel CLI インストール（50.9.6）
- [x] Vercel ログイン
- [x] `.env.local` ファイル作成
- [x] Firebase 設定情報を `.env.local` に追加

## ⚠️ 要確認・設定

### 1. Firebase VAPID キーの設定

`.env.local` ファイルの `NEXT_PUBLIC_FIREBASE_VAPID_KEY` を設定する必要があります。

Firebase 用の service worker ファイル `public/firebase-messaging-sw.js` は、`npm run dev` / `npm run build` / `npm start` 実行時に `.env.local` から自動生成されます。

**設定方法:**

```bash
# CLIで取得（推奨）
firebase projects:webapp:sdkconfig --json
```

または Firebase Console から：

1. https://console.firebase.google.com/project/your-project-id/settings/cloudmessaging
2. 「ウェブプッシュ証明書」セクション
3. キーペアが未生成の場合は「キーペアを生成」
4. 生成されたキーを `.env.local` に追加

### 2. Firestore データベースの作成

Firebase Console で Firestore データベースを作成：

1. https://console.firebase.google.com/project/your-project-id/firestore
2. 「データベースを作成」をクリック
3. **本番モード**で開始
4. ロケーション: **asia-northeast1（東京）**

### 3. Firebase Authentication の有効化

Firebase Console で匿名認証を有効化：

1. https://console.firebase.google.com/project/your-project-id/authentication
2. 「Sign-in method」タブ
3. 「匿名」を有効化

### 4. Firestore セキュリティルールの設定

Firebase Console → Firestore Database → ルール：

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
      allow read: if request.auth != null && request.auth.uid == accountId;
      allow create: if request.auth != null && request.auth.uid == accountId;
      allow read, write: if request.auth != null
        && exists(/databases/$(database)/documents/accounts/$(request.auth.uid))
        && get(/databases/$(database)/documents/accounts/$(request.auth.uid)).data.isAdmin == true;
    }

    // その他のドキュメントはデフォルトで拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Firebase プランの確認

Cloud Functions を使用するため、**Blazeプラン（従量課金）**にアップグレードが必要：

1. https://console.firebase.google.com/project/your-project-id/usage
2. プランを Blaze にアップグレード（無料枠内でほぼ運用可能）

## 🚀 次のステップ

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### Cloud Functions のデプロイ

```bash
firebase deploy --only functions
```

デプロイ後、Functions の URL が表示されるので、`.env.local` の `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` を更新してください。

### Vercel へのデプロイ

```bash
# 初回デプロイ（プロジェクト設定）
vercel

# 本番デプロイ
vercel --prod
```

Vercel で本番運用する場合は、`.env.local` に設定した Firebase 関連の環境変数を Vercel プロジェクト側にも設定してください。

対象例:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL`

設定方法:

- Vercel Dashboard: Project Settings → Environment Variables から追加
- Vercel CLI: `vercel env add <環境変数名>` で追加

---

## 📖 関連ドキュメント

- [実装機能一覧](../04-reference/features.md) - 全機能の詳細仕様
- [クラウド同期セットアップ](./SYNC_SETUP.md) - Firestore同期の設定方法
- [開発ガイドライン](../02-development/) - コーディング規約
- [テストガイド](../03-testing/) - テスト方法

---

[📖 ドキュメントトップに戻る](../)

---

**最終更新日**: 2026年4月1日
