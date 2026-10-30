# セットアップチェックリスト

このチェックリストを使用して、プロジェクトのセットアップが完了しているか確認してください。

> 💡 詳細なセットアップ手順はリポジトリ直下の [README.md](../../README.md) を参照してください。初めて参加する場合は [新しく参加する開発者向けガイド](./ONBOARDING.md) から読むと全体を把握しやすくなります。

## ✅ 完了済み

- [x] Node.js インストール（v22 または v24 LTS、リポジトリ推奨 `.nvmrc`: 24）
- [x] npm インストール（11.6.2）
- [x] ルートディレクトリで `npm install` 実行
- [x] firebase-functions ディレクトリで `npm install` 実行
- [x] Firebase CLI インストール（15.5.1）
- [x] Firebase ログイン
- [x] Vercel CLI インストール（50.9.6）
- [x] Vercel ログイン
- [x] `.env.local` ファイル作成
- [x] Firebase 設定情報を `.env.local` に追加
- [ ] 必要な場合のみ `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true` を設定

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

### 開発用ローカル認証の扱い

Firebase をまだ用意していないローカル開発では、必要に応じて `.env.local` に `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true` を設定すると、ローカル擬似認証を使えます。

注意点:

- 既定値は `false` のままです
- 有効になるのは、Firebase が未設定（API キー・プロジェクト ID・アプリ ID のどれかが空）で、かつブラウザのホスト名が `localhost` / `127.0.0.1` / `::1` のときだけです。Firebase を設定済みなら、このフラグは無視されます
- 判定は `NODE_ENV` ではなくホスト名で行うため、本番ビルド（`npm start`）でも localhost で開けば有効になります（公開 URL からは有効になりません）
- shared 開発環境、staging、プレビュー環境では有効化しないでください
- Firebase 認証や Firestore 連携の本番同等確認をしたい場合は、このフラグを使わず Firebase 設定を行ってください

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

Firebase Console → Firestore Database → ルール（リポジトリの `firestore.rules` と同等）：

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

    // AI エージェント向け API キー: ドキュメント ID はキーの SHA-256 ハッシュ
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

Cloud Functions は Node.js 24 環境で以下の 5 つの関数をエクスポートします：

- `syncRoutines`: ルーティン通知用同期 (HTTP)
- `checkNotifications`: 通知チェックスケジューラー (Pub/Sub)
- `cleanupNotifications`: 通知クリーンアップスケジューラー (Pub/Sub)
- `onBugReportCreated`: 不具合報告 GitHub Issue 自動起票 (Firestore トリガー)
- `agentApi`: AI エージェント向け CRUD REST API (HTTP)

Cloud Functions をデプロイする場合は、事前に Secret の設定が必須です。`onBugReportCreated` も一緒にデプロイされるため、不具合報告機能を使うかどうかに関わらず必要になります。Claude を使わない場合は `ANTHROPIC_API_KEY` に `none` を登録します（詳細は `docs/02-development/bug-report-secrets-config.md` 参照）：

```bash
firebase functions:secrets:set GITHUB_TOKEN
# Claude による Issue の整形に使う Anthropic の API キー（使わない場合は値に none を登録）
firebase functions:secrets:set ANTHROPIC_API_KEY

# 任意の起票先は firebase-functions/.env.<project-id> に以下を記載
# GITHUB_REPO=owner/repo（未指定時: poteto317/daily-routine）
```

ビルドとデプロイ：

```bash
cd firebase-functions
npm run build
cd ..
firebase deploy --only functions
firebase deploy --only firestore:rules
```

デプロイ後、Functions の URL が表示されるので、`.env.local` の `NEXT_PUBLIC_FUNCTIONS_URL` を更新してください。

### Vercel へのデプロイ

```bash
# 初回デプロイ（プロジェクト設定）
vercel

# 本番デプロイ
vercel --prod
```

Vercel で本番運用する場合は、`.env.local` に設定した Firebase 関連の環境変数を Vercel プロジェクト側にも設定してください。

### 環境変数一覧リファレンス

`.env.local` および本番環境で利用される環境変数の一覧です。

| 環境変数名                                 | 必須/任意                  | 説明                                                                                      | 設定例・既定値                                            |
| :----------------------------------------- | :------------------------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| `NEXT_PUBLIC_ENABLE_LOCAL_AUTH`            | 任意                       | Firebase未設定環境での開発用ローカル擬似認証フラグ。`localhost` でのみ有効                | `false`（開発時のみ `true`）                              |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | 必須                       | Firebase Web API キー                                                                     | `your-api-key`                                               |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | 必須                       | Firebase Authentication ドメイン                                                          | `<project-id>.firebaseapp.com`                            |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | 必須                       | Firebase プロジェクト ID                                                                  | `daily-routine-xxxx`                                      |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | 任意                       | Cloud Storage バケット名                                                                  | `<project-id>.appspot.com`                                |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 必須                       | FCM 送信者 ID（プロジェクト番号）                                                         | `123456789012`                                            |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | 必須                       | Firebase Web アプリ ID                                                                    | `1:123456:web:abcdef`                                     |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`           | 任意                       | Web Push (FCM) 通知用 VAPID 公開鍵                                                        | `BEl62v...`                                               |
| `NEXT_PUBLIC_FUNCTIONS_URL`                | 任意                       | Cloud Functions のベース URL（通知同期用）                                                | `https://asia-northeast1-<project-id>.cloudfunctions.net` |
| `NEXT_PUBLIC_APP_VERSION`                  | 自動                       | アプリケーションのバージョン（`next.config.ts` で `package.json` から自動注入）           | `0.1.0`                                                   |
| `GITHUB_TOKEN`                             | Functions Secret           | 不具合報告の GitHub Issue 自動起票用トークン                                              | Secret Manager に登録                                     |
| `ANTHROPIC_API_KEY`                        | Functions Secret           | 不具合報告の Issue を Claude で整形するための Anthropic API キー（使わない場合は `none`） | Secret Manager に登録                                     |
| `GITHUB_REPO`                              | Functions 文字列パラメータ | 不具合報告の起票先 GitHub リポジトリ（デフォルト: `poteto317/daily-routine`）             | firebase-functions/.env.<project-id> に設定               |

設定方法:

- Vercel Dashboard: Project Settings → Environment Variables から追加
- Vercel CLI: `vercel env add <環境変数名>` で追加

---

## 📖 関連ドキュメント

- [実装機能一覧](../04-reference/features.md) - 全機能の詳細仕様
- [クラウド同期セットアップ](./SYNC_SETUP.md) - Firestore同期の設定方法
- [システムアーキテクチャ設計](../02-development/architecture.md) - 全体構成とデータフロー
- [開発ガイドライン](../02-development/) - コーディング規約
- [テストガイド](../03-testing/) - テスト方法

---

[📖 ドキュメントトップに戻る](../)

---

**最終更新日**: 2026年10月10日
