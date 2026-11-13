# 運動種目の選択・管理と運動記録 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. この文書はレビュー用の計画であり、実装開始の指示ではありません。

**Goal:** 運動記録の種目名を管理可能なセレクトボックスへ変更し、種目と運動記録を既存の認証付き API から CRUD 操作できるようにする。

**Architecture:** 種目マスター `workoutExercises` を追加し、記録には種目 ID と記録時の名前を保存する。既存の localStorage・Firestore 同期・スナップショットの仕組みと `agentApi` の認証・トランザクションを拡張する。

**Tech Stack:** Next.js 16.3 / React 19 / TypeScript / Firebase Cloud Functions・Firestore / Jest・Testing Library 。

**Spec:** この文書の「設計仕様」。ユーザー確認済み事項：種目名を変更・削除しても、過去の記録には記録時の名前を残す。

## Global Constraints

- 今回は計画作成のみ。製品コードの変更、デプロイ、コミット・プッシュは実装時に別途扱う。
- 実装前に `AGENTS.md` と `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` を読む。
- UI文言は `src/features/workout-tracker/locales/ja.json` に置く。画面・状態管理・検証・保存の責務分割を維持する。
- 既存の `strength` / `running` と記録形式を維持する。旧記録の削除や名前の一括置換は行わない。
- API認証・エラー形式・同期更新は既存の `agentApi` に合わせる。別のHTTP関数や認証方式は追加しない。
- APIで変更したデータは、アプリでダウンロードして反映する既存運用を維持する。

## Review Focus

- 種目の改名・削除後にも旧記録の表示と数値更新ができること（Task 1・4）。
- 同期フィールドの欠損と明示的な空配列を区別し、削除した種目が復活しないこと（Task 2）。
- フォームで選択中の種目が削除された場合や種別切替時に、別種別・存在しない種目で保存しないこと（Task 3）。
- APIの記録更新で種目名スナップショットを意図せず最新名に置換しないこと（Task 4）。
- 別アカウント、旧バックアップ、保存失敗、古い同期データによってローカルの記録・種目を消さないこと（Task 1・2・5）。

## 調査で確認した現状

- `src/types/routine/workout.ts`：記録は `exerciseName` を文字列で保持。筋トレは重量・回数・任意セット数、ランニングは消費カロリー。
- `page/components/WorkoutRecordForm.tsx`：種目名はテキスト入力。
- `storageRecords.ts`：記録の追加・削除・一覧を提供。日付別の `WorkoutRecordHistory` を保存。
- `src/features/sync/sync/`：`workoutRecordHistory` は既に同期対象。フィールド欠損時はローカルを維持し、明示的な空は反映する。
- `src/features/settings/state/transferGroups/recordGroup.ts`：運動記録をJSONエクスポート・インポート対象に含む。
- `firebase-functions/src/agentApi/`：家計簿・ジャーナル・TodoのCRUDを提供。運動記録は未対応。
- `（非公開の OpenAPI 仕様）`：既存HTTP APIの仕様書あり。

## 設計仕様

### 1. 採用方針と選択肢

1. **種目ID＋記録時の名前を保存（採用案）**：改名・削除の影響を記録から切り離し、APIで種目を一意に指定できる。
2. 名前だけの候補一覧：変更量は少ないが、同名・改名時の識別やAPIからの参照が曖昧になる。
3. 名前を種目マスターから常に参照：改名が過去へ反映されるため、確認済みの要望に合わない。

以下は1を採用した計画。ユーザー未指定の詳細は実装案として明示しており、レビューで変更できる。

### 2. 画面

- 現在の筋トレ／ランニングの切替を維持し、該当する種別の種目だけを `<select>` に表示する。
- 先頭は「種目を選択してください」。選択前は記録を保存できない。
- 同じ画面に「種目を管理」ボタンと開閉可能な管理領域を追加する。
- 管理領域で種目の追加・名前変更・削除を行う。新規追加の種別は現在のタブを使う。既存種目の種別変更は扱わない。
- 削除前に「過去の運動記録は残ります」と確認する。選択中の種目を削除したら選択を解除する。
- 種別を切り替えたら選択を解除する。種目追加直後は追加した種目を選択する。
- 候補は保存順。並び替え機能や固定プリセットは今回追加しない。
- 候補が0件なら「種目を追加してください」と管理操作への導線を表示する。
- UIの既存記録は追加・一覧・削除を維持。過去記録の編集画面は今回の対象外だが、APIのPATCHには対応する。
- ラベルとselectを `htmlFor` / `id` で関連付け、キーボード操作とエラー通知に対応する。

