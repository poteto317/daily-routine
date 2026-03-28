export interface TodoListItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  /** インデントレベル（0=最上位, 最大3） */
  indent?: number;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoListItem[];
  createdAt: string;
  updatedAt: string;
  isHidden?: boolean;
}
