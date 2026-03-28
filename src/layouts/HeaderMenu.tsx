import type { User } from "firebase/auth";
import type { PageType } from "@/features/routine/pages/types";
import { useHeaderMenuInteraction } from "@/hooks/useHeaderMenuInteraction";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";
import { HeaderMenuPanel } from "@/layouts/header-menu/HeaderMenuPanel";
import { HeaderMenuToggleButton } from "@/layouts/header-menu/HeaderMenuToggleButton";

const HEADER_MENU_PANEL_ID = "header-menu-panel";

type HeaderMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpenAction: (isOpen: boolean) => void;
  currentPage: PageType;
  filteredMenuItems: HeaderMenuItem[];
  user: User | null;
  onNavigateAction: (page: PageType) => void;
  onLogoutAction: () => Promise<void>;
};

export const HeaderMenu = ({
  isMenuOpen,
  setIsMenuOpenAction,
  currentPage,
  filteredMenuItems,
  user,
  onNavigateAction,
  onLogoutAction,
}: HeaderMenuProps) => {
  const {
    menuButtonRef,
    setMenuItemRef,
    closeMenu,
    handleMenuToggleClick,
    handleNavigateClick,
    handleLogoutClick,
    handleMenuItemKeyDown,
    handleMenuKeyDown,
  } = useHeaderMenuInteraction({
    isMenuOpen,
    setIsMenuOpenAction,
    onNavigateAction,
    onLogoutAction,
  });

  return (
    <div className="relative" onKeyDown={handleMenuKeyDown}>
      <HeaderMenuToggleButton
        isMenuOpen={isMenuOpen}
        menuButtonRef={menuButtonRef}
        onToggleClick={handleMenuToggleClick}
        panelId={HEADER_MENU_PANEL_ID}
      />

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <HeaderMenuPanel
            panelId={HEADER_MENU_PANEL_ID}
            currentPage={currentPage}
            filteredMenuItems={filteredMenuItems}
            user={user}
            setMenuItemRef={setMenuItemRef}
            onNavigateClick={handleNavigateClick}
            onLogoutClick={handleLogoutClick}
            onMenuItemKeyDown={handleMenuItemKeyDown}
          />
        </>
      )}
    </div>
  );
};
