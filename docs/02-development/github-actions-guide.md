# GitHub Actions 導入ガイド

## GitHub Actions とは

GitHub Actions は、GitHub が提供する **CI/CD（継続的インテグレーション / 継続的デリバリー）** のサービス。
リポジトリに対して特定のイベント（Push、Pull Request など）が発生したとき、あらかじめ定義した処理を **GitHub のサーバー上で自動実行** してくれる。

簡単に言うと、今まで手元で `npm run verify` を手動で実行していた作業を、**Push や PR を出すだけで GitHub が自動で実行してくれる** 仕組み。

---

## 導入する目的・メリット

### 1. ミスの早期発見

PR を出した時点で lint・型チェック・テスト・ビルドが自動実行されるため、壊れたコードが main ブランチに入ることを防げる。手元で `npm run verify` を忘れても、GitHub 側で検知できる。

### 2. コードの品質保証

すべてのPRが同じ基準（lint ルール・型安全性・テスト通過・ビルド成功）でチェックされるため、レビュー前に基本的な品質が担保される。

### 3. 環境依存の排除

ローカル環境（macOS）とは異なる環境（Ubuntu Linux）でビルド・テストが実行されるため、「自分の環境では動くけど他では動かない」問題を検出できる。

### 4. レビューの効率化

PR 上に CI の結果（Pass / Fail）が表示されるので、レビュアーはコードの内容に集中できる。

### 5. 無料で使える

パブリックリポジトリは無制限、プライベートリポジトリでも月2,000分まで無料。

---

## 基本用語

| 用語                         | 説明                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| **Workflow（ワークフロー）** | `.github/workflows/` に置く YAML ファイル。自動化の定義全体。 |
| **Event（イベント）**        | ワークフローを起動するトリガー。例: `push`, `pull_request`。  |
| **Job（ジョブ）**            | ワークフロー内の処理の単位。1つの仮想マシン上で実行される。   |
| **Step（ステップ）**         | ジョブ内の個々の処理。コマンド実行やアクションの呼び出し。    |
| **Action（アクション）**     | 再利用可能な処理の部品。`actions/checkout@v4` など。          |
| **Runner（ランナー）**       | ワークフローが実行されるサーバー。GitHub が無料で提供。       |

---

## ファイル構成

```
.github/
├── workflows/
│   └── ci.yml          ← 今回作成した CI ワークフロー
├── ISSUE_TEMPLATE/     ← 既存（Issue テンプレート）
│   ├── fix---バグ.md
│   ├── feature---機能.md
│   └── idea---検討中の機能.md
└── copilot-instructions.md  ← 既存（Copilot 設定）
```

### ファイルの役割

