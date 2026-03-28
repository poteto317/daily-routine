import { ACCOUNT_ADMIN_LEGEND_TEXT } from "./helpers";

export const AccountAdminLegend = () => {
  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <h3 className="text-xs font-bold text-gray-600 mb-2">
        {ACCOUNT_ADMIN_LEGEND_TEXT.title}
      </h3>
      <ul className="text-xs text-gray-500 space-y-1">
        {ACCOUNT_ADMIN_LEGEND_TEXT.items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
};
