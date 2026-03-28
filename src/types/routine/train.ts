export interface TrainLine {
  id: string;
  name: string;
  company: string;
}

export interface TrainDelayInfo {
  lineId: string;
  lineName: string;
  company: string;
  delayMinutes: number;
  reason?: string;
  section?: string;
  lastUpdated: string;
}

export interface TrainDelaySettings {
  enabled: boolean;
  monitoredLines: Array<{
    lineId: string;
    lineName: string;
    company: string;
    sections?: string[];
  }>;
}
