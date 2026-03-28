interface CardPanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 共通のカードコンテナコンポーネント
 * 白背景、角丸、影付きのカードスタイルを提供
 */
export const CardPanel = ({ children, className = "" }: CardPanelProps) => {
  const baseClasses =
    "bg-white dark:bg-slate-100 rounded-2xl shadow-xl p-6 mb-6";
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return <div className={combinedClasses}>{children}</div>;
};
