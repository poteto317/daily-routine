# origin/main 差分の単一責任レビュー（2026-10-09）

比較元：`origin/main` = `7f6a78c55a538fc021e77517185a7c42849c294a`。開始時HEAD：`2a144b7eaa74405204802f7897410be5cb85c0fe`。fetch後の60ファイルを全件確認。

**方針:** 振る舞い・公開API・データ形式・エラーの優先順を保つ。コミットしない。新しい責務単位のユニットテストを先に追加し、既存統合テストでも互換性を確認する。

## 全件の判定

| ファイル                                                                          | 判定               | 理由／対応                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `docs/03-testing/test-matrix.md`                                                  | 分離不要           | 仕様・検証記録。製品動作を変更しないため既存仕様を維持。                                                           |
| `（非公開のエージェント API 仕様）`                                                  | 分離不要           | 仕様・検証記録。製品動作を変更しないため既存仕様を維持。                                                           |
| `docs/04-reference/features.md`                                                   | 分離不要           | 仕様・検証記録。製品動作を変更しないため既存仕様を維持。                                                           |
| `（非公開の OpenAPI 仕様）`                                                  | 分離不要           | 仕様・検証記録。製品動作を変更しないため既存仕様を維持。                                                           |
| `docs/superpowers/plans/2026-10-08-workout-exercises-api.md`                      | 分離不要           | 仕様・検証記録。製品動作を変更しないため既存仕様を維持。                                                           |
| `firebase-functions/src/agentApi/__tests__/workoutEndToEnd.test.ts`               | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `firebase-functions/src/agentApi/__tests__/workoutExercises.test.ts`              | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `firebase-functions/src/agentApi/__tests__/workoutFixtures.ts`                    | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `firebase-functions/src/agentApi/__tests__/workoutRecords.test.ts`                | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `firebase-functions/src/agentApi/operations/index.ts`                             | 分離不要           | 公開シンボル／リソース登録の集約。必要な参照先のみ追従。                                                           |
| `firebase-functions/src/agentApi/operations/workout/index.ts`                     | 分離不要           | 公開シンボル／リソース登録の集約。必要な参照先のみ追従。                                                           |
| `firebase-functions/src/agentApi/operations/workout/workoutExerciseOperations.ts` | 分離対象           | 名前入力・重複ルール・エンティティ生成を分離。操作関数は調停のみ。                                                 |
| `firebase-functions/src/agentApi/operations/workout/workoutInput.ts`              | 分離対象           | 本文フィールド検証とクエリ検証を分離。                                                                             |
| `firebase-functions/src/agentApi/operations/workout/workoutRecordOperations.ts`   | 分離対象           | 本文解析・種目照合・記録生成／変更・履歴移動・一覧絞り込みを入力／エンティティ／ストアへ分離。操作関数は調停のみ。 |
| `firebase-functions/src/agentApi/operations/workout/workoutStore.ts`              | 分離対象           | 種目マスターと日付別記録履歴のストアを分離。                                                                       |
| `firebase-functions/src/agentApi/operations/workout/workoutTypes.ts`              | 分離不要           | 保存形式の型、またはストレージキーの定義。                                                                         |
| `firebase-functions/src/agentApi/router.ts`                                       | 分離不要           | HTTPルートの解決と登録。                                                                                           |
| `src/features/settings/state/transferGroups/recordGroup.ts`                       | 分離不要           | バックアップの「記録」グループを定義するアダプター。運動項目登録だけで独自ドメインロジックはない。                 |
| `src/features/sync/__tests__/localData.test.ts`                                   | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/sync/__tests__/sync.test.fixtures.ts`                               | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/sync/__tests__/syncStorage.test.utils.ts`                           | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/sync/__tests__/workoutExercises.integration.test.ts`                | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/sync/sync/localData.ts`                                             | 分離対象           | 運動データの収集・保存を専用同期アダプターへ委譲。                                                                 |
| `src/features/sync/sync/localDataHelpers.ts`                                      | 分離対象           | 運動データの存在判定を専用同期アダプターへ委譲。                                                                   |
| `src/features/sync/sync/syncDataNormalizer.ts`                                    | 分離対象           | 運動データの欠損時フォールバックを専用同期アダプターへ委譲。                                                       |
| `src/features/sync/sync/types.ts`                                                 | 分離不要           | 保存形式の型、またはストレージキーの定義。                                                                         |
| `src/features/workout-tracker/WorkoutTrackerPage.tsx`                             | 分離不要           | 表示部品とpropsの構成が責務で、保存・検証・業務ルールを持たない。                                                  |
| `src/features/workout-tracker/__tests__/WorkoutExerciseFlow.test.tsx`             | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/WorkoutRecordForm.test.tsx`               | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/WorkoutTrackerPage.test.tsx`              | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/storageData.test.ts`                      | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/storageExercises.test.ts`                 | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/storageRecords.test.ts`                   | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/useWorkoutRecordFormValuesState.test.tsx` | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/useWorkoutTrackerActions.test.tsx`        | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/useWorkoutTrackerDataState.test.tsx`      | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/useWorkoutTrackerPageState.test.tsx`      | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/workoutRecordFormValidation.test.ts`      | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/workoutTrackerMutationActions.test.ts`    | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/__tests__/workoutTrackerPageStateResult.test.ts`    | テストを維持・拡充 | 既存の振る舞い／統合境界を検証する役割。抽出先ごとのユニットテストを追加し、既存のアサーションは維持する。         |
| `src/features/workout-tracker/locales/ja.json`                                    | 分離不要           | 画面の日本語文言という単独の責務。                                                                                 |
| `src/features/workout-tracker/page/components/WorkoutExerciseManager.tsx`         | 分離対象           | 一覧の構成、追加フォーム、種目編集行を別コンポーネントへ分離。hookの戻り値型への依存も解消。                       |
| `src/features/workout-tracker/page/components/WorkoutExerciseSelect.tsx`          | 分離対象           | 種別の候補抽出・選択の有効性判定を純粋関数へ分離。                                                                 |
| `src/features/workout-tracker/page/components/WorkoutRecordForm.tsx`              | 分離不要           | 表示部品とpropsの構成が責務で、保存・検証・業務ルールを持たない。                                                  |
| `src/features/workout-tracker/page/useWorkoutExerciseActions.ts`                  | 分離対象           | Reactのエラーstateと保存・確認・選択・一覧更新の操作を分離。                                                       |
| `src/features/workout-tracker/page/useWorkoutRecordFormValuesState.ts`            | 分離不要           | フォーム値とリセット／種別切替のstate管理。                                                                        |
| `src/features/workout-tracker/page/useWorkoutTrackerActions.ts`                   | 分離不要           | 記録操作関数をReactのコールバックへ接続する薄いアダプター。                                                        |
| `src/features/workout-tracker/page/useWorkoutTrackerDataState.ts`                 | 分離対象           | データstateとブラウザーイベントの購読／解除を分離。                                                                |
| `src/features/workout-tracker/page/useWorkoutTrackerPageState.ts`                 | 分離不要           | データ・フォーム・操作hookの合成ルート。                                                                           |
| `src/features/workout-tracker/page/workoutTrackerMutationActions.ts`              | 分離不要           | 記録保存／削除のUI操作を調停。検証・永続化の実装は既に外部へ委譲。                                                 |
| `src/features/workout-tracker/page/workoutTrackerPageStateResult.ts`              | 分離不要           | 公開ページstateの形を整える処理。                                                                                  |
| `src/features/workout-tracker/storage.ts`                                         | 分離不要           | 公開シンボル／リソース登録の集約。必要な参照先のみ追従。                                                           |
| `src/features/workout-tracker/storageData.ts`                                     | 分離不要           | 記録履歴の読み書きと保存エラー通知の境界。                                                                         |
| `src/features/workout-tracker/storageExercises.ts`                                | 分離対象           | 読み書き、種目の純粋な生成／更新、保存操作の調停を分離。                                                           |
| `src/features/workout-tracker/storageKeys.ts`                                     | 分離不要           | 保存形式の型、またはストレージキーの定義。                                                                         |
| `src/features/workout-tracker/workoutExerciseValidation.ts`                       | 分離不要           | 種目名の正規化・制約を検証する純粋関数。                                                                           |
| `src/features/workout-tracker/workoutRecordFormValidation.ts`                     | 分離対象           | 数値・日付パーサー、筋トレ検証、ランニング検証、フォーム型を分離。入口は選択と日付の検証・種別への振り分け。       |
| `src/lib/storage/exports/workoutTracker.ts`                                       | 分離不要           | 公開シンボル／リソース登録の集約。必要な参照先のみ追従。                                                           |
| `src/types/routine/index.ts`                                                      | 分離不要           | 公開シンボル／リソース登録の集約。必要な参照先のみ追従。                                                           |
| `src/types/routine/workout.ts`                                                    | 分離不要           | 保存形式の型、またはストレージキーの定義。                                                                         |

