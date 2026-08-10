# 作成フォームでもソフトウェアキーボードを閉じる 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans を使って本プランをタスクごとに実行する。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** Todoアイテム追加時と同様に、各種「作成フォーム」でも作成操作の直後にソフトウェアキーボードが閉じるようにする。機能によってキーボードが閉じたり閉じなかったりする一貫性のなさを解消する。

**Architecture:** PR #156 でTodoアイテムの追加フォーム2種にのみ対応したが、同じ「入力 → 作成 → キーボードが開いたまま」の構造が他の作成フォームにも残っている。対象は以下4つで、いずれも構造が同一。

- `TodoListCreateForm`（Todoリストの作成）
- `TodoCategoryCreateForm`（Todoカテゴリの作成）
- `BudgetCategoryCreateForm`（家計簿カテゴリの作成）
- `BudgetAllowanceItemForm`（収入・固定費・変動費の項目作成）

共通する構造:

- `inputRef` を props で受け取る（`InlineInsertForm` と違い、ref の所有者は呼び出し側）
- Enterキーと作成ボタンの両方から同じ `onCreate` 系ハンドラを呼ぶ
- 作成ボタンは `disabled={!xxx.trim()}` で空入力を防ぐが、**Enterキー経路には同じガードがない**
- 作成が成功するとフォームが閉じる（アンマウントされる）

`InlineInsertForm` では ref をコンポーネント内部で持てたため `useInlineInsertSubmit` に閉じ込められたが、今回の4つは ref が外部から渡される。そのため共通フックを `src/hooks/` に新設し、機能をまたいで共有する（`useCloseOnEscape` と同じ配置方針）。

> **注意:** 当初は「外部から渡された ref を blur する」設計にしていたが、実装中に不備が判明し「**フォーカス中のテキスト入力を blur する**」設計へ変更した。詳細は末尾の Self-Review を参照。以降の Task 1 のコード例は当初案のままなので、最終形は実際のソースを参照すること。

**Tech Stack:** React 19, TypeScript, Jest, React Testing Library, Playwright

## Global Constraints

- 作成操作（作成ボタンのクリック・Enterキー確定の両方）で一貫して入力欄を `blur()` する
- IME変換中のEnterキーでは作成も `blur()` も発生しない（既存の `isImeComposingKeyDown` 判定を変更しない）
- 空入力・空白のみでバリデーションに失敗した場合は `blur()` しない（何も作成されていないのにキーボードが閉じると再入力しづらくなるため）
- 各フォームの props シグネチャは変更しない（呼び出し側への影響を出さない）
- 自動コミットはしない

---

## 対象ファイル

| ファイル                                                      | 変更内容                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/hooks/useDismissKeyboardOnSubmit.ts`                     | 新規。フォーカス中のテキスト入力を blur してから送信する共通フック |
| `src/hooks/__tests__/useDismissKeyboardOnSubmit.test.ts`      | 新規。フックのユニットテスト                                       |
| `src/features/todo-lists/TodoListCreateForm.tsx`              | 上記フックを利用                                                   |
| `src/features/todo-lists/TodoCategoryCreateForm.tsx`          | 同上                                                               |
| `src/features/budget/components/BudgetCategoryCreateForm.tsx` | 同上                                                               |
| `src/features/budget/components/BudgetAllowanceItemForm.tsx`  | 同上                                                               |
| 各フォームの `__tests__`                                      | blur とバリデーションガードの検証を追加                            |
| `e2e/todo-list.spec.ts`                                       | Todoリスト作成時のフォーカス挙動を実ブラウザで検証                 |

`TodoItemTitleArea` / `TodoListHeader` / `TodoListManagementItem` / `TodoCategoryManagementItem` / `BudgetAllowanceItemRow` / `BudgetCategoryManagementItem` は「既存項目のインライン編集」であり、確定後に編集モードを抜けて元の表示に戻る性質のもの。新規作成フォームとは操作の流れが異なるため今回の対象外とする。

---

### Task 1: 共通フック useDismissKeyboardOnSubmit を作る

**Files:**

- Create: `src/hooks/useDismissKeyboardOnSubmit.ts`
- Create: `src/hooks/__tests__/useDismissKeyboardOnSubmit.test.ts`

**Interfaces:**

- `useDismissKeyboardOnSubmit({ inputRef, canSubmit, onSubmit })` が返すもの:
  - `handleSubmit: () => void` — `canSubmit` が true のときだけ `inputRef` を blur してから `onSubmit` を呼ぶ

- [x] **Step 1: テストを書く（RED）**

`src/hooks/__tests__/useDismissKeyboardOnSubmit.test.ts` を新規作成する:

```ts
import { renderHook } from "@testing-library/react";
import { useDismissKeyboardOnSubmit } from "../useDismissKeyboardOnSubmit";

