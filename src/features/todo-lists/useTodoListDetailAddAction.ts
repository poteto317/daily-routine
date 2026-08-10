import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { addTodoItemFromDetailInput } from "./todoListPageViewActions";

type UseTodoListDetailAddActionParams = {
  inputText: string;
  listId: string;
  onAddItem: (listId: string, title: string) => void;
  setInputText: Dispatch<SetStateAction<string>>;
  inputRef: RefObject<HTMLInputElement | null>;
};

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
      // 追加後は入力欄からフォーカスを外し、モバイルのソフトウェアキーボードを閉じる
      blurInput: () => inputRef.current?.blur(),
    });
  }, [inputRef, inputText, listId, onAddItem, setInputText]);

  return {
    handleAdd,
  };
};