## 対応順と検証

1. APIを入力／ルール／エンティティ／ストア／操作に分離。名前保持、日付移動、null解除、エラー優先順のユニットテスト。
2. アプリ側の種目永続化・フォーム検証・同期アダプターを分離。重複・不変性・境界値・空と欠損・保存失敗のテスト。
3. 管理UI・操作hook・購読を分離。追加成功時だけ入力リセット、キャンセル、選択維持、購読解除のテスト。
4. 独立レビュー、全体verify:fast、FunctionsとNextのビルド、差分チェック。API仕様の変更なしを確認。

## 実行記録

- 開始時の作業ツリーはクリーン。自動コミット禁止。

### 分離結果

- API：本文の作成／変更パーサー、クエリパーサー、種目の入力・重複ルール、エンティティ、種目／記録ストアを分離。操作層は読み取り・検証・変換・応答の調停に限定。
- アプリの種目管理：`storageExerciseData` が永続化、`workoutExerciseMutations` が純粋な生成／変更、`storageExercises` が両者の調停を担当。
- 記録フォーム：型、日付／数値パーサー、筋トレ／ランニングの検証を分離。既存の公開関数・型のexportは維持。
- 画面：追加フォームと編集行を管理一覧から抽出。表示候補・選択判定を純粋関数化し、操作の型をReact hookから独立させた。
- 操作と購読：保存・確認・選択更新の操作をReact stateから分離し、ブラウザーイベントの購読／解除を独立させた。
- 同期：収集・欠損補完・保存・存在判定を運動データ用アダプターにまとめ、既存の同期入口は委譲する。
- 補助変更：純粋な種目変換で不変性を検証できるよう、名前検証の配列引数をreadonlyに変更。実行時の挙動は変更しない。

