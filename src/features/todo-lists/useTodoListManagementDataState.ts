import { useState } from "react";
import { getTodoLists } from "./storage";
import { createTodoListManagementDataStateResult } from "./todoListManagementDataStateResult";
import type { TodoList } from "./types";
import { useTodoListManagementActionHandlers } from "./useTodoListManagementActionHandlers";
import { useTodoListManagementMenuOrder } from "./useTodoListManagementMenuOrder";
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
  // 作成・削除等の操作とドラッグでの並び替えの計算は、ストレージの生の並び順（lists）を基準に行う。
  // 表示だけをハンバーガーメニューと同じ並び順（menuOrder）に揃えるため、
  // action handlerには渡さず、結果として公開するlistsのみ並べ直す
  // （menuOrderの保持とドラッグでの並び替えの保存はuseTodoListManagementMenuOrder、
  // menuOrderによる表示順の導出はuseTodoListManagementOrderに委譲）。
  // 表示順にはmenuOrderのstateをそのまま渡すので、並べ替えた直後に表示が追いつく。
  const { menuOrder, handleReorderLists } = useTodoListManagementMenuOrder({
    lists,
  });
  const sortedLists = useTodoListManagementOrder({ lists, menuOrder });
  const actionHandlers = useTodoListManagementActionHandlers({
    lists,
    titleInput,
    setLists,
    closeForm,
    navigate,
  });

  return createTodoListManagementDataStateResult({
    actionHandlers,
    handleReorderLists,
    lists: sortedLists,
  });
};
