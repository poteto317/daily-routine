import type { PageType } from "@/features/routine/pages/types";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

type Props = {
  item: HeaderMenuItem;
  index: number;
  currentPage: PageType;
  setMenuItemRef: (index: number, element: HTMLButtonElement | null) => void;
  onNavigateClick: (page: PageType) => void;
  onMenuItemKeyDown: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
};

export const HeaderMenuItemButton = ({
  item,
  index,
  currentPage,
  setMenuItemRef,
  onNavigateClick,
  onMenuItemKeyDown,
}: Props) => {
  const isActiveItem =
    item.isActive !== undefined
      ? item.isActive && currentPage === item.route
      : currentPage === item.route;

  return (
    <button
      ref={(element) => {
        setMenuItemRef(index, element);
      }}
      type="button"
      key={item.id}
      onClick={() => {
        item.onBeforeNavigate?.();
        onNavigateClick(item.route);
      }}
      onKeyDown={(event) => onMenuItemKeyDown(event, index)}
      role="menuitem"
      className={`w-full text-left px-4 py-3 flex items-center gap-3 whitespace-nowrap transition-colors ${
        isActiveItem
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      }`}
    >
      <span className="text-xl">{item.icon}</span>
      <span className="font-medium">{item.label}</span>
      {item.badge && (
        <span
          className={`ml-auto px-2 py-0.5 ${item.badge.color} text-white text-xs font-bold rounded`}
        >
          {item.badge.text}
        </span>
      )}
    </button>
  );
};
