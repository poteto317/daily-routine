# バックグラウンドから戻ったときに、時間を過ぎたルーティンの背景色を更新する 設計書

作成日: 2026年11月12日

対象: [Issue #9](https://github.com/poteto317/daily-routine/issues/9)「bug: スマホでバッググラウンドから呼び出した際に時間が過ぎているルーティンの背景色が変更されていない」

## 背景と目的

ホーム画面のルーティンのカードは、今日の曜日のルーティンで開始時間を過ぎていて未完了なら、背景を黄色（`bg-yellow-50`）にする。Issue #9 は、アプリを終了せずにバックグラウンドへ回し、開始時間を過ぎてから戻したときに、この黄色に変わらないという不具合である。

PR #60（コミット 7d76c7a、2026年4月9日）で、Issue の「追加対応」の 5 項目（復帰イベントでの即時の再評価、30 分間隔のフォールバックタイマー、直近に更新があったときのスキップ、非表示中のタイマー停止、間隔の設定）は実装済みである。しかし、Issue のコメント（2026年4月6日）のとおり、スマホでは想定どおりに動いていない。

目的は次の 2 つ。

- 原因を特定し、画面を開き直さなくても、バックグラウンドから戻った時点で背景色が今の時刻に合うようにする。
- 同じ不具合が戻ったときに、テストで検出できるようにする。

Issue に書かれているとおり、リアルタイム性（開始時間になった瞬間に色が変わること）は目的ではない。時間超過の積み上がりを、戻ったときに目で確かめられることが目的である。

## 原因

スマホに固有の問題ではなく、PC のブラウザでも起きる。原因は、React Compiler の自動メモ化と、描画時に現在時刻を読む関数の組み合わせである。

1. `isRoutinePast(routine)`（`src/features/routine/helpersPresentation.ts`）は、引数に現在時刻を取らず、関数の中で `getCurrentTime()` と `new Date()` を読む。同じ引数でも、呼ぶ時刻によって結果が変わる。
2. カードのクラスは `getRoutineItemCardClassName({ routine, isEditMode, ... })`（`src/features/routine/components/routineItemModel.ts`）が `isRoutinePast(routine)` を呼んで決める。
3. このプロジェクトは React Compiler（`next.config.ts` の `reactCompiler: true`）を使う。コンパイラは、カードの各コンポーネントの中の `getRoutineItemCardClassName(...)` の呼び出しを、`routine`・`isEditMode`・`isDragging` をキーにしてメモ化する。現在時刻はキーに入らない。
4. 復帰時に呼ばれる `refreshRoutineState`（`src/features/routine/hooks/routineStateSync.ts`）は、日付が変わっていなければ `[...previous]` を返す。配列は新しくなるが、中の `routine` オブジェクトの参照は変わらない。
5. その結果、復帰イベントで state を更新してカードが再描画されても、クラスの計算はキー（`routine` など）が変わらないのでメモの値が使われる。`isRoutinePast` は呼び直されず、背景色は最初の描画の値のままになる。

コンパイル結果で確かめたのは、カード自身のクラスの計算のメモ化である。一覧（`src/features/routine/pages/DraggableRoutineList.tsx`）の `routines.map(...)` のブロックは `routines`（配列）などをキーにしているので、`refreshRoutineState` が新しい配列を返せばカードは再描画されうる。それでも色が変わらないのは、上の 3 のメモ化による。

根拠は次のとおり。

- **コンパイル結果**: 契約テスト（`src/__tests__/reactCompilerToday.contract.test.ts`）と同じ方法でカードのコンポーネントをコンパイルすると、`getRoutineItemCardClassName(...)` の呼び出しは `if ($[n] !== isEditMode || $[m] !== routine) { ... }` の形の番兵ブロックの中に入る。現在時刻はキーに入っていない。
- **実際の画面での再現**: 開発サーバー（`npm run dev`）で、開始時間が 1 分後のルーティンを用意した。開始時間を過ぎた後に `visibilitychange`（`document`）・`focus`・`pageshow`（`window`）を発火させて 1.5 秒待っても、カードは `bg-white` のままだった。再読み込みすると `bg-yellow-50` になった。
- **経緯**: `reactCompiler: true` は最初のコミット（3508ad0、2026年3月28日）から有効で、PR #60 より前である。PR #60 の修正は、マージの時点から画面には効いていなかったことになる。PR #60 のテストは Jest で通るが、Jest（ts-jest）は React Compiler を通さないので、この不具合を検出できない（L-690）。

「今日」が固定される同じ種類の不具合は、PR #209・#212・#213 で直し、`docs/02-development/coding-standards.md` の「React Compiler と今日・現在時刻」に規約がある。カードの背景色は、その対応の対象から漏れていた。

## 決めたこと

利用者への追加の質問はしない。どれも技術的な選択で、Issue の記述と既存の規約から決められるため、推奨案を採用した。

| 項目                           | 決定                                                                                                                                                   | 理由                                                                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現在時刻の持ち方               | 共通フック `useCurrentMinute`（`useSyncExternalStore` を使う外部ストア）を新しく作り、カードの各コンポーネントが直接読む                               | 親の JSX がメモ化されていても、ストアを読むコンポーネントは通知で自分から再描画される。props を何段も渡す必要がない                                                                                                       |
| 値の単位                       | 今の「分」の開始時刻（epoch ミリ秒）                                                                                                                   | 背景色の判定は分単位。同じ分のあいだは同じ値になるので、通知が重なっても再描画は 1 回で済む                                                                                                                               |
| `isRoutinePast`                | `isRoutinePast(routine, nowMs)` に変え、関数の中で時計を読まない。`nowMs` は必須の引数にする                                                           | 純粋な関数にすれば、コンパイラのメモ化と食い違わない。必須にすると、渡し忘れを型チェックで検出できる                                                                                                                      |
| `getRoutineItemCardClassName`  | 引数に必須の `nowMinute: number` を足す                                                                                                                | 呼ぶ側 5 か所の渡し忘れを型チェックで検出できる。コンパイル結果で `nowMinute` がメモのキーに入ることを契約テストで確かめられる                                                                                            |
| 通知する場所                   | `useRoutineForegroundSync` の `runRefresh` の中。画面が表示中なら、フォールバックのスキップ条件より前に通知する                                        | 復帰イベントのまとめ（L-488）とフォールバックタイマーをそのまま使える。変更が最も小さい                                                                                                                                   |
| フォールバックのスキップと通知 | 時刻の通知はスキップしない（`refreshRoutineState` だけをスキップする）。Issue の「追加対応」の 3 つめの読み方を少し変える判断なので、PR の説明にも書く | スキップは「直近にルーティンが更新されたなら表示も新しい」という前提で入れたものだが、React Compiler のもとでは、ほかのルーティンの更新では各カードの色は再計算されない。通知は軽い（同じ分なら再描画なし）ので、常に行う |
| 1 分ごとのタイマー             | 作らない                                                                                                                                               | Issue に「リアルタイム性ではなく、時間超過の積み上がりを視覚的に明確にするのが目的」とある。表示中の更新は、既存のフォールバックタイマー（既定 30 分、設定で変更可）で行う                                                |
| `refreshRoutineState`          | 変えない（`[...previous]` のまま）                                                                                                                     | 日付変更のリセットに使われている。背景色の更新は時刻の通知で行うので、変える必要がない                                                                                                                                    |
| フックの置き場所               | `src/hooks/useCurrentMinute.ts`                                                                                                                        | 「今日」の共通フック `src/hooks/useToday.ts` と同じ場所。`src/features/` から `src/hooks/` への参照は、既存の依存の向きに合う                                                                                             |
| 対象の範囲                     | カードの背景色（`isRoutinePast` を使う 5 つのコンポーネント）だけ                                                                                      | ルーティンの機能で、描画時に現在時刻を読んでいるのはここだけである                                                                                                                                                        |
| 実機での確認                   | iOS・Android の実機での確認は、この変更の作業者（AI）には実施できない。PR に手順を書き、利用者に確認を依頼する                                         | Issue のテストは実機での再現手順。開発サーバーとブラウザでの再現・修正の確認までは行う                                                                                                                                    |

## 設計

### 1. 現在時刻のストア（`src/hooks/useCurrentMinute.ts`、新規）

```ts
import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** いまの「分」の開始時刻（epoch ミリ秒）。同じ分のあいだは同じ値を返す */
export const getCurrentMinute = (): number =>
  Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;

/** 表示に使う現在時刻を読み直させる（アプリがバックグラウンドから戻ったときなどに呼ぶ） */
export const notifyCurrentMinute = (): void => {
  listeners.forEach((listener) => listener());
};

/**
 * 描画時に使う現在時刻（分単位）。
 * notifyCurrentMinute() が呼ばれ、分が変わっていれば、このフックを使うコンポーネントが再描画される。
 */
export const useCurrentMinute = (): number =>
  useSyncExternalStore(subscribe, getCurrentMinute, getCurrentMinute);
```

- ストアは値を持たない。通知は「時刻を読み直せ」という合図で、値は読むたびに `Date.now()` から求める。このため、コンポーネントが後からマウントされても古い値にならない。
- 通知を受けた React は `getCurrentMinute()` を呼び、前の値と同じ（同じ分）なら再描画しない。
- フックの本体には `"use no memo"` を付けない。コンパイルして確かめたところ、このフックにはメモ化される式が無い（コンパイル結果に `_c(` が出ない）。
- サーバー側のスナップショットにも同じ関数を渡す。カードはサーバーでもハイドレーションの最初の描画でも描画されないので、ハイドレーションの不一致は起きない（`AuthGuard` が最初にローディングを返す。サーバーでは、ルーティンの初期値も空配列になる）。
- 購読の解除は `useSyncExternalStore` がアンマウント時に行う（L-108）。

### 2. `isRoutinePast` を純粋な関数にする（`src/features/routine/helpersPresentation.ts`）

```ts
export const isRoutinePast = (routine: Routine, nowMs: number): boolean => {
  const now = new Date(nowMs);
  const isTodayRoutine = routine.daysOfWeek.includes(toJstDay(now));
  return (
    isTodayRoutine &&
    timeToMinutes(toJstTime(now)) > timeToMinutes(routine.startTime)
  );
};
```

- 曜日と時刻の両方を、渡された `nowMs` から JST で求める（`toJstDay`・`toJstTime`・`timeToMinutes` は `@/lib/storage/core` にある）。0 時をまたいだ後の通知では、曜日も新しい日になる。
- 判定の規則（今日の曜日で、今の時刻が開始時間より後）は変えない。
- `getCurrentTime` は、この関数からは使わなくなる。`src/features/meal/utils/mealFormat.ts` が使っているので、関数そのものは残す。
- `isRoutinePast` は `src/features/routine/helpers.ts` と `src/features/routine/index.ts` から再エクスポートされている。エクスポートは残す（シグネチャだけが変わる）。プロダクトコードで呼んでいるのは `routineItemModel.ts` だけである。

### 3. カードのクラス（`src/features/routine/components/routineItemModel.ts`）

`RoutineItemCardClassParams` に必須の `nowMinute: number` を足し、`getRoutineItemCardClassName` は `isRoutinePast(routine, nowMinute)` を呼ぶ。ほかの分岐（ドラッグ中・編集モードなど）は変えない。

### 4. カードのコンポーネント（5 つ）

次の 5 つのコンポーネントで、本体の先頭で `const nowMinute = useCurrentMinute();` を呼び、`getRoutineItemCardClassName` に `nowMinute` を渡す。

| ファイル（`src/features/routine/components/`） | 注意                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `RoutineItem.tsx`                              |                                                                                                            |
| `SortableRoutineItem.tsx`                      | `shouldUseSwipeOnlyRoutineItem(isEditMode)` による早期リターンより前で呼ぶ（フックの呼び出し順を保つため） |
| `SortableRoutineNormalDragItem.tsx`            |                                                                                                            |
| `SortableRoutineEditModeItem.tsx`              |                                                                                                            |
| `RoutineDragOverlay.tsx`                       | `if (!routine) return null;` より前で呼ぶ                                                                  |

### 5. 復帰時の通知（`src/features/routine/hooks/useRoutineForegroundSync.ts`）

`runRefresh` を次のようにする。

```ts
const runRefresh = (force: boolean) => {
  if (document.visibilityState !== "visible") return;
  // 表示に使う現在時刻は、スキップ条件に関係なく読み直させる
  notifyCurrentMinute();
  if (!force && shouldSkipFallbackRefresh()) return;
  refreshRoutineState(setRoutines);
  lastBackgroundRefreshAtRef.current = Date.now();
};
```

- 復帰イベント（`visibilitychange`・`pageshow`・`focus`）は、既存のとおり `setTimeout(0)` で 1 回にまとめてから `runRefresh(true)` を呼ぶ。通知も 1 回になる（L-488）。
- 画面が非表示のときは通知しない（既存の先頭の判定）。
- フォールバックタイマー（既定 30 分）のたびにも通知する。表示したままの画面でも、この間隔で背景色が今の時刻に合う。設定で間隔を 0 にするとタイマーは動かないが、復帰イベントでの通知は行われる（既存の仕様のまま）。
- リスナーとタイマーの後片付けは、既存のまま変えない（L-108）。

### 変更後の動き

1. 利用者がアプリをバックグラウンドへ回す。フォールバックタイマーは止まる（既存）。
2. ルーティンの開始時間を過ぎる。
3. 利用者がアプリを戻す。`visibilitychange` などが発火し、`runRefresh(true)` が 1 回呼ばれる。
4. `notifyCurrentMinute()` で、表示中のカードが `getCurrentMinute()` を読み直す。分が変わっているのでカードが再描画され、`nowMinute` が変わったため `getRoutineItemCardClassName` が呼び直される。
5. 開始時間を過ぎた未完了のカードが黄色になる。

## 採用しなかった案

- **現在時刻を `useRoutines` の state に持ち、props で各カードまで渡す**: 通る階層が多く（ページ・一覧・並び替えの各コンポーネント）、変更の範囲が広い。渡し忘れた経路は、また固定される。
- **カードのコンポーネントに `"use no memo"` を付ける**: カード自身のメモ化を外しても、色が更新されるのは、別の理由（`refreshRoutineState` が新しい配列を返すなど）でカードが再描画されたときだけである。フォールバックのスキップ条件が成り立つ回などでは更新されない。「現在時刻が計算の入力である」こともコードに表れず、契約テストでも確かめられない。5 つのコンポーネントのメモ化を外すことにもなる。
- **表示中に 1 分ごとのタイマーで通知する**: Issue がリアルタイム性を目的にしていない。必要になったら、`notifyCurrentMinute()` を呼ぶタイマーを足すだけで対応できる。
- **`refreshRoutineState` で各 `routine` を新しいオブジェクトにする**: メモのキーを無理に変える方法で、「現在時刻が計算の入力である」ことがコードに表れない。日付変更のリセットとも役割が混ざる。
- **カードごとのフック `useRoutineItemCardClassName` にまとめる**: `RoutineDragOverlay` は `routine` が無いことがあり、扱いが不自然になる。引数で渡すほうが、契約テストでキーを確かめやすい。

## 変更の範囲

| 種類                     | ファイル                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新規                     | `src/hooks/useCurrentMinute.ts`、`src/hooks/__tests__/useCurrentMinute.test.ts`、`src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 変更（実装）             | `src/features/routine/helpersPresentation.ts`、`src/features/routine/components/routineItemModel.ts`、カードのコンポーネント 5 つ、`src/features/routine/hooks/useRoutineForegroundSync.ts`                                                                                                                                                                                                                                                                                                                                                                                             |
| 変更（テスト）           | `src/features/routine/__tests__/helpers.presentation.test.ts`、`helpers.test.setup.ts`、`jstToday.test.ts`、`routineItemModel.test.ts`、`RoutineItem.test.setup.ts`（`@/lib/storage/core` のモックの `getCurrentTime` を `toJstTime` に置き換える。`RoutineItem.render.test.tsx`・`RoutineItem.actions.test.tsx` が本物の `isRoutinePast` を通るため）、`src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`、`src/__tests__/reactCompilerToday.contract.test.ts`、`src/features/routine/__tests__/useRoutines.initial-and-mutations.test.ts`（コメントの訂正だけ） |
| 変更（テストマトリクス） | `src/features/test-matrix/detailed-test-cases/group-01-04.ts`（2-24 に復帰時のケースを足す。2-24-2 の期待値の色の表記を実装に合わせる）                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 変更（ドキュメント）     | `docs/02-development/coding-standards.md`、`docs/03-testing/test-matrix.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

保存データ・同期・設定項目（`backgroundRefreshIntervalMinutes`）・文言は変えない。

## テスト方針

Jest は React Compiler を通さないので、「コンパイラのメモ化で固定される」不具合そのものは、通常のコンポーネントのテストでは赤にならない（L-690）。このため、配線のテストと、コンパイル結果を見る契約テストを組み合わせる。どのテストがどの退行を検出するかを次に示す。

| テスト                                                                                | 検出する退行                                                                                                                                 | 補足                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `helpers.presentation.test.ts`・`jstToday.test.ts`（`isRoutinePast(routine, nowMs)`） | 判定の規則の変更、JST の曜日・時刻の計算の誤り、0 時をまたいだときの曜日の誤り                                                               | 純粋性のテストを足す: システム時刻を A に固定し、`nowMs` に B を渡すと、結果は B に従う。関数の中で時計を読む実装に戻ると失敗する                                                                                                                                                                                                                                                                 |
| `routineItemModel.test.ts`                                                            | `getRoutineItemCardClassName` が `nowMinute` を `isRoutinePast` に渡さない                                                                   | `isRoutinePast` のモックが `(routine, nowMinute)` で呼ばれることを確かめる                                                                                                                                                                                                                                                                                                                        |
| `useCurrentMinute.test.ts`                                                            | 通知で値が更新されない、同じ分で値が変わる、アンマウント後も購読が残る                                                                       | 時計だけを進め、再描画も通知もしない場合は、値が変わらないことも確かめる（通知が必要であることの確認。`useSyncExternalStore` は描画のたびに値を読み直すので、`rerender()` はしない）。購読の解除は、アンマウント後に `notifyCurrentMinute()` を呼んでも `Date.now` が読まれないことで確かめる（購読が残っていれば、React が値を読み直すために `getCurrentMinute()` を呼ぶ）                       |
| `routineItemPastColor.wiring.test.tsx`                                                | カードのコンポーネントが `useCurrentMinute` を呼ばない、または `nowMinute` を渡さない                                                        | 5 つのコンポーネントそれぞれで、開始時間の前に描画し、時計を進めて `notifyCurrentMinute()` を呼ぶと、`routine` の props を変えなくても黄色になることを確かめる。`SortableRoutineItem` は `isEditMode={false}` で描画する（既定の `true` では `SortableRoutineEditModeItem` に任せるので、自分のクラスの計算を通らない）。修正前のコードでは、通知の関数が無く、カードも再描画されないので失敗する |
| `routineItemPastColor.wiring.test.tsx`（通しのテスト）                                | 復帰の検知から、現在時刻の通知、カードの再描画までのつながりが切れる（例: `useRoutineForegroundSync` が `notifyCurrentMinute()` を呼ばない） | 本物の `useRoutineForegroundSync` と `useCurrentMinute` を通し、カード 1 枚を同じ画面に描画する。時計を開始時間の後へ進めてから `visibilitychange`・`pageshow`・`focus` を発火させると黄色になること、復帰イベントが無くてもフォールバックタイマーの回で黄色になることを確かめる。`refreshRoutineState` はモックにする（保存データの読み直しは、このテストでは確かめない）                        |
| `useRoutineForegroundSync.test.tsx`                                                   | 復帰時に通知しない、非表示でも通知する、フォールバックのスキップで通知まで止める                                                             | 復帰イベントをまとめた後に通知が 1 回であること、スキップ条件が成り立つフォールバックの回でも通知は行い `refreshRoutineState` は呼ばないことを確かめる                                                                                                                                                                                                                                            |
| 契約テスト `reactCompilerToday.contract.test.ts`                                      | コンパイル結果で、`getRoutineItemCardClassName` の呼び出しのキーに `nowMinute` が入らない（＝React Compiler のもとで背景色が固定される）     | 5 つのコンポーネントを `TODAY_TARGETS` に足す（`hookCall: "useCurrentMinute("`、`dependencies: ["nowMinute"]`）。Jest の通常のテストでは検出できない部分を、ここで検出する                                                                                                                                                                                                                        |
| 実際の画面での確認（手動）                                                            | 上のすべてをすり抜けた、実際のビルドでの不具合                                                                                               | 開発サーバーで、「原因」の再現手順を修正後に繰り返し、再読み込みなしで黄色になることを確かめる                                                                                                                                                                                                                                                                                                    |

テストでは時刻を固定する（`jest.useFakeTimers().setSystemTime(...)`）。実際の時計に依存するテストは書かない（L-538）。

実装の最後に、テストが退行を実際に検出することを、コードを一時的に壊して確かめる（確かめたら必ず元に戻す。L-690）。

- カードのコンポーネントの呼び出しから `nowMinute` を外す（固定の値を渡す） → 契約テストの依存の検証と、配線のテストが失敗する。
- `runRefresh` から `notifyCurrentMinute()` を外す → `useRoutineForegroundSync.test.tsx` の通知のテストが失敗する。
- `isRoutinePast` の中で `Date.now()` を読む実装に戻す → 純粋性のテストが失敗する。

## ドキュメントの更新

- `docs/02-development/coding-standards.md` の「React Compiler と今日・現在時刻」に、描画時に現在時刻が必要なときの規約を足す: `useCurrentMinute` を使う、現在時刻を使う純粋な関数は時刻を引数で受け取る、復帰時は `notifyCurrentMinute()` で読み直させる、対象のコンポーネントは契約テストの `TODAY_TARGETS` に足す。レビューの確認項目と最終更新日も合わせる。
- `docs/03-testing/test-matrix.md` の 2-24 の備考を、仕組みの変更に合わせる。
- テストマトリクスの詳細ケース（`group-01-04.ts`）の 2-24 に、「バックグラウンドへ回し、開始時間を過ぎてから戻す → 再読み込みなしで超過の色になる」を足す。Issue の再現手順を、実機の確認項目として残すためである。2-24-2 の期待値「超過カラー（赤/警告系）」は、実装（黄色）に合わせて直す。

## 受け入れ条件

Issue #9 の再現手順とテストに対応する。

1. アプリを終了せずにバックグラウンドへ回し、ルーティンの開始時間を過ぎてから戻すと、画面を開き直さなくても、そのルーティン（今日の曜日・未完了）の背景が黄色になる。
2. 「追加対応」の 5 項目（復帰イベントでの即時の再評価、30 分のフォールバックタイマー、直近の更新・再評価があったときの `refreshRoutineState` のスキップ、非表示中のタイマー停止、間隔の設定）は、これまでどおり動く。
3. 完了済みのカード（緑）、開始時間の前のカード（白）、今日の曜日でないルーティンの色は変わらない。
4. `npm run verify:fast` が通る。
5. 開発サーバーとブラウザで、1 の動きを確かめる（作業者が実施する）。
6. iOS・Android の実機で、Issue の再現手順のとおりに 1 を確かめる（**作業者には実施できない。PR に手順を書き、利用者に確認を依頼する**）。

## 参照した知見

`<dev-flow-kit>/lessons/review-lessons.md` の次の項目を反映した。

- L-538: React Compiler のもとで、描画時に求めた今日・現在時刻が固定される。値は計算の入力として実際に渡す。テストは時刻を固定する。
- L-690: コンパイラに由来する不具合は Jest で赤にならない。配線のテストと契約テストを組み合わせ、どのテストがどの退行を検出するかを書く。
- L-488: 復帰イベントは 1 回にまとめ、表示中のときだけ処理する。
- L-108: タイマー・購読は、アンマウント時に必ず解除する。
