# Todoアイテム追加時にソフトウェアキーボードを閉じる 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development（推奨）または superpowers:executing-plans を使って本プランをタスクごとに実行する。ステップはチェックボックス（`- [ ]`）で進捗管理する。

**Goal:** Todoリストへのアイテム追加操作（ボタンクリック／Enterキー確定）を行った際、入力欄からフォーカスを外し、モバイル端末のソフトウェアキーボードを自動的に閉じる。

**Architecture:** Todoアイテムの追加フォームは2種類存在し、挙動が異なる。

1. `TodoListAddForm`（リスト下部の常設フォーム）— 追加後、`useTodoListDetailAddAction.ts` が入力欄へ**明示的に再フォーカス**しており、連続追加できる設計になっている。これがキーボードを開いたままにする直接の原因。
2. `InlineInsertForm`（アイテム直後への挿入フォーム）— 追加すると `insertAfterId` が `null` に戻り、フォーム自体がアンマウントされる。多くのモバイルブラウザでは要素がDOMから消えるとキーボードも閉じるが、ブラウザ実装に依存するため保証がない。

要件確認の結果、**連続追加の利便性よりもキーボードを閉じることを優先する**方針で進める。両フォームとも、追加操作が成功した場合に入力欄を明示的に `blur()` する。連続で追加したい場合はユーザーが入力欄を再タップする。

物理キーボードを使うPC環境でも同様に一律で `blur()` する（デバイス種別の判定は行わない）。PCでは連続追加のたびに入力欄をクリックし直す手間が増えるが、タッチ操作かどうかを判定するロジック（`matchMedia("(pointer: coarse)")` 等）を持ち込むと、タブレット+外付けキーボードのような中間ケースの誤判定リスクが生まれる。今回は要件確認時にこのトレードオフを踏まえて「一律で優先する」との回答を得ているため、判定ロジックは追加しない。

**blurのタイミングについて:** Task 1（`TodoListAddForm`）は「追加成功 → clearInput → blurInput」の順（既存の `addTodoItemFromDetailInput` の処理順をそのまま踏襲）、Task 2（`InlineInsertForm`）は「blur → onAddAction（この中でフォームがアンマウントされる）」の順で、表面上は前後が逆になる。ただし両者とも共通しているのは「**バリデーション成功が確定した場合のみ blur する**」という点で、この原則は一貫させる。Task 2 側は `onAddAction` 呼び出し前に自前で `inputText.trim()` を確認することで、この原則を満たす（詳細は Task 2 Step 2 を参照）。

**Tech Stack:** React 19, TypeScript, Jest, React Testing Library

## Global Constraints

- 追加操作（追加ボタンクリック・Enterキー確定の両方）で一貫して入力欄を `blur()` する。対象デバイスの種別（タッチ/物理キーボード）による分岐は設けない
- IME変換中のEnterキーでは追加も `blur()` も発生しない（既存の `isImeComposingKeyDown` 判定を変更しない）
- 空入力・空白のみの入力でバリデーションに失敗した場合は `blur()` しない（何も追加されていないのにキーボードが閉じると、ユーザーが再入力しづらくなるため）。追加ボタンは `disabled` で守られるが、**Enterキー経路には別途ガードが必要**（Task 2 で詳述）
- 自動コミットはしない

---

## 対象ファイル

