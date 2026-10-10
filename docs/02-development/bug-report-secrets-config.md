# 不具合報告機能 — Secret / 環境変数 設定リファレンス

不具合報告機能（[bug-report-feature-plan.md](./bug-report-feature-plan.md)）で使用する
秘密情報・環境変数の定義方針と設定手順をまとめる。

> **重要（リポジトリ規約）**: GitHub トークンや AI API キーなどの秘密情報は
> **ソースコードへ絶対にコミットしない**。すべて Firebase Secret Manager で管理する。

---

## 1. 一覧

| 名前           | 種別                          | 用途                                                                 | 使用フェーズ |
| -------------- | ----------------------------- | -------------------------------------------------------------------- | ------------ |
| `GITHUB_TOKEN` | Secret                        | GitHub Issue 作成（fetch）                                           | Phase 2〜    |
| `GITHUB_REPO`  | 環境変数 / パラメータ         | Issue 作成先リポジトリ `owner/repo`（例: `poteto317/daily-routine`） | Phase 2〜    |
| `AI_API_KEY`   | Secret                        | AI による本文整形                                                    | Phase 3〜    |
| `AI_MODEL`     | 環境変数 / パラメータ（任意） | 使用モデル名（プロバイダ確定後に指定）                               | Phase 3〜    |

- **Secret**: 値が機密。Firebase Secret Manager（`defineSecret`）で管理。
- **環境変数 / パラメータ**: 機密でない設定値。`defineString` などのパラメータ、
  または関数の `process.env`（`.env` ファイル）で管理してよい。

---

## 2. GitHub 認証情報の方針

- **最小権限**: Fine-grained Personal Access Token もしくは GitHub App を使用し、
  対象リポジトリに対して **Issues: Read and write** のみ許可する。
  （Contents / PR などの権限は付与しない。）
- 失効・ローテーションを想定し、コード側はトークンを直接参照せず
  Secret 経由でのみ取得する。

---

## 3. 設定手順（Cloud Functions / Firebase Secret Manager）

### 3.1 Secret の登録

```bash
# GitHub トークン（Phase 2 以降）
firebase functions:secrets:set GITHUB_TOKEN

# AI API キー（Phase 3 以降）
firebase functions:secrets:set AI_API_KEY
```

実行するとプロンプトに値の入力を求められる（履歴やソースに残さない）。

### 3.2 関数コードでの宣言（参考・Phase 2 で実装）

```ts
import { defineSecret, defineString } from "firebase-functions/params";

const githubToken = defineSecret("GITHUB_TOKEN");
const aiApiKey = defineSecret("AI_API_KEY");
const githubRepo = defineString("GITHUB_REPO", {
  default: "poteto317/daily-routine",
});

export const onBugReportCreated = onDocumentCreated(
  {
    document: "bugReports/{reportId}",
    region: "asia-northeast1",
    secrets: [githubToken /*, aiApiKey */],
  },
  async (event) => {
    const token = githubToken.value();
    const repo = githubRepo.value();
    // ... fetch で GitHub REST API を呼び出し Issue 作成（createGithubIssue）
  },
);
```

### 3.3 デプロイ

```bash
firebase deploy --only functions
```

- Secret を新規追加・更新した場合は、その Secret を使う関数の再デプロイが必要。

---

## 4. ローカル開発 / エミュレータ

- エミュレータでは `firebase-functions/.secret.local` に `GITHUB_TOKEN=...` の形式で記載するか、`functions:secrets:access` を利用する。
  `firebase-functions/.gitignore` に `*.local` が含まれているため `.secret.local` は追跡対象外だが、
  ルート `.gitignore` には含まれないので `firebase-functions/` 直下への配置を徹底すること。
- 実際の GitHub への Issue 作成を避けたい場合は、テスト用リポジトリを `GITHUB_REPO`
  に指定するか、`createGithubIssue` をモックする。

> `.gitignore` に Secret を含むローカルファイル（`.env*`, `.secret.local` 等）が
> 含まれていることを Phase 2 着手時に確認する。

---

## 5. 関連

- 機能全体プラン: [bug-report-feature-plan.md](./bug-report-feature-plan.md)
- Firestore ルール: リポジトリルート `firestore.rules` の `bugReports` セクション

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
