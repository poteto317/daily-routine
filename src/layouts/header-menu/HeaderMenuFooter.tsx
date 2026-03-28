import type { User } from "firebase/auth";
import { uiTextConfig } from "@/config";

type Props = {
  user: User | null;
  logoutItemIndex: number;
  setMenuItemRef: (index: number, element: HTMLButtonElement | null) => void;
  onLogoutClick: () => void;
  onMenuItemKeyDown: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
};

export const HeaderMenuFooter = ({
  user,
  logoutItemIndex,
  setMenuItemRef,
  onLogoutClick,
  onMenuItemKeyDown,
}: Props) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
      {user && (
        <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2 mb-2">
            <span>👤</span>
            <span className="font-medium">
              {user.isAnonymous
                ? uiTextConfig.auth.anonymousUserFull
                : user.email || uiTextConfig.auth.user}
            </span>
          </div>
        </div>
      )}
      <button
        ref={(element) => {
          setMenuItemRef(logoutItemIndex, element);
        }}
        type="button"
        onClick={onLogoutClick}
        onKeyDown={(event) => onMenuItemKeyDown(event, logoutItemIndex)}
        role="menuitem"
        className="w-full text-left px-4 py-3 flex items-center gap-3 whitespace-nowrap transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
      >
        <span className="text-xl">🚪</span>
        <span className="font-medium">{uiTextConfig.auth.logout.button}</span>
      </button>
    </div>
  );
};
