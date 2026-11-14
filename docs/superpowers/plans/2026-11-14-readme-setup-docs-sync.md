# README / セットアップ docs 同期 Implementation Plan

> **For agentic workers:** Docs-only のためメインエージェントがインラインで実装してよい。REQUIRED SUB-SKILL のサブエージェント駆動は任意。Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 新規環境の人が README から Firebase なしで起動でき、ONBOARDING / SETUP_CHECKLIST と矛盾しないセットアップ docs にする。

**Architecture:** ルート README に最短経路（ローカル認証）を置き、ONBOARDING は短い手順＋README リンク、SETUP_CHECKLIST は Firebase 本格経路の未チェックテンプレート。`firestore.rules` は全文転載をやめファイル参照にする。

**Tech Stack:** Markdown のみ（アプリコード変更なし）

**Spec:** `docs/superpowers/specs/2026-11-14-readme-setup-docs-sync-design.md`

## Global Constraints

- 変更対象: `README.md` / `docs/01-getting-started/ONBOARDING.md` / `docs/01-getting-started/SETUP_CHECKLIST.md` / 必要なら `docs/01-getting-started/README.md`
- アプリ・設定コードは変更しない
- ローカル認証ホスト: `localhost` / `127.0.0.1` / `::1`
- Firebase 未設定判定: apiKey / projectId / appId が空（プレースホルダ残し禁止）
- `.env.local` 作成は既存を上書きしない（L-072）
- Next.js 表記は `package.json` の `16.4.6` に合わせる
- `/feature` 中はコミットしない
- 知見: L-072, L-028, L-026, L-045

---

### Task 1: README の事実修正と最短セットアップ再構成

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: 見出し「最短: Firebase なしで動かす」（または同等）。ONBOARDING / SETUP_CHECKLIST からリンクされるアンカーになること。

- [x] **Step 1: 技術スタックの Next.js を 16.4.6 に更新する**

- [x] **Step 2: clone URL を `https://github.com/poteto317/daily-routine.git` にする**

- [x] **Step 3: セットアップ節を再構成する**
  1. 前提環境（現状どおり Node 22/24、`.nvmrc` 24）
  2. インストール
  3. **最短: Firebase なしで動かす**（主経路）
     - `.env.local` が無いときだけ example からコピー（`cp -n` または「既にある場合はスキップ」を明記）
     - `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true`
     - `NEXT_PUBLIC_FIREBASE_API_KEY` / `PROJECT_ID` / `APP_ID` を空にする（`your-*` 残し禁止）
     - 有効条件: フラグ・Firebase 未設定・ホスト `localhost` / `127.0.0.1` / `::1`
     - `npm run dev` → 匿名またはテストアカウント
  4. Firebase を使う場合 → SETUP_CHECKLIST / SYNC_SETUP へ誘導
  5. 既存の環境変数ブロックは「Firebase あり」向けとして残しつつ、ローカル経路との必須差を注記

- [x] **Step 4: 関連ドキュメントに ONBOARDING へのリンクを追加する**

- [x] **Step 5: 読み返し** — ホスト一覧・上書き防止・プレースホルダ注意が揃っていること

---

### Task 2: ONBOARDING を README 最短経路に同期

**Files:**
- Modify: `docs/01-getting-started/ONBOARDING.md`

**Interfaces:**
- Consumes: Task 1 の README 見出しアンカー

- [x] **Step 1: セクション「2. セットアップ」を短い手順＋README リンクに整える**
  - ホストに `::1` を含める
  - 上書き防止とプレースホルダ空を README と同じ意味で書く（全文二重管理はしない）
  - README へのリンクアンカーを実見出しに合わせる

- [x] **Step 2: 読む順番表の README 説明を「最短セットアップ含む」に更新する（必要なら）**

---

### Task 3: SETUP_CHECKLIST を新規環境テンプレート化し同期

**Files:**
- Modify: `docs/01-getting-started/SETUP_CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1 のローカル認証条件・環境変数の言い回し

- [x] **Step 1: 先頭の「完了済み」を未チェックのテンプレートに戻す**（個人の [x] を残さない）。セクション名も「確認項目」など新規向けにする。

- [x] **Step 2: CLI バージョンの固定値を緩める**（例: Node は README と同じ、npm / Firebase CLI / Vercel CLI は「インストール済みであること」＋確認コマンド）

- [x] **Step 3: ローカル認証の注意を README と同じ三条件＋`::1`＋プレースホルダ空＋上書き防止に揃える**

- [x] **Step 4: 環境変数表の必須／任意を経路別に分ける**（または脚注でローカル認証のみのとき Firebase キーは空）

- [x] **Step 5: 埋め込み `firestore.rules` 全文を削除し、リポジトリの `firestore.rules` を参照する要約に置き換える**（L-045）

- [x] **Step 6: 最終更新日を 2026年11月14日 にする**

---

### Task 4: セットアップ索引の整合（必要時）と横断検証

**Files:**
- Modify (if needed): `docs/01-getting-started/README.md`
- Verify only: `package.json`, `.nvmrc`, `.github/workflows/ci.yml`, `src/features/auth/storage.ts`, `src/lib/firebase-modules/config.ts`, `.gitignore`

- [x] **Step 1: `docs/01-getting-started/README.md` の流れが「ONBOARDING →（必要なら）SETUP_CHECKLIST」のまま矛盾しないか確認し、必要なら一行修正**

- [x] **Step 2: バージョン突合** — README の Next / Node が package.json・CI・.nvmrc と一致

- [x] **Step 3: ローカル認証条件突合** — 三文書と `storage.ts` / `config.ts` が一致

- [x] **Step 4: 三文書間でローカル認証手順・ホスト・上書き防止・プレースホルダ注意が一致することを検索確認**

- [x] **Step 5: URL ホスト抽出と許可リスト照合（L-026）** — 変更した文書内の `https://` ホスト

- [x] **Step 6: `.gitignore` が `.env*` と `public/firebase-messaging-sw.js` を無視していることを確認し、手順がその前提であること

- [x] **Step 7: `git diff` でアプリソース（`src/` 等）に変更が無いことを確認**

---

## 完了条件（Spec 受け入れ）

1. README から Firebase なし起動手順がコード条件と一致して辿れる
2. バージョン表記が対象文書内で package.json / CI / .nvmrc と矛盾しない
3. ONBOARDING・SETUP_CHECKLIST のローカル認証注意が README と矛盾しない
4. SETUP_CHECKLIST が新規環境テンプレート（個人 [x] 前提でない）
5. アプリソースに変更が無い
