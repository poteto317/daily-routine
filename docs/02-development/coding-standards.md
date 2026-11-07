# React（Next.js）コーディング規約

このプロジェクトのReact/Next.js開発における設計ルールです。フロントエンドアーキテクトとして、以下の5つのディレクトリ分類と依存関係ルールを厳守してください。

## 1. ディレクトリの分類と責務

### ① layouts/ (配置・枠組み)

- アプリの「外殻」を定義する。
- ヘッダー、サイドバー、フッターなどの全体的な配置（Grid/Flex）のみを管理する。
- ページをまたいで維持される構造を担当し、特定のビジネスロジックは持たない。

### ② app/ (または pages/) (組み立て・ルーティング)

- 実際のURLに対応するエントリーポイント。
- 役割は「各要素の結合」のみ。layoutsの中にfeaturesを配置し、画面を完成させる。

### ③ features/ (ドメイン・機能単位)

- ビジネスロジックを伴う「機能」の塊（例：auth, search, cart, profile）。
- フォルダ内に、その機能専用の「UIコンポーネント」「カスタムフック」「型定義」「API呼出」を閉じ込める（Co-location）。
- 外部への公開は、フォルダ直下の `index.ts` を通じて行うこと。

### ④ components/ (共通UI部品)

- アプリ全体で使い回す、純粋なUIパーツ（Button, Input, Card, Typographyなど）。
- 特定のドメイン知識やAPI通信を持たず、Propsのみで動作する「ピュア」なコンポーネントにする。

### ⑤ hooks/ (共通ロジック)

- 汎用的なカスタムフック（useWindowSize, useLocalStorage, useDebounceなど）。
- 特定の機能（Feature）に依存しない、純粋なユーティリティロジックのみ。

---

## 2. 依存関係（重要ルール）

コードの複雑化を防ぐため、以下の「単方向の依存ルール」を徹底してください。

- **app** は、layouts, features, components, hooks のすべてを参照できる。
- **features** は、components, hooks を参照できる。
- **layouts** は、components, hooks を参照できる。
- **components と hooks** は、layouts, features, app のどれも参照してはならない（独立性を保つ）。

## 3. コーディングスタイル

### コメントは日本語で記述

- 関数・クラス・複雑なロジックには日本語でコメントを付ける
- JSDocコメントも日本語推奨
- 例: `/** ルーティンの完了状態を切り替える */`

### フォーム・キーボード操作の原則

- **IME 変換中の Enter 誤爆防止**: 日本語入力（IME変換確定）での Enter キー押下によってフォーム送信やリスト追加が誤発火しないよう、`keydown` イベントハンドラでは必ず `isImeComposingKeyDown`（`src/lib/isImeComposingKeyDown.ts`）で判定を行ってください。
  ```typescript
  if (isImeComposingKeyDown(e)) return;
  ```
- **Escape キーのモーダル閉じ (`useCloseOnEscape`)**: `role="dialog"` / `aria-modal="true"` を持つモーダルやパネルでは、共通フック `useCloseOnEscape`（`src/hooks/useCloseOnEscape.ts`）を使用してください。内部で `isImeComposingNativeKeyDown` により IME 変換キャンセル時の誤クローズを防ぎます。
- **作成フォーム送信時のソフトウェアキーボード自動収納 (`useDismissKeyboardOnSubmit`)**: モバイル端末でアイテム作成後にソフトウェアキーボードが開いたまま残るのを防ぐため、作成フォームの送信ハンドラには `useDismissKeyboardOnSubmit`（`src/hooks/useDismissKeyboardOnSubmit.ts`）を使用してください。`onSubmit` によるアンマウントより先にアクティブな入力要素を `blur()` します。

### React Compiler と今日・現在時刻

このプロジェクトは React Compiler（`next.config.ts` の `reactCompiler: true`）で、フック・コンポーネントを自動でメモ化します。props・state・フックの戻り値に依存しない式は最初の描画の値が使い回されるため、本体で求めた「今日」「現在時刻」は、画面を開き直すまで最初の描画の値に固定されます。Jest（ts-jest）はコンパイラを通さないので、単体テストでは検出できません。

- **描画時に「今日」「現在時刻」を求めない**: フック・コンポーネントの本体で `new Date()`・`getTodayString()` などを呼ばないでください。保存する日付に使う値は特に、イベントハンドラの中（呼ばれた時点）で取ってください。描画時に取った値をハンドラに持たせると、再描画の無いまま 0 時をまたいだ操作が前日で処理されます。
- **描画時に今日が必要なとき**は `src/hooks/useToday.ts` のフック（`useJstTodayKey`・`useJstDay`・`useLocalTodayKey`）を使ってください。各フックは `"use no memo"` で自動メモ化から外してあり、呼ぶ側は戻り値を依存として扱うので、日をまたいだ後の次の描画で新しい今日になります（0 時に自動で再描画はしません）。`useMemo` で使うときは、戻り値を計算の中で実際に使ってください（依存の配列に足すだけでは、コンパイラが依存から外します）。
- **新しく今日を使うフック・コンポーネントを直したら**、契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に足してください。コンパイル結果で、今日が固定されていないことを確かめます。
- **対象外**: イベントハンドラの中、`useState` の初期化関数の中で取る今日は対象外です（描画のたびに求める値ではありません）。

### ViewModelパターンの適用

- **テキスト定数**: `locales/ja.json` にまとめる（国際化対応）
- **ビジネスロジック**: `helpers.ts` に関数として抽出
- **UIコンポーネント**: 状態管理とロジック呼び出しのみ

### ファイル配置の原則

- 各機能（feature）フォルダに `locales/ja.json` を配置
- コンポーネントは `components/` 配下に配置
- 共通処理は `helpers.ts` に集約

## 4. コードレビューの観点

- コードを生成する際は、どのフォルダにどのファイルを配置すべきかを明示してください。
- 常に「変更のしやすさ」と「削除のしやすさ」を意識した疎結合なコードを作成してください。
- コメントが日本語で書かれているか確認してください。
- テキスト定数がハードコードされていないか確認してください。
- フォーム入力やキーボード操作で IME 確定が考慮されているか確認してください。
- フック・コンポーネントの本体で「今日」「現在時刻」を求めていないか確認してください（React Compiler で固定される。「React Compiler と今日・現在時刻」）。

## 📖 関連ドキュメント

- [システムアーキテクチャ設計](./architecture.md) - 全体構成・同期モデル・セキュリティ
- [リファクタリングガイド](./refactoring-guide.md) - コンポーネントのリファクタリング手順
- [レビュー教訓集](./review-lessons.md) - 過去レビュー指摘からの教訓
- [Storybook ガイド](./storybook-guide.md) - UI カタログの開発・運用
- [機能リファレンス](../04-reference/features.md) - 実装済み機能の詳細
- [テストガイド](../03-testing/) - テスト方法とマトリクス

---

[📖 ドキュメントトップに戻る](../)

---

**最終更新日**: 2026年11月7日
