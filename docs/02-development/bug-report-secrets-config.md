# 不具合報告機能 — Secret / 環境変数 設定リファレンス

不具合報告機能（[bug-report-feature-plan.md](./bug-report-feature-plan.md)）で使用する
秘密情報・環境変数の定義方針と設定手順をまとめる。

> **重要（リポジトリ規約）**: GitHub トークンや AI API キーなどの秘密情報は
> **ソースコードへ絶対にコミットしない**。すべて Firebase Secret Manager で管理する。

---

## 1. 一覧

| 名前                | 種別                  | 用途                                                                 | 使用フェーズ |
| ------------------- | --------------------- | -------------------------------------------------------------------- | ------------ |
| `GITHUB_TOKEN`      | Secret                | GitHub Issue 作成（fetch）                                           | Phase 2〜    |
| `GITHUB_REPO`       | 環境変数 / パラメータ | Issue 作成先リポジトリ `owner/repo`（例: `poteto317/daily-routine`） | Phase 2〜    |
| `ANTHROPIC_API_KEY` | Secret                | Claude API による Issue のタイトル・本文の整形（`none` で無効化）    | Phase 3〜    |

- 整形に使うモデルは `claude-opus-5-5` でコードに固定している（`draftIssueWithClaude.ts`）。
- 月の利用上限は Anthropic Console のワークスペースの利用上限で設定する。上限超過などで Claude API が失敗した場合は、従来の内容で Issue を作成する。

- **Secret**: 値が機密。Firebase Secret Manager（`defineSecret`）で管理。
- **環境変数 / パラメータ**: 機密でない設定値。`defineString` などのパラメータ、
  または関数の `process.env`（`.env` ファイル）で管理してよい。

---

## 2. GitHub 認証情報の方針

- **最小権限**: Fine-grained Personal Access Token もしくは GitHub App を使用し、
  対象リポジトリに対して **Issues: Read and write** のみ許可する。
  （Contents / PR などの権限は付与しない。添付画像は Firebase Storage に保存し、ダウンロードトークン付き URL を Issue 本文に埋め込むため、GitHub PAT の権限変更は不要。）
- 失効・ローテーションを想定し、コード側はトークンを直接参照せず
  Secret 経由でのみ取得する。

---

## 3. 設定手順（Cloud Functions / Firebase Secret Manager / Firebase Storage）

### 3.1 Secret の登録

```bash
# GitHub トークン（Phase 2 以降）
firebase functions:secrets:set GITHUB_TOKEN

# Claude API キー（Phase 3 以降。デプロイ前に必ず登録する。使わない場合は none を登録）
firebase functions:secrets:set ANTHROPIC_API_KEY
```

実行するとプロンプトに値の入力を求められる（履歴やソースに残さない）。

### 3.2 関数コードでの宣言（参考・Phase 2〜3 で実装）

```ts
import { defineSecret, defineString } from "firebase-functions/params";

const githubToken = defineSecret("GITHUB_TOKEN");
const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");
const githubRepo = defineString("GITHUB_REPO", {
  default: "poteto317/daily-routine",
});

export const onBugReportCreated = onDocumentCreated(
  {
    document: "bugReports/{reportId}",
    region: "asia-northeast1",
    // Claude 最大 45 秒（画像つきの失敗後に画像なしで再整形して最大 45 秒）
    // + GitHub 最大 30 秒 + 画像の取得・Firestore の読み書きが収まる長さ
    timeoutSeconds: 180,
    memory: "512MiB",
    secrets: [githubToken, anthropicApiKey],
  },
  async (event) => {
    const token = githubToken.value();
    const repo = githubRepo.value();
    // ... 画像解決・Claude 整形・fetch で GitHub REST API を呼び出し Issue 作成
  },
);
```

### 3.3 Firebase Storage の有効化とルールのデプロイ

添付画像の保存には Firebase Storage の既定バケットを使用する。

1. Firebase コンソール（Blaze プランが必要）の「Storage」から既定バケットを作成・有効化する。
   - クライアントの `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` は既存の環境変数設定をそのまま使用する。
   - Cloud Functions の実行サービスアカウントは同一プロジェクトの既定バケットを読み書きできる。
2. Storage ルール（`storage.rules`）、Firestore ルール（`firestore.rules`）、および Functions をデプロイする。

```bash
firebase deploy --only storage,firestore:rules,functions
```

- Secret を新規追加・更新した場合は、その Secret を使う関数の再デプロイが必要。
- **ダウンロードトークン URL の性質**: Functions（Admin SDK）が `firebaseStorageDownloadTokens` に UUID トークンを設定し、`https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedPath>?alt=media&token=<token>` 形式の URL を GitHub Issue 本文の `## スクリーンショット` 節に埋め込む。`storage.rules` では `allow read: if false` としているが、ダウンロードトークン付き URL は推測不可能なトークン自体が認可として機能するため、URL を知る人（Issue の閲覧権限を持つメンバーや GitHub の画像プロキシ）は画像を閲覧できる。

---

## 4. ローカル開発 / エミュレータ

- エミュレータでは `firebase-functions/.secret.local` に `GITHUB_TOKEN=...` の形式で記載するか、`functions:secrets:access` を利用する。
  `firebase-functions/.gitignore` に `*.local` が含まれているため `.secret.local` は追跡対象外だが、
  ルート `.gitignore` には含まれないので `firebase-functions/` 直下への配置を徹底すること。
- エミュレータでは `.secret.local` に `ANTHROPIC_API_KEY=none` も記載する（記載が無いと Secret Manager の本番の値が使われ、ローカルの動作確認でも Claude API が呼ばれて課金されうる）。実 API で試すときだけ実キーにする。
- 実際の GitHub への Issue 作成を避けたい場合は、テスト用リポジトリを `GITHUB_REPO`
  に指定するか、`createGithubIssue` をモックする。

> `.gitignore` に Secret を含むローカルファイル（`.env*`, `.secret.local` 等）が
> 含まれていることを Phase 2 着手時に確認する。

---

## 5. 関連

- 機能全体プラン: [bug-report-feature-plan.md](./bug-report-feature-plan.md)
- Firestore ルール: リポジトリルート `firestore.rules` の `bugReports` セクション
- Storage ルール: リポジトリルート `storage.rules` の `bugReports/{uid}/{reportId}/{fileName}` セクション

## 6. 起票先の変更

`GITHUB_REPO` は `defineString` の通常パラメータです。Secret として登録しても、この関数の起票先には反映されません（PR #181で関連ガイドの誤記を修正）。

対象のFirebaseプロジェクトIDに合わせて、`firebase-functions/.env.<project-id>` に次を記載し、関数を再デプロイします。既存ファイルがある場合は他の設定を保持して追記・更新してください。

```dotenv
GITHUB_REPO=owner/repository
```

```bash
firebase deploy --only functions:onBugReportCreated --project <project-id>
```

未指定時は `poteto317/daily-routine` を使用します。ローカルエミュレータ用の上書きは `firebase-functions/.env.local` に記載します。`GITHUB_TOKEN` は引き続きSecretとして設定し、通常の環境変数ファイルには記載しません。環境変数ファイルはコミットしません。

ユニットテストでは、実際の `githubRepo.value()` に環境変数を渡し、GitHub呼び出しをモックして起票先URLを確認します。実リポジトリへのIssue作成は行いません。
