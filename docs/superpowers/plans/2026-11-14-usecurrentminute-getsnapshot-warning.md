# useCurrentMinute の getSnapshot 警告を JSDoc に書く Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `useCurrentMinute` の JSDoc に、開発時・分の変わり目で React の getSnapshot 警告が出うることを書き、ランタイムは変えない。

**Architecture:** Issue #225 の方針 B。ストアのキャッシュ化は行わず、既存の「notify と別理由の再描画で値が進む」動作を維持したまま、フックの JSDoc に警告の説明と「意図して直していない」旨を追記する。

**Tech Stack:** TypeScript / React 19（`useSyncExternalStore`）/ Jest。コード変更はコメントのみ。

設計書: `docs/superpowers/specs/2026-11-14-usecurrentminute-getsnapshot-warning-design.md`（Issue #225）

## Global Constraints

- ランタイムのコード（`subscribe`・`getCurrentMinute`・`notifyCurrentMinute`・`useSyncExternalStore` の引数）は変えない。
- 規約（`docs/02-development/coding-standards.md`）は変えない。
- テストの追加はしない。既存の `src/hooks/__tests__/useCurrentMinute.test.ts` が通ることだけ確かめる。
- JSDoc は日本語。既存の「別の理由で再描画されたときだけ値が進む」という説明と矛盾しない文言にする。
- **コミットしない。**（後の `/commit-ja` で行う）
- 確認した知見: L-466・L-538 は今回の文書のみの変更の対象外。

---

### Task 1: useCurrentMinute の JSDoc を更新する

**Files:**

- Modify: `src/hooks/useCurrentMinute.ts:22-33`（`useCurrentMinute` の JSDoc）
- Verify: `src/hooks/__tests__/useCurrentMinute.test.ts`

**Interfaces:**

- Consumes: 既存の `useCurrentMinute` / `getCurrentMinute` / `notifyCurrentMinute`
- Produces: なし（挙動変更なし）

- [x] **Step 1: JSDoc を更新する**

`useCurrentMinute` の JSDoc に、既存の箇条書きのあとに次の趣旨を足す（文言は既存の「別の理由で再描画されたときだけ」と揃える）。

```ts
/**
 * 描画時に使う現在時刻（分単位）。
 * notifyCurrentMinute() が呼ばれ、分が変わっていれば、このフックを使うコンポーネントが再描画される。
 *
 * - 毎分のタイマーは持たない。値が進むのは、notifyCurrentMinute() が呼ばれたときと、
 *   コンポーネントが別の理由で再描画されたときだけ（いま通知を呼ぶのは useRoutineForegroundSync）。
 * - サーバーでの描画と、ハイドレーションの最初の描画で描かれるコンポーネントからは使わない。
 *   サーバーとクライアントで分がずれると、ハイドレーションの不一致になる
 *   （いまの利用箇所は、最初の描画ではローディングを返す AuthGuard の内側だけ）。
 * - 開発時だけ、分の変わり目に React が getSnapshot を続けて 2 回呼ぶあいだで値が変わると、
 *   「The result of getSnapshot should be cached」の警告が 1 回出ることがある。
 *   本番ビルドではこの確認は行われず、無限ループにもならない。
 *   ストアに値をキャッシュして直すと、別の理由の再描画でも分が進む今の動作が変わるため、
 *   意図して直していない（Issue #225）。
 */
export const useCurrentMinute = (): number =>
  useSyncExternalStore(subscribe, getCurrentMinute, getCurrentMinute);
```

- [x] **Step 2: 既存テストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/hooks/__tests__/useCurrentMinute.test.ts --forceExit --testPathIgnorePatterns='/node_modules/' '/firebase-functions/lib/' '/e2e/'`

（worktree 配下では `jest.config.ts` の `/\.worktrees/` 無視に当たるため、ignore を上書きして実行した。）

Expected: `Test Suites: 1 passed`、すべてのテストが pass。→ 7 passed。

- [x] **Step 3: コミットしない**

このプランではコミットしない。
