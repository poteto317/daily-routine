import {
  createClosedTodoListFormState,
  shouldFocusTodoListForm,
} from "../todoListManagementFormState";

describe("todoListManagementFormState", () => {
  describe("createClosedTodoListFormState", () => {
    it("showForm=false / titleInput='' の初期状態を返す", () => {
      expect(createClosedTodoListFormState()).toEqual({
        showForm: false,
        titleInput: "",
      });
    });

    it("呼び出すたびに新しいオブジェクトを返す", () => {
      const a = createClosedTodoListFormState();
      const b = createClosedTodoListFormState();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe("shouldFocusTodoListForm", () => {
    it("showForm=true のとき true を返す", () => {
      expect(shouldFocusTodoListForm(true)).toBe(true);
    });

    it("showForm=false のとき false を返す", () => {
      expect(shouldFocusTodoListForm(false)).toBe(false);
    });
  });
});
