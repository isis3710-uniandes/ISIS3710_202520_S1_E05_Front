export type Task = {
  id: string;
  title: string;
  day: number;
  start: number;
  end: number;
  project: string;
  color: string;
  date: string;
  startTime: string;
  endTime: string;
  periodicity: "none" | "daily" | "weekly" | "biweekly" | "monthly";
  priority: "low" | "medium" | "high";
  organization: string;
  description: string;
};

