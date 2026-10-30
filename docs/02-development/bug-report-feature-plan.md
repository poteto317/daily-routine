# 不具合報告機能 段階導入プラン

## 目的・方針

アプリ利用者がアプリ内から不具合を報告でき、最終的に **AI が報告内容を整形した上で
GitHub Issue を自動作成する**までを段階的に実装する。

> **自動化のスコープ**: 「不具合報告 → GitHub Issue 作成」までを自動化する。
> **PR は対応時に作成**する（Issue へ Copilot コーディングエージェントをアサインするなど。
> 本プランの自動化対象外。将来フェーズとして道筋のみ記載）。

### 確定した方針（ユーザー合意済み）

| 項目             | 決定                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| 入口（UI）       | **設定画面内に「不具合を報告」セクションを追加**                                       |
| 報告データの扱い | **Firestore に保存** → Cloud Functions がそれを元に Issue 化（履歴・管理者確認が可能） |
| AI の関与        | **Issue 作成時に AI が本文を整形**（タイトル / 再現手順 / ラベル推定）してから作成     |
| 自動化の終点     | **GitHub Issue 作成まで**（PR は対応時に別途作成）                                     |

---

## 全体パイプライン（最終形）

```
[アプリ: 不具合を報告画面]
   │  ① 画像がある場合は Firebase Storage (bugReports/{uid}/{reportId}/{fileName}) に先行アップロード
   │  ② ユーザーが不具合を報告（説明＋再現手順＋画像参照＋自動収集メタ）
   ▼
[Firestore: bugReports/{id}]  status: "pending"
   │  ③ onDocumentCreated トリガ（Cloud Functions, asia-northeast1）
   ▼
[Cloud Functions]
   │  ④ 添付画像を Storage から取得・検証（サイズ・マジックナンバー判定・ダウンロードトークン URL 取得）
   │  ⑤ AI で本文整形（title / body(再現手順含む) / 添付画像も Claude に渡して状況把握）
   │  ⑥ GitHub REST API（fetch）で Issue 作成（本文にスクリーンショット節の URL を埋め込み）
   ▼
[GitHub: Issue 作成]  ← 自動化はここまで
   │  ⑦ issueNumber / issueUrl を Firestore に書き戻し  status: "issued"
   ▼
（対応時）Issue に対応 → 必要なら Copilot 等で PR 作成（手動トリガ・将来フェーズ）
```

---

## アーキテクチャ調査メモ（統合ポイント）

- **フロント**: Next.js 16 App Router / Feature-based Architecture（`src/features/<feature>/`）。
- **設定画面 / 独立ページ**: `src/features/bug-report/`（ヘッダーメニューから遷移する `BugReportPage`、および `BugReportSection`）。
- **Firebase**: 匿名認証（`useAuth` の `user.uid`）でユーザー識別。Firestore と Firebase Storage を利用。
  ルールは `firestore.rules` および `storage.rules`。
- **Cloud Functions**: `firebase-functions/src/` 配下。既存は `onRequest`
  （HTTPS, region `asia-northeast1`）。本機能は **Firestore トリガ**
  （`onDocumentCreated`）を新規採用する。
- **GitHub**: リポジトリ `poteto317/daily-routine`。Issue 作成には認証情報が必要
  （後述）。
- **アプリバージョン**: `package.json` の `version`（現状 `0.1.0`）をメタとして添付可能。

---

## データモデル（Firestore: `bugReports/{reportId}`）

```ts
type BugReportStatus = "pending" | "processing" | "issued" | "error";

type BugReportImage = {
  path: string; // "bugReports/{uid}/{reportId}/{fileName}"
  contentType: string; // "image/png" | "image/jpeg" | "image/webp" | "image/gif"
  size: number; // バイト数（最大 5MB）
};

type BugReport = {
  id: string;
  uid: string; // 匿名認証 uid
  title: string; // ユーザー入力（任意。空ならAIが生成）
  description: string; // ユーザー入力（必須）
  stepsToReproduce?: string; // 任意
  images?: BugReportImage[]; // 任意（最大 3 枚）
  // 自動収集メタ
  meta: {
    appVersion: string; // package.json version
    userAgent: string;
    url: string; // 報告時のパス
    locale: string;
    timezone: string;
    createdAtClient: string; // ISO8601
  };
  status: BugReportStatus;
  // Issue 化後に書き戻し
  issueNumber?: number;
  issueUrl?: string;
  aiLabels?: string[];
  errorMessage?: string; // status="error" のとき
  createdAt: Timestamp; // serverTimestamp
  updatedAt: Timestamp;
};
```

