import * as todoListsModule from "../index";

describe("todo-lists index exports", () => {
  it("pages and storage functions are exported", () => {
    expect(todoListsModule.TodoListsPage).toBeDefined();
    expect(todoListsModule.TodoListManagementPage).toBeDefined();
    expect(todoListsModule.TodoCategoryManagementPage).toBeDefined();
    expect(todoListsModule.getTodoLists).toBeDefined();
    expect(todoListsModule.saveTodoLists).toBeDefined();
    expect(todoListsModule.getTodoCategories).toBeDefined();
    expect(todoListsModule.saveTodoCategories).toBeDefined();
    expect(todoListsModule.saveTodoListsToLocal).toBeDefined();
  });
});
