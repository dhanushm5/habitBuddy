export interface User {
  id: number;
  email: string;
}

export interface Habit {
  _id: string;
  id: number;
  name: string;
  frequencyDays: number[];
  color: string;
  reminderTime?: string;
  completedDates: string[];
  startDate: string;
  userId: number;
}

export interface HabitStats {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Avatar {
  color: string;
  accessory: string;
  shape: string;
}

export interface AuthResponse {
  token: string;
}
