# ルーティンのカードが読むスワイプの設定を、購読するフックに変える 設計書

作成日: 2026年11月13日

対象: [Issue #224](https://github.com/poteto317/daily-routine/issues/224)「bug: ルーティンのカードが描画中に読む設定（getSettings）が、React Compiler で最初の描画の値に固定される可能性がある（未検証）」

## 背景と目的

ルーティンのカード（`RoutineItem.tsx` と `SortableRoutineItem.tsx`）は、コンポーネントの本体で `const settings = getSettings();` を呼び、`settings.swipeAction`（スワイプしたときの動作。`"delete"` または `"edit"`）を、スワイプの部品（`SwipeableRoutineItem`・`SortableRoutineEditModeItem`）の `swipeActionType` に渡している。`swipeActionType` は、スワイプしたときに見える背景の色とアイコン（削除は赤、編集は青）を決める。

このプロジェクトは React Compiler（`next.config.ts` の `reactCompiler: true`）で、コンポーネントを自動でメモ化する。props・state・フックの戻り値に依存しない式は、最初の描画の値が使い回される（L-538）。`getSettings()` は引数が無く、どれにも依存しないので、#9（現在時刻の固定）と同じ仕組みで固定される可能性があった。Issue は「未検証」として起票されている。

目的は次の 3 つである。

1. 固定されるかを確かめる（Issue の「確認すること」1）。
2. 固定される場合は直し、コンパイル結果で固定されていないことをテストで確かめる（同 2）。
3. 同じ書き方がほかに無いかを確かめ、規約に足すかを決める（同 3）。

## 確かめたこと

この節の「固定される（再現した）」「起きる経路」「影響」「同じ書き方の調査」は、直す前のコードについて確かめた内容で、直す前の動作を書いている。直した後の動作は、最後の「直した後（本番ビルドで確かめた）」にある。

### 固定される（再現した）

- **コンパイル結果**: 契約テスト（`src/__tests__/reactCompilerToday.contract.test.ts`）と同じオプションで 2 つのファイルを React Compiler に通すと、どちらも `getSettings()` の呼び出しが `if ($[i] === Symbol.for("react.memo_cache_sentinel")) { ... }`（最初の描画で 1 回だけ実行されるブロック）の中に入る。
- **本番ビルドの出力**: `npm run build` の出力（チャンク）でも、同じブロックの中に入っている。
- **本番ビルドでの動作**（2026年11月13日、`npm run build` と `npm run start`）: ホーム画面でカードを表示したまま、保存されている設定の `swipeAction` を、別のタブで変えたときと同じ形で `"edit"` に書き換えた。その後、分が変わるのを待ち、`focus` のイベントでカードを再描画させても、スワイプの背景は 3 枚とも赤（`bg-red-500`）のままだった。再読み込みをすると、3 枚とも青（`bg-blue-500`）になった。

### 起きる経路

- **起きる経路（確認済み）**: カードを表示したまま、別のタブ・別のウィンドウ（ブラウザのタブと PWA の組み合わせを含む）で設定を変えたとき。変えた側の設定は同じ localStorage に保存されるが、カードを表示している側は、再読み込みをするまで最初の描画の値を使い続ける。
- **同じタブの中では、いまは起きない**（コードを読んで確認。動作の実験はしていない）:
  - 設定画面を開くと、ホーム画面のカードはアンマウントされる。戻ると新しくマウントされ、設定を読み直す。
  - ヘッダーからのダウンロード（`runHeaderDownload`）は、ダウンロード自体は再読み込み無し（`downloadFromFirestore({ reload: false })`）で呼ぶが、その後のアラートの後に必ず再読み込みをする（`applyHeaderSyncFeedback`）。
  - 同期のスナップショットの適用（`useSyncSnapshotActionHandlers`）と、インポートでの復元（`useImportTransferAction`）も、再読み込みをする。
  - `downloadFromFirestore({ reload: false })` を呼ぶのは、上の `runHeaderDownload` と `syncLatestData()` の 2 か所だけである。`syncLatestData()` は、テストのほかに呼び出し元が無い。

### 影響

スワイプしたときに**見える動作**（背景の色とアイコン）と、**実行される動作**が食い違う。実行される動作は `createSwipeHandler`（`src/features/routine/helpersPresentation.ts`）が、スワイプした時点で `getSettings()` を読んで決めるので、新しい設定になる。たとえば、別のタブで「編集」から「削除」に変えた後、カードを表示したままのタブでスワイプすると、青い「編集」の背景が見えているのに、ルーティンが削除される。

### 同じ書き方の調査

テストのほかで `getSettings()` を呼んでいる箇所をすべて確かめた。描画中に読み、表示に使っていて、コンパイラに固定されるのは、上の 2 つのファイルだけだった。ほかは次のどれかに当たり、今回の不具合と同じ形ではない。

| 種類                                                                                                                                                                                                                                                    | 箇所                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フォームや state の初期値として 1 回だけ読み、その後は利用者が編集する（最初の値でよい。規約の「対象外」）                                                                                                                                              | `settings/state/useSettingsFormState.ts`、`settings/state/useTrainDelayState.ts`、`settings/state/useMenuOrderState.ts`、`settings/state/featureVisibility.ts`、`todo-lists/useTodoListManagementMenuOrder.ts`                                                                                                                                                                                                                                    |
| 1 回だけ読み（`useState` の初期値や、`useMemo(…, [])`）、利用者が編集しない表示や動作に使う（コンパイラによる固定ではないが、設定を変えても、コンポーネントが作り直されるまで古いまま残る。規約の「対象外」には当たらない。今回は直さない。「範囲外」） | `routine/hooks/useTrainDelays.ts`（設定の `trainDelay` を `useState` の初期値として読み、ホームの電車遅延情報の表示に使う）、`pomodoro/usePomodoroTimerInitialState.ts`（設定の集中・休憩の時間を `useMemo(…, [])` で 1 回だけ読み、タイマーの時間に使う）、`routine/components/useRoutineFormSourceData.ts`（設定の既定の所要時間・通知の時間を `useMemo(…, [])` で 1 回だけ読み、フォームのヒントの文字と、送信時に空欄の代わりに使う値に使う） |
| イベントや処理の時点で読む（描画中ではない）                                                                                                                                                                                                            | `routine/helpersPresentation.ts`、`settings/state/dataTransferGroups.ts`、`settings/storage.ts`（`saveMenuOrder`）、`sync/sync/syncDataNormalizer.ts`、`sync/sync/localData.ts`、`hooks/themeEffectActions.ts`                                                                                                                                                                                                                                    |
| 設定の変更の通知（`SETTINGS_UPDATED_EVENT`）を受けて読み直す                                                                                                                                                                                            | `routine/hooks/useRoutines.ts`                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 描画のたびに読むが、コンパイラがメモ化していない                                                                                                                                                                                                        | `hooks/headerMenuItemData.ts`（呼び出し元の `hooks/useHeaderMenuItems.ts` は、コンパイル結果に `_c(` が無い）                                                                                                                                                                                                                                                                                                                                     |

（パスは `src/features/` または `src/` からの相対。直す前の調査なので、今回足すフック `settings/state/useSwipeActionSetting.ts` は入っていない。このフックは、設定の変更の通知（`SETTINGS_UPDATED_EVENT` と `storage`）を受けて読み直す種類に当たる。）

### 直した後（本番ビルドで確かめた）

- **本番ビルドでの動作**（2026年11月13日、`npm run build` と `npm run start`）: ホーム画面でカードを表示したまま、保存されている設定（ユーザーごとのキー `getUserScopedKey("app-settings")`）の `swipeAction` を `"edit"` に書き換え、`storage` のイベントを発行した。再読み込みをせずに、スワイプの背景は 3 枚とも赤（`bg-red-500`）から青（`bg-blue-500`）に変わった。設定を元に戻して `storage` のイベントを発行すると、再読み込みをせずに 3 枚とも赤に戻った。

## 決めたこと

1. **設定を購読するフックを足す。** `src/features/settings/state/useSwipeActionSetting.ts` に `useSwipeActionSetting()` を作り、2 つのカードは `getSettings()` の代わりにこのフックを呼ぶ。フックの戻り値はメモ化の依存になるので、コンパイラは値を固定しない。
2. **`useSyncExternalStore` で作る。** 現在時刻のフック（`src/hooks/useCurrentMinute.ts`）と同じ形にする。知見 L-466 が挙げる修正（変更の通知を購読する、または `useSyncExternalStore`）に沿う。
3. **戻り値は `swipeAction` の文字列だけにする。** `getSettings()` は、保存データがあると呼ぶたびに新しいオブジェクトを返す。設定の全体を `useSyncExternalStore` のスナップショットにすると、毎回「変わった」と判定されて再描画が止まらなくなる。項目を選ぶ関数を渡す汎用のフックも、いま要るのは 1 項目だけなので作らない（YAGNI）。
   - **保存された値は、`"delete"` か `"edit"` のどちらかにして返す**（ローカルのレビューで追加。2026年11月13日）。`getSettings()` は保存データの値の型を検証しないので、インポートや同期で壊れた値（オブジェクト・配列・`null`・知らない文字列）が入りうる。オブジェクトや配列をそのまま返すと、読むたびに参照が変わり、上と同じ理由で再描画が止まらなくなる（`Maximum update depth exceeded`）。受け付ける値でないときは、`"edit"` として扱う（スワイプの実行の `createSwipeHandler` が、`"delete"` 以外を編集として扱うのに合わせる）。
   - **受け付ける値の一覧（`SWIPE_ACTIONS`）は、型（`AppSettings["swipeAction"]`）をキーにしたオブジェクトで持つ**（ローカルのレビューで追加。2026年11月14日）。`swipeAction` に値を足したときに、一覧が型エラーになる。`=== "delete"` で分ける形では、足した値を、型エラーも無いまま `"edit"` に直してしまう。
4. **2 つのイベントを購読する。**
   - `SETTINGS_UPDATED_EVENT`（`saveSettings()` が同じタブの中で出す）。いまは同じタブでカードを表示したまま設定が変わる経路は無いが、再読み込み無しのダウンロードなどが将来つながったときに、そのまま追従する。
   - ブラウザの `storage` イベント（別のタブ・別のウィンドウが localStorage を書いたときに届く）。今回確認した経路を直す。
5. **`storage` イベントはキーで絞らない。** 既存の `subscribeWorkoutStorage.ts` と同じ扱いにする。関係のないキーのイベントでも、スナップショットの値（文字列）が同じなら React は再描画しない。`localStorage.clear()`（`key` が `null`）にも追従できる。保存に使うキー（`STORAGE_KEY_SETTINGS` とユーザーごとの接頭辞）を、設定の保存の外へ出さずに済む。
6. **サーバー側のスナップショットは `DEFAULT_SETTINGS.swipeAction` にする。** サーバーでの描画とハイドレーションの最初の描画が同じ値になり、ハイドレーションの不一致が起きない。ハイドレーションの後、React が保存されている値で描画し直す。
7. **値をキャッシュしない。** スナップショットの取得は、描画のたびに localStorage を読んで JSON を解析する。これは React Compiler を入れる前の動作（描画のたびに `getSettings()` を呼ぶ）と同じ負荷で、カードの枚数は 1 日のルーティンの数に限られる。モジュールの中に値を持つと、ユーザーの切り替えやテストの間で古い値が残る心配が増えるので、持たない。
8. **親から props で渡す形にはしない。** Issue はもう 1 つの案として props を挙げている。親で `getSettings()` を読むと、同じ固定が親へ移るだけで、親でも購読が要る。カードは 2 種類で、親も複数ある（リスト、ドラッグ用のリスト）ので、カードがフックを直接呼ぶほうが、配線の漏れ（L-060）が起きにくい。
9. **契約テストを足す。** コンパイル結果を調べる共通の関数を `src/__tests__/reactCompilerContract.helpers.ts` に切り出し、設定用の契約テスト `src/__tests__/reactCompilerSettings.contract.test.ts` を足す。既存の `reactCompilerToday.contract.test.ts` は、切り出した関数を import する形に変える（確認の内容は変えない）。「今日・現在時刻」と「保存された設定」は、対象のファイルの一覧も、固定を表す式も別なので、テストのファイルを分ける。契約テストは「固定されたブロックが 0 件」を期待するので、コンパイラの出力の形が変わって道具がブロックを見つけられなくなると、黙って通るようになる。これを防ぐため、道具そのもののテスト `src/__tests__/reactCompilerContract.helpers.test.ts` を足し、わざと固定される短い例で、道具が固定を見つけられることを確かめる（ローカルのレビューで追加）。
10. **規約に足す。** `docs/02-development/coding-standards.md` に「React Compiler と保存された設定の値」の小節と、コードレビューの観点を足す。
11. **スワイプした時点の読み取り（`createSwipeHandler`）は変えない。** イベントの時点で読むので固定されない。表示が新しい設定に追従すれば、見える動作と実行される動作は一致する。
12. **範囲に入れないもの**は、下の「範囲外」に書く。

## 変更する箇所

| ファイル                                                                                          | 変更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/settings/state/useSwipeActionSetting.ts`（新規）                                    | スワイプの動作の設定を購読するフック（下の「フック」）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/features/routine/components/RoutineItem.tsx`                                                 | `getSettings` の import と呼び出しをやめ、`const swipeAction = useSwipeActionSetting();` にする。`swipeActionType={swipeAction}` を渡す                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/features/routine/components/SortableRoutineItem.tsx`                                         | 同上（表示モードと編集モードの 2 か所の `swipeActionType`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/__tests__/reactCompilerContract.helpers.ts`（新規）                                          | `reactCompilerToday.contract.test.ts` から、コンパイルと sentinel のブロックの取り出しの関数を、中身を変えずに移す（`readSource`・`compileWithReactCompiler`・`listSentinelBlocks`。`ROOT`・`SENTINEL_CONDITION`・`readBlock` はこのファイルの中だけで使う）。ローカルのレビューで、ソースの文字列を受け取る `compileSourceWithReactCompiler(source, file)` を足し、`compileWithReactCompiler` はそれを呼ぶ形にした（コンパイルのオプションは変えない）。メモ化の依存の比較の件数を返す `countDependencyComparisons(code, dependency)` も足した（設定用の契約テストと、道具のテストが使う） |
| `src/__tests__/reactCompilerContract.helpers.test.ts`（新規）                                     | 契約テストの道具が、固定される例を見つけられることを確かめる（下の「テスト」。ローカルのレビューで追加）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/__tests__/reactCompilerToday.contract.test.ts`                                               | 移した関数を import する形にする。確認の内容・対象の一覧は変えない                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/__tests__/reactCompilerSettings.contract.test.ts`（新規）                                    | 2 つのカードのコンパイル結果で、設定が固定されていないことを確かめる（下の「テスト」）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/features/settings/__tests__/useSwipeActionSetting.test.tsx`（新規）                          | フックの単体テスト                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx`（新規） | カードが、設定の変更でスワイプの背景を描画し直すことを確かめる配線テスト                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/features/routine/__tests__/RoutineItem.test.setup.ts`                                        | `@/features/settings/storage` のモックに、本物のモジュールの export（`SETTINGS_UPDATED_EVENT`・`DEFAULT_SETTINGS` など）を残す。`getSettings` のモックは変えない                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `docs/02-development/coding-standards.md`                                                         | 「React Compiler と保存された設定の値」の小節と、レビューの観点を足す（下の「規約」）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

`SwipeableRoutineItem.tsx`・`SortableRoutineEditModeItem.tsx`・`helpersPresentation.ts`・`settings/storage.ts` は変更しない。

Storybook（`RoutineItem.stories.tsx`・`SortableRoutineItem.stories.tsx`）は、ストーリーの `beforeEach()` の中で `saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" })` を呼んでいる。フックが `SETTINGS_UPDATED_EVENT` を購読するので、ストーリーの動作は変更しなくても、保存の直後に表示が追従する。

実装では、Storybook の 2 つのファイル（`RoutineItem.stories.tsx`・`src/features/routine/pages/DraggableRoutineList.stories.tsx`）の冒頭のコメントだけを直した。カードが「`getSettings()` を直接呼ぶ」と説明していたので、「`useSwipeActionSetting()` で設定を読む」に合わせた。ストーリーの動作は変えていない。

### フック

`src/features/settings/state/useSwipeActionSetting.ts`

```ts
import { useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  getSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/features/settings/storage";
import type { AppSettings } from "@/types/routine";

type SwipeAction = AppSettings["swipeAction"];

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener(SETTINGS_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SETTINGS_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

// 受け付ける値の一覧。型をキーにしているので、swipeAction に値を足すと、ここが型エラーになる
const SWIPE_ACTIONS: Record<SwipeAction, true> = { delete: true, edit: true };

const isSwipeAction = (value: unknown): value is SwipeAction =>
  typeof value === "string" && Object.hasOwn(SWIPE_ACTIONS, value);

// 保存データは型を検証していないので、受け付ける値でないとき（壊れた値を含む）は "edit" として返す
const getSnapshot = (): SwipeAction => {
  const saved: unknown = getSettings().swipeAction;
  return isSwipeAction(saved) ? saved : "edit";
};

const getServerSnapshot = (): SwipeAction => DEFAULT_SETTINGS.swipeAction;

export const useSwipeActionSetting = (): SwipeAction =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

- `subscribe`・`getSnapshot`・`getServerSnapshot` は、モジュールの直下に置く（描画のたびに作り直すと、`useSyncExternalStore` が購読をやり直す）。
- 購読の解除では、足した 2 つのリスナーを両方外す（L-108）。`useRef` のガードは使わないので、StrictMode の 2 回のマウントでもリスナーが失われない（L-469）。
- コメント（JSDoc）は日本語で書き、「描画中に `getSettings()` を直接呼ぶと React Compiler に固定されるため、このフックを使う」ことと、Issue の番号（#224）を書く。
- この形は、試しに書いてコンパイルし、確かめてある。カードの出力から `getSettings` が消え、`$[n] !== swipeAction` の比較が入る（`RoutineItem.tsx` は 1 か所、`SortableRoutineItem.tsx` は表示モードと編集モードの 2 か所）。

### 規約

`docs/02-development/coding-standards.md` の「React Compiler と今日・現在時刻」の小節の直後（「ダークモードの配色」の前）に、小節「React Compiler と保存された設定の値」を足す。書く内容は次のとおり。

- 冒頭の段落: 保存された設定（`getSettings()`）は、props・state・フックの戻り値のどれにも依存しないので、フック・コンポーネントの本体で呼んで表示に使うと、最初の描画の値に固定される（書き方によっては、ほかの props などに依存するメモ化のブロックの中に入り、その値が変わるまで古い値のままになる）。Jest はコンパイラを通さないので、単体テストでは検出できない（「React Compiler と今日・現在時刻」と同じ仕組み）。
- 表示に使う設定は、購読するフックで受け取る。スワイプの動作は `useSwipeActionSetting()`（`src/features/settings/state/useSwipeActionSetting.ts`）。
- 本体から呼ぶ関数が、呼ばれた時点（描画中）に `getSettings()` を読み、その結果を表示に使う場合も、同じように固定される。表示に使う設定を扱う関数は、設定の値を引数で受け取る関数にし、購読するフックの戻り値を渡す（ローカルのレビューで追加）。
- ほかの項目が要るときは、同じ形のフックを足す。スナップショットは、文字列・数値・真偽値か、変わらない限り同じ参照の値にする（`getSettings()` は、保存データがあると呼ぶたびに新しいオブジェクトを返すので、設定の全体をスナップショットにしない）。配列・オブジェクトの項目も、保存データがあると、読むたびに新しい参照になる。そのまま返すと再描画が止まらなくなるので、中身が前回と同じなら、前回返した値を返す（ローカルのレビューで追加）。保存データは値の型を検証していないので、スナップショットでは、受け付ける値のどれかに直してから返す（ローカルのレビューで追加）。受け付ける値の一覧は、項目の型をキーにしたオブジェクトで持ち、値を足したときに型エラーで気付けるようにする（例: `useSwipeActionSetting.ts` の `SWIPE_ACTIONS`。ローカルのレビューで追加）。
- サーバー側のスナップショットは `DEFAULT_SETTINGS` の値にする。サーバーでの描画とハイドレーションの最初の描画は既定値になり、その後で保存された値に切り替わるので、見た目が大きく変わる設定を、サーバーで描画されるコンポーネントで使うときは注意する（ローカルのレビューで追加）。
- フックを使うフック・コンポーネントは、契約テスト（`src/__tests__/reactCompilerSettings.contract.test.ts`）の `SETTINGS_TARGETS` に足す。フックの戻り値は、名前のある変数に入れて使い、その変数名を `dependencies` の `name` に書く（変数に入れずに使うと、比較は、コンパイラが付けた名前（`t0` など）との比較になり、`name` に書ける名前が無い）。`dependencies` の `comparisons` には、コンパイル結果の `$[n] !== 変数名` の件数を書く（フックの戻り値を直接の依存に持つメモ化のブロックの数で、値を使う箇所の数とは限らない。同じブロックの中で何度使っても 1 件。式の形によっては、値を使っていても数に入らない。例: 値をそのまま JSX に渡す箇所と、import した関数の結果をそのまま描画に使う箇所は、数に入る。比較の結果で文字列を選ぶ箇所、`String()` などの変換に渡す箇所、ほかのフックの引数に渡す箇所は、数に入らない。似た形でも結果が変わることがあるので、形から推測せず、契約テストを実行して、実際の件数を確かめる）。`comparisons` は 1 以上にする（0 件では、件数の確認が何も守らないので、契約テストで落ちる。実際の件数が 0 件になるときは、値をそのまま JSX に渡すなど、件数に入る形で使う箇所を作る）。使う箇所を増やした・減らしたときと、値を使う式の形を変えたときは、件数が変わることがある。どの箇所もフックの戻り値から求めていることを確かめてから、この件数を直す（ローカルのレビューで追加）。
- 契約テストで守られる範囲（ローカルのレビューで追加）: 契約テストが確かめるのは、`SETTINGS_TARGETS` に載せたファイルだけ。ファイルごとに確かめることは、下の「テスト」の契約テストの 2〜4（ソースに `getSettings` が書かれていない、最初の描画で 1 回だけ実行されるブロックに `getSettings(` が無い、フックの戻り値を直接の依存に持つメモ化のブロックの数が `comparisons` と同じで、`comparisons` を 1 以上で書いている）。契約テストでは見つからないので、レビューで確かめることは、次の 2 つ: 一覧に無いファイル。ほかのファイルの関数（中で `getSettings()` を読む）を本体から呼ぶ形のうち、件数が変わらないもの（呼び出しを新しく足しただけの場合、同じメモ化のブロックの中にある複数の箇所の一部だけを置き換えた場合、もともと件数に入っていない箇所を置き換えた場合。例: 比較の結果で文字列を選ぶ箇所、`String()` などの変換に渡す箇所、ほかのフックの引数に渡す箇所）。
- 対象外: イベントハンドラの中で読む設定（イベントの時点で読む）、`useState` の初期値として読む設定（最初の 1 回だけ読み、その後は、利用者が編集する値として state で持つもの。フォームの初期値がこれに当たる。例: `src/features/settings/state/useSettingsFormState.ts` の `useState(createInitialSettingsFormState)`。`SETTINGS_TARGETS` に載せていないファイルなので、同じファイルの中の関数で読んでいる）。ただし、`SETTINGS_TARGETS` に載せたファイルでは、これらの読み方も、契約テストの「ソースに `getSettings` が書かれていない」で落ちる。`SETTINGS_TARGETS` に載せたファイルでこれらの読み方が要るときは、読む処理を、コンポーネント・フック以外のファイルの関数に置き、その関数が設定を読むのが、イベントの時点か、`useState` の初期化のときだけになるようにする（イベントの時点で読む例: `helpersPresentation.ts` の `createSwipeHandler` は、本体から呼ぶが、設定を読むのは、返したハンドラが呼ばれた時点。初期値として読む例: `useState(() => readX())`）。この 2 つ以外の、描画中に読んだ値を表示に使う形は、対象外ではない。また、`useState` の初期値として読む形でも、利用者が編集しない表示（カードの見た目など）に使う設定は、対象外ではない。固定の仕組みは違うが（React Compiler ではなく、state が最初の値を持ち続ける）、設定を変えても、コンポーネントが作り直されるまで古いまま残る。表示に使う設定は、購読するフックで受け取る（ローカルのレビューで追加）。

「4. コードレビューの観点」には、「今日・現在時刻」の観点の次に、「フック・コンポーネントの本体で `getSettings()` を呼び、その値を表示に使っていないか、本体から呼ぶ関数が、描画中に `getSettings()` を読んで、その結果を表示に使っていないか、`useState` の初期値として読んだ設定を、利用者が編集しない表示に使っていないか」の観点を 1 行足す（イベントの時点で読む設定と、`useState` の初期値として読み、その後は利用者が編集する設定（フォームの初期値）は対象外と書く）。

## テスト

- **契約テスト**（`reactCompilerSettings.contract.test.ts`。Jest はコンパイラを通さないので、コンパイル結果を調べる。L-538）: 対象は 2 つのカード。ファイルごとに次を確かめる。
  1. コンパイルされている（出力に `_c(` がある。無いと、3 の確認が空振りで通る）。
  2. ソースに `getSettings` が書かれていない（ローカルのレビューで追加）。コンパイル結果ではなくソースを見るのは、3 の確認だけでは、本体で読む形の一部を見つけられないため。`getSettings()` が、ほかの値（props など）に依存するメモ化のブロックの中に入ると、その値が変わるまで古い設定のまま固定されるが、最初の描画で 1 回だけ実行されるブロックにはならない。同じファイルの中の関数に包んで読む形も、ここで見つかる。文字で探すので、コメントに `getSettings` と書いた場合も落ちる（イベントの時点で読む設定や、`useState` の初期値として読む設定（フォームの初期値など、その後は利用者が編集する値）が要るときは、読む処理を、コンポーネント・フック以外のファイルの関数に置く）。
  3. 最初の描画で 1 回だけ実行されるブロックの中に `getSettings(` が無い。2 が通ればこの確認も通るが、Issue #224 で起きた形（コンパイル結果で固定されている）を直接確かめる確認として残す（「今日・現在時刻」の契約テストと同じ見方）。
  4. メモ化の依存の比較（`$[n] !== swipeAction`）の件数が、`SETTINGS_TARGETS` に書いた件数と同じである（`RoutineItem.tsx` は 1 件、`SortableRoutineItem.tsx` は 2 件）。「1 件以上ある」ではなく件数を比べるのは、`SortableRoutineItem.tsx` の 2 か所のうち 1 か所だけを、ほかのファイルの関数（中で `getSettings()` を読む）の呼び出しに置き換えた場合を見つけるため（比較が 1 件残るので、「ある」だけの確認は通ってしまう。ローカルのレビューで変更）。件数は、フックの戻り値を直接の依存に持つメモ化のブロックの数で、値を使う箇所の数ではない（式の形によっては、戻り値を使っていても数に入らない。例: 値をそのまま JSX に渡す箇所と、import した関数の結果をそのまま描画に使う箇所は、数に入る。比較の結果で文字列を選ぶ箇所、`String()` などの変換に渡す箇所、ほかのフックの引数に渡す箇所は、数に入らない）。`SortableRoutineItem.tsx` の 2 か所は、表示モードと編集モードの別々のブロックにあるので 2 件になる。同じブロックの中にある複数の箇所の一部だけを置き換えた場合と、もともと件数に入っていない箇所を置き換えた場合は、件数が変わらず、この確認では見つからない（規約とレビューの観点で補う）。「固定されるブロックの総数」を比べる確認は足さない（カードに定数だけの JSX を足すなど、設定と関係のない変更でも数が変わって落ち、原因が伝わらないため）。件数は、道具の `countDependencyComparisons(code, dependency)` で数える（変数名は正規表現の文字として扱わず、名前が前方一致するだけの変数と、プロパティの比較は数えない）。`SETTINGS_TARGETS` に書いた件数が 1 以上であることも、別の確認で確かめる（ローカルのレビューで追加）。0 件の登録は、`name` に書いた変数を直接の依存に持つメモ化のブロックが 1 つも無いことを表し、値を使う箇所を関数に包んで読む形に置き換えても、0 件のままで通るため。実際の件数が 0 件になるのは、`name` が、フックの戻り値を入れた変数の名前と違う場合、フックの戻り値を変数に入れずに使っている場合、値を使う箇所が、どれも件数に入らない形の場合。
  5. ソースが `useSwipeActionSetting(` を呼んでいる。
- **契約テストの道具のテスト**（`reactCompilerContract.helpers.test.ts`。ローカルのレビューで追加）: 短い例を `compileSourceWithReactCompiler` でコンパイルし、次を確かめる。
  1. 本体で `getSettings()` を読む例は、`getSettings(` を含む「最初の描画で 1 回だけ実行されるブロック」が 1 つ見つかり、依存の比較に値が無い。
  2. フックの戻り値で受け取る例は、固定されるブロックが無く、依存の比較に値がある。
  3. 関数に包んで読む例は、固定されるブロックはあるが `getSettings(` を含まず、依存の比較に値が無い（規約に書いた、検出できる範囲の根拠）。
  4. 設定の値を、別々のメモ化のブロックの 2 か所で使う例は、依存の比較が 2 件ある。そのうち 1 か所だけを関数に包んで読む形にすると、固定されるブロックは `getSettings(` を含まず、依存の比較が 1 件に減る（契約テストが件数を比べる根拠）。
  5. 設定の値を、同じ JSX 要素の 2 か所で使う例は、依存の比較が 1 件で、片方だけを関数に包んで読む形にしても 1 件のまま変わらない（件数の確認では見つからない形の根拠）。
  6. 設定の値から、比較の結果で文字列を選ぶ式で求めた値を経由して使う例は、依存の比較に変数が出ない（0 件）。この使い方を関数に包んで読む形に置き換えても、固定されるブロックは見つからず、件数も 0 件のまま変わらない（件数の確認では見つからない形の根拠）。
  7. 設定の値を引数にして、import した関数の結果をそのまま描画に使う例は、依存の比較が 1 件ある（呼び出しのブロックが、値を直接の依存に持つ）。引数を関数に包んで読む形に置き換えると、0 件に減る（件数の確認で見つかる形の根拠。ローカルのレビューで追加）。
  8. もともと件数に入っていない箇所（`String()` に渡して描画に使う例、ほかのフックの引数に渡す例）は、依存の比較に変数が出ない（0 件）。関数に包んで読む形に置き換えると、`getSettings(` を含まない「最初の描画で 1 回だけ実行されるブロック」が 1 つでき、件数は 0 件のまま変わらない（最初の描画の値に固定されるのに、契約テストでは見つからない形の根拠。ローカルのレビューで追加）。
  9. 本体で `getSettings()` を読んでも、ほかの値（props）に依存するメモ化のブロックの中で読む例は、最初の描画で 1 回だけ実行されるブロックとしては見つからない（契約テストが、ソースに `getSettings` が書かれていないことも確かめる根拠）。
  10. `countDependencyComparisons` は、名前が前方一致するだけの変数と、プロパティの比較を数えず、名前に `$` を含む変数も数える。キャッシュの宣言（`const $ = _c(n)`）が無い出力では数えない。キャッシュの変数名が `$0` になる例（コンポーネントが `$` という名前の変数を使っている）でも数える。ソースに書いた、キャッシュ以外の変数の比較（`$1[0] !== 変数名`）は数えない。名前が `$` で終わる変数（`a$[0]`）と、プロパティの `$`（`obj.$[0]`）との比較も数えない。
  11. フックの戻り値を変数に入れずに使う例は、依存の比較が、コンパイラが付けた名前（`t0`）との比較になる。固定されるブロックは無いが、変数名で数える件数は 0 件になる（契約テストの一覧に載せるファイルで、フックの戻り値を名前のある変数に入れる根拠。ローカルのレビューで追加）。
  12. コンパイルされない関数からは、ブロックが 1 つも見つからない。
- **フックの単体テスト**（`useSwipeActionSetting.test.tsx`。保存の関数はモックせず、本物の `getSettings`・`saveSettings` と jsdom の localStorage を使う。L-059）:
  - 保存データが無いときは、既定値（`"delete"`）を返す。
  - 保存データがあるときは、その値を返す（`"delete"` か `"edit"`）。
  - `saveSettings()` で値が変わると、新しい値を返す（同じタブの経路）。
  - localStorage を直接書き換えて `storage` イベントを出すと、新しい値を返す（別のタブの経路）。書き方は下の「別のタブの経路の書き方」に従う。
  - アンマウントで、2 つのイベントのリスナーが両方外れる（L-108）。
  - StrictMode で描画しても、設定の変更に追従する（L-469）。
  - 保存された `swipeAction` が壊れている（オブジェクト・配列・`null`・知らない文字列・プロトタイプにある名前の `"constructor"`）ときも、描画が止まらず `"edit"` を返す（ローカルのレビューで追加）。
  - サーバーでの描画（`renderToString`）では、保存された値ではなく既定値（`"delete"`）を返す（ローカルのレビューで追加。`getServerSnapshot` を渡し忘れると、サーバーでの描画が例外になる）。
  - ハイドレーション（`hydrateRoot`）では、不一致を起こさずに既定値で始め、その後に保存された値へ追従する（ローカルのレビューで追加。サーバーの HTML は、設定を保存する前に作る。サーバーは localStorage を持たないので、本番と同じ順序にするため。`getServerSnapshot` に `getSnapshot` を渡すと、不一致になる）。
- **配線テスト**（`routineItemSwipeActionSetting.wiring.test.tsx`。本物のフックと本物の保存を通す。L-059、L-060）: `RoutineItem`、`SortableRoutineItem`（表示モード）、`SortableRoutineItem`（編集モード）のそれぞれで、props を変えずに設定を `"edit"` へ変えると、スワイプの背景が赤（`.bg-red-500`）から青（`.bg-blue-500`）に変わることを、同じタブの経路（`saveSettings`）と別のタブの経路（`storage` イベント）の両方で確かめる。`swipeActionType` は部品の側に既定値（`"delete"`）があり、渡し忘れてもモックのテストでは気づけないので、変更後の色まで見る。色のクラスは `src/components/swipeable/getSwipeActionMeta.tsx` が返す（削除は `bg-red-500`、編集は `bg-blue-500`）。このテストは `routineItemPastColor.wiring.test.tsx` と同じ構成にする。`@dnd-kit/sortable` と `@dnd-kit/utilities` を同じ形でモックし、`RoutineItem.test.setup.ts` は使わない（`@/lib/storage/core` と `@/features/settings/storage` をモックしない）。
- **別のタブの経路の書き方**（フックの単体テストと配線テストで同じにする）: `saveSettings()` は使わない（使うと `SETTINGS_UPDATED_EVENT` も出て、`storage` の購読を外してもテストが通ってしまう）。次の 2 つを順に行う。
  1. `localStorage.setItem(getUserScopedKey("app-settings"), JSON.stringify({ ...DEFAULT_SETTINGS, swipeAction: "edit" }))` で書く。`getUserScopedKey` は `@/lib/storage/core` から、`DEFAULT_SETTINGS` は `@/features/settings/storage` から import する。キーの文字列 `"app-settings"` は、`storage.ts` の非公開の定数 `STORAGE_KEY_SETTINGS` と同じ値をテストに直接書く（定数は export しない）。
  2. `act(() => { window.dispatchEvent(new StorageEvent("storage")); })` でイベントを出す（jsdom の `localStorage.setItem` は、同じウィンドウには `storage` イベントを出さないため）。
- **同じタブの経路の書き方**: `act(() => { saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" }); })`。`storage` イベントは出さない。
- **テストの後始末**: 設定を書くテストは、`afterEach` で `localStorage.clear()` を呼び、次のテストへ値を残さない。
- **既存のテスト**: `RoutineItem.render.test.tsx`・`RoutineItem.actions.test.tsx` は、`RoutineItem.test.setup.ts` のモックを直したうえで、そのまま通す。`reactCompilerToday.contract.test.ts` は、関数の切り出しの前後で、テストの件数と結果が変わらないことを確かめる。
- **TDD の順序**: 先に、設定用の契約テストと配線テストを書き、いまのコードで失敗することを確かめてから、フックを作ってカードを直す。フックの単体テストは、フックより先に書く。
- **検証**: `npm test`、`npm run lint`、`npm run typecheck`、`npm run format:check`、`npm run build` を通す。直した後のコンパイル結果は契約テストで確かめる。本番ビルドでの動作の確認（別のタブと同じ形で設定を書き換え、再読み込み無しで背景の色が変わること）も、実装の後に行う。この確認は、2026年11月13日に行った（結果は「確かめたこと」の「直した後（本番ビルドで確かめた）」）。

## 範囲外

- スワイプした時点の読み取り（`createSwipeHandler`）の変更。
- 「同じ書き方の調査」の表にある、ほかの `getSettings()` の呼び出しの変更（初期値として読む箇所を、別のタブでの変更に追従させることなど）。
- `routine/hooks/useTrainDelays.ts` の変更。設定の `trainDelay` を `useState` の初期値として読み、利用者が編集しない表示（ホームの電車遅延情報）に使っている。規約の「対象外」には当たらないが、React Compiler による固定ではなく、カードの表示とも別の動作なので、今回は直さない（別の Issue にする。ローカルのレビューで追加）。
- `pomodoro/usePomodoroTimerInitialState.ts` と `routine/components/useRoutineFormSourceData.ts` の変更。どちらも、設定を `useMemo(…, [])` で 1 回だけ読み、利用者が編集しない表示や動作（Pomodoro のタイマーの時間、ルーティンのフォームのヒントの文字と、送信時に空欄の代わりに使う値）に使っている。`useTrainDelays.ts` と同じく、React Compiler による固定ではなく、カードの表示とも別の動作なので、今回は直さない（別の Issue にする。ローカルのレビューで追加）。
- `useRoutines.ts` が `SETTINGS_UPDATED_EVENT` だけを購読している点（`useRoutines.ts` が設定から読むのは、定期リフレッシュの間隔だけ。別のタブで設定を変えても、この間隔が追従しない）。カードの表示とは別の動作なので、今回は扱わない。
- 設定の全体や、ほかの項目を購読する汎用のフック。
- 再読み込み無しのダウンロード（`syncLatestData`）を画面につなぐこと。
- 「今日・現在時刻」の契約テストの確認の内容の変更。

## 確認した知見

`<dev-flow-kit>/lessons/review-lessons.md` の次の項目を確認し、設計に反映した。

- L-538（React Compiler は、props・state・フックの戻り値に依存しない式を最初の描画の値でメモ化する。Jest はコンパイラを通さない）: 今回の不具合の仕組み。「決めたこと」1 と、契約テスト。
- L-466（常駐するフックやコンポーネントが設定の値を 1 回だけ読み、変更が反映されない）: 「決めたこと」2・4。変更の通知の購読と `useSyncExternalStore` で直す。
- L-469（`useRef` のガードと cleanup の併用で、StrictMode でリスナーが失われる）: 「フック」。ガードを使わず、StrictMode のテストを足す。
- L-108（タイマー・購読の解除）: 「フック」。2 つのリスナーを両方外し、テストで確かめる。
- L-059（モックしたテストだけでは、実物を検証できない）: フックの単体テストと配線テストは、本物の保存を使う。
- L-060（省略できる props と既定値で、配線の漏れをテストが検出しない）: 配線テストは、既定値（赤）ではない値（青）に変わることまで見る。
