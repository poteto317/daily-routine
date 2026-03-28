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
      focusInput: () => inputRef.current?.focus(),
    });
  }, [inputRef, inputText, listId, onAddItem, setInputText]);

  return {
    handleAdd,
  };
};
