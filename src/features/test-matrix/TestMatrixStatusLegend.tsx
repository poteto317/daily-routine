import testMatrixTexts from "./locales/ja.json";

export const TestMatrixStatusLegend = () => (
  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="font-medium text-gray-700">
        {testMatrixTexts.page.statusLabel}
      </span>
      <span className="text-gray-600">{testMatrixTexts.page.statusOk}</span>
      <span className="text-gray-600">{testMatrixTexts.page.statusNg}</span>
      <span className="text-gray-600">{testMatrixTexts.page.statusNa}</span>
      <span className="text-gray-600">
        {testMatrixTexts.page.statusUnchecked}
      </span>
    </div>
  </div>
);
