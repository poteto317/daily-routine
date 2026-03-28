import { uiTextConfig } from "@/config";
import type { User } from "firebase/auth";
import type { PageType } from "@/features/routine/pages/types";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";
import { HeaderMenuFooter } from "./HeaderMenuFooter";
import { HeaderMenuItemButton } from "./HeaderMenuItemButton";

type Props = {
  panelId: string;
  currentPage: PageType;
  filteredMenuItems: HeaderMenuItem[];
  user: User | null;
  setMenuItemRef: (index: number, element: HTMLButtonElement | null) => void;
  onNavigateClick: (page: PageType) => void;
  onLogoutClick: () => void;
  onMenuItemKeyDown: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
};

export const HeaderMenuPanel = ({
  panelId,
  currentPage,
  filteredMenuItems,
  user,
  setMenuItemRef,
  onNavigateClick,
  onLogoutClick,
  onMenuItemKeyDown,
}: Props) => {
  return (
    <div
      id={panelId}
      role="menu"
      aria-label={uiTextConfig.menu.label}
      className="absolute right-0 mt-2 min-w-48 w-max bg-white dark:bg-slate-100 rounded-lg shadow-xl border border-gray-200 dark:border-gray-300 overflow-hidden max-h-[80vh] overflow-y-auto z-50"
    >
      {filteredMenuItems.map((item, index) => (
        <HeaderMenuItemButton
          key={item.id}
          item={item}
          index={index}
          currentPage={currentPage}
          setMenuItemRef={setMenuItemRef}
          onNavigateClick={onNavigateClick}
          onMenuItemKeyDown={onMenuItemKeyDown}
        />
      ))}

      <HeaderMenuFooter
        user={user}
        logoutItemIndex={filteredMenuItems.length}
        setMenuItemRef={setMenuItemRef}
        onLogoutClick={onLogoutClick}
        onMenuItemKeyDown={onMenuItemKeyDown}
      />
    </div>
  );
};
