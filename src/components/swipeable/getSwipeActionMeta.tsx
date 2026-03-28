import { ReactNode } from "react";

type SwipeActionType = "delete" | "edit" | "indent";

type SwipeActionMeta = {
  actionColor: string;
  actionIcon: ReactNode;
};

export const getSwipeActionMeta = (
  swipeActionType: SwipeActionType,
): SwipeActionMeta => {
  if (swipeActionType === "delete") {
    return {
      actionColor: "bg-red-500",
      actionIcon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    };
  }

  if (swipeActionType === "indent") {
    return {
      actionColor: "bg-teal-500",
      actionIcon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h10M4 12h16M10 18h10" />
          <path d="M8 15l3-3-3-3" />
        </svg>
      ),
    };
  }

  return {
    actionColor: "bg-blue-500",
    actionIcon: (
      <svg
        className="w-6 h-6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  };
};