| ファイル                   | 役割                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml` | CI ワークフローの定義ファイル。push / PR 時に lint・型チェック・テスト・ビルドを自動実行する。                              |
| `.github/workflows/`       | GitHub Actions が認識するワークフロー置き場。このディレクトリにある `.yml` ファイルが自動的にワークフローとして登録される。 |

---

## ci.yml の設定内容（1行ずつの解説）

### ワークフロー名

```yaml
name: CI
```

GitHub の Actions タブや PR 上に表示される名前。わかりやすい名前をつける。

---

### トリガー条件（`on`）

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

| 設定                             | 意味                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `push: branches: [main]`         | main ブランチに直接 push（またはマージ）した時に実行                                  |
| `pull_request: branches: [main]` | main ブランチに対する PR が開かれた / コミットが追加された / 再オープンされた時に実行 |

**なぜ両方必要か**: PR 作成時はマージ前の検証、push 時はマージ後の最終確認。

---

### 同時実行制御（`concurrency`）

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

| 設定                          | 意味                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `group: ci-${{ github.ref }}` | 同じブランチ/PRに対する実行をグループ化。`github.ref` は push 時は `refs/heads/ブランチ名`、PR 時は `refs/pull/番号/merge` になるため、PR ごとに独立したグループになる |
| `cancel-in-progress: true`    | 新しいコミットが push されたら、実行中の古い CI をキャンセル                                                                                                           |

**メリット**: PR に連続でコミットを push した場合、古いCIが無駄に走り続けるのを防ぎ、GitHub Actions の実行時間（プライベートリポジトリの場合は利用枠）を節約できる。

---

### ジョブ定義（`jobs`）

```yaml
jobs:
  ci:
    name: Lint / Typecheck / Test / Build (Node ${{ matrix.node-version }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: ["22.x", "24.x"]
```

| 設定                     | 意味                                                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci:`                    | ジョブID（内部的な識別子）                                                                                                                                                                                     |
| `name:`                  | GitHub UI に表示されるジョブ名。Node バージョンも表示して判別しやすくする                                                                                                                                      |
| `runs-on: ubuntu-latest` | Ubuntu Linux の最新版で実行（GitHub が無料提供）                                                                                                                                                               |
| `strategy.matrix`        | Node 22.x / 24.x の2系統で並列実行し、Cloud Functions でも使用している 24.x との互換性を含めて担保する。各バージョンの LTS フェーズは [公式スケジュール](https://nodejs.org/en/about/previous-releases) を参照 |

---

### ステップ 1: チェックアウト

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

リポジトリのコードを Runner にダウンロードする。GitHub 公式アクション。これがないとコードにアクセスできない。

---

### ステップ 2: Node.js セットアップ

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: npm
```

| 設定                                       | 意味                                                      |
| ------------------------------------------ | --------------------------------------------------------- |
| `node-version: ${{ matrix.node-version }}` | matrix で定義した Node.js バージョンを使う                |
| `cache: npm`                               | npm キャッシュを有効化。2回目以降の `npm ci` が高速になる |

**Node.js 22.x / 24.x を使う理由**: 22.x / 24.x はいずれも LTS ラインのバージョン（最新フェーズは [公式リリーススケジュール](https://nodejs.org/en/about/previous-releases) を参照）。24.x は Cloud Functions でも使用しているバージョンのため、両系統で実行することでバージョン間の互換性を確認する。

---

### ステップ 3: 依存パッケージのインストール

```yaml
- name: Install dependencies
  run: npm ci
```

| `npm ci` vs `npm install` | 違い                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                  | `package-lock.json` に完全に従ってインストール。lock ファイルと `package.json` に差分があるとエラーになる。CI 向き。 |
| `npm install`             | `package.json` を基準にインストールし、lock ファイルを更新する可能性がある。開発時向き。                             |

---

### ステップ 4: Tailwind 短縮記法チェック

```yaml
- name: Tailwind shorthand scan
  run: npm run tailwind:scan
```

`tools/tailwind/check-shorthand.mjs` によるカスタムスクリプト。このプロジェクト独自のルールに基づき、Tailwind CSS の非推奨な書き方がないかを検出する。

---

### ステップ 5: ESLint

```yaml
- name: Lint
  run: npm run lint
```

ESLint で静的解析を実行。`--max-warnings 0` により、warning も含めすべての問題をエラーとして扱う。

---

### ステップ 6: TypeScript 型チェック

```yaml
- name: Type check
  run: npm run typecheck
```

`tsc --noEmit` で型チェックのみ実行。`tsconfig.json`（本体コード）と `tsconfig.test.json`（テストコード）の両方をチェック。

---

### ステップ 7: テスト

```yaml
- name: Run tests
  run: npm test -- --runInBand
```

Jest テストをシリアル実行（`--runInBand`）で実行。CI 環境での安定性を高めるためシリアル実行を指定している。

---

### ステップ 8: ビルド

```yaml
- name: Build
  run: npm run build
  env:
    NEXT_PUBLIC_FIREBASE_API_KEY: dummy
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: dummy
    ...
    NEXT_PUBLIC_FUNCTIONS_URL: dummy
```

Next.js のプロダクションビルドを実行。ビルドが成功することを検証する。

**`env:` にダミー値を設定している理由**: Firebase の環境変数はビルド時に参照されるが、CI ではビルドが通ることの検証が目的であり、実際の Firebase 接続は不要。ダミー値を設定することで、環境変数が未定義によるビルドエラーを回避している。

---

## 実行の流れ（ライフサイクル）

```
開発者が PR を作成 / コミットを push
         ↓
GitHub が .github/workflows/ci.yml を検出
         ↓
Ubuntu サーバー（Runner）が Node 22.x / 24.x で並列起動
         ↓
[Checkout] → [Node.js Setup] → [npm ci] → [tailwind:scan] → [lint] → [typecheck] → [test] → [build]
         ↓
結果が PR ページに表示（✅ Pass / ❌ Fail）
```

---

## PR での見え方

PR を作成すると、以下のように CI の結果が表示される:

- **✅ All checks have passed** — すべてのステップが成功
- **❌ Some checks were not successful** — いずれかのステップが失敗

失敗した場合は「Details」リンクからログを確認し、どのステップで何が原因で失敗したかを調べることができる。

---

## 有効化する手順

このワークフローを有効化するには:

1. `.github/workflows/ci.yml` をコミットする
2. GitHub に push する
3. 自動的に認識されて有効化される

特別な設定画面での操作は不要。`.github/workflows/` ディレクトリに YAML ファイルがあれば、GitHub が自動的にワークフローとして登録する。

---

## ブランチ保護ルール（オプション・推奨）

CI が通らない PR のマージを防ぐため、GitHub のリポジトリ設定でブランチ保護ルールを設定できる:

1. GitHub リポジトリ → Settings → Branches
2. 「Add branch ruleset」または「Add classic branch protection rule」
3. Branch name pattern: `main`
4. 「Require status checks to pass before merging」を有効化
5. 必須チェックに Node 22.x / 24.x の `CI` ジョブを追加

これにより、CI が Pass しないと main へのマージができなくなる。

**注意**: この設定は GitHub の Web UI で行うもの。ワークフローファイルだけでは自動設定されない。CI を導入して動作確認ができた後に設定することを推奨。

---

## よくある質問

### Q: ローカルで `npm run verify` を実行する必要はなくなる？

A: CI が代替してくれるので、push 前に毎回実行する義務はなくなる。ただし、push → CI 失敗 → 修正 → 再 push のサイクルは時間がかかるため、大きな変更の前にはローカルで事前確認するのがおすすめ。

### Q: CI の実行時間はどのくらい？

A: プロジェクトの規模にもよるが、このワークフローでは 2〜5 分程度が目安。`cache: npm` によるキャッシュで2回目以降は短縮される。

### Q: プライベートリポジトリだと料金がかかる？

A: GitHub Free プランでは月 2,000 分まで無料。このプロジェクトの CI は 1 回あたり数分なので、通常の開発頻度であれば無料枠内に収まる。

### Q: Firebase の実際のキーを GitHub に設定する必要はある？

A: 今回の CI ワークフローではビルドの成否確認のみが目的なので、ダミー値で十分。将来的にデプロイの自動化を導入する場合は、GitHub Secrets に実際のキーを登録する必要がある。

### Q: `npm run verify` との違いは？

A: 実行される内容はほぼ同じ。違いは以下:

| 項目             | `npm run verify` | GitHub Actions CI             |
| ---------------- | ---------------- | ----------------------------- |
| 実行場所         | ローカル PC      | GitHub のサーバー             |
| 実行タイミング   | 手動             | Push / PR 時に自動            |
| Node.js          | ローカル環境依存 | Node 22.x / 24.x              |
| OS               | macOS            | Ubuntu Linux                  |
| テストモード     | 通常             | シリアル実行（`--runInBand`） |
| ビルドの環境変数 | `.env.local`     | ダミー値                      |

---

## 今後の拡張案

導入後、必要に応じて以下の拡張が可能:

| 拡張                    | 内容                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| **Vercel 自動デプロイ** | main マージ時に Vercel へ自動デプロイ（Vercel の GitHub 連携で対応可能） |
| **カバレッジレポート**  | テストカバレッジの結果を PR にコメントとして投稿                         |
| **Lighthouse CI**       | パフォーマンス・アクセシビリティの自動チェック                           |
| **依存パッケージ更新**  | Dependabot による自動 PR 作成                                            |
