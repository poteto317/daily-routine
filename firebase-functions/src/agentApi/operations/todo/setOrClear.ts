/** value が null ならキーを消し、undefined なら何もせず、それ以外なら設定する */
export const setOrClear = <T extends object>(
  target: T,
  key: string,
  value: unknown,
): T => {
  if (value === undefined) return target;
  const rest = Object.fromEntries(
    Object.entries(target).filter(([entryKey]) => entryKey !== key),
  );
  return (value === null ? rest : { ...rest, [key]: value }) as T;
};