### firestore.rules / storage.rules（方針）

- `firestore.rules`:
  - `create`: 認証済み（匿名でも可）ユーザーが、自身の `uid` のドキュメントのみ作成可。
    `status` は `"pending"` 固定、`images` は省略または最大 3 要素の配列、`issueNumber` 等の書き込みは禁止（サーバ専用フィールド）。
  - `read`: 自分の報告のみ読み取り可（管理者は別途）。
  - `update`/`delete`: クライアントからは不可（Cloud Functions=Admin SDK のみ）。
- `storage.rules`:
  - `bugReports/{uid}/{reportId}/{fileName}` のみ許可。認証済み本人のみ `create`（5MB 以下・PNG/JPEG/WebP/GIF・安全なファイル名）および `delete`（送信途中失敗時のクリーンアップ用）を許可し、`read` / `update` は拒否。

---

## 認証情報（GitHub / AI）

- **GitHub 認証**: 最小権限の **Fine-grained PAT** もしくは **GitHub App** を利用し、
  `repos: issues:write` 相当のみ許可。トークンは **Firebase Secret Manager**
  （`defineSecret`）で管理し、コードにハードコードしない。
  - 対象リポジトリ・オーナーは環境変数 / Secret 化（例: `GITHUB_REPO=poteto317/daily-routine`）。
- **AI 認証**: AI プロバイダ（OpenAI / Gemini 等）の API キーも Secret Manager で管理。
  - プロバイダ選定は Phase 3 で確定（プラン段階では抽象 `AiIssueFormatter` IF を定義）。

> セキュリティ要件（リポジトリ規約）: 秘密情報はソースにコミットしない。

---

## 段階導入フェーズ

### Phase 0 — 設計・基盤準備

- Firestore コレクション設計の確定、型定義 `BugReport`（`firebase-functions/src/bugReport/types.ts`
  と フロント `src/features/bug-report/types.ts`）。
- `firestore.rules` に `bugReports` ルール追加（クライアントは create のみ・サーバ専用
  フィールド禁止）。
- Secret / 環境変数の定義方針を README / docs に追記
  （`GITHUB_TOKEN`(secret), `GITHUB_REPO`, `ANTHROPIC_API_KEY`(secret) 等）。
- **成果物**: 型・ルール・ドキュメント。機能挙動の変更なし。

> Phase 0 実装済み成果物:
>
> - フロント型: `src/features/bug-report/types.ts`（`index.ts` から型を再エクスポート）
> - Functions 型: `firebase-functions/src/bugReport/types.ts` に `BugReport` 等を追加
> - ルール: `firestore.rules` に `bugReports`（create/read のみ・サーバ専用フィールド禁止）
> - Secret/環境変数手順: [bug-report-secrets-config.md](./bug-report-secrets-config.md)

### Phase 1 — アプリ内 報告UI ＋ Firestore 保存（Issue化・AIなし）

- `src/features/bug-report/` を新設（Feature-based Architecture に準拠）。
  - `components/BugReportSection.tsx`（設定画面差し込み用）
  - `components/BugReportForm.tsx`（タイトル任意・説明必須・再現手順任意）
  - `hooks/useBugReportForm.ts`（入力 state・バリデーション・送信）
  - `api.ts`（Firestore へ `addDoc`。`uid`・`meta` 自動付与・`status:"pending"`）
  - `collectBugReportMeta.ts`（appVersion / UA / url / locale / timezone 収集）
  - `index.ts`
- `SettingsPage.tsx` に `BugReportSection` を追加。送信完了・エラーのフィードバック表示。
- ダークモード・a11y（`aria-label`、フォーム要素のラベル）対応。
- **テスト**: フォームのバリデーション、メタ収集、Firestore 送信（Firestore はモック）、
  送信成功/失敗時の UI。
