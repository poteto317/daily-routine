import configJa from "./locales/ja.json";

export const { appConfig, menuConfig, uiTextConfig } = configJa;

// 型定義
export interface AppConfig {
  app: {
    name: string;
    title: string;
    description: string;
    shortTitle: string;
  };
  defaults: {
    durationMinutes: number;
    notificationMinutes: number;
    pomodoroFocusMinutes: number;
    pomodoroBreakMinutes: number;
  };
  validation: {
    durationMinutes: ValidationRule;
    notificationMinutes: ValidationRule;
    pomodoroFocusMinutes: ValidationRule;
    pomodoroBreakMinutes: ValidationRule;
  };
  export: {
    filenamePrefix: string;
    dateFormat: string;
  };
  notification: {
    testTimeout: number;
  };
  auth: {
    testAccount: {
      email: string;
      password: string;
    };
  };
}

export interface ValidationRule {
  min: number;
  max: number;
  recommended: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: {
    text: string;
    color: string;
  };
}

export interface MenuConfig {
  menuItems: MenuItem[];
  header: {
    logo: string;
    title: string;
  };
}

export interface UITextConfig {
  auth: {
    logout: {
      button: string;
      confirm: string;
      success: string;
      error: string;
    };
    anonymousUser: string;
    anonymousUserFull: string;
    user: string;
  };
  editMode: {
    toggle: {
      enable: string;
      disable: string;
    };
  };
  menu: {
    label: string;
  };
  settings: {
    title: string;
    save: string;
    saved: string;
    sections: Record<string, unknown>;
    dataManagement: Record<string, unknown>;
    errors: Record<string, string>;
  };
  days: Array<{
    value: number;
    label: string;
    fullLabel: string;
  }>;
}
