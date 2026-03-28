import { useState } from "react";
import { createPomodoroAudio } from "./pomodoroTimerRuntime";

export const usePomodoroAudio = () => {
  const [audio] = useState(() => createPomodoroAudio());

  return audio;
};
