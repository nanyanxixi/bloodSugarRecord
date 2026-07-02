export type MealType = 'emptyStomach' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime';
export type TimePoint = 'before' | '1h' | '2h';
export type BloodSugarStatus = 'normal' | 'high' | 'low';

export interface BloodSugarEntry {
  id: string;
  date: string;
  time: string;
  mealType: MealType;
  timePoint: TimePoint | null;
  value: number;
  food: string;
  exercise: string;
  status: BloodSugarStatus;
  createdAt: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  time: string;
  weight: number;
  createdAt: number;
}

export interface Statistics {
  total: number;
  normal: number;
  high: number;
  low: number;
  normalRate: number;
  abnormalRate: number;
}

export interface WeightStatistics {
  latest: number;
  first: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  records: WeightEntry[];
}

export interface MealOption {
  value: MealType;
  label: string;
}

export interface TimePointOption {
  value: TimePoint | null;
  label: string;
}

export interface ExerciseOption {
  value: string;
  label: string;
}
