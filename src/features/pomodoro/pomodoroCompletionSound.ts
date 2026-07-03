export const playTimerCompletionSound = (
  audio: HTMLAudioElement | null,
): void => {
  audio?.play().catch(() => undefined);
};