### 追加検証の観点

履歴の日付移動と空バケット削除、名前スナップショット、setsのnull解除、入力エラーの優先順、クエリ境界値、種目の重複と非破壊更新、日付・数値の境界、同期の欠損/null/空、保存失敗、追加成功時だけ入力を消すこと、削除キャンセル、選択維持、購読解除をユニットテストで補強。

新規モジュールのテストが未実装で失敗することを確認してから抽出し、既存の画面・API・同期の統合テストで互換性も確認。

### 最終検証

- 全体テスト：1,242スイート／5,593テスト成功（開始前5,512件から81件追加、新規15テストファイル）。
- `tailwind:scan`、ESLint、アプリとテストの型チェック：成功。
- Next.js本番ビルド、Firebase Functionsビルド：成功。
- 変更ファイルのPrettierチェック、`git diff --check`：成功。
- 独立レビュー：対象13箇所すべてを確認し、修正を要する指摘なし。レビュー側でも関連44スイート／275テスト成功。
- 全体検証の初回はテスト集計前に終了コード1で終了し、失敗内容は出力されなかった。ビルド完了後に全テストを単独再実行し、上記の全件成功と終了コード0を確認。
- コミット・プッシュなし。HEADは開始時の`2a144b7`のまま。

## 別観点からの反復レビュー（2026-10-10）

対象は引き続きorigin/mainからの変更全体（未追跡の分離先も含む）。行数ではなく、変更理由、依存方向、型の所有責務、副作用の境界、テストの独立性を判定基準にした。

### 1巡目：対応すべき指摘1件

記録エンティティがHTTP入力パーサー側の作成・更新型を参照していた。純粋な変換処理の契約を入力経路が所有しているため、依存方向の整理が必要と判断。

- `workoutRecordCommands.ts`に検証済みの共通契約を移動し、エンティティとパーサーの両方から参照。
- 既存パーサーからの型exportは維持。
- 新規作成の種目IDは必須化し、保存済みの旧記録のoptionalは維持。APIの実行時仕様に変更なし。
- 筋トレの生成時メタデータと非破壊性、ランニングの生成・更新を2テスト追加。型契約も明示的なTypeScriptチェックで修正前の失敗／修正後の成功を確認。

UIの入力state・購読解除、保存操作の調停、同期アダプターは、それぞれ一つの変更理由にまとまっているため追加分割不要。API専用のエラー変換を別の汎用エラー階層に置き換えることも、現在の利用範囲では利益がなく対象外と判断。

### 2巡目：対応すべき指摘0件

独立レビュアーが修正箇所と全範囲を再確認し、具体的な残存指摘なし。ここで反復を終了。

検証：API全65スイート／603テスト、Functionsビルド、変更ファイルのESLint、型契約チェック、差分チェックが成功。今回の製品変更はバックエンドの型依存整理のみのため、前回成功済みのアプリ全体ビルドは再実行していない。コミット・プッシュなし。

## 元のmain全差分の一般レビュー（2026-10-10）

比較元は引き続き`7f6a78c55a538fc021e77517185a7c42849c294a`。未コミット・未追跡ファイルと追加のドキュメント変更も含め、サブエージェントへ一般的な不具合・回帰レビューを依頼し、結果を待って修正、再レビューした。

- 1巡目：対応すべき指摘2件。API説明の種目ID上限を実装・OpenAPIと一致する200文字に修正。種目管理の「モーダル」という説明を実装どおり「開閉領域」に修正。
- テスト対応：本文の作成・更新ともに、空白除去後200文字のIDを受理し、201文字は参照検索前に拒否する2ケースを追加。
- 2巡目：両修正とテストを確認し、元のmain差分について残る対応すべき指摘なし。反復終了。
- 検証：全体verify:fast成功（1,242スイート／5,595テスト）。この実行開始後に追加した2ケースは、関連3スイート／25テストの実行で別途成功を確認。追加テストのESLintも警告なし。
- 差分チェックにあるfeatures.mdの末尾スペース2個は、既存のMarkdown明示改行として意図されたもの。レビューで修正不要と判定。
- コミット・プッシュなし。
