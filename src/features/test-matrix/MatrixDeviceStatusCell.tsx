import { STATUS_DISPLAY } from "./statusHelpers";
import type { CheckStatus } from "./types";
import { getStatusTitle } from "./helpers";

interface MatrixDeviceStatusCellProps {
  status: CheckStatus;
  statusTitleLabel: "PC" | "SP";
  hasDetail: boolean;
  okCount: number;
  totalCount: number;
  onToggle: () => void;
}

export const MatrixDeviceStatusCell = ({
  status,
  statusTitleLabel,
  hasDetail,
  okCount,
  totalCount,
  onToggle,
}: MatrixDeviceStatusCellProps) => (
  <td className="px-2 py-2 text-center">
    <div className="flex flex-col items-center gap-1">
      {hasDetail ? (
        <div
          className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold ${STATUS_DISPLAY[status].color}`}
          title={getStatusTitle(
            statusTitleLabel,
            STATUS_DISPLAY[status].label,
            true,
          )}
        >
          {STATUS_DISPLAY[status].emoji}
        </div>
      ) : (
        <button
          onClick={onToggle}
          className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold transition-all cursor-pointer select-none ${STATUS_DISPLAY[status].color}`}
          title={getStatusTitle(
            statusTitleLabel,
            STATUS_DISPLAY[status].label,
            false,
          )}
        >
          {STATUS_DISPLAY[status].emoji}
        </button>
      )}
      {hasDetail && (
        <span className="text-[10px] text-gray-500 font-medium">
          {okCount}/{totalCount}
        </span>
      )}
    </div>
  </td>
);
