import { useState } from "react";
import { getTodoLists } from "./storage";
import { createTodoListManagementDataStateResult } from "./todoListManagementDataStateResult";
import type { TodoList } from "./types";
import { useTodoListManagementActionHandlers } from "./useTodoListManagementActionHandlers";
import { useTodoListManagementOrder } from "./useTodoListManagementOrder";

type UseTodoListManagementDataStateParams = {
  titleInput: string;
  closeForm: () => void;
  navigate: (page: "todo-lists") => void;
};

export const useTodoListManagementDataState = ({
  titleInput,
  closeForm,
  navigate,
}: UseTodoListManagementDataStateParams) => {
  const [lists, setLists] = useState<TodoList[]>(() => getTodoLists());
  // 作成・削除等の操作はストレージの生の並び順（lists）を基準に行う。
  // 表示だけをハンバーガーメニューと同じ並び順に揃えるため、
  // action handlerには渡さず、結果として公開するlistsのみ並び替える
  // （並び替え自体の責務はuseTodoListManagementOrderに委譲）。
  const sortedLists = useTodoListManagementOrder({ lists });
  const actionHandlers = useTodoListManagementActionHandlers({
    lists,
    titleInput,
    setLists,
    closeForm,
    navigate,
  });

  return createTodoListManagementDataStateResult({
    actionHandlers,
    lists: sortedLists,
  });
};
