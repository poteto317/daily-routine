# 新しく参加する開発者向けガイド

このリポジトリで初めて作業する人が、最初の 1 日で「動かす・読む・テストを書く・検証を通す」まで進めるためのガイドです。詳しい内容は各文書に任せ、ここでは読む順番と、つまずきやすい点をまとめます。

## 1. 最初に読むもの

| 順番 | 文書                                                                        | 読む目的                                                     |
| ---- | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | [README.md](../../README.md)                                                | アプリの概要、セットアップ、よく使うコマンド                 |
| 2    | このガイド                                                                  | 主要な流れ、テストの書き方、落とし穴                         |
| 3    | [architecture.md](../02-development/architecture.md)                        | 同期モデル、ディレクトリの責務、共通基盤モジュールの一覧     |
| 4    | [coding-standards.md](../02-development/coding-standards.md)                | ディレクトリの分類と依存の向き、ViewModel パターン、IME 対応 |
| 5    | [テストガイド](../03-testing/README.md)                                     | テストの種類と実行方法、結合テストの一覧                     |
| 6    | [review-lessons.md](../02-development/review-lessons.md)（11 章だけでも可） | 過去のレビュー指摘とチェックリスト                           |

AI アシスタント向けの規約は `.github/copilot-instructions.md` にあります。人が読んでも役立つ内容（ストレージの一元化、`import type`、テストのタイマー後始末など）が含まれています。

## 2. セットアップ（Firebase なしで動かす）

Firebase のプロジェクトが無くても、ローカル疑似認証で画面を一通り動かせます。

```bash
nvm use                                 # .nvmrc の Node 24 を使う（22 でも可）
npm install
npm install --prefix firebase-functions # Cloud Functions のテストも npm test で動くため必須
cp .env.local.example .env.local
```

`.env.local` の `NEXT_PUBLIC_ENABLE_LOCAL_AUTH` を `true` にし、Firebase の値は空のままにします。

```bash
npm run dev    # http://localhost:3000 を開き、「匿名」または「テストアカウント」でログイン
```

