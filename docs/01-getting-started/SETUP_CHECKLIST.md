# セットアップチェックリスト

このチェックリストを使用して、プロジェクトのセットアップが完了しているか確認してください。

> 💡 詳細なセットアップ手順はリポジトリ直下の [README.md](../../README.md) を参照してください。初めて参加する場合は [新しく参加する開発者向けガイド](./ONBOARDING.md) から読むと全体を把握しやすくなります。

## ✅ 確認項目（新規環境用テンプレート）

自分の環境で進めたらチェックを付けてください。リポジトリには個人の完了状態をコミットしないでください。

- [ ] Node.js インストール（v22 または v24 LTS、リポジトリ推奨 `.nvmrc`: 24。`node -v` で確認）
- [ ] npm インストール（最新版を推奨。`npm -v` で確認）
- [ ] ルートディレクトリで `npm install` 実行
- [ ] `npm install --prefix firebase-functions` 実行
- [ ] （Firebase を使う場合）Firebase CLI インストールとログイン（`firebase --version` / `firebase login`）
- [ ] （Vercel にデプロイする場合）Vercel CLI インストールとログイン（`vercel --version` / `vercel login`）
- [ ] `.env.local` をリポジトリ直下に作成（既にある場合は上書きしない。`cp -n .env.local.example .env.local`）
- [ ] 次の **どちらか一方** だけを選ぶ（両方は不可。空キーと Firebase 記入は両立しない）
  - [ ] **最短経路:** `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true` にし、Firebase の apiKey / projectId / appId を空にする（[README の最短セットアップ](../../README.md#2-最短-firebase-なしで動かす)）
  - [ ] **Firebase 経路:** Firebase 設定情報を `.env.local` に追加（この場合ローカル認証フラグは不要／無視される）

## ⚠️ 要確認・設定

### 1. Firebase VAPID キーの設定（通知を使う場合のみ）

プッシュ通知を使うときだけ、`.env.local` の `NEXT_PUBLIC_FIREBASE_VAPID_KEY` を設定してください。ローカル認証のみの最短セットアップや、通知を使わない Firebase 経路では不要です。

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

Firebase をまだ用意していないローカル開発では、[README の最短セットアップ](../../README.md#2-最短-firebase-なしで動かす) に従ってローカル擬似認証を使えます。

注意点:

- 既定値は `false` のままです
- 有効になるのは次の 3 つがそろったときだけです: `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true`、Firebase 未設定（API キー・プロジェクト ID・アプリ ID のどれかが空）、ホスト名が `localhost` / `127.0.0.1` / `::1`。Firebase を設定済みなら、このフラグは無視されます
- `your-api-key` などのプレースホルダが残っていると Firebase 設定済みとみなされ、ローカル擬似認証は使われません
- `.env.local` は既にある場合は上書きしないでください（`cp -n`）
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

ルールの正本はリポジトリ直下の [`firestore.rules`](../../firestore.rules) です。Firebase Console に手で転記せず、次でデプロイしてください。

```bash
firebase deploy --only firestore:rules
```

概要（詳細・条件はファイルを参照）:

- `users/{userId}` と配下の `syncSnapshots` — 本人のみ読み書き
- `routines/{userId}` — 本人のみ読み書き
- `accounts/{accountId}` — 本人の読み取り・作成、管理者は全レコードの読み書き
- `bugReports/{reportId}` — 本人の作成・読み取りのみ（`status: pending` 固定）。更新・削除は Cloud Functions のみ
- `apiKeys/{keyHash}` — 本人の作成・読み取り・削除。更新は禁止
- その他は拒否

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
firebase deploy --only storage
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

**経路の見分け**

- **ローカル認証のみ:** `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true` とし、`NEXT_PUBLIC_FIREBASE_API_KEY` / `PROJECT_ID` / `APP_ID` は空のまま（他の Firebase キーも不要）
- **Firebase あり:** 下表の Firebase クライアントキーを設定。ローカル認証フラグは無視される

| 環境変数名                                 | 必須/任意                                                                 | 説明                                                                                                      | 設定例・既定値                                            |
| :----------------------------------------- | :------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| `NEXT_PUBLIC_ENABLE_LOCAL_AUTH`            | ローカル認証経路では必須（`true`）。Firebase 経路では任意（無視される） | Firebase 未設定かつ `localhost` / `127.0.0.1` / `::1` でのみ有効なローカル擬似認証フラグ                  | `false`（最短セットアップ時のみ `true`）                  |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase 経路で必須。ローカル認証経路では空                               | Firebase Web API キー                                                                                     | 実キー（example の `your-api-key` を残さない）            |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase 経路で必須                                                       | Firebase Authentication ドメイン                                                                          | `<project-id>.firebaseapp.com`                            |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase 経路で必須。ローカル認証経路では空                               | Firebase プロジェクト ID                                                                                  | `daily-routine-xxxx`                                      |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | 任意                                                                      | Cloud Storage バケット名                                                                                  | `<project-id>.appspot.com`                                |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 任意（通知を使う場合。Firebase Console の設定値として一緒に入れてよい）   | FCM 送信者 ID（プロジェクト番号）                                                                         | `123456789012`                                            |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase 経路で必須。ローカル認証経路では空                               | Firebase Web アプリ ID                                                                                    | `1:123456:web:abcdef`                                     |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`           | 任意（通知を使う場合）                                                    | Web Push (FCM) 通知用 VAPID 公開鍵                                                                        | `BEl62v...`                                               |
| `NEXT_PUBLIC_FUNCTIONS_URL`                | 任意                                                                      | Cloud Functions のベース URL（通知同期用）                                                                | `https://asia-northeast1-<project-id>.cloudfunctions.net` |
| `NEXT_PUBLIC_APP_VERSION`                  | 自動                                                                      | アプリケーションのバージョン（`next.config.ts` で `package.json` から自動注入）                           | `0.1.0`                                                   |
| `GITHUB_TOKEN`                             | Functions Secret                                                          | 不具合報告の GitHub Issue 自動起票用トークン                                                              | Secret Manager に登録                                     |
| `ANTHROPIC_API_KEY`                        | Functions Secret                                                          | 不具合報告の Issue を Claude で整形するための Anthropic API キー（使わない場合は `none`）                 | Secret Manager に登録                                     |
| `GITHUB_REPO`                              | Functions 文字列パラメータ                                                | 不具合報告の起票先 GitHub リポジトリ（デフォルト: `poteto317/daily-routine`）                             | firebase-functions/.env.<project-id> に設定               |

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

**最終更新日**: 2026年11月14日
