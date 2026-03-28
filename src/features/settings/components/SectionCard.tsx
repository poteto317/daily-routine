import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  beta?: boolean;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const SectionCard = ({
  title,
  beta,
  description,
  children,
  className,
}: SectionCardProps) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
          {title}
        </h3>
        {beta && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            Beta
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};
