import { type MonitoredLine } from "./constants";

type LineOption = { id: string; name: string; company: string };

export const resolveSelectedLine = (
  lineId: string,
  availableLines: LineOption[],
): LineOption | null => {
  return availableLines.find((item) => item.id === lineId) ?? null;
};

export const hasMonitoredLine = (
  monitoredLines: MonitoredLine[],
  lineId: string,
): boolean => {
  return monitoredLines.some((item) => item.lineId === lineId);
};

export const createMonitoredLine = (line: LineOption): MonitoredLine => {
  return { lineId: line.id, lineName: line.name, company: line.company };
};

export const removeMonitoredLine = (
  monitoredLines: MonitoredLine[],
  lineId: string,
): MonitoredLine[] => {
  return monitoredLines.filter((line) => line.lineId !== lineId);
};
