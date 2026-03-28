"use client";

import { useAuth } from "@/features/auth";
import { menuConfig } from "@/config";
import { useHeaderSyncController } from "@/hooks/useHeaderSyncController";
import { useHeaderMenuController } from "@/hooks/useHeaderMenuController";
import type { PageType } from "@/features/routine/pages/types";
import { HeaderSyncButton } from "@/layouts/HeaderSyncButton";
import { HeaderEditModeButton } from "@/layouts/HeaderEditModeButton";
import { HeaderMenu } from "@/layouts/HeaderMenu";

export type HeaderProps = {
  onNavigateAction: (page: PageType) => void;
  currentPage: PageType;
  isEditMode: boolean;
  onToggleEditModeAction: () => void;
};

export const Header = ({
  onNavigateAction,
  currentPage,
  isEditMode,
  onToggleEditModeAction,
}: HeaderProps) => {
  const { syncStatus, handleUploadClick, handleDownloadClick } =
    useHeaderSyncController();
  const { user, signOut, isAdmin } = useAuth();
  const {
    isMenuOpen,
    setIsMenuOpenAction,
    filteredMenuItems,
    onNavigateAction: onMenuNavigateAction,
    onLogoutAction,
  } = useHeaderMenuController({
    onNavigateAction,
    isAdmin,
    signOut,
  });

  return (
    <header className="bg-white dark:bg-slate-100 shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onMenuNavigateAction("home")}
          className="flex items-center gap-2 text-gray-900 dark:text-black hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-2xl">{menuConfig.header.logo}</span>
          <h1 className="text-lg font-bold">{menuConfig.header.title}</h1>
        </button>

        <div className="flex items-center gap-2">
          <HeaderSyncButton
            mode="upload"
            syncStatus={syncStatus}
            onSyncAction={handleUploadClick}
          />
          <HeaderSyncButton
            mode="download"
            syncStatus={syncStatus}
            onSyncAction={handleDownloadClick}
          />
          {currentPage === "home" && (
            <HeaderEditModeButton
              isEditMode={isEditMode}
              onToggleEditModeAction={onToggleEditModeAction}
            />
          )}
          <HeaderMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpenAction={setIsMenuOpenAction}
            currentPage={currentPage}
            filteredMenuItems={filteredMenuItems}
            user={user}
            onNavigateAction={onMenuNavigateAction}
            onLogoutAction={onLogoutAction}
          />
        </div>
      </div>
    </header>
  );
};
