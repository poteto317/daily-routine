import { useRef, useState } from "react";

export const useTodoListDetailInputState = () => {
  const [inputText, setInputText] = useState("");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    dragOverIndex,
    inputRef,
    inputText,
    setDragOverIndex,
    setInputText,
  };
};
