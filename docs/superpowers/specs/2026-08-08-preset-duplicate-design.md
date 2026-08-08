# ルーティンプリセット コピー機能 設計書

- 日付: 2026-08-08
- 対象領域: `src/features/preset/`

## 背景・目的

プリセット管理画面（`PresetManager`）には作成・適用・編集・削除の機能があるが、既存プリセットを元に似た内容のプリセットを作る手段がない。似たプリセットを作るには毎回ゼロからルーティンを選び直す必要があり手間が大きい。既存プリセットを複製し、複製後は編集画面で微調整できるようにする。

## 決定事項（Deep Dig Round 1）

| # | 論点 | 決定 | 理由・備考 |
|---|---|---|---|
| Q1 | 連鎖コピー時の命名（「Aのコピー」を再度コピーすると「Aのコピーのコピー」になる件） | **現行のまま**。常に末尾に「のコピー」を追記する連番なしの単純方式 | 実装最小。名前が肥大化した場合はユーザーが手動編集（既存の編集機能）で対応可能という前提 |
| Q2 | ボタン表現の一貫性（既存の編集✏️・削除🗑️は絵文字のみ、複製だけテキストにする案） | **絵文字+テキストに統一**。編集・削除ボタンも含めて「✏️ 編集」「🗑️ 削除」「📄 コピー」のように改修する | 3ボタン中1つだけ形式が異なる不揃いを避ける。既存2ボタンの改修が今回のスコープに追加される（影響範囲が広がる） |
| Q3 | プリセット数の際限ない増殖（上限チェックなし、複製は1クリックで確認ダイアログなし） | **スコープ外**。上限チェックは実装しない | シンプルさ優先。既存の「作成」機能にも同じ上限なし問題があり複製固有の問題ではない |

## 決定事項（Deep Dig Round 2）

| # | 論点 | 決定 | 理由・備考 |
|---|---|---|---|
| Q1 | 同期の配列まるごと置換方式（複製直後にオフライン同期が競合すると複製/削除どちらかが巻き戻りうる） | **何もしない**。presets固有の追加対応はしない | `normalizeCoreSyncData` はpresets含む全CoreSyncDataフィールドが配列まるごと置換方式で、`todoLists`も同じ設計と確認済み。複製機能固有のリスクではなくアプリ全体の既存設計を踏襲するのみ |
| Q2 | 複製成功時のフィードバック（一覧が長いと末尾追加が画面外で気づかれない可能性） | **何もしない**。トースト・自動スクロールなし、完全にサイレント | 最小実装を優先。確認ダイアログを避けた「軽快な操作感」という当初方針と一貫する |
| Q3 | `event.stopPropagation()` の実装方式 | **既存踏襲**。編集・削除ボタンと同じ「plain onClick + stopPropagation」 | プリセットカードにスワイプ/ドラッグ機構が無いことをコードで確認済み（grep 0件）。touchstart/mousedown capture方式（todo-lists由来）を先取り導入するのはYAGNI |

## 要件

- プリセット一覧の各カードに「コピー」操作を追加する
- コピーは即座に実行され、確認ダイアログは出さない（非破壊的操作のため）
- コピーされたプリセットは元のプリセット名に「のコピー」を付けた名前で、一覧の末尾に追加される
- コピー後は一覧に追加されるのみで、編集モードなどは自動で開かない。トースト通知・追加行への自動スクロールも行わない（Deep Dig Round 2 Q2）
- **コピーされたプリセットは元のプリセットと完全に独立している**。コピー後にどちらか一方を編集・削除しても、もう一方には一切影響しない

## データ構造（既存、変更なし）

```ts
// src/types/routine/core.ts
interface RoutinePreset {
  id: string;
  name: string;
  description?: string;
  routineTemplates: RoutineTemplate[];
  createdAt: string;
  updatedAt: string;
}

interface RoutineTemplate {
  title: string;
  startTime: string;
  duration: number;
  category: RoutineCategory;
  description?: string;
  notificationMinutes?: number;
}
```

`RoutineTemplate` はプリミティブ値のみのフラットな構造（ネストしたオブジェクト・配列を持たない）。これが独立性担保の実装をシンプルにする前提になる。

## 設計

既存の作成（`createPresetFromRoutines`）・削除（`deletePreset`）と同じ層構造をそのまま踏襲する。新規追加のみで、既存コードの変更は最小限（配線の追加のみ）。

### 1. データ層 — `storageFactory.ts`

`duplicatePreset` を追加する。`createPresetId`（同ファイル内の既存プライベート関数）をそのまま再利用できるため、この場所に置く。

```ts
export const duplicatePreset = (preset: RoutinePreset): RoutinePreset => {
  const now = new Date().toISOString();
  return {
    id: createPresetId(),
    name: `${preset.name}のコピー`,
    description: preset.description,
    routineTemplates: preset.routineTemplates.map((template) => ({ ...template })),
    createdAt: now,
    updatedAt: now,
  };
};
```

**独立性の担保**:
- `id` は新規発行（既存プリセットと衝突しない）
- `routineTemplates` は配列自体を新規生成し、各要素も `{ ...template }` で新しいオブジェクトとしてコピーする。`RoutineTemplate` はプリミティブ値のみのフラット構造なので、この浅いコピーで実質的な完全独立（deep copy相当）になる。元の配列・要素への参照は一切残らない
- `createdAt` / `updatedAt` は複製時刻で新規発行し、元プリセットの値を引き継がない

### 2. ロジック層 — `presetManagerStateActions.ts`

`duplicatePresetAndReload` を追加する。既存の `deletePresetAndReload` と対になる構造。