| ファイル                                                                | 変更内容                                                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/features/todo-lists/todoListPageViewActions.ts`                    | `addTodoItemFromDetailInput` の `focusInput` パラメータを `blurInput` にリネーム                    |
| `src/features/todo-lists/useTodoListDetailAddAction.ts`                 | `focusInput: () => inputRef.current?.focus()` を `blurInput: () => inputRef.current?.blur()` に変更 |
| `src/features/todo-lists/InlineInsertForm.tsx`                          | 内部で `inputRef` を保持し、追加操作（ボタン／Enter）の直前に `blur()` を呼ぶ                       |
| `src/features/todo-lists/__tests__/todoListPageViewActions.test.ts`     | `focusInput` → `blurInput` のリネームに追従                                                         |
| `src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx` | `focus` の呼び出し検証を `blur` の呼び出し検証に変更                                                |
| `src/features/todo-lists/__tests__/InlineInsertForm.test.tsx`           | 追加操作でinput要素からフォーカスが外れることを検証するテストを追加                                 |

`TodoListAddForm.tsx` 自体は `onAddAction` を呼ぶだけで `blur` 処理を持たない（`useTodoListDetailAddAction` が担当する）ため変更不要。`TodoListAddForm.test.tsx` も変更不要。

---

### Task 1: TodoListAddForm側（リスト下部の常設フォーム）を追加後にblurする

**Files:**

- Modify: `src/features/todo-lists/todoListPageViewActions.ts`
- Modify: `src/features/todo-lists/useTodoListDetailAddAction.ts`
- Modify: `src/features/todo-lists/__tests__/todoListPageViewActions.test.ts`
- Modify: `src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx`

**Interfaces:**

- `addTodoItemFromDetailInput` のパラメータ型:

  ```ts
  {
    inputText: string;
    listId: string;
    onAddItem: (listId: string, title: string) => void;
    clearInput: () => void;
    blurInput: () => void;  // 旧 focusInput から変更
  }
  ```

- [x] **Step 1: `todoListPageViewActions.test.ts` を `blurInput` 前提に書き換える（RED）**

現在のファイル全文（`src/features/todo-lists/__tests__/todoListPageViewActions.test.ts`）で、すべての `focusInput` を `blurInput` に置換する（変数宣言 `const focusInput = jest.fn();` と、渡している箇所 `focusInput,` / `focusInput: jest.fn(),` の両方）。アサーション `expect(focusInput).toHaveBeenCalled()` も `expect(blurInput).toHaveBeenCalled()` に置換する。テストの意図（「成功時に呼ばれる」「失敗時に呼ばれない」）は変えない。

Run: `npx jest src/features/todo-lists/__tests__/todoListPageViewActions.test.ts --no-coverage`
Expected: FAIL（`addTodoItemFromDetailInput` がまだ `focusInput` パラメータを要求するため、`blurInput` を渡すテストは型エラー・呼び出し漏れで失敗する）

- [x] **Step 2: `todoListPageViewActions.ts` の `addTodoItemFromDetailInput` を修正する（GREEN）**

```ts
export const addTodoItemFromDetailInput = (params: {
  inputText: string;
  listId: string;
  onAddItem: (listId: string, title: string) => void;
  clearInput: () => void;
  blurInput: () => void;
}): boolean => {
  const { inputText, listId, onAddItem, clearInput, blurInput } = params;
  const normalized = normalizeTitle(inputText);

  if (!normalized) {
    return false;
  }

  onAddItem(listId, normalized);
  clearInput();
  blurInput();
  return true;
};
```

Run: `npx jest src/features/todo-lists/__tests__/todoListPageViewActions.test.ts --no-coverage`
Expected: PASS（既存11件すべて）

- [x] **Step 3: `useTodoListDetailAddAction.test.tsx` を `blur` 呼び出しの検証に書き換える（RED）**

```ts
import { act, renderHook } from "@testing-library/react";

jest.mock("../todoListPageViewActions", () => ({
  addTodoItemFromDetailInput: jest.fn(),
}));

import { addTodoItemFromDetailInput } from "../todoListPageViewActions";
import { useTodoListDetailAddAction } from "../useTodoListDetailAddAction";