### 3. データと互換性

新しい `WorkoutExercise`：

```ts
type WorkoutExercise = {
  id: string;
  name: string;
  label: "strength" | "running";
  createdAt: string;
  updatedAt: string;
};
```

- localStorageキー：`workout-exercises`。既存のユーザー別ストレージAPIを使う。
- Firestoreの同期フィールド：`workoutExercises: WorkoutExercise[]`。
- 記録には `exerciseId?: string` を追加し、既存の `exerciseName` を名前のスナップショットとして保持する。
- 新規作成は `exerciseId` 必須。アプリ／APIがマスターから `label` と `exerciseName` を設定する。
- 旧記録はIDなしでも表示・取得・削除・数値更新できる。過去の名前から勝手に種目との関連付けを作らない。
- 初期マスターは空。既存の記録名は履歴に残り、新規入力前に使う種目を登録する。履歴から候補を自動生成して削除後に復活させる処理は入れない。
- 種目の名前変更はマスターだけを更新する。種目削除時も記録本体と保存済みのID・名前を残す。
- 種目を再作成すると別IDになる。削除されたIDを新しい種目へ自動的に付け替えない。
- 名前は前後空白を除去し1〜100 UTF-16コード単位。同種別で同じ名前は禁止（大文字小文字は区別）。別種別で同名は可。
- 重複時は400 `invalid_field`。名前の不正、存在しない参照先も400 `invalid_field`。
- 金額向け `readAmount` は再利用せず、運動用の有限正数検証を用意する。重量・回数・セット数・消費カロリーはいずれも0より大きい有限数。既存仕様に合わせ回数・セット数の小数も許可し、整数制限はこの変更で加えない。
- `sets` は任意。空欄は省略、不正な非空欄はUI/APIともエラー。APIのPATCHでは `sets: null` で解除可能。
- 日付は実在する `YYYY-MM-DD`。未来日は既存どおり禁止しない。

### 4. 同期・バックアップ

- `SyncPayload`、ローカル収集、正規化、復元、ローカルデータ存在判定に種目マスターを追加する。
- リモートの `workoutExercises` が欠損またはnullならローカルを維持。`[]` なら全削除として反映。
- スナップショット保存・復元にも含める。旧スナップショットに項目がなければローカルの種目を維持する。
- JSONバックアップの「記録」グループに種目マスターを追加する。旧ファイルで省略されていても既存マスターは消さない。
- localStorage更新通知と同期タイムスタンプは既存ヘルパー経由で扱う。保存失敗時に成功表示やフォームのリセットをしない。
- 種目だけがある状態でも `hasLocalData()` がtrueになるようにする。
- API書き込み対象のトップレベルフィールドがクラウドにない場合、既存の409 `outdated_sync_data` 保護を維持する。APIから空フィールドを勝手に作らない。
- 利用開始時は新アプリから一度アップロードする。API更新後は先にダウンロードする。

### 5. API

ベースは既存の `/agentApi`。Bearer APIキーを共用する。

| リソース | 一覧                     | 作成                      | 更新                            | 削除                             |
| -------- | ------------------------ | ------------------------- | ------------------------------- | -------------------------------- |
| 種目     | `GET /workout/exercises` | `POST /workout/exercises` | `PATCH /workout/exercises/{id}` | `DELETE /workout/exercises/{id}` |
| 運動記録 | `GET /workout/records`   | `POST /workout/records`   | `PATCH /workout/records/{id}`   | `DELETE /workout/records/{id}`   |

**種目**

- GET：任意 `label=strength|running`。保存順。応答 `{ exercises: [...] }`。
- POST：`{ name, label }`。応答201 `{ exercise }`。
- PATCH：`{ name }`。`label` の変更は未対応、未知キーとして拒否。応答200 `{ exercise }`。
- DELETE：記録は削除しない。応答200 `{ deleted: id }`。

**運動記録**

