import { LoadingIndicator } from "./LoadingIndicator";

type FullScreenLoadingProps = {
  message: string;
};

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message,
}) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300 flex items-center justify-center">
      <LoadingIndicator message={message} />
    </div>
  );
};
