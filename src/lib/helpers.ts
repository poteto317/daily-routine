/**
 * Lib layer helper functions
 * Functions for Firebase modules
 */

import texts from "./locales/ja.json";

/**
 * Get permission denied message
 */
export const getPermissionDeniedMessage = (permission: string): string => {
  return texts.firebaseMessaging.permissionDeniedTemplate.replace(
    "{permission}",
    permission,
  );
};

/**
 * Get token retrieval failed message
 */
export const getTokenRetrievalFailedMessage = (
  errorMessage: string,
): string => {
  return texts.firebaseMessaging.tokenRetrievalFailedTemplate.replace(
    "{errorMessage}",
    errorMessage,
  );
};