- ローカル疑似認証が有効になる条件（フラグ・Firebase 未設定・ホスト名が localhost）は [README の環境変数の節](../../README.md#2-環境変数の設定) を参照してください。
- データはすべてブラウザの localStorage に保存されます。クラウド同期・通知・不具合報告など Firebase を使う機能は動きません。
- Firebase を使う機能を確かめるときは [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) と [SYNC_SETUP.md](./SYNC_SETUP.md) に従って設定します。

セットアップが済んだら、変更を入れる前に一度 `npm run verify` を流し、手元で全件が通ることを確かめておきます（git worktree の中では「4-5」の注意を参照）。

## 3. 主要な流れとコードの入口

最初は次の 5 つの流れを、入口のファイルから追うと全体がつかめます。

### 3-1. 画面の表示と切り替え

- 入口は `src/app/page.tsx`。URL は 1 つで、画面は `PageType` の状態で切り替える SPA です。
- `src/features/routine/pages/PageLayout.tsx` が画面を選び、`pageComponentRegistry.ts`（画面の対応表）と `lazyPageComponents.ts`（`next/dynamic` による遅延読み込み）から各機能のページを読み込みます。
- 最後に開いた画面は localStorage に保存され、リロード後も復元されます。

### 3-2. ログインとユーザーごとのデータ

- 認証の操作は `src/services/authService.ts`（Firebase）と `src/services/localAuthService.ts`（ローカル疑似認証）。画面からは `useAuth()`（`src/features/auth`）で状態を受け取ります。
- ログインを検知すると `src/hooks/authSyncStateActions.ts` の `applyAuthenticatedUserState` が、ユーザー ID の設定 → ログイン前データのユーザー別キーへの移行（`migrateToUserStorage`）→ 日付キーの移行、の順に 1 度だけ実行します。
- 以降の localStorage のキーは `user:{uid}:{key}` になります（`src/lib/storage/core-modules/userScope.ts`）。

### 3-3. データの保存（ルーティンを例に）

- 各機能のデータは、その機能の `storage.ts` だけを通して読み書きします。`storage.ts` は `src/lib/storage/core.ts` の `getStorageItem` / `setStorageItem` を使います。
- ルーティンを変更すると `src/features/routine/hooks/routinePersistenceSync.ts` の `saveAndSyncRoutines` が、今日の完了状態を取り除いて localStorage に保存し、`routines-saved` イベントで他の画面に知らせ、通知用にサーバーへ送ります（`syncRoutinesToFirebase`。失敗しても画面には出さない）。
- 書き込みに失敗しても例外は投げず、`storage-write-failed` イベントで通知し、画面下部のバナーに表示します（[architecture.md 2-4 節](../02-development/architecture.md#2-4-クライアント耐障害性ストレージ書き込み失敗の検知と復旧)）。

### 3-4. 起動時のルーティンの初期化

- `src/features/routine/hooks/routineLifecycleState.ts` が、保存済みのルーティンを旧形式から移行し、壊れたグループを修復し（`routineGroupRepairModel.ts`）、今日の完了状態を反映します。
- 修復の詳細は [architecture.md 3-5 節](../02-development/architecture.md#3-5-責務ごとに分けたモジュール) の表にあります。結合テストは `src/features/routine/__tests__/routineInitialization.integration.test.ts` です。

### 3-5. クラウド同期と AI エージェント API

- 同期は `src/features/sync/`。アップロードは全機能のデータを集めて Firestore の `users/{uid}` に上書きし、履歴を `syncSnapshots` に最大 5 件残します。ダウンロードは「無いフィールドはローカルを維持し、明示的な空配列は尊重する」規則で取り込みます（`syncDataNormalizer.ts`、[architecture.md 2-3 節](../02-development/architecture.md#2-3-データ保護下位互換性設計)）。
- 同期状態は `sync-status-changed` イベントで画面に伝わります（`src/features/sync/sync/statusStore.ts`）。
- AI エージェント API は `firebase-functions/src/agentApi/`。`handler.ts` が「認証 → ルーティング → 操作の実行 → 応答」をつなぎ、操作は `operations/` に機能ごとに分かれています。仕様は [agent-api.md](../04-reference/agent-api.md) と [openapi.yaml](../04-reference/openapi.yaml) です。

## 4. テストの書き方

### 4-1. 置き場所と名前

- テストは対象と同じ階層の `__tests__/` に置き、`*.test.ts(x)` とします。複数のモジュールをまたぐ流れは `*.integration.test.ts(x)` にします。
- テスト名（`it` の説明）は日本語で、「どういう条件で・どうなるか」を書きます（例: `"通信に失敗したら拒否せず false を返す"`）。`it.each` のラベルも日本語にそろえます。
- テストは ts-jest で実行され、**テストファイルも型検査されます**。型エラーがあるとテストが失敗するので、モックの戻り値は `as never` や `jest.MockedFunction<typeof fn>` で型を合わせます。

### 4-2. 既存の道具を使う

新しくモックを組み立てる前に、同じ機能の既存のテスト用ファイルを探してください。

| 用途                                 | 使うもの                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| 同期（Firestore・Firebase のモック） | `src/features/sync/__tests__/sync.test.utils.ts`（`setupSyncTestEnvironment`、`mockExistingSyncDocument` など） |
| 天気 API（fetch のモック）           | `src/features/weather/__tests__/weather-api/testUtils.ts`                                                       |
| Cloud Functions の Firestore         | `firebase-functions/src/agentApi/__tests__/fakeFirestore.ts`                                                    |
| Cloud Functions の 4xx の検証        | `firebase-functions/src/agentApi/__tests__/testUtils.ts` の `expectApiError`                                    |
| E2E の共通操作（ログイン・メニュー） | `e2e/helpers.ts`                                                                                                |

### 4-3. 失敗経路を必ず書く

外部から入ってくるデータ（localStorage・Firestore・fetch の応答・Service Worker のメッセージ）を扱う関数には、成功のテストに加えて次の失敗経路のテストを書きます。

- 通信や読み出しが例外になる・Promise が拒否される（`mockRejectedValueOnce`）
- 本文が JSON として読めない（`json` が例外を投げる）
- JSON としては正しいが形が違う（`null`、配列の代わりにオブジェクト、必須フィールドが無い、型が違う）
- HTTP エラー（`ok: false`）

例: `src/features/weather/__tests__/weather-api/fetchWeatherData.failures.test.ts`、`src/features/sync/__tests__/remoteStatus.refresh.test.ts`、`firebase-functions/src/agentApi/__tests__/operations/dataAccess.test.ts`。

検証が無く例外になる箇所は、テストで「現状の振る舞い」を固定し、その旨をコメントに書きます。検証を足すと振る舞いが変わる場合は、同じ変更で直さずに別の課題として扱います。

### 4-4. 後始末

- `jest.spyOn` したものは `afterEach` か `try / finally` で `mockRestore()` する。
- `global.fetch` などグローバルを差し替えたら、元の値を保存して `afterEach` で戻す。
- `jest.useFakeTimers()` を使ったら `afterEach` で `jest.useRealTimers()`。`setInterval` の ID は保持してクリアする（`.github/copilot-instructions.md` の「8. テスト」）。
- `console.error` を出す経路をテストするときは、`jest.spyOn(console, "error").mockImplementation(() => {})` で出力を抑え、呼ばれたことを確かめる。

### 4-5. 実行のしかた

```bash
npm test -- --runInBand                     # 全件（TZ=Asia/Tokyo で実行される）
npx cross-env TZ=Asia/Tokyo jest path/to/file.test.ts   # 1 ファイル
```

`.worktrees/` 配下の git worktree の中では、`jest.config.ts` の除外設定により `npm test` がテストを 1 件も見つけません。worktree での実行方法は [テストガイドの該当節](../03-testing/README.md#2-自動テスト) を参照してください。

## 5. よくある落とし穴

| 落とし穴                                                                             | 対処                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `localStorage` を直接読み書きする                                                    | 機能の `storage.ts` を通す。直接書くとユーザー別のキー・書き込み失敗の通知・最終更新時刻の更新がすべて抜ける。                                                                                                                                                   |
| ログイン前に保存したデータが、ログイン後に消えたように見える                         | ユーザー別キーへ移すのは `USER_DATA_KEYS` の 12 キーだけ。新しい機能のキーは移らない（[architecture.md 2-1 節](../02-development/architecture.md#2-1-データアクセスの基本原則)）。                                                                               |
| 「無い」と「空」を同じに扱う                                                         | 同期データで `undefined`（古い端末が書いたため情報が無い）と `[]`（ユーザーが全削除した）は別物。`dailyProgress` の `null` は「今日はまだ何も完了していない」で、上書きしない。                                                                                  |
| 日付が 1 日ずれる                                                                    | 日付キーは JST 基準。テストは `TZ=Asia/Tokyo` で動くので、`npm test` 以外の方法で実行するときも `cross-env TZ=Asia/Tokyo` を付ける。                                                                                                                             |
| `arr[0]` が `undefined` になり得るのに型は通る                                       | tsconfig で `noUncheckedIndexedAccess` を有効にしていないため、配列の添字アクセスは常に要素型になる。空配列があり得る箇所は自分で分岐し、空のときのテストを書く。                                                                                                |
| `JSON.parse` や `locales/ja.json` の値を `as` で型に当てはめる                       | `as` は実行時に何も確かめない。保存データ・応答には型ガード（`value is T`）を書くか、少なくとも形が違うときのテストを書く。文言ファイルの選択肢は、値が型の範囲に収まることをテストで確かめる。                                                                  |
| `window` のカスタムイベントを `event as CustomEvent<...>` で受ける                   | `storage-write-failed` と `sync-status-changed` は `WindowEventMap` に型を宣言済みなので、`window.addEventListener` のリスナーは `CustomEvent<…>` を引数に取ればキャストは要らない。新しいイベントを足すときも、発火する側のモジュールで同じように宣言する。     |
| Enter キーで IME の変換確定がフォーム送信になる                                      | `keydown` では `isImeComposingKeyDown` で判定する（[coding-standards.md](../02-development/coding-standards.md)）。                                                                                                                                              |
| `public/firebase-messaging-sw.js` を編集・コミットする                               | 生成物なので編集しない。元は `public/firebase-messaging-sw.template.js` で、`npm run dev` / `build` / `start` のたびに作り直される。                                                                                                                             |
| Cloud Functions のファイルを分割・改名したあと、古い `lib/` が残ったままデプロイする | `firebase-functions` の `build` は `lib/` を消してからビルドする。手で `tsc` を実行した場合は `lib/` を消してからにする（[review-lessons.md 9-4](../02-development/review-lessons.md#9-4-古いビルド成果物が分割後のモジュールを隠すデプロイした関数が壊れる)）。 |
| `npm run verify` が通ったので整形も大丈夫だと思う                                    | `verify` と CI には Prettier の検査が入っていない。自分が触ったファイルだけ `npx prettier --write <ファイル>` で整形する（ディレクトリ全体に実行すると無関係な差分が出る）。                                                                                     |
| macOS の `sed -i` が GNU 版の書き方で動かない、zsh でグロブがエラーになる            | [review-lessons.md 10-3](../02-development/review-lessons.md#10-3-シェルos-の違いmacos--zsh) を参照。                                                                                                                                                            |

## 6. 変更を出す前に

1. 変更に対応するテストを追加・更新した（失敗経路を含む）。
2. 関連する docs（このガイド、architecture.md、テストガイド、README）を実装に合わせた。
3. 自分が触ったファイルを Prettier で整形した。
4. `npm run verify` が通った（lint・型検査・Cloud Functions の型検査・全テスト・本番ビルド）。
5. [review-lessons.md 11 章](../02-development/review-lessons.md#11-レビュー用チェックリスト) のチェックリストを見直した。

---

[📖 ドキュメントトップに戻る](../)
