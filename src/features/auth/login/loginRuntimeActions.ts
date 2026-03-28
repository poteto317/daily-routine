type SetValue<T> = (value: T) => void;

type RunLoginPageActionArgs = {
  setError: SetValue<string | null>;
  setLoading: SetValue<boolean>;
  execute: () => Promise<void>;
  onError: (error: unknown) => string;
  logError?: (error: unknown) => void;
};

export const runLoginPageAction = async ({
  setError,
  setLoading,
  execute,
  onError,
  logError,
}: RunLoginPageActionArgs): Promise<void> => {
  setError(null);
  setLoading(true);

  try {
    await execute();
  } catch (error) {
    setError(onError(error));
    logError?.(error);
  } finally {
    setLoading(false);
  }
};
