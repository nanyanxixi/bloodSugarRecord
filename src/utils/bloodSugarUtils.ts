import { MealType, TimePoint, BloodSugarStatus, MealOption, TimePointOption, ExerciseOption } from '@/types';

export const mealOptions: MealOption[] = [
  { value: 'emptyStomach', label: '空腹' },
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'bedtime', label: '睡前' },
];

export const timePointOptions: TimePointOption[] = [
  { value: null, label: '餐前' },
  { value: '1h', label: '餐后1小时' },
  { value: '2h', label: '餐后2小时' },
];

export const exerciseOptions: ExerciseOption[] = [
  { value: '散步', label: '散步' },
  { value: '慢跑', label: '慢跑' },
  { value: '瑜伽', label: '瑜伽' },
  { value: '游泳', label: '游泳' },
  { value: '孕妇操', label: '孕妇操' },
  { value: '爬山', label: '爬山' },
  { value: '其他', label: '其他' },
];

type ThresholdMap = {
  [key in MealType]: { [key: string]: { normal: number } };
};

export function getBloodSugarStatus(value: number, mealType: MealType, timePoint: TimePoint | null): BloodSugarStatus {
  if (value < 3.9) return 'low';

  const thresholds: ThresholdMap = {
    emptyStomach: {
      '': { normal: 5.1 },
    },
    breakfast: {
      '': { normal: 5.3 },
      '1h': { normal: 10.0 },
      '2h': { normal: 8.5 },
    },
    lunch: {
      '': { normal: 5.3 },
      '1h': { normal: 10.0 },
      '2h': { normal: 8.5 },
    },
    dinner: {
      '': { normal: 5.3 },
      '1h': { normal: 10.0 },
      '2h': { normal: 8.5 },
    },
    bedtime: {
      '': { normal: 6.7 },
    },
  };

  const threshold = thresholds[mealType][timePoint || ''];
  return value > threshold.normal ? 'high' : 'normal';
}

export function getStatusColor(status: BloodSugarStatus): string {
  switch (status) {
    case 'normal':
      return '#22C55E';
    case 'high':
      return '#EF4444';
    case 'low':
      return '#EAB308';
    default:
      return '#9CA3AF';
  }
}

export function getStatusText(status: BloodSugarStatus): string {
  switch (status) {
    case 'normal':
      return '正常';
    case 'high':
      return '偏高';
    case 'low':
      return '偏低';
    default:
      return '未知';
  }
}

export function getMealLabel(mealType: MealType): string {
  const option = mealOptions.find(o => o.value === mealType);
  return option ? option.label : mealType;
}

export function getTimePointLabel(timePoint: TimePoint | null): string {
  const option = timePointOptions.find(o => o.value === timePoint);
  return option ? option.label : '';
}

export function getMealAndTimePointLabel(mealType: MealType, timePoint: TimePoint | null): string {
  const mealLabel = getMealLabel(mealType);
  const timeLabel = getTimePointLabel(timePoint);
  if (mealType === 'emptyStomach') return '空腹';
  if (mealType === 'bedtime') return '睡前';
  return `${mealLabel}${timeLabel}`;
}

export function detectMealTypeByTime(hours: number, minutes: number): MealType {
  const totalMinutes = hours * 60 + minutes;
  
  if (totalMinutes >= 0 && totalMinutes < 360) return 'bedtime';
  if (totalMinutes >= 360 && totalMinutes < 600) return 'emptyStomach';
  if (totalMinutes >= 600 && totalMinutes < 690) return 'breakfast';
  if (totalMinutes >= 690 && totalMinutes < 780) return 'lunch';
  if (totalMinutes >= 780 && totalMinutes < 930) return 'lunch';
  if (totalMinutes >= 930 && totalMinutes < 1050) return 'dinner';
  if (totalMinutes >= 1050 && totalMinutes < 1200) return 'dinner';
  if (totalMinutes >= 1200 && totalMinutes < 1320) return 'dinner';
  if (totalMinutes >= 1320 && totalMinutes < 1440) return 'bedtime';
  
  return 'emptyStomach';
}

