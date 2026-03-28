export const isInvalidNumberInput = (
  value: string,
  min: number,
  max: number,
): boolean => {
  if (!value) return true;

  const parsedValue = Number.parseInt(value, 10);

  return parsedValue < min || parsedValue > max;
};
