import { useState } from "react";
import type { JournalViewState } from "./journalViewStateActions";

type JournalPageInputInitialState = Pick<
  JournalViewState,
  "titleInput" | "contentInput"
>;

export const useJournalPageInputState = (
  initialState: JournalPageInputInitialState,
) => {
  const [titleInput, setTitleInput] = useState(initialState.titleInput);
  const [contentInput, setContentInput] = useState(initialState.contentInput);

  return {
    contentInput,
    setContentInput,
    setTitleInput,
    titleInput,
  };
};
