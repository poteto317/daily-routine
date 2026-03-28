export const focusMenuItem = (
  menuItems: Array<HTMLButtonElement | null>,
  nextIndex: number,
) => {
  const availableItems = menuItems.filter(
    (element): element is HTMLButtonElement => element !== null,
  );

  if (availableItems.length === 0) return;

  const normalizedIndex =
    (nextIndex + availableItems.length) % availableItems.length;
  availableItems[normalizedIndex]?.focus();
};
