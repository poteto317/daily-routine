# 運動記録のセット数入力欄レイアウト修正・セレクトボックス化 実装プラン

- **対象 Issue**: [#192 [不具合報告] 運動記録のセット数入力欄のレイアウトが崩れている](https://github.com/poteto317/daily-routine/issues/192)
- **設計書**: [2026-11-03-workout-sets-select-design.md](file://.worktrees/issue-192-workout-sets-input/docs/superpowers/specs/2026-11-03-workout-sets-select-design.md)
- **反映した知見**: L-015, L-060, L-303

---

## ワークツリー実行時の環境注意点

- **Jest 実行**: `jest.config.ts` で `/\\.worktrees/` が除外されているため、ワークツリー内での Jest 実行時は必ず `--testPathIgnorePatterns "/node_modules/"` を付与して実行する。
- **型チェック**: `npm run typecheck` で `tsconfig.tsbuildinfo` の EPERM が発生する場合は、`npx tsc --noEmit --incremental false` を用いるか、メインリポジトリの `tsconfig.tsbuildinfo` を参照する。

---

## タスク一覧

### タスク 1: テストの更新・追加（Red: 先に失敗させる）

1. **`src/features/workout-tracker/__tests__/WorkoutStrengthFields.test.tsx` の更新**:
   - `texts.form.setsPlaceholder` の参照を削除。
   - アクセシビリティ検証: 重量・回数・セット数の全フィールドが `screen.getByLabelText(label)` で対応する `<input>` / `<select>` 要素を取得できること（`htmlFor` と `id` の紐付け検証）。
   - セット数欄が `<select>`（combobox）として描画され、選択肢として 1〜5（値: `"1"`〜`"5"`）が含まれることの検証。
   - `sets="3"` の props を渡したとき、`<select>` の value に `"3"` が反映されることの検証（`.toHaveValue("3")`。変異耐性）。
   - セット数を変更（change イベント）した際に `onChangeSetsAction` が渡された値で呼ばれることの検証（L-060）。
   - L-303 に従い、明確な期待値（`.toHaveValue()`, 選択肢の数・値）を直接アサートし、冗長な `.toBeInTheDocument()` の重複を避ける。

2. **親コンポーネント連携テスト `src/features/workout-tracker/__tests__/WorkoutRecordForm.test.tsx` の更新（L-060）**:
   - `onChangeSetsAction` のモック関数を渡し、セット数の `<select>` を変更したときに親の `onChangeSetsAction` が呼ばれる配線テストを追加。

3. **`src/features/workout-tracker/__tests__/useWorkoutRecordFormValuesState.test.tsx` の更新**:
   - 初期値のテストで `sets` が `"1"` であることを期待するように更新。
   - `resetValues` のテストで、事前に `act(() => result.current.setSets("3"))` などで初期値以外に変更した上で `resetValues()` を実行し、`sets` が `"1"` に戻ることを検証（変異耐性）。

4. **テスト実行（Red の確認）**:
   - `npx jest src/features/workout-tracker/__tests__/WorkoutStrengthFields.test.tsx src/features/workout-tracker/__tests__/WorkoutRecordForm.test.tsx src/features/workout-tracker/__tests__/useWorkoutRecordFormValuesState.test.tsx --testPathIgnorePatterns "/node_modules/"` を実行し、想定通り失敗することを確認。

---

### タスク 2: ロケール文言・フック初期値・コンポーネントの実装（Green: 通す）

1. **ロケール文言の更新 (`src/features/workout-tracker/locales/ja.json`)**:
   - `texts.form.setsLabel` を `"セット数（任意）"` から `"セット数"` に変更。
   - `texts.form.setsPlaceholder` を削除。

2. **フォーム初期状態の更新 (`src/features/workout-tracker/page/useWorkoutRecordFormValuesState.ts`)**:
   - `createInitialValues` 内の `sets: ""` を `sets: "1"` に変更。
   - `resetValues` は `createInitialValues()` をベースにするため、自動的に `sets: "1"` にリセットされる。

3. **コンポーネントの更新 (`src/features/workout-tracker/page/components/WorkoutStrengthFields.tsx`)**:
   - React の `useId` を用いて、重量・回数・セット数の入力要素 ID を生成（例: `weightInputId`, `repsInputId`, `setsSelectId`）。
   - 各 `<label>` に `htmlFor` を付与し、各 `<input>` / `<select>` に対応する `id` を付与。
   - セット数の `<input type="number">` を `<select>` に置き換え:
     - `id={setsSelectId}`
     - `value={sets}`
     - `onChange={(e) => onChangeSetsAction(e.target.value)}`
     - `className={inputClassName}`
     - `<option value="1">1</option>` 〜 `<option value="5">5</option>`
   - `texts.form.setsPlaceholder` への参照を削除。

4. **テスト実行（Green の確認）**:
   - タスク 1 のテストを再実行し、全テストがパスすることを確認。
   - `npx jest src/features/workout-tracker --testPathIgnorePatterns "/node_modules/"` を実行し、運動記録機能の他の既存テスト（`workoutRecordFormValidation.test.ts` 等）にデグレがないことを確認。

---

### タスク 3: ドキュメントの同期

1. **テストマトリクス更新 (`docs/03-testing/test-matrix.md`)**:
   - 項目 22-1 の備考を「セット数は1〜5の選択（デフォルト: 1）」に更新。

2. **機能仕様リファレンス更新 (`docs/04-reference/features.md`)**:
   - 筋トレ固有項目を「重量 (kg)、回数 (reps)、セット数（1〜5の選択、デフォルト: 1）」に更新。

---

### タスク 4: 全体検証

1. フォーマット整形:
   - `npm run format`
2. 各種チェック・テスト実行:
   - `npm run format:check`
   - `npm run lint`
   - `npm run typecheck`（または `npx tsc --noEmit --incremental false`）
   - `npm run typecheck:functions`
   - `npx jest --testPathIgnorePatterns "/node_modules/" --maxWorkers=4`
   - `npm run build`
