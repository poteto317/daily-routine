type LoadingIndicatorProps = {
  message: string;
  subMessage?: string;
  containerClassName?: string;
  spinnerClassName?: string;
  messageClassName?: string;
  subMessageClassName?: string;
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  subMessage,
  containerClassName = "text-center",
  spinnerClassName = "animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4",
  messageClassName = "text-gray-700 dark:text-gray-900 text-lg",
  subMessageClassName = "text-sm text-gray-500 dark:text-gray-600 mt-2",
}) => {
  return (
    <div className={containerClassName}>
      <div className={spinnerClassName}></div>
      <p className={messageClassName}>{message}</p>
      {subMessage ? <p className={subMessageClassName}>{subMessage}</p> : null}
    </div>
  );
};