describe("useTodoListDetailAddAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("追加 action を組み立てて add helper に委譲し、成功時に入力欄からフォーカスを外す", () => {
    const setInputText = jest.fn();
    const onAddItem = jest.fn();
    const blur = jest.fn();
    const inputRef = {
      current: { blur },
    } as unknown as React.RefObject<HTMLInputElement | null>;

    (addTodoItemFromDetailInput as jest.Mock).mockImplementation(
      ({ clearInput, blurInput }) => {
        clearInput();
        blurInput();
        return true;
      },
    );

    const { result } = renderHook(() =>
      useTodoListDetailAddAction({
        inputText: " New Task ",
        listId: "list-1",
        onAddItem,
        setInputText,
        inputRef,
      }),
    );

    let didAdd = false;
    act(() => {
      didAdd = result.current.handleAdd();
    });

    expect(didAdd).toBe(true);
    expect(addTodoItemFromDetailInput).toHaveBeenCalledWith({
      inputText: " New Task ",
      listId: "list-1",
      onAddItem,
      clearInput: expect.any(Function),
      blurInput: expect.any(Function),
    });
    expect(setInputText).toHaveBeenCalledWith("");
    expect(blur).toHaveBeenCalledTimes(1);
  });
});
```

Run: `npx jest src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx --no-coverage`
Expected: FAIL（`useTodoListDetailAddAction` はまだ `focusInput` を渡すため）

- [x] **Step 4: `useTodoListDetailAddAction.ts` を修正する（GREEN）**

```ts
export const useTodoListDetailAddAction = ({
  inputText,
  listId,
  onAddItem,
  setInputText,
  inputRef,
}: UseTodoListDetailAddActionParams) => {
  const handleAdd = useCallback(() => {
    return addTodoItemFromDetailInput({
      inputText,
      listId,
      onAddItem,
      clearInput: () => setInputText(""),
      blurInput: () => inputRef.current?.blur(),
    });
  }, [inputRef, inputText, listId, onAddItem, setInputText]);

  return {
    handleAdd,
  };
};
```

（変更は `focusInput:` キーと `.focus()` 呼び出しを、それぞれ `blurInput:` と `.blur()` に変えるのみ。他の行は変更しない）

Run: `npx jest src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx --no-coverage`
Expected: PASS

- [x] **Step 5: Task 1関連のテストとlint/型チェックを実行する**

Run:

```bash
npx jest src/features/todo-lists/__tests__/todoListPageViewActions.test.ts src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx --no-coverage
npx eslint src/features/todo-lists/todoListPageViewActions.ts src/features/todo-lists/useTodoListDetailAddAction.ts --quiet
npx tsc --noEmit -p tsconfig.test.json
```

Expected: すべてエラーなし

---

### Task 2: InlineInsertForm側（アイテム直後への挿入フォーム）を追加操作時にblurする

**Files:**

- Modify: `src/features/todo-lists/InlineInsertForm.tsx`
- Modify: `src/features/todo-lists/__tests__/InlineInsertForm.test.tsx`

**Interfaces:**

- `InlineInsertForm` の props シグネチャは変更しない（`inputRef` はコンポーネント内部で保持し、外部には公開しない）

- [x] **Step 1: 追加操作でinput要素からフォーカスが外れることを検証するテストを追加する（RED）**

`src/features/todo-lists/__tests__/InlineInsertForm.test.tsx` の末尾（`role=form` のテストの後）に追加する:

```ts
  it("追加ボタンクリックで入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    const input = screen.getByRole("textbox");
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(document.activeElement).not.toBe(input);
  });

  it("Enterキーでの追加でも入力欄からフォーカスが外れる", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.activeElement).not.toBe(input);
  });

  it("IME変換中のEnterではフォーカスを外さない（変換確定と誤って閉じるのを防ぐ）", () => {
    render(<InlineInsertForm {...defaultProps} inputText="Todo" />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, {
      key: "Enter",
      nativeEvent: { isComposing: true },
      isComposing: true,
    });

    expect(document.activeElement).toBe(input);
  });

  it("空欄でEnterを押しても何も追加されず、フォーカスも外れない", () => {
    // ボタンはdisabledで守られているが、Enterキー経路には元々ガードがない。
    // ここでガードしないと、何も追加されていないのにキーボードだけ閉じてしまう
    // （Global Constraints違反）。
    render(<InlineInsertForm {...defaultProps} inputText="" />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onAddAction).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("空白のみでEnterを押しても何も追加されず、フォーカスも外れない", () => {
    render(<InlineInsertForm {...defaultProps} inputText="   " />);
    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onAddAction).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });
```

Run: `npx jest src/features/todo-lists/__tests__/InlineInsertForm.test.tsx --no-coverage`
Expected: FAIL（追加した5件のうち、フォーカスが外れることを期待する2件が失敗。`InlineInsertForm` はまだ `blur()` を呼ばないため `document.activeElement` が `input` のまま。空欄/空白ケースの2件は元々のロジックで `onAddAction` は呼ばれないためこの時点でもPASSする）

- [x] **Step 2: `InlineInsertForm.tsx` に `inputRef` を追加し、追加操作の直前にblurする（GREEN）**

```tsx
"use client";

import { useRef } from "react";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import texts from "./locales/ja.json";

type InlineInsertFormProps = {
  inputText: string;
  onChangeTextAction: (text: string) => void;
  onAddAction: () => void;
  onCancelAction: () => void;
};

/**
 * アイテムの直後に表示されるインライン挿入フォーム。
 */
export const InlineInsertForm = ({
  inputText,
  onChangeTextAction,
  onAddAction,
  onCancelAction,
}: InlineInsertFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 追加操作の直前に明示的にblurする。フォーム自体はこの後アンマウントされるが、
  // アンマウントでキーボードが閉じるかどうかはブラウザ実装に依存するため、
  // ここで確実にフォーカスを外しておく。
  //
  // 追加ボタンは disabled={!inputText.trim()} で空入力を防いでいるが、
  // Enterキー経路にはそのガードがかからない。空欄/空白のみでEnterを押した
  // 場合、何も追加されないのにキーボードだけ閉じるとユーザーが混乱するため、
  // ここでも同じ条件（バリデーション成功）を満たした場合のみblurする。
  const handleAdd = () => {
    if (!inputText.trim()) return;
    inputRef.current?.blur();
    onAddAction();
  };

  return (
    <li>
      <div
        role="form"
        aria-label="アイテムを挿入"
        className="flex gap-2 py-1.5 pl-2"
      >
        <input
          ref={inputRef}
          type="text"
          autoFocus
          aria-label={texts.list.itemPlaceholder}
          value={inputText}
          onChange={(e) => onChangeTextAction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
              handleAdd();
            }
            if (e.key === "Escape") {
              onCancelAction();
            }
          }}
          placeholder={texts.list.itemPlaceholder}
          className="flex-1 text-sm px-3 py-1.5 border border-teal-300 dark:border-teal-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputText.trim()}
          className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
        >
          {texts.list.addButton}
        </button>
        <button
          type="button"
          onClick={onCancelAction}
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 px-2 transition-colors"
          aria-label="キャンセル"
        >
          ✕
        </button>
      </div>
    </li>
  );
};
```

`onAddAction` を直接 `onClick`/`onKeyDown` に渡していた箇所を、`blur()` を挟む `handleAdd` に置き換える点が変更のポイント。`disabled={!inputText.trim()}` の判定・`onCancelAction`・`onChangeTextAction` の配線は変更しない。`handleAdd` 冒頭の `if (!inputText.trim()) return;` により、ボタン側は元々 `disabled` で呼ばれないため実質的にEnterキー経路のみに効くガードになる。

Run: `npx jest src/features/todo-lists/__tests__/InlineInsertForm.test.tsx --no-coverage`
Expected: PASS（既存10件 + 新規5件、計15件）

- [x] **Step 3: Task 2関連のlint/型チェックを実行する**

Run:

```bash
npx eslint src/features/todo-lists/InlineInsertForm.tsx --quiet
npx tsc --noEmit -p tsconfig.test.json
```

Expected: エラーなし

---

### Task 3: 全体テスト・E2E確認

- [x] **Step 1: todo-lists機能全体のテストを実行する**

Run: `npx jest src/features/todo-lists --no-coverage`
Expected: 全件PASS（既存テストに回帰がないこと）

- [x] **Step 2: 全体テストスイート・lint・型チェック・E2Eを実行する**

Run:

```bash
npm test -- --runInBand
npm run lint
npm run typecheck
npm run test:e2e
```

Expected: すべてPASS。特に `e2e/todo-list.spec.ts`（Todoリスト作成→追加→完了操作）が今回の変更後も通ることを確認する。

- [x] **Step 3: 実ブラウザで動作確認する**

`npm run dev` でdevサーバーを起動し、Playwrightまたは手動操作で以下を確認する:

- リスト下部の追加フォームで、追加ボタンクリック後に入力欄のフォーカスが外れている（`document.activeElement` がinput要素でなくなる）
- 同フォームで、Enterキーでの追加後も同様にフォーカスが外れている
- アイテム直後への挿入フォームでも同様
- IME変換中のEnterでは何も起きない（既存の日本語入力時の挙動が壊れていないこと）

モバイル実機・エミュレータでのソフトウェアキーボードの開閉確認ができる場合は、あわせて目視確認する。

- [ ] **Step 4: コミット（ユーザーに確認の上で実行）**

「自動コミットはしないでください」という指示のもとで実行する場合は、Step 3まで完了したらユーザーに差分を提示し、コミットしてよいか確認してから実行する。

```bash
git add \
  src/features/todo-lists/todoListPageViewActions.ts \
  src/features/todo-lists/useTodoListDetailAddAction.ts \
  src/features/todo-lists/InlineInsertForm.tsx \
  src/features/todo-lists/__tests__/todoListPageViewActions.test.ts \
  src/features/todo-lists/__tests__/useTodoListDetailAddAction.test.tsx \
  src/features/todo-lists/__tests__/InlineInsertForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(todo-lists): Todoアイテム追加時にソフトウェアキーボードを閉じる

