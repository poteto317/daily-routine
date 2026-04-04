import { useMemo } from "react";
import { getListProgress } from "./todoListProgress";
import { createTodoListDetailProgressResult } from "./todoListDetailProgressResult";
import type { TodoList } from "./types";

type UseTodoListDetailProgressParams = {
  list: TodoList;
};

export const useTodoListDetailProgress = ({
  list,
}: UseTodoListDetailProgressParams) => {
  const progress = useMemo(() => getListProgress(list), [list]);

  return createTodoListDetailProgressResult({ progress });
};