- GET：任意 `date=YYYY-MM-DD`、`label=strength|running`、`exerciseId=<id>`。複数条件はAND。`createdAt` 降順、同値はID昇順。応答 `{ records: [...] }`。
- 削除済み種目のIDによる絞り込みも有効。ID未付与の旧記録は `exerciseId` フィルタなしで取得できる。存在しないフィルタIDは空配列。
- POST筋トレ：`{ date, exerciseId, weightKg, reps, sets? }`。
- POSTランニング：`{ date, exerciseId, caloriesBurned }`。
- `label` / `exerciseName` / `id` / タイムスタンプは入力不可。種目マスターから種別と名前を確定する。異種別の数値項目は400。
- PATCH：`date?`、`exerciseId?`、現在の種別に対応する数値項目。空オブジェクトは400 `empty_patch`。
- PATCHで `exerciseId` を省略した場合、記録時の名前・ID・種別を維持する（参照先が削除済みでも可）。
- PATCHで現在と同じ `exerciseId` を指定しても名前を更新しない。存在しないIDを明示指定した場合は400。
- PATCHで別の既存種目IDを指定した場合、同じ種別ならIDと名前を置き換える。別種別への変更は400で拒否する。旧記録へのID付与も同じ種別のみ。
- 日付変更時は旧日付の配列から新日付へ移動し、空になった旧バケットを削除する。
- POSTは201 `{ record }`、PATCHは200 `{ record }`、DELETEは200 `{ deleted: id }`。
- 記録・種目の更新時に `updatedAt` を更新し、`createdAt` は保持する。
- GET単体・PUT・ページネーションは既存APIに合わせて追加しない。
- 不正入力400、認証401、対象／同期データなし404、未対応メソッド405、同期フィールド欠損409、想定外例外500。未知・重複・ネストしたクエリも既存どおり拒否する。
- クエリのキー検証→同期読込→操作検証→書込保護という既存の順序を維持する。例えば種目なしの記録作成は参照先の400が409より先になる。

## 実装手順

### Task 1: 型・種目ストレージ・互換性

**Files:**

- Modify: `src/types/routine/workout.ts`, `src/types/routine/index.ts`
- Modify: `src/features/workout-tracker/storageKeys.ts`, `storage.ts`, `storageRecords.ts`
- Create: `src/features/workout-tracker/workoutExerciseValidation.ts`, `storageExercises.ts`
- Modify: `src/lib/storage/exports/workoutTracker.ts`
- Test: `src/features/workout-tracker/__tests__/storageExercises.test.ts`, `storageRecords.test.ts`
- Test: `src/lib/storage/__tests__/exports.test.ts`

**Interfaces:** `getWorkoutExercises(): WorkoutExercise[]`、`saveWorkoutExercises(exercises): void`、`addWorkoutExercise({ name, label }): WorkoutExercise`、`renameWorkoutExercise(id, name): WorkoutExercise`、`deleteWorkoutExercise(id): void`。既存のストレージ書込失敗通知を確認し、失敗を呼び出し側に伝えられるようにする。UIでは検証成功後にストレージ操作を呼ぶ。

- [ ] 名前の空白除去・上限・同種別重複・別種別同名、改名と削除で履歴不変、アカウント分離、保存失敗のテストを追加する。
- [ ] `npm test -- --runInBand src/features/workout-tracker/__tests__/storageExercises.test.ts` で新機能の未実装による失敗を確認する。
- [ ] 型とストレージ操作を実装し、旧記録には `exerciseId` を要求しない一方、新規入力型では必須にする。保存名はマスターから取得する。
- [ ] 上記テストと既存 `storageRecords.test.ts`・exportsテストを実行し、すべてPASSを確認してコミットする。

### Task 2: 同期・バックアップへの接続

**Files:**

- Modify: `src/features/sync/sync/types.ts`, `localData.ts`, `syncDataNormalizer.ts`, `localDataHelpers.ts`
- Modify: `src/features/settings/state/transferGroups/recordGroup.ts`
- Test/fixtures: `src/features/sync/__tests__/localData.test.ts`, `syncDataNormalizer.test.ts`, `sync.download.test.ts`, `snapshots.test.ts`, `sync.test.fixtures.ts`, `syncStorage.test.utils.ts`
- Test: `src/features/settings/__tests__/dataTransferHelpers.test.ts`

