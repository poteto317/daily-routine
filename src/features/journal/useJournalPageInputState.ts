import { useState } from "react";
import type { JournalViewState } from "./journalViewStateActions";

type JournalPageInputInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput" | "dateInput"
>;

export const useJournalPageInputState = (
  initialState: JournalPageInputInitialState,
) => {
  const [titleInput, setTitleInput] = useState(initialState.titleInput);
  const [contentInput, setContentInput] = useState(initialState.contentInput);
  // null（未操作）・""（空にした）・YYYY-MM-DD（選んだ値）を 1 つの state で表す
  const [dateInput, setDateInput] = useState<string | null>(
    initialState.dateInput,
  );

  return {
    contentInput,
    dateInput,
    setContentInput,
    setDateInput,
    setTitleInput,
    titleInput,
  };
};
