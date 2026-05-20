export type FrequencyType = "daily" | "weekly" | "custom";

export interface HabitSchedule {
  frequency: FrequencyType;
  days: number[];
  reminderTime: {
    hour: number;
    minute: number;
  };
  startDate: string;
  endDate?: string;
}

export interface HabitLog {
  date: string;
  completed: boolean;
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  schedule: HabitSchedule;
  logs: HabitLog[];
  createdAt: string;
  streak: number;
}
