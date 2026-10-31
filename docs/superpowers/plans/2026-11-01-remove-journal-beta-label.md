# ジャーナルの Beta 表記削除 実装プラン

設計書: `docs/superpowers/specs/2026-11-01-remove-journal-beta-label-design.md`

目的: Issue #195 に対応し、正式機能となったジャーナルから利用者向けの Beta 表記を削除する。

気をつける知見: L-015 / L-057 / L-060。

## タスク 1: ヘッダーメニュー設定とジャーナル画面の検証を更新する

ファイル:

- `src/config/locales/ja.json`
- `src/config/__tests__/index.test.ts`
- `src/features/journal/__tests__/JournalPage.test.tsx`

手順:

1. `src/config/locales/ja.json` の `menuConfig.menuItems` 内の `id: "journal"` から `badge` オブジェクトを削除する。
2. `src/config/__tests__/index.test.ts` に「ジャーナルメニューにはベータバッジを設定しない」テストを追加し、`expect(menuConfig.menuItems.find((item) => item.id === "journal")).not.toHaveProperty("badge");` を検証する。
3. `src/features/journal/__tests__/JournalPage.test.tsx` に、ジャーナル画面のレンダリング時に `BETA` / `Beta` 表記が存在しないことのアサーションを追加する（`expect(screen.queryByText(/beta/i)).not.toBeInTheDocument();`）。
4. `npm test -- src/config/ src/features/journal/__tests__/JournalPage.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` でテストを実行し、PASS することを確認する。

## タスク 2: テストマトリクス画面のジャーナルバッジを正式化する

ファイル:

- `src/features/test-matrix/initialData.ts`
- `src/features/test-matrix/__tests__/initialData.test.ts`

手順:

1. `src/features/test-matrix/initialData.ts` の `id: "journal"` のカテゴリを、既存の正式機能と同じ `badge: { text: "実装済", color: "bg-green-500" }` に置き換える。
2. `src/features/test-matrix/__tests__/initialData.test.ts` で、ジャーナルカテゴリのバッジが `{ text: "実装済", color: "bg-green-500" }` であることを検証するテストアサーションを追加する。
3. 他のカテゴリのバッジは変更しない。
4. `npm test -- src/features/test-matrix/__tests__/initialData.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` でテストを実行し、PASS することを確認する。

## タスク 3: ドキュメントを同期する

ファイル:

- `docs/03-testing/test-matrix.md`
- `docs/04-reference/features.md`

手順:

1. `docs/03-testing/test-matrix.md` のジャーナル見出し `## 3. ジャーナル（Journal）🔶` を `## 3. ジャーナル（Journal）✅` に変更する（個別項目の状態は変更しない）。
2. `docs/04-reference/features.md` のジャーナルセクションの技術仕様に `- ステータス: 正式機能` を追記する（家計簿セクションと同様）。
3. 他機能の Beta 表記は変更しない。

## タスク 4: 全体検証

手順:

1. ドキュメントを含む変更ファイルのコードフォーマットを実行する:
   `npm run format`
2. 対象機能のテストを実行する:
   `npm test -- src/config/ src/features/test-matrix/ src/features/journal/ --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
3. プロジェクトの検証コマンドを実行する:
   - `npm run format:check`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run typecheck:functions`
   - `npm test -- --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
   - `npm run build`