export function detectTimePointByTime(hours: number, minutes: number, mealType: MealType): TimePoint | null {
  const totalMinutes = hours * 60 + minutes;
  
  if (mealType === 'emptyStomach') return null;
  if (mealType === 'bedtime') return null;
  
  switch (mealType) {
    case 'breakfast':
      if (totalMinutes >= 600 && totalMinutes < 660) return '1h';
      if (totalMinutes >= 660 && totalMinutes < 690) return '2h';
      return null;
    case 'lunch':
      if (totalMinutes >= 690 && totalMinutes < 780) return null;
      if (totalMinutes >= 780 && totalMinutes < 840) return '1h';
      if (totalMinutes >= 840 && totalMinutes < 930) return '2h';
      return null;
    case 'dinner':
      if (totalMinutes >= 930 && totalMinutes < 1050) return null;
      if (totalMinutes >= 1050 && totalMinutes < 1200) return null;
      if (totalMinutes >= 1200 && totalMinutes < 1260) return '1h';
      if (totalMinutes >= 1260 && totalMinutes < 1320) return '2h';
      return null;
    default:
      return null;
  }
}

export const defaultFoodOptions: Record<MealType, string[]> = {
  emptyStomach: [],
  breakfast: [
    '牛奶',
    '水煮蛋',
    '玉米',
    '鸡蛋肠粉',
    '蒸饺',
    '包子',
    '茶叶蛋',
    '豆浆',
    '全麦面包',
    '燕麦片',
    '小米粥',
    '蒸红薯',
    '香蕉',
    '苹果',
    '粥',
  ],
  lunch: [
    '米饭',
    '辣椒炒肉',
    '牛腩',
    '香干炒肉',
    '螺蛳粉',
    '炒白菜',
    '鸡肉',
    '油麦菜',
    '空心菜',
    '青菜',
    '荞麦汤面',
    '清蒸鱼',
    '番茄炒蛋',
    '西兰花炒肉',
    '黄瓜炒鸡蛋',
    '豆腐',
    '瘦肉汤',
    '炒菠菜',
    '凉拌黄瓜',
    '杂粮饭',
  ],
  dinner: [
    '米饭',
    '炒白菜',
    '鸡肉',
    '油麦菜',
    '空心菜',
    '青菜',
    '荞麦汤面',
    '清蒸鱼',
    '番茄炒蛋',
    '西兰花炒肉',
    '黄瓜炒鸡蛋',
    '豆腐',
    '瘦肉汤',
    '炒菠菜',
    '凉拌黄瓜',
    '杂粮饭',
    '粥',
    '蒸蛋羹',
  ],
  bedtime: [],
};

export function formatBloodSugar(value: number): string {
  return value.toFixed(2);
}

export function validateBloodSugar(value: number): { valid: boolean; message: string } {
  if (value <= 2.0) {
    return { valid: false, message: '血糖值过低，请确认测量结果' };
  }
  if (value >= 50.0) {
    return { valid: false, message: '血糖值过高，请确认测量结果' };
  }
  return { valid: true, message: '' };
}

export interface ParsedExercise {
  type: string;
  duration?: number;
  distance?: number;
  durationUnit?: string;
  distanceUnit?: string;
}

export function parseExerciseText(text: string): ParsedExercise {
  if (!text) {
    return { type: '' };
  }
  
  const exerciseTypes = ['散步', '慢跑', '瑜伽', '游泳', '孕妇操', '爬山'];
  let type = text;
  let duration: number | undefined;
  let distance: number | undefined;
  let durationUnit = '分钟';
  let distanceUnit = 'km';
  
  for (const t of exerciseTypes) {
    if (text.includes(t)) {
      type = t;
      break;
    }
  }
  
  const durationMatch = text.match(/(\d+(?:\.\d+)?)\s*(分钟|分|min|小时|时|h)/i);
  if (durationMatch) {
    duration = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.includes('小时') || unit.includes('时') || unit === 'h') {
      duration *= 60;
      durationUnit = '分钟';
    } else {
      durationUnit = '分钟';
    }
  }
  
  const distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*(公里|km|米|m)/i);
  if (distanceMatch) {
    distance = parseFloat(distanceMatch[1]);
    const unit = distanceMatch[2].toLowerCase();
    if (unit.includes('米') || unit === 'm') {
      distance /= 1000;
      distanceUnit = 'km';
    } else {
      distanceUnit = 'km';
    }
  }
  
  if (type === text && !duration && !distance) {
    const customMatch = text.match(/([^\d]+)(\d+(?:\.\d+)?)\s*(分钟|分|公里|km|米|m)/i);
    if (customMatch) {
      type = customMatch[1].trim();
    }
  }
  
  return { type, duration, distance, durationUnit, distanceUnit };
}

export function formatExerciseText(type: string, duration?: number, distance?: number): string {
  let text = type;
  if (duration !== undefined && duration !== null && duration > 0) {
    text += `${text ? ' ' : ''}${duration}分钟`;
  }
  if (distance !== undefined && distance !== null && distance > 0) {
    text += `${text ? ' ' : ''}${distance}km`;
  }
  return text;
}