```ts
export const duplicatePresetAndReload = (
  presets: RoutinePreset[],
  presetId: string,
): { presets: RoutinePreset[]; duplicated: boolean } => {
  const preset = findPresetById(presets, presetId);
  if (!preset) {
    return { presets: loadPresetList(), duplicated: false };
  }

  addPreset(duplicatePreset(preset));
  return { presets: loadPresetList(), duplicated: true };
};
```

### 3. ハンドラー層 — 新規 `presetDuplicateActions.ts`

既存 `presetApplyDeleteActions.ts` と同じ粒度・命名パターンで新規ファイルを作る。

```ts
export const createPresetDuplicateHandler = ({
  presets,
  setPresets,
}: DuplicatePresetHandlerArgs) => {
  return (presetId: string) => {
    const { presets: nextPresets, duplicated } = duplicatePresetAndReload(
      presets,
      presetId,
    );
    if (!duplicated) return;
    setPresets(nextPresets);
  };
};
```

### 4. hooks層

`usePresetApplyDeleteActions.ts` に `handleDuplicatePreset` を追加する（新規フックを作らず、既存の適用・削除と同居させる。3つとも「プリセット一覧に対する単発アクション」という同じ性質のため、責務の重複はない）。`presetApplyDeleteActionsResult.ts` の戻り値にも `handleDuplicatePreset` を追加する。

`usePresetManagerActionHandlers.ts` / `presetManagerActionHandlersResult.ts` を通じて `usePresetManagerState.ts` まで配線する（既存の `handleApplyPreset` / `handleDeletePreset` と同じ経路）。

### 5. UI層

- `PresetCard.tsx`: `onDuplicate: () => void` propを追加。編集ボタンと削除ボタンの間に「コピー」ボタンを配置する（Deep Dig Q2により、既存の編集・削除ボタンも合わせて改修）
  - 3ボタンとも「絵文字+テキスト」に統一する: 編集「✏️ 編集」／削除「🗑️ 削除」／複製「📄 コピー」（絵文字は仮、実装時に確定）
  - 複製ボタンも編集・削除ボタンと同様、`onClick` 内で `event.stopPropagation()` を呼び、カード全体の `onSelect` が誤発火しないようにする（既存2ボタンと同じ方式を踏襲、Deep Dig Round 2で妥当性確認済み）
- `PresetListSection.tsx`: `onDuplicatePreset: (presetId: string) => void` propを追加し、`PresetCard` に配線
- `PresetManager.tsx`: `state.handleDuplicatePreset` を `PresetListSection` に配線

### 6. i18n

`locales/ja.json` の `card` セクションに以下を追加し、`helpers.ts` に対応する定数を追加する（既存の `PRESET_APPLY_LABEL` / `PRESET_EDIT_LABEL` と同じパターン）。

- `duplicateLabel: "📄 コピー"` → `PRESET_DUPLICATE_LABEL`
- `deleteLabel: "🗑️ 削除"` → `PRESET_DELETE_LABEL`（新規）

**既存コードとの整合性の注意**: 現状 `editSection.editLabel`（`"✏️"`）はロケール経由（`PRESET_EDIT_LABEL`）だが、削除ボタンの `"🗑️"` は `PresetCard.tsx` にハードコードされておりロケール未経由（既存コードの軽微な不整合）。Round 1 Q2で削除ボタンにもテキストを追加する以上、この機会に削除ラベルもロケール経由に揃える。`editLabel` の値も `"✏️ 編集"` に更新する。

複製ボタンの絵文字（`📄`）は暫定。実装時にレビューで最終確認する（低リスクな見た目の選択のため、Deep Digではこれ以上深掘りしない）。

## テスト方針

既存の削除フローのテスト構成に倣う。

- `storageFactory.test.ts`: `duplicatePreset` が新しい `id` を発行すること、名前に「のコピー」を付与すること、`routineTemplates` が元の配列・要素と参照を共有しないこと（配列を書き換えても元プリセットに影響しないことを直接アサート）
- `presetManagerStateActions.test.ts`: `duplicatePresetAndReload` が対象プリセットを複製して保存すること、存在しない `presetId` を渡した場合は何もしないこと
- `presetDuplicateActions.test.ts`: ハンドラーが正しく状態を更新すること
- `PresetCard.test.tsx`: **現状このファイルは存在しない**（`PresetCard.tsx` 自体に専用テストが無く、プロジェクトの「1ソース:1テストファイル」慣習から外れた既存の穴）。今回新規作成し、複製ボタン（`onDuplicate` 呼び出し、`event.stopPropagation()` 効果）に加え、Round 1 Q2で変更する編集・削除ボタンの新ラベル表示も合わせてカバーする
  - 確認済み: `presetHelpers.test.ts` は `PRESET_EDIT_LABEL` を `toBeTruthy()` でしか検証しておらず、ロケール値を `"✏️"` → `"✏️ 編集"` に変えても既存テストは壊れない

## 影響範囲

- 変更は `src/features/preset/` 配下に閉じる
- 既存の削除・適用フローへの影響なし（新規関数の追加と配線のみ）。**編集ボタン・削除ボタンの表示（テキストラベル追加）はDeep Dig Q2により変更対象**（挙動・ハンドラーは変更なし、見た目のみ）
- ストレージのスキーマ変更なし（`RoutinePreset` の形はそのまま、レコードが1件増えるだけ）
- プリセット数の上限チェックは実装しない（Deep Dig Q3でスコープ外と決定）
- 同期: `presets` は他のCoreSyncData（`routines`/`dailyHistory`等）と同じく配列まるごと置換方式（`normalizeCoreSyncData`、id単位マージなし）。複製機能固有の追加リスクではなく既存の設計を踏襲するのみ（Deep Dig Round 2で確認）