**Interfaces:** `SyncPayload.workoutExercises: WorkoutExercise[]`。Task 1の取得・保存APIを使い、収集→Firestore→復元の往復で種目IDを保持する。

- [ ] マスター往復、欠損/nullで維持、`[]`で削除、旧バックアップ／スナップショット、種目だけのローカルデータ存在判定をテストする。
- [ ] `npm test -- --runInBand src/features/sync/__tests__ src/features/settings/__tests__/dataTransferHelpers.test.ts` で追加ケースの失敗を確認する。
- [ ] 同期型・正規化・収集／復元・バックアップの配列項目登録と関連フィクスチャを更新する。
- [ ] 同じテストと `npm run typecheck` を実行し、PASSを確認してコミットする。

### Task 3: セレクトボックス・種目管理UI

**Files:**

- Create: `src/features/workout-tracker/page/components/WorkoutExerciseSelect.tsx`, `WorkoutExerciseManager.tsx`
- Create: `src/features/workout-tracker/page/useWorkoutExerciseActions.ts`
- Modify: `src/features/workout-tracker/WorkoutTrackerPage.tsx`, `workoutRecordFormValidation.ts`, `locales/ja.json`
- Modify: `src/features/workout-tracker/page/useWorkoutTrackerDataState.ts`, `useWorkoutRecordFormValuesState.ts`, `useWorkoutTrackerPageState.ts`, `useWorkoutTrackerActions.ts`, `workoutTrackerMutationActions.ts`, `workoutTrackerPageStateResult.ts`
- Modify: `src/features/workout-tracker/page/components/WorkoutRecordForm.tsx`
- Test: 同機能の既存form/page/stateテストと新規 `WorkoutExerciseSelect.test.tsx`, `WorkoutExerciseManager.test.tsx`

**Interfaces:** フォーム値を `exerciseName` から `exerciseId` に変更。`validateWorkoutRecordForm(values, exercises)` が種目存在を検証し、名前スナップショット付き `NewWorkoutRecordInput` を返す。データstateは `{ records, exercises, reload }` を返す。

- [ ] 種別で選択肢が変わる、未選択不可、種目追加直後に選択、改名後の新規記録だけ新名、選択中の削除で解除、空状態、削除キャンセルをUIテストする。
- [ ] 種目削除後の古い選択で送信した場合の拒否、sets空欄省略／不正値拒否、保存失敗でフォームを保持するテストを追加する。
- [ ] `npm test -- --runInBand src/features/workout-tracker` で新ケースの失敗を確認する。
- [ ] select・管理領域・状態更新を実装する。保存直前にも種目の現在値を検証し、名称を解決する。UIから直接localStorageを操作しない。
- [ ] 同じテストを実行し、PASSを確認する。キーボード操作と狭い画面での表示を確認してコミットする。

### Task 4: 種目・記録のAPI CRUD

**Files:**

- Modify: `firebase-functions/src/agentApi/router.ts`, `operations/index.ts`
- Create: `firebase-functions/src/agentApi/operations/workout/workoutTypes.ts`, `workoutInput.ts`, `workoutStore.ts`, `workoutExerciseOperations.ts`, `workoutRecordOperations.ts`, `index.ts`
- Test: `firebase-functions/src/agentApi/__tests__/workoutExercises.test.ts`, `workoutRecords.test.ts`
- Modify/Test: `firebase-functions/src/agentApi/__tests__/router.test.ts`, `endToEnd.test.ts`

**Interfaces:** `workoutExerciseOperations: ResourceOperations` と `workoutRecordOperations: ResourceOperations`。保存先は `workoutExercises` と既存 `workoutRecordHistory`。`OperationContext` / `OperationOutcome`、ID生成・日付検証・既存エラーを再利用する。フロントの `@/` モジュールをFunctionsへ直接importしない。

- [ ] 8操作の正常系、認証、種別ごとの必須／禁止キー、日付・数値、同名、存在しない種目、未知クエリ・重複クエリをテストする。
- [ ] 名前スナップショット維持、削除済み参照の数値更新、同じIDの再指定、旧記録へのID付与、異種別変更拒否、日付移動、sets解除をテストする。
- [ ] 古い同期データの400/404/409、フィルタANDと順序、別uidへの非干渉、更新後の同期メタデータ・スナップショットをテストする。
- [ ] `npm test -- --runInBand firebase-functions/src/agentApi/__tests__/workoutExercises.test.ts firebase-functions/src/agentApi/__tests__/workoutRecords.test.ts` で追加テストの失敗を確認する。
- [ ] 純粋な操作関数を実装し、ルーティングと許可クエリを登録する。種目の重複検証と参照確認は書き込みトランザクション内で行う。
- [ ] `npm test -- --runInBand firebase-functions/src/agentApi` と `npm --prefix firebase-functions run build` のPASSを確認してコミットする。