const setup = (canSubmit: boolean) => {
  const onSubmit = jest.fn();
  const blur = jest.fn();
  const inputRef = {
    current: { blur },
  } as unknown as React.RefObject<HTMLInputElement | null>;
  const { result } = renderHook(() =>
    useDismissKeyboardOnSubmit({ inputRef, canSubmit, onSubmit }),
  );
  return { result, onSubmit, blur };
};

describe("useDismissKeyboardOnSubmit", () => {
  it("送信可能なら blur してから onSubmit を呼ぶ", () => {
    const { result, onSubmit, blur } = setup(true);
    const callOrder: string[] = [];
    blur.mockImplementation(() => callOrder.push("blur"));
    onSubmit.mockImplementation(() => callOrder.push("submit"));

    result.current.handleSubmit();

    // 順序が逆だと、フォームがアンマウントされた後にblurすることになり
    // ソフトウェアキーボードが閉じない
    expect(callOrder).toEqual(["blur", "submit"]);
  });

  it("送信不可なら onSubmit も blur も呼ばない", () => {
    const { result, onSubmit, blur } = setup(false);

    result.current.handleSubmit();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(blur).not.toHaveBeenCalled();
  });

  it("inputRef が未設定でも onSubmit は呼ばれる（描画前の呼び出しで落ちない）", () => {
    const onSubmit = jest.fn();
    const inputRef = {
      current: null,
    } as React.RefObject<HTMLInputElement | null>;
    const { result } = renderHook(() =>
      useDismissKeyboardOnSubmit({ inputRef, canSubmit: true, onSubmit }),
    );

    expect(() => result.current.handleSubmit()).not.toThrow();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("canSubmit が変わると挙動も切り替わる", () => {
    const onSubmit = jest.fn();
    const blur = jest.fn();
    const inputRef = {
      current: { blur },
    } as unknown as React.RefObject<HTMLInputElement | null>;

    const { result, rerender } = renderHook(
      ({ canSubmit }: { canSubmit: boolean }) =>
        useDismissKeyboardOnSubmit({ inputRef, canSubmit, onSubmit }),
      { initialProps: { canSubmit: false } },
    );

    result.current.handleSubmit();
    expect(onSubmit).not.toHaveBeenCalled();

    rerender({ canSubmit: true });
    result.current.handleSubmit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(blur).toHaveBeenCalledTimes(1);
  });
});
```

Run: `npx jest src/hooks/__tests__/useDismissKeyboardOnSubmit.test.ts --no-coverage`
Expected: FAIL（`../useDismissKeyboardOnSubmit` が存在せずモジュール解決エラー）

- [x] **Step 2: フックを作成する（GREEN）**

```ts
import type { RefObject } from "react";

type UseDismissKeyboardOnSubmitParams = {
  /** 送信時にフォーカスを外す入力欄。呼び出し側が所有する ref をそのまま渡す */
  inputRef: RefObject<HTMLInputElement | null>;
  /** 送信可能か。false のときは何もしない */
  canSubmit: boolean;
  onSubmit: () => void;
};

/**
 * 送信時に入力欄からフォーカスを外し、モバイルのソフトウェアキーボードを閉じる。
 *
 * ソフトウェアキーボードはテキスト入力にフォーカスがあるときだけ表示されるため、
 * blur することで閉じる。フォームの多くは送信後にアンマウントされるが、
 * アンマウントでキーボードが閉じるかはブラウザ実装に依存するため、明示的に blur する。
 *
 * blur は onSubmit より先に呼ぶ。onSubmit の中でフォームがアンマウントされると
 * 入力欄が存在しなくなり、後から blur しても効果がない。
 *
 * canSubmit が false のときは何もしない。何も作成されていないのにキーボードだけ
 * 閉じると、ユーザーが再入力しづらくなるため。作成ボタンは disabled で守られて
 * いても Enterキー経路には同じガードが無いことが多いので、ここで一律に防ぐ。
 *
 * ref を内部で持たず外部から受け取るのは、対象フォームの多くが呼び出し側で
 * ref を所有しているため（内部で持てる場合は useInlineInsertSubmit を参照）。
 */
export const useDismissKeyboardOnSubmit = ({
  inputRef,
  canSubmit,
  onSubmit,
}: UseDismissKeyboardOnSubmitParams) => {
  const handleSubmit = () => {
    if (!canSubmit) return;
    inputRef.current?.blur();
    onSubmit();
  };

  return { handleSubmit };
};
```

Run: `npx jest src/hooks/__tests__/useDismissKeyboardOnSubmit.test.ts --no-coverage`
Expected: PASS（4件すべて）

---

### Task 2: 4つの作成フォームにフックを適用する

各フォームで共通して行う変更は次の3点のみ。マークアップ・クラス名・props シグネチャは変更しない。

1. `useDismissKeyboardOnSubmit` を import し、`canSubmit`（＝既存の `disabled` 判定の否定）と既存の作成ハンドラを渡して `handleSubmit` を得る
2. `onKeyDown` の Enter 分岐で呼ぶ関数を `handleSubmit` に差し替える
3. 作成ボタンの `onClick` を `handleSubmit` に差し替える（`disabled` の記述はそのまま残す）

- [x] **Step 1: `TodoListCreateForm.tsx` を変更する**

冒頭に import を追加:

```ts
import { useDismissKeyboardOnSubmit } from "@/hooks/useDismissKeyboardOnSubmit";
```

コンポーネント本体を、propsの分割代入直後に以下を追加した形にする（アロー関数の即時returnになっている場合はブロックに変える）:

```ts
const { handleSubmit } = useDismissKeyboardOnSubmit({
  inputRef,
  canSubmit: Boolean(titleInput.trim()),
  onSubmit: onCreateAction,
});
```

`onKeyDown` の `onCreateAction();` を `handleSubmit();` に、作成ボタンの `onClick={onCreateAction}` を `onClick={handleSubmit}` に変更する。

- [x] **Step 2: `TodoCategoryCreateForm.tsx` を変更する**

同様。`canSubmit: Boolean(nameInput.trim())`、`onSubmit: onCreateAction`。

- [x] **Step 3: `BudgetCategoryCreateForm.tsx` を変更する**

同様。`canSubmit: Boolean(nameInput.trim())`、`onSubmit: onCreate`。

- [x] **Step 4: `BudgetAllowanceItemForm.tsx` を変更する**

同様。`canSubmit: Boolean(nameInput.trim())`、`onSubmit: onCreate`。
このフォームは Enter 分岐が2箇所（名前欄と金額欄）あるため、**両方**を `handleSubmit()` に差し替える。

- [x] **Step 5: 各フォームのテストに blur とガードの検証を追加する**

4つのテストファイルそれぞれに、以下3ケースを追加する（`<入力欄の取得方法>` と `<作成ボタン名>` は各テストの既存記述に合わせる）。

```tsx
  it("作成ボタンのクリックで入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", () => {
    // 有効な入力値を与えた状態で描画する
    const input = screen.getByRole("textbox");
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "<作成ボタン名>" }));

    expect(document.activeElement).toBe(document.body);
  });

  it("Enterキーでの作成でも入力欄からフォーカスが外れる", () => {
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.activeElement).toBe(document.body);
  });

  it("空欄でEnterを押しても作成されず、フォーカスも外れない", () => {
    // 入力値が空の状態で描画する
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(<作成ハンドラのモック>).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });
```

各テストファイルの既存の props 名・モック名・ボタン名に合わせて記述する。テスト対象コンポーネントは `inputRef` を props で受け取るため、`inputRef` には `React.createRef<HTMLInputElement>()` を渡し、実際の input 要素に紐づくようにすること（`{ current: null }` のままだと blur が呼ばれず検証にならない）。

Run: `npx jest src/features/todo-lists src/features/budget --no-coverage`
Expected: 全件PASS

- [x] **Step 6: lint・型チェックを実行する**

Run:

```bash
npx eslint src/hooks/ src/features/todo-lists/ src/features/budget/ --quiet
npx tsc --noEmit -p tsconfig.test.json
```

Expected: エラーなし

---

### Task 3: E2Eと全体確認

- [x] **Step 1: Todoリスト作成時のフォーカス挙動をE2Eに追加する**

`e2e/todo-list.spec.ts` に追加する。既存の `createListAndOpen` ヘルパーはリスト作成後に画面遷移してしまうため、この検証では使わずに直接操作する。

```ts
test("Todoリスト作成後は入力欄からフォーカスが外れる", async ({ page }) => {
  await loginAnonymously(page);
  await navigateViaMenu(page, "Todoリスト管理");

  await page.getByRole("button", { name: "＋ 新しいリストを追加" }).click();
  const titleInput = page.getByPlaceholder("リストのタイトル");
  await titleInput.click();
  await titleInput.fill("フォーカス検証用リスト");
  await expect(titleInput).toBeFocused();

  await page.getByRole("button", { name: "作成" }).click();

  // 作成に成功するとフォームが閉じ、入力欄自体が画面から消える
  await expect(titleInput).toBeHidden();
  // リストが作成されていること
  await expect(page.getByText("フォーカス検証用リスト")).toBeVisible();
});
```

- [x] **Step 2: 全体テストスイート・lint・型チェック・E2Eを実行する**

Run:

```bash
npm test -- --runInBand
npm run lint
npm run typecheck
npm run test:e2e
```

Expected: すべてPASS

- [x] **Step 3: 実装を壊してテストがREDになることを確認する**

`useDismissKeyboardOnSubmit` の `inputRef.current?.blur();` を一時的にコメントアウトし、各フォームのテストが落ちることを確認してから元に戻す。続けて `if (!canSubmit) return;` でも同様に確認する。

- [ ] **Step 4: コミット（ユーザーに確認の上で実行）**

「自動コミットはしないでください」という指示のもと実行されるため、Step 3 まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

---

## Self-Review

- **Spec coverage**: `isImeComposingKeyDown` を使う全12ファイルを走査し、「新規作成フォーム」4件を対象、「既存項目のインライン編集」6件を対象外として理由付きで仕分けた。
- **Placeholder scan**: Task 2 Step 5 のテストコードには `<作成ボタン名>` 等のプレースホルダが含まれるが、これは4ファイルで名称が異なるためで、実行時に各ファイルの既存記述へ合わせる旨を明記している。それ以外に未確定箇所はない。
- **Type consistency**: `useDismissKeyboardOnSubmit` の `inputRef` は各フォームが props で受け取る `RefObject<HTMLInputElement | null>` と同じ型。`canSubmit` は既存の `disabled={!xxx.trim()}` の否定であり、判定条件を二重に定義しない。
- **既存挙動の保護**: IME変換中は既存の `isImeComposingKeyDown` 判定より内側に入らないため影響しない。空入力時に `blur` しない制約もフック側で一元的に担保する。
- **設計判断**: `useInlineInsertSubmit`（ref を内部所有）と本フック（ref を外部から受領）で2つに分かれるが、これは対象フォームの ref 所有者が異なるという実態に沿ったもの。無理に統合すると、ref を内部で持つケースと外部から受け取るケースの両対応で API が複雑になるため分けている。両者のJSDocから相互に参照できるようにしておく。
- **実装中に変更した設計（重要）**: 当初 `inputRef` を props で受け取って blur する設計にしていたが、`BudgetAllowanceItemForm` は入力欄が2つ（名前・金額）あり、金額欄で Enter を押しても名前欄の ref を blur するだけで**金額欄のキーボードが開いたまま残る**ことがテストで判明した。そのため「フォーカス中のテキスト入力（input / textarea）を blur する」設計に変更し、`inputRef` 引数自体を廃止した。これにより ref のプラミングが不要になり、入力欄が複数あるフォームでも正しく動作する。対象をテキスト入力に限定しているため、ボタンのクリックで送信した場合にボタンのフォーカスを奪うこともない。