- ※ この時点では Firestore に溜まるだけ（Issue 化はしない）。

### Phase 2 — Cloud Functions: Firestore → GitHub Issue 自動作成（AI整形なし・最小）

- `firebase-functions/src/bugReport/` 新設。
  - `onBugReportCreated`（`onDocumentCreated("bugReports/{id}")`,
    region `asia-northeast1`, `secrets:[GITHUB_TOKEN]`）。
  - `createGithubIssue.ts`（GitHub REST API（Node グローバル `fetch`）で Issue 作成。素のテンプレートで本文整形）。
  - 冪等性: 既に `issueNumber` がある／`status!=="pending"` ならスキップ。
  - 成否で Firestore を更新（`issued` + issueNumber/issueUrl、または `error` + message）。
- `index.ts` から関数をエクスポート。
- **テスト**: `global.fetch` / Admin SDK をモックし、Issue 作成・書き戻し・冪等性・エラー時
  ステータス遷移を検証。
- 既存 functions のテスト規約（`firebase-functions` の lint/build）を遵守。

> **Phase 2 セットアップ前提 — GitHub ラベル作成**:
> `buildIssueContent.ts` の `DEFAULT_BUG_REPORT_LABELS = ["bug", "user-report"]` を使用するため、
> リポジトリに `user-report` ラベルが存在しないと Issue 作成 API が 422 で失敗する。
> 初回デプロイ前に以下で作成すること（`bug` はデフォルトで存在する）:
>
> ```bash
> gh api repos/OWNER/REPO/labels --method POST \
>   --field name="user-report" --field color="e4e669" \
>   --field description="ユーザーからのアプリ内不具合報告"
> ```

> Phase 2 実装済み成果物（`firebase-functions/src/bugReport/`）:
>
> - `buildIssueContent.ts`: 報告→Issue 内容（title/body/labels）整形（firebase 非依存の純粋関数）
> - `createGithubIssue.ts`: GitHub REST API で Issue 作成。**依存追加を避けるため Octokit ではなく Node グローバル `fetch` を使用**
> - `processBugReport.ts`: 冪等性ガード（status!=="pending" / issueNumber 既存ならスキップ）＋成功/失敗での書き戻し（deps 注入で純粋・テスト可能）
> - `onBugReportCreated.ts`: `onDocumentCreated("bugReports/{reportId}")` の薄いトリガ。`region: asia-northeast1`・`secrets:[GITHUB_TOKEN]`・`GITHUB_REPO`(defineString)。`index.ts` からエクスポート
> - テスト: `buildIssueContent` / `createGithubIssue`（fetch モック）/ `processBugReport`（Issue作成・書き戻し・冪等性・エラー遷移）。ルート jest が `firebase-functions/src/**/__tests__` を実行（純粋モジュールは firebase ランタイム非依存）

### Phase 3 — AI による本文整形を組み込み

- `firebase-functions/src/bugReport/aiIssueFormatter.ts`（旧案。実装は `draftIssueWithClaude.ts` ほか）
  - 入力: ユーザー記述 + メタ。出力スキーマ: `{ title, body, labels: string[] }`。
  - プロンプト設計（日本語、再現手順の構造化、ラベル候補を限定リストから推定）。
  - `secrets:[ANTHROPIC_API_KEY]`。（旧案）プロバイダは抽象 IF 経由で差し替え可能に（実装では Anthropic に固定し、抽象 IF は設けていない）。
- `onBugReportCreated` のフローに組み込み（AI整形 → Issue作成）。
- **フォールバック**: AI 失敗時は Phase 2 の素テンプレートで Issue 化（機能継続）。
- `aiLabels` を Firestore に記録。
- **テスト**: AI クライアントをモックし、整形結果が Issue 本文/ラベルに反映されること、
  失敗時フォールバックを検証。