### Task 5: APIドキュメント・統合検証

**Files:**

- Modify: `（非公開の OpenAPI 仕様）`, `（非公開のエージェント API 仕様）`, `docs/04-reference/features.md`
- Modify: `docs/03-testing/test-matrix.md`

- [ ] 非公開の OpenAPI 仕様に、種目・記録まわりの操作とスキーマを追加する（既存操作は維持）。
- [ ] PATCHの名前保持・種別変更不可、削除時の履歴保持、同期フィールド初期化とダウンロード手順を説明する。
- [ ] 非公開の OpenAPI 仕様が実装と一致するか（参照の整合・操作の一意性・入力例）を検証する。
- [ ] `npm run verify:fast`、`npm --prefix firebase-functions run build`、`npm run build` を実行する。変更ドキュメントにPrettierチェック、差分に `git diff --check` を実行する。
- [ ] テスト用環境で「アプリから種目・記録を保存→アップロード→APIで種目・記録の作成／更新／削除→ダウンロード→履歴表示」を確認する。本番データは使わない。
- [ ] 種目の改名／削除後にも古い名前の履歴が残り、新規候補だけ更新されること、再読込・アカウント切替・バックアップ復元で破損しないことを確認する。
- [ ] 検証結果を記録してドキュメントをコミットする。デプロイ先とリリース手順は実装完了時に確認する。

## 完了条件

- 種目はセレクトボックスで選び、その候補を同じ画面で追加・改名・削除できる。
- 旧記録がそのまま読め、種目の改名・削除で記録時の名前が変わらない。
- 種目と運動記録のCRUDがAPI経由で操作でき、アプリへの同期で反映される。
- 種目マスターが同期・バックアップ・スナップショットに含まれる。
- 非公開の OpenAPI 仕様と実装が一致し、関連テスト・型検査・ビルドが成功している。

## 推奨実行順

Task 1 → Task 2 → Task 3 → Task 4 → Task 5。型・同期・UI・APIで同じ仕様を使うため、まずは同一セッションで順に実装する方式を推奨する。

## 実装結果（2026-10-08）

Task 1〜5を実装し、独立レビューの指摘1件を修正した。

- `npm run verify:fast`：Lint・型検査・Tailwind検査、1,227スイート／5,512テスト成功。
- `npm --prefix firebase-functions run build` と `npm run build`：成功。
- 非公開の OpenAPI 仕様：実装との対応と入力例の検証に成功。
- Chromiumの幅390pxで追加・選択・フォーカス・記録作成・改名・削除・再読込を確認。履歴名保持、横幅のはみ出しなし、ページ例外なし。
- 復元時の容量不足を4ケースで再現し、保存失敗を成功扱いしない修正を確認。

### 実装時の判断

- 以前のmain作業指定を引き継ぎ、現在のチェックアウトで実装。別作業ツリーは作成しなかった。
- 新規記録の必須 `exerciseId` と画面・同期側の変更は相互依存するため、Task 1〜3はコンパイル可能な単位にまとめてコミットした。
- 種目select／管理画面の主な動作は、実際のページ・ストレージをつないだ統合テストで検証した。
- 保存処理は当初boolean返却を検討したが、同期・インポート側の見落としを避けるため、保存失敗時に例外を伝えるvoid APIに統一。既存のダウンロード・インポートのエラー処理に接続した。今後の呼び出し元も例外を成功扱いしないこと。
- 本番デプロイは行わず、APIはフェイクFirestore、画面はFirebase接続を無効化したローカル認証で検証。実サービスへの接続確認はデプロイ時に必要。
- 手作業で破損させたバックアップの要素修復は対象外。既存の配列形式検証と旧形式互換を維持しているため、そのようなデータは自動修復しない。
- 独立レビューで残った軽微な指摘はなし。
