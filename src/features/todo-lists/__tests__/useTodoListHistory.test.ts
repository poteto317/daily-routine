import { act, renderHook } from "@testing-library/react";
import { useTodoListHistory } from "../useTodoListHistory";
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

const renderHistory = (initialLists: TodoList[] = [listA], saveLists = jest.fn()) =>
  renderHook(() =>
    useTodoListHistory({ getInitialLists: () => initialLists, saveLists }),
  );

describe("useTodoListHistory", () => {
  describe("初期状態", () => {
    it("canUndo=false, canRedo=false, lists が初期値", () => {
      const { result } = renderHistory();
      expect(result.current.lists).toEqual([listA]);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("persist", () => {
    it("lists が更新され canUndo=true, canRedo=false になる", () => {
      const { result } = renderHistory();
      act(() => { result.current.persist([listA, listB]); });
      expect(result.current.lists).toEqual([listA, listB]);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it("saveLists が新しいリストで呼ばれる", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.persist([listA, listB]); });
      expect(saveLists).toHaveBeenCalledWith([listA, listB]);
    });

    describe("no-op スキップ", () => {
      it("全要素参照が同一の配列を persist しても saveLists が呼ばれない", () => {
        const saveLists = jest.fn();
        const { result } = renderHistory([listA], saveLists);
        act(() => { result.current.persist([listA]); });
        expect(saveLists).not.toHaveBeenCalled();
      });

      it("全要素参照が同一の配列を persist しても canUndo が true にならない", () => {
        const { result } = renderHistory([listA]);
        act(() => { result.current.persist([listA]); });
        expect(result.current.canUndo).toBe(false);
      });

      it("lists.map() が返す新配列（全要素同一参照）を persist しても saveLists が呼ばれない", () => {
        const saveLists = jest.fn();
        const { result } = renderHistory([listA, listB], saveLists);
        const mappedSame = [listA, listB].map((l) => l);
        act(() => { result.current.persist(mappedSame); });
        expect(saveLists).not.toHaveBeenCalled();
      });

      it("要素参照が変化した場合は saveLists が呼ばれる", () => {
        const saveLists = jest.fn();
        const { result } = renderHistory([listA], saveLists);
        const updatedListA = { ...listA, title: "Updated" };
        act(() => { result.current.persist([updatedListA]); });
        expect(saveLists).toHaveBeenCalledWith([updatedListA]);
      });

      it("getInitialLists が呼ばれるたびに新しいオブジェクト参照を返す場合でも初期 lists の persist は no-op になる", () => {
        // localStorage 復元のように毎回異なるオブジェクト参照を返すシミュレーション。
        // historyRef が useReducer と別に getInitialLists() を呼ぶと present の要素参照が
        // 不一致となり isNoOpPersist が false を返してしまうバグを検証する。
        const saveLists = jest.fn();
        const getInitialLists = () => [{ ...listA }];
        const { result } = renderHook(() =>
          useTodoListHistory({ getInitialLists, saveLists }),
        );
        act(() => { result.current.persist(result.current.lists); });
        expect(saveLists).not.toHaveBeenCalled();
        expect(result.current.canUndo).toBe(false);
      });
    });
  });

  describe("undo", () => {
    it("lists が元に戻り canUndo=false, canRedo=true になる", () => {
      const { result } = renderHistory();
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.undo(); });
      expect(result.current.lists).toEqual([listA]);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it("saveLists が undo 前の状態で呼ばれる", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.persist([listA, listB]); });
      saveLists.mockClear();
      act(() => { result.current.undo(); });
      expect(saveLists).toHaveBeenCalledWith([listA]);
    });

    it("canUndo=false 時に undo を呼んでも状態変化なし・saveLists も呼ばれない", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.undo(); });
      expect(result.current.lists).toEqual([listA]);
      expect(saveLists).not.toHaveBeenCalled();
    });
  });

  describe("redo", () => {
    it("lists がやり直し後の値になり canUndo=true, canRedo=false になる", () => {
      const { result } = renderHistory();
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.undo(); });
      act(() => { result.current.redo(); });
      expect(result.current.lists).toEqual([listA, listB]);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it("saveLists が redo 後の状態で呼ばれる", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.undo(); });
      saveLists.mockClear();
      act(() => { result.current.redo(); });
      expect(saveLists).toHaveBeenCalledWith([listA, listB]);
    });

    it("canRedo=false 時に redo を呼んでも状態変化なし・saveLists も呼ばれない", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.persist([listA, listB]); });
      saveLists.mockClear();
      act(() => { result.current.redo(); });
      expect(result.current.lists).toEqual([listA, listB]);
      expect(saveLists).not.toHaveBeenCalled();
    });
  });

  describe("saveLists 正確性", () => {
    it("persist に渡したリストと saveLists に渡されるリストは同一参照", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      const nextLists = [listA, listB];
      act(() => { result.current.persist(nextLists); });
      expect(saveLists).toHaveBeenCalledWith(nextLists);
    });

    it("undo 後の saveLists には undo 前の lists が渡る (内容一致)", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.persist([listA, listB]); });
      saveLists.mockClear();
      act(() => { result.current.undo(); });
      const savedArg = saveLists.mock.calls[0][0];
      expect(savedArg).toEqual([listA]);
    });

    it("redo 後の saveLists には redo 後の lists が渡る (内容一致)", () => {
      const saveLists = jest.fn();
      const { result } = renderHistory([listA], saveLists);
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.undo(); });
      saveLists.mockClear();
      act(() => { result.current.redo(); });
      const savedArg = saveLists.mock.calls[0][0];
      expect(savedArg).toEqual([listA, listB]);
    });
  });

  describe("関数の参照安定性", () => {
    it("undo の参照は再レンダーをまたいでも常に安定している", () => {
      const saveLists = jest.fn();
      const { result, rerender } = renderHook(() =>
        useTodoListHistory({ getInitialLists: () => [listA], saveLists }),
      );
      const undo1 = result.current.undo;
      rerender();
      expect(result.current.undo).toBe(undo1);
    });

    it("redo の参照は再レンダーをまたいでも常に安定している", () => {
      const saveLists = jest.fn();
      const { result, rerender } = renderHook(() =>
        useTodoListHistory({ getInitialLists: () => [listA], saveLists }),
      );
      const redo1 = result.current.redo;
      rerender();
      expect(result.current.redo).toBe(redo1);
    });

    it("history が変化した後も undo の参照が変わらない（historyRef で追跡するため）", () => {
      const saveLists = jest.fn();
      const { result } = renderHook(() =>
        useTodoListHistory({ getInitialLists: () => [listA], saveLists }),
      );
      const undo1 = result.current.undo;
      act(() => { result.current.persist([listA, listB]); });
      expect(result.current.undo).toBe(undo1);
    });
  });

  describe("同一 tick 内の複数呼び出し", () => {
    it("undo を 2 回連続呼ぶと saveLists が異なる値で 2 回呼ばれる", () => {
      const saveLists = jest.fn();
      const { result } = renderHook(() =>
        useTodoListHistory({ getInitialLists: () => [listA], saveLists }),
      );
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.persist([listA, listB, listC]); });
      saveLists.mockClear();

      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(saveLists).toHaveBeenCalledTimes(2);
      expect(saveLists.mock.calls[0][0]).toEqual([listA, listB]);
      expect(saveLists.mock.calls[1][0]).toEqual([listA]);
    });

    it("persist を 2 回連続呼ぶと 2 回目は更新済みの present を基準に no-op 判定する", () => {
      const saveLists = jest.fn();
      const { result } = renderHook(() =>
        useTodoListHistory({ getInitialLists: () => [listA], saveLists }),
      );

      act(() => {
        result.current.persist([listA, listB]);
        // [listA, listB] が present になった後、同じ値での persist は no-op になる
        result.current.persist([listA, listB]);
      });

      expect(saveLists).toHaveBeenCalledTimes(1);
      expect(saveLists).toHaveBeenCalledWith([listA, listB]);
    });

    it("redo を 2 回連続呼ぶと saveLists が異なる値で 2 回呼ばれる", () => {
      const saveLists = jest.fn();
      const { result } = renderHook(() =>
        useTodoListHistory({ getInitialLists: () => [listA], saveLists }),
      );
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.persist([listA, listB, listC]); });
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });
      saveLists.mockClear();

      act(() => {
        result.current.redo();
        result.current.redo();
      });

      expect(saveLists).toHaveBeenCalledTimes(2);
      expect(saveLists.mock.calls[0][0]).toEqual([listA, listB]);
      expect(saveLists.mock.calls[1][0]).toEqual([listA, listB, listC]);
    });
  });

  describe("複合操作", () => {
    it("undo 後に新たな persist で future がクリアされる", () => {
      const { result } = renderHistory();
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.undo(); });
      act(() => { result.current.persist([listC]); });
      expect(result.current.lists).toEqual([listC]);
      expect(result.current.canRedo).toBe(false);
    });

    it("複数回 persist → 複数回 undo で順番に元に戻る", () => {
      const { result } = renderHistory();
      act(() => { result.current.persist([listA, listB]); });
      act(() => { result.current.persist([listA, listB, listC]); });

      act(() => { result.current.undo(); });
      expect(result.current.lists).toEqual([listA, listB]);

      act(() => { result.current.undo(); });
      expect(result.current.lists).toEqual([listA]);
    });

    it("履歴上限 50 件: 51 回 persist しても undo 回数は 50 以下", () => {
      const { result } = renderHistory();
      for (let i = 0; i < 51; i++) {
        act(() => { result.current.persist([makeList(`list-${i}`)]); });
      }
      let undoCount = 0;
      while (result.current.canUndo) {
        act(() => { result.current.undo(); });
        undoCount++;
        if (undoCount > 55) break;
      }
      expect(undoCount).toBeLessThanOrEqual(50);
    });
  });
});
