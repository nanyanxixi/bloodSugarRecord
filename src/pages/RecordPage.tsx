import { useState, useEffect } from 'react';
import { useBloodSugarStore } from '@/hooks/useBloodSugarStore';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { mealOptions, timePointOptions, exerciseOptions, detectMealTypeByTime, detectTimePointByTime, getBloodSugarStatus, getStatusColor, getStatusText, getMealAndTimePointLabel, defaultFoodOptions, validateBloodSugar, formatBloodSugar } from '@/utils/bloodSugarUtils';
import { MealType, TimePoint } from '@/types';
import { Clock, Utensils, Activity, Save, RefreshCw, Plus, Scale } from 'lucide-react';

export function RecordPage() {
  const addRecord = useBloodSugarStore((state) => state.addRecord);
  const addWeightRecord = useBloodSugarStore((state) => state.addWeightRecord);
  
  const now = new Date();
  const [date, setDate] = useState(formatDate(now));
  const [time, setTime] = useState(formatTime(now));
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [timePoint, setTimePoint] = useState<TimePoint | null>(null);
  const [value, setValue] = useState<string>('');
  const [food, setFood] = useState('');
  const [exercise, setExercise] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseDistance, setExerciseDistance] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [exerciseType, setExerciseType] = useState<'time' | 'distance'>('time');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [showWeightSection, setShowWeightSection] = useState(false);

  useEffect(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const detectedMealType = detectMealTypeByTime(hours, minutes);
    const detectedTimePoint = detectTimePointByTime(hours, minutes, detectedMealType);
    setMealType(detectedMealType);
    setTimePoint(detectedTimePoint);
  }, []);

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    const [hours, minutes] = newTime.split(':').map(Number);
    const detectedMealType = detectMealTypeByTime(hours, minutes);
    const detectedTimePoint = detectTimePointByTime(hours, minutes, detectedMealType);
    setMealType(detectedMealType);
    setTimePoint(detectedTimePoint);
  };

  const handleExerciseSelect = (option: string) => {
    if (option === '其他') {
      setExercise('');
      setCustomExercise('');
      setExerciseDuration('');
      setExerciseDistance('');
      setExerciseType('time');
    } else {
      setExercise(option);
      setCustomExercise('');
    }
  };

  const handleMealTypeChange = (newMealType: MealType) => {
    setMealType(newMealType);
    if (newMealType === 'emptyStomach' || newMealType === 'bedtime') {
      setTimePoint(null);
    } else if (timePoint === null) {
      const [hours, minutes] = time.split(':').map(Number);
      const detectedTimePoint = detectTimePointByTime(hours, minutes, newMealType);
      setTimePoint(detectedTimePoint);
    }
  };

  const handleFoodAdd = (foodItem: string) => {
    if (food) {
      setFood(food + '、' + foodItem);
    } else {
      setFood(foodItem);
    }
  };

  const buildExerciseText = () => {
    let text = exercise === '其他' ? customExercise : exercise;
    if (exerciseDuration) {
      text += `${text ? ' ' : ''}${exerciseDuration}分钟`;
    }
    if (exerciseDistance) {
      text += `${text ? ' ' : ''}${exerciseDistance}公里`;
    }
    return text;
  };

  const status = value ? getBloodSugarStatus(parseFloat(value), mealType, timePoint) : 'normal';
  const statusColor = getStatusColor(status);

  const handleSave = () => {
    if (!value) {
      setErrorMessage('请输入血糖值');
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setErrorMessage('请输入有效的数值');
      return;
    }
    
    const validation = validateBloodSugar(numValue);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }
    
    setErrorMessage('');
    
    addRecord({
      date,
      time,
      mealType,
      timePoint,
      value: parseFloat(numValue.toFixed(2)),
      food,
      exercise: buildExerciseText(),
    });
    
    if (weight) {
      const weightValue = parseFloat(weight);
      if (!isNaN(weightValue) && weightValue > 0) {
        addWeightRecord({
          date,
          time,
          weight: parseFloat(weightValue.toFixed(2)),
        });
      }
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setValue('');
      setFood('');
      setExercise('');
      setExerciseDuration('');
      setExerciseDistance('');
      setCustomExercise('');
      setExerciseType('time');
      setWeight('');
    }, 2000);
  };

  const handleRefresh = () => {
    const newNow = new Date();
    setDate(formatDate(newNow));
    setTime(formatTime(newNow));
    const hours = newNow.getHours();
    const minutes = newNow.getMinutes();
    const detectedMealType = detectMealTypeByTime(hours, minutes);
    const detectedTimePoint = detectTimePointByTime(hours, minutes, detectedMealType);
    setMealType(detectedMealType);
    setTimePoint(detectedTimePoint);
  };

  return (
    <div className="min-h-screen bg-primary-light pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center">血糖记录</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">当前时间</span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">餐段选择</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mealOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMealTypeChange(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mealType === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {mealType !== 'emptyStomach' && mealType !== 'bedtime' && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {timePointOptions.map((option) => (
                  <button
                    key={option.value?.toString() || 'null'}
                    onClick={() => setTimePoint(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      timePoint === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-primary-light rounded-xl">
            <span className="text-sm text-gray-600">当前选择：</span>
            <span className="text-sm font-medium text-primary">{getMealAndTimePointLabel(mealType, timePoint)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">血糖值 (mmol/L)</span>
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setErrorMessage('');
              }}
              placeholder="输入血糖值"
              step="0.01"
              className="w-full px-6 py-6 text-4xl font-bold text-center bg-gray-50 rounded-2xl border-2 transition-all"
              style={{ borderColor: errorMessage ? '#EF4444' : (value ? statusColor : '#E5E7EB'), color: errorMessage ? '#EF4444' : (value ? statusColor : '#9CA3AF') }}
            />
            {value && !errorMessage && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-medium"
                   style={{ backgroundColor: statusColor, color: 'white' }}>
                {getStatusText(status)}
              </div>
            )}
          </div>
          {errorMessage && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl flex items-center gap-2">
              <span className="text-red-500 text-sm">{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">餐食内容</span>
          </div>
          {defaultFoodOptions[mealType].length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {defaultFoodOptions[mealType].map((item) => (
                <button
                  key={item}
                  onClick={() => handleFoodAdd(item)}
                  className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {item}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="记录餐食内容..."
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 resize-none"
            rows={3}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">运动情况</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {exerciseOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleExerciseSelect(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  exercise === option.value && option.value !== '其他'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {(exercise === '其他' || !exercise) && (
            <input
              type="text"
              value={customExercise}
              onChange={(e) => setCustomExercise(e.target.value)}
              placeholder="输入运动内容..."
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 mb-3"
            />
          )}
          {(exercise && exercise !== '其他') && (
            <div className="space-y-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => {
                    setExerciseType('time');
                    setExerciseDistance('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    exerciseType === 'time'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  ⏱️ 时间(分钟)
                </button>
                <button
                  onClick={() => {
                    setExerciseType('distance');
                    setExerciseDuration('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    exerciseType === 'distance'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  📏 距离(km)
                </button>
              </div>
              {exerciseType === 'time' ? (
                <input
                  type="number"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  placeholder="输入时长（分钟）"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800"
                />
              ) : (
                <input
                  type="number"
                  value={exerciseDistance}
                  onChange={(e) => setExerciseDistance(e.target.value)}
                  placeholder="输入距离（公里）"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800"
                />
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <button
            onClick={() => setShowWeightSection(!showWeightSection)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">体重记录</span>
            </div>
            <span className={`text-sm transition-transform ${showWeightSection ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showWeightSection && (
            <div className="mt-4">
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="输入体重 (kg)"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!value || parseFloat(value) <= 2.0 || parseFloat(value) >= 50.0}
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            value && parseFloat(value) > 2.0 && parseFloat(value) < 50.0
              ? 'bg-primary hover:opacity-90 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          保存记录
        </button>

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
            <div className="bg-white rounded-2xl p-6 shadow-xl animate-bounce">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-500 text-2xl">✓</span>
              </div>
              <p className="text-gray-800 font-medium text-center">记录保存成功</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