追加操作（ボタンクリック／Enterキー確定）の直後に入力欄からフォーカスを外し、
モバイル端末のソフトウェアキーボードが自動的に閉じるようにする。

EOF
)"
```

---

## Self-Review

- **Spec coverage**: 2種類の追加フォーム（`TodoListAddForm`/`InlineInsertForm`）両方を対象にし、ユーザーが確認した要件（連続追加より閉じることを優先）を満たしている。
- **Placeholder scan**: なし。すべてのコードブロックは実際に貼り付け可能な完全な内容。
- **Type consistency**: `addTodoItemFromDetailInput` のパラメータ型変更（`focusInput` → `blurInput`）は、呼び出し元 `useTodoListDetailAddAction.ts` の変更と型シグネチャが一致している。
- **既存挙動の保護**: バリデーション失敗時（空入力）は `blurInput`/`blur()` を呼ばないことを明記し、IME変換中のEnterでも `blur()` されないことをテストで担保する設計にしている。
- **スコープ判断**: `TodoListAddForm.tsx` 自体（blur処理を持たないプレゼンテーションコンポーネント）は変更不要と判定し、対象から除外した。
- **セカンドパス（dig:digによる検証）で発見・修正した論点**:
  1. **バグ**: 初版の `InlineInsertForm` 実装は追加ボタンの `disabled` 判定に守られる一方、Enterキー経路には同等のガードがなく、空欄/空白でEnterを押すと何も追加されないままblurだけ発生してしまう不具合があった。Global Constraintsの「バリデーション失敗時はblurしない」に違反するため、`handleAdd` 冒頭に `if (!inputText.trim()) return;` を追加し、Step 1のRED テストにも空欄/空白ケースを追加した。
  2. **一貫性**: Task 1は「追加後」、Task 2は「追加前」にblurしており表面上のタイミングが逆だが、「バリデーション成功確定後にのみblurする」という原則は両者で統一されていることをArchitectureセクションに明記した。
  3. **トレードオフの明文化**: PC・物理キーボード環境でも一律blurする方針を採用した理由（デバイス種別判定のリスクの方が大きいと判断）をArchitectureセクションに明記した。
