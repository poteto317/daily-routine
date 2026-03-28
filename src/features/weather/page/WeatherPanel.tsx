type WeatherPanelProps = {
  children: React.ReactNode;
};

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ children }) => {
  return (
    <div className="bg-white dark:bg-slate-100 rounded-2xl shadow-xl p-6 mb-6">
      {children}
    </div>
  );
};