> **進捗（2026-10-30 更新）**
>
> - 実装済み: `draftIssueWithClaude.ts` で Claude API（`claude-opus-5-5`）によりタイトルと本文を整形し、`handleBugReport` から処理ロック取得後に呼び出す。失敗時（利用上限超過・残高不足・タイムアウト・拒否応答・出力不正など）は Phase 2 の素テンプレートで Issue 化する。Secret は `ANTHROPIC_API_KEY`（`none` で無効化）。プロバイダは Anthropic に固定し、抽象 IF は設けていない。
> - 実装済み（Issue #183）: スクリーンショット画像添付（PNG / JPEG / WebP / GIF、1 枚 5MB まで、最大 3 枚）。クライアントで Firebase Storage（`bugReports/{uid}/{reportId}/{fileName}`）に先行アップロードした上で `setDoc` により報告を作成し、途中失敗時はアップロード済み画像を削除する。Functions 側ではサイズ・マジックナンバー検証を行い、ダウンロードトークン付き URL を GitHub Issue 本文の `## スクリーンショット` 節に埋め込むとともに、画像を Claude にも渡して状況把握に用いる（画像つき整形が失敗した場合は画像なしで 1 回だけ再整形し、それも失敗した場合は素テンプレートにフォールバックする）。
> - 未実装: ラベル候補の推定と `aiLabels` の Firestore への記録。

### Phase 4 — 運用・管理整備（任意・推奨）

- 重複検知 / レート制限（短時間の連投・スパム対策）。
- 管理者向け一覧（`account-admin` 連携 or 簡易ビュー）で report の status / issueUrl 確認、
  失敗報告の再送（status を pending に戻す等）。
- ユーザーへのフィードバック強化（Issue 化完了の通知・報告履歴表示）。
- **テスト**: 重複検知・再送・一覧表示。

### Phase 5（将来 / 自動化対象外）— 対応時の AI PR 作成への接続

- 作成済み Issue に **GitHub Copilot コーディングエージェント**をアサインして PR を生成
  （対応時の手動トリガ）。本プランでは仕組みの**道筋のみ**記載し、自動実行はしない。

---

## 設計上の考慮点・リスク・既知の制約

- **秘密情報の管理**: GitHub トークン / AI キーは Firebase Secret Manager。
  ソースへ絶対にコミットしない（リポジトリ規約）。
- **権限最小化**: GitHub は `issues:write` のみの fine-grained 権限を維持（画像の保存にはリポジトリの Contents 権限を使わず Firebase Storage を使用）。
- **スパム / 乱用**: 匿名認証ゆえ大量送信・Storage 書き込みのリスク。レート制限・重複検知は Phase 4 で対応。
- **PII / 機微情報**: 報告本文・添付画像やメタに個人情報や機密情報が混入し得る。UI に注意書きを表示し、収集メタは最小限に。
- **コスト**: AI 呼び出し・Storage 保存と Issue 作成の従量コスト。失敗時リトライの上限設定。
- **冪等性 / 二重作成防止**: トリガ再実行に備え `status` と `issueNumber` でガード。
- **AI 失敗時の機能継続**: 整形失敗でも Issue 化は止めない（画像つき失敗時は画像なしで 1 回再試行、さらに失敗時は素テンプレートへフォールバック）。
- **オフライン / PWA**: 送信は要オンライン。オフライン時は UI で明示。
- **添付画像の既知の制約**:
  - Issue 起票後も画像は Firebase Storage に残る（Issue からのリンクを維持するため自動削除しない）。
  - 送信途中失敗時のクリーンアップのため `storage.rules` で本人の `delete` を許可しており、本人が後から削除した場合は Issue 内の画像リンクが切れる。
  - `setDoc` の通信タイムアウト等でクライアント側では失敗に見えて実際には Firestore に書き込まれていた場合、クリーンアップ処理により Storage 上の画像が削除され、Issue 起票時に「取得できなかった」注記になる場合がある。

---

## テスト・検証方針

- 各 Phase でユニット / 結合テストを追加（規約どおり `__tests__/`、`*.test.ts(x)`）。
- フロント: `npm run verify`（lint + typecheck + jest + build）。
- Functions: `firebase-functions` の lint / build（＋ functions 用テスト）。
- 外部 I/O（Firestore / Octokit / AI）は必ずモックし、ネットワークに依存しない。
- 自動コミットはしない（ユーザー承認後にコミット）。

---

## 次アクション

Phase 0（設計・基盤）→ Phase 1（報告UI＋Firestore保存）から実装着手予定。
本プラン承認後、Phase 0 から着手する。
