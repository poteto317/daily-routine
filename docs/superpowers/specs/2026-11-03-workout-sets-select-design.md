# 運動記録のセット数入力欄レイアウト修正・セレクトボックス化 設計書（Issue #192）

## 背景・目的

運動記録（筋トレ）の入力フォームにおいて、セット数の入力欄だけレイアウトが崩れる問題（[Issue #192](https://github.com/poteto317/daily-routine/issues/192)）を解消する。

### 原因

3 列グリッド（`grid grid-cols-3 gap-2`）内で、「重量 (kg)」「回数」に対しセット数のラベルが「セット数（任意）」と長く、画面幅や文字サイズによって折り返されてラベルの高さが揃わず、入力欄の垂直位置がずれる。

### 対応方針

- ラベル文言を「セット数（任意）」から「セット数」に短縮し、3 列のラベル高さを統一する。
- セット数入力を `<input type="number">` から 1〜5 を選べる `<select>` に変更する。
- フォームの初期値およびリセット時のセット数をデフォルト `1` とする。

## 要件

1. **文言の更新（`src/features/workout-tracker/locales/ja.json`）**
   - `texts.form.setsLabel`: `"セット数（任意）"` → `"セット数"`
   - `texts.form.setsPlaceholder`: セレクトボックス化に伴い削除

2. **コンポーネント更新（`src/features/workout-tracker/page/components/WorkoutStrengthFields.tsx`）**
   - セット数入力を `<input type="number">` から `<select>` に変更。
   - 選択可能な値は `1`〜`5`（value: `"1"`, `"2"`, `"3"`, `"4"`, `"5"`）。
   - 見た目は既存の `inputClassName` を適用し、周囲の input / select と統一。
   - アクセシビリティ担保のため、`useId` により label の `htmlFor` と select の `id` を紐付ける（重量・回数欄も同様に `htmlFor` / `id` を紐付け）。

3. **フォーム初期状態の更新（`src/features/workout-tracker/page/useWorkoutRecordFormValuesState.ts`）**
   - `createInitialValues` の `sets` の初期値を `""` から `"1"` に変更。
   - `resetValues` 実行時も `sets` は `"1"` に初期化される。

4. **バリデーション（`src/features/workout-tracker/validateStrengthWorkoutForm.ts`）**
   - UI 上は 1〜5 の選択肢を提供し、初期値を "1" とする。
   - バリデータ `validateStrengthWorkoutForm` は既存の空文字許容ロジック（空なら sets プロパティを省略、値があれば正の数値として検証）を維持し、過去データおよび既存テスト（`空欄のsetsは省略する`）との後方互換性を担保する。

5. **ドキュメントの同期**
   - `docs/03-testing/test-matrix.md`: 項目 22-1 の備考を「セット数は1〜5の選択（デフォルト: 1）」に更新。
   - `docs/04-reference/features.md`: 筋トレ固有項目を「セット数（1〜5の選択、デフォルト: 1）」に更新。

## スコープ外（変更しない点）

- データ型定義（`StrengthWorkoutRecord.sets?: number`）および LocalStorage 保存形式（`workout-records`）は変更しない（過去データの互換性を完全維持 / L-015 準拠）。
- ランニング記録の項目や種目管理（`WorkoutExercise`）のロジックには手を加えない。
- Agent REST API スキーマ（`openapi.yaml`）は `sets?: number` のままとし、後方互換性を保つ。

## 反映した知見

- **L-015**: 保存データ型（`StrengthWorkoutRecord.sets?: number`）・LocalStorage 保存形式の構造は変更せず、既存データの互換性を維持する。
- **L-060**: `WorkoutStrengthFields` の props（`values`, `onChange` 等）の配線漏れを防ぐため、親コンポーネント連携および単体テストで各フィールドの変更イベントを確実に検証する。
- **L-303**: 単体テストで強いアサーション（例: `.toHaveValue("1")` や選択肢の検証）を行う際に不要な弱いアサーション（`.toBeInTheDocument()` 等）を重複させず、明確な期待値をアサートする。
