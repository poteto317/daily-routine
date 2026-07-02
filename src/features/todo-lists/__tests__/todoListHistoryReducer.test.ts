import {
  todoListHistoryReducer,
  createInitialHistoryState,
  isUndoable,
  isRedoable,
  getPrevState,
  getNextState,
  MAX_HISTORY,
  type HistoryState,
} from "../todoListHistoryReducer";
import type { TodoList } from "../types";

const makeList = (id: string): TodoList => ({
  id,
  title: `List ${id}`,
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const listA = makeList("a");
const listB = makeList("b");
const listC = makeList("c");

const initialState = (): HistoryState => ({
  past: [],
  present: [listA],
  future: [],
});

describe("todoListHistoryReducer", () => {
  describe("default（未知アクション）", () => {
    it("未知のアクションが来ても状態をそのまま返す（ランタイム安全）", () => {
      const state = initialState();
      const next = todoListHistoryReducer(
        state,
        { type: "UNKNOWN" } as unknown as Parameters<typeof todoListHistoryReducer>[1],
      );
      expect(next).toBe(state);
    });
  });

  describe("PERSIST", () => {
    describe("no-op スキップ（shallow-equal チェック）", () => {
      it("同一参照のリスト配列を PERSIST すると状態が変化しない（同一参照を返す）", () => {
        const state = initialState();
        // lists.map() が new array を返しても要素参照が同じ場合は no-op
        const sameElements = [...state.present];
        const next = todoListHistoryReducer(state, { type: "PERSIST", payload: sameElements });
        expect(next).toBe(state);
      });

      it("no-op PERSIST では canUndo が true にならない", () => {
        const state = initialState();
        const next = todoListHistoryReducer(state, {
          type: "PERSIST",
          payload: [...state.present],
        });
        expect(next.past).toHaveLength(0);
      });

      it("要素数が変わった場合は通常の PERSIST として履歴に積む", () => {
        const state = initialState();
        const next = todoListHistoryReducer(state, {
          type: "PERSIST",
          payload: [listA, listB],
        });
        expect(next).not.toBe(state);
        expect(next.past).toHaveLength(1);
      });

      it("同じ要素数でも要素参照が異なれば履歴に積む", () => {
        const state = initialState();
        const updatedListA = { ...listA, title: "Updated" };
        const next = todoListHistoryReducer(state, {
          type: "PERSIST",
          payload: [updatedListA],
        });
        expect(next).not.toBe(state);
        expect(next.past).toHaveLength(1);
      });

      it("future が残っている状態で no-op PERSIST しても future が保持される", () => {
        const state: HistoryState = {
          past: [],
          present: [listA],
          future: [[listB]],
        };
        const next = todoListHistoryReducer(state, {
          type: "PERSIST",
          payload: [...state.present],
        });
        expect(next).toBe(state);
        expect(next.future).toEqual([[listB]]);
      });
    });

    it("present を past に積み、新しい present をセットし、future をクリアする", () => {
      const state = initialState();
      const next = todoListHistoryReducer(state, {
        type: "PERSIST",
        payload: [listA, listB],
      });
      expect(next.past).toEqual([[listA]]);
      expect(next.present).toEqual([listA, listB]);
      expect(next.future).toEqual([]);
    });

    it("future が残っていた場合、PERSIST でクリアされる", () => {
      const state: HistoryState = {
        past: [],
        present: [listA],
        future: [[listB]],
      };
      const next = todoListHistoryReducer(state, {
        type: "PERSIST",
        payload: [listC],
      });
      expect(next.future).toEqual([]);
    });

    it(`past が MAX_HISTORY(${MAX_HISTORY}) 件に達したとき、最古エントリが切り捨てられる`, () => {
      const lists = Array.from({ length: MAX_HISTORY }, (_, i) =>
        [makeList(`list-${i}`)],
      );
      const state: HistoryState = {
        past: lists,
        present: [listA],
        future: [],
      };
      const next = todoListHistoryReducer(state, {
        type: "PERSIST",
        payload: [listB],
      });
      expect(next.past).toHaveLength(MAX_HISTORY);
      expect(next.past[0]).toEqual(lists[1]);
    });

    it("past が MAX_HISTORY 未満のときはそのまま積む", () => {
      const state: HistoryState = {
        past: [[listA]],
        present: [listB],
        future: [],
      };
      const next = todoListHistoryReducer(state, {
        type: "PERSIST",
        payload: [listC],
      });
      expect(next.past).toHaveLength(2);
    });
  });

  describe("UNDO", () => {
    it("past の末尾を present に戻し、元の present を future の先頭に積む", () => {
      const state: HistoryState = {
        past: [[listA]],
        present: [listB],
        future: [],
      };
      const next = todoListHistoryReducer(state, { type: "UNDO" });
      expect(next.past).toEqual([]);
      expect(next.present).toEqual([listA]);
      expect(next.future).toEqual([[listB]]);
    });

    it("past が空のとき、状態を変えない（同一参照を返す）", () => {
      const state = initialState();
      const next = todoListHistoryReducer(state, { type: "UNDO" });
      expect(next).toBe(state);
    });

    it("複数の past がある場合、末尾から順に取り出す", () => {
      const state: HistoryState = {
        past: [[listA], [listB]],
        present: [listC],
        future: [],
      };
      const step1 = todoListHistoryReducer(state, { type: "UNDO" });
      expect(step1.present).toEqual([listB]);
      expect(step1.past).toEqual([[listA]]);

      const step2 = todoListHistoryReducer(step1, { type: "UNDO" });
      expect(step2.present).toEqual([listA]);
      expect(step2.past).toEqual([]);
    });

    it("既存の future を保持したまま先頭に追加する", () => {
      const state: HistoryState = {
        past: [[listA]],
        present: [listB],
        future: [[listC]],
      };
      const next = todoListHistoryReducer(state, { type: "UNDO" });
      expect(next.future).toEqual([[listB], [listC]]);
    });
  });

  describe("REDO", () => {
    it("future の先頭を present に戻し、元の present を past の末尾に積む", () => {
      const state: HistoryState = {
        past: [],
        present: [listA],
        future: [[listB]],
      };
      const next = todoListHistoryReducer(state, { type: "REDO" });
      expect(next.past).toEqual([[listA]]);
      expect(next.present).toEqual([listB]);
      expect(next.future).toEqual([]);
    });

    it("future が空のとき、状態を変えない（同一参照を返す）", () => {
      const state = initialState();
      const next = todoListHistoryReducer(state, { type: "REDO" });
      expect(next).toBe(state);
    });

    it("複数の future がある場合、先頭から順に取り出す", () => {
      const state: HistoryState = {
        past: [],
        present: [listA],
        future: [[listB], [listC]],
      };
      const step1 = todoListHistoryReducer(state, { type: "REDO" });
      expect(step1.present).toEqual([listB]);
      expect(step1.future).toEqual([[listC]]);

      const step2 = todoListHistoryReducer(step1, { type: "REDO" });
      expect(step2.present).toEqual([listC]);
      expect(step2.future).toEqual([]);
    });

    it("既存の past を保持したまま末尾に追加する", () => {
      const state: HistoryState = {
        past: [[listA]],
        present: [listB],
        future: [[listC]],
      };
      const next = todoListHistoryReducer(state, { type: "REDO" });
      expect(next.past).toEqual([[listA], [listB]]);
    });
  });
});

describe("createInitialHistoryState", () => {
  it("past・future が空配列で、present が getInitialLists の戻り値である", () => {
    const state = createInitialHistoryState(() => [listA]);
    expect(state.past).toEqual([]);
    expect(state.present).toEqual([listA]);
    expect(state.future).toEqual([]);
  });

  it("getInitialLists が複数のリストを返すとき present に反映される", () => {
    const state = createInitialHistoryState(() => [listA, listB]);
    expect(state.present).toEqual([listA, listB]);
  });
});

describe("isUndoable", () => {
  it("past が空のとき false を返す", () => {
    const state: HistoryState = { past: [], present: [listA], future: [] };
    expect(isUndoable(state)).toBe(false);
  });

  it("past に 1 件以上あるとき true を返す", () => {
    const state: HistoryState = { past: [[listA]], present: [listB], future: [] };
    expect(isUndoable(state)).toBe(true);
  });
});

describe("isRedoable", () => {
  it("future が空のとき false を返す", () => {
    const state: HistoryState = { past: [], present: [listA], future: [] };
    expect(isRedoable(state)).toBe(false);
  });

  it("future に 1 件以上あるとき true を返す", () => {
    const state: HistoryState = { past: [], present: [listA], future: [[listB]] };
    expect(isRedoable(state)).toBe(true);
  });
});

describe("getPrevState", () => {
  it("past が空のとき null を返す", () => {
    const state: HistoryState = { past: [], present: [listA], future: [] };
    expect(getPrevState(state)).toBeNull();
  });

  it("past に 1 件あるとき、その要素を返す", () => {
    const state: HistoryState = {
      past: [[listA]],
      present: [listB],
      future: [],
    };
    expect(getPrevState(state)).toEqual([listA]);
  });

  it("past に複数件あるとき、末尾の要素を返す", () => {
    const state: HistoryState = {
      past: [[listA], [listB]],
      present: [listC],
      future: [],
    };
    expect(getPrevState(state)).toEqual([listB]);
  });
});

describe("getNextState", () => {
  it("future が空のとき null を返す", () => {
    const state: HistoryState = { past: [], present: [listA], future: [] };
    expect(getNextState(state)).toBeNull();
  });

  it("future に 1 件あるとき、その要素を返す", () => {
    const state: HistoryState = {
      past: [],
      present: [listA],
      future: [[listB]],
    };
    expect(getNextState(state)).toEqual([listB]);
  });

  it("future に複数件あるとき、先頭の要素を返す", () => {
    const state: HistoryState = {
      past: [],
      present: [listA],
      future: [[listB], [listC]],
    };
    expect(getNextState(state)).toEqual([listB]);
  });
});
