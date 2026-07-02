import { useState } from 'react';
import { useBloodSugarStore } from '@/hooks/useBloodSugarStore';
import { getStatusColor, getStatusText, getMealAndTimePointLabel, defaultFoodOptions, exerciseOptions, formatBloodSugar, detectMealTypeByTime, detectTimePointByTime, parseExerciseText, formatExerciseText } from '@/utils/bloodSugarUtils';
import { BloodSugarEntry, MealType, TimePoint } from '@/types';
import { List, Table2, Trash2, Edit3, X, Check, Plus, Utensils, Activity } from 'lucide-react';
import { mealOptions, timePointOptions } from '@/utils/bloodSugarUtils';

export function RecordsPage() {
  const records = useBloodSugarStore((state) => state.records);
  const weightRecords = useBloodSugarStore((state) => state.weightRecords);
  const deleteRecord = useBloodSugarStore((state) => state.deleteRecord);
  const updateRecord = useBloodSugarStore((state) => state.updateRecord);
  
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BloodSugarEntry>>({});
  const [editMealType, setEditMealType] = useState<MealType>('breakfast');
  const [editTimePoint, setEditTimePoint] = useState<TimePoint | null>(null);
  const [editExercise, setEditExercise] = useState('');
  const [editExerciseDuration, setEditExerciseDuration] = useState('');
  const [editExerciseDistance, setEditExerciseDistance] = useState('');
  const [editExerciseType, setEditExerciseType] = useState<'time' | 'distance'>('time');

  const handleEditTimeChange = (newTime: string) => {
    setEditData({ ...editData, time: newTime });
    const [hours, minutes] = newTime.split(':').map(Number);
    const detectedMealType = detectMealTypeByTime(hours, minutes);
    const detectedTimePoint = detectTimePointByTime(hours, minutes, detectedMealType);
    setEditMealType(detectedMealType);
    setEditTimePoint(detectedTimePoint);
  };

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, BloodSugarEntry[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const mealTimePoints = [
    { key: 'emptyStomach', label: '空腹' },
    { key: 'breakfast_before', label: '早餐前' },
    { key: 'breakfast_1h', label: '早餐后1h' },
    { key: 'breakfast_2h', label: '早餐后2h' },
    { key: 'lunch_before', label: '午餐前' },
    { key: 'lunch_1h', label: '午餐后1h' },
    { key: 'lunch_2h', label: '午餐后2h' },
    { key: 'dinner_before', label: '晚餐前' },
    { key: 'dinner_1h', label: '晚餐后1h' },
    { key: 'dinner_2h', label: '晚餐后2h' },
    { key: 'bedtime', label: '睡前' },
  ];

  const getCellKey = (record: BloodSugarEntry) => {
    if (record.mealType === 'emptyStomach') return 'emptyStomach';
    if (record.mealType === 'bedtime') return 'bedtime';
    return `${record.mealType}_${record.timePoint || 'before'}`;
  };

  const handleStartEdit = (record: BloodSugarEntry) => {
    setEditingId(record.id);
    setEditData({ ...record });
    setEditMealType(record.mealType);
    setEditTimePoint(record.timePoint);
    
    const parsedExercise = parseExerciseText(record.exercise);
    setEditExercise(parsedExercise.type);
    setEditExerciseDuration(parsedExercise.duration?.toString() || '');
    setEditExerciseDistance(parsedExercise.distance?.toString() || '');
    setEditExerciseType(parsedExercise.duration ? 'time' : 'distance');
  };

  const handleSaveEdit = () => {
    if (editingId && editData.value !== undefined) {
      const duration = editExerciseDuration ? parseFloat(editExerciseDuration) : undefined;
      const distance = editExerciseDistance ? parseFloat(editExerciseDistance) : undefined;
      const formattedExercise = formatExerciseText(editExercise, duration, distance);
      
      updateRecord(editingId, {
        ...editData,
        mealType: editMealType,
        timePoint: editTimePoint,
        exercise: formattedExercise,
      } as Partial<BloodSugarEntry>);
      setEditingId(null);
      setEditData({});
      setEditMealType('breakfast');
      setEditTimePoint(null);
      setEditExercise('');
      setEditExerciseDuration('');
      setEditExerciseDistance('');
      setEditExerciseType('time');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(id);
    }
  };

  const handleFoodAdd = (foodItem: string) => {
    const currentFood = (editData.food || '') as string;
    if (currentFood) {
      setEditData({ ...editData, food: currentFood + '、' + foodItem });
    } else {
      setEditData({ ...editData, food: foodItem });
    }
  };

  const editingRecord = records.find(r => r.id === editingId);

  return (
    <div className="min-h-screen bg-primary-light pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center">血糖记录</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="flex bg-white rounded-2xl shadow-sm p-1 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <List className="w-4 h-4" />
            列表视图
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              viewMode === 'table' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Table2 className="w-4 h-4" />
            表格视图
          </button>
        </div>

        {viewMode === 'list' ? (
          <div className="space-y-4">
            {sortedDates.map((date) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-primary-light border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">{date}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupedRecords[date].map((record) => (
                    <div key={record.id} className="px-4 py-3">
                      {editingId === record.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">测量时间</span>
                            <input
                              type="time"
                              value={editData.time as string || record.time}
                              onChange={(e) => handleEditTimeChange(e.target.value)}
                              className="text-sm px-2 py-1 bg-gray-50 rounded border border-gray-200"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {mealOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => setEditMealType(option.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  editMealType === option.value
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          {editMealType !== 'emptyStomach' && editMealType !== 'bedtime' && (
                            <div className="flex flex-wrap gap-2">
                              {timePointOptions.map((option) => (
                                <button
                                  key={option.value?.toString() || 'null'}
                                  onClick={() => setEditTimePoint(option.value)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    editTimePoint === option.value
                                      ? 'bg-primary text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                          <input
                            type="number"
                            value={(editData.value as number || record.value).toFixed(2)}
                            onChange={(e) => setEditData({ ...editData, value: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-lg font-bold"
                          />
                          <div className="flex items-center gap-2 mb-2">
                            <Utensils className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">餐食内容</span>
                          </div>
                          {defaultFoodOptions[editMealType].length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {defaultFoodOptions[editMealType].map((item) => (
                                <button
                                  key={item}
                                  onClick={() => handleFoodAdd(item)}
                                  className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                          <textarea
                            value={editData.food as string || record.food}
                            onChange={(e) => setEditData({ ...editData, food: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                            rows={2}
                            placeholder="记录餐食内容..."
                          />
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">运动情况</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {exerciseOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  if (option.value === '其他') {
                                    setEditExercise('');
                                    setEditExerciseDuration('');
                                    setEditExerciseDistance('');
                                    setEditExerciseType('time');
                                  } else {
                                    setEditExercise(option.value);
                                  }
                                }}
                                className={`px-2 py-1 rounded-full text-xs transition-all ${
                                  editExercise === option.value && option.value !== '其他'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          {(editExercise === '' || !exerciseOptions.find(o => o.value === editExercise)) && (
                            <input
                              type="text"
                              value={editExercise}
                              onChange={(e) => setEditExercise(e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm mb-2"
                              placeholder="输入运动内容..."
                            />
                          )}
                          {editExercise && (
                            <div className="space-y-2">
                              <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                  onClick={() => {
                                    setEditExerciseType('time');
                                    setEditExerciseDistance('');
                                  }}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    editExerciseType === 'time'
                                      ? 'bg-white text-primary shadow-sm'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  ⏱️ 时间(分钟)
                                </button>
                                <button
                                  onClick={() => {
                                    setEditExerciseType('distance');
                                    setEditExerciseDuration('');
                                  }}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    editExerciseType === 'distance'
                                      ? 'bg-white text-primary shadow-sm'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  📏 距离(km)
                                </button>
                              </div>
                              {editExerciseType === 'time' ? (
                                <input
                                  type="number"
                                  value={editExerciseDuration}
                                  onChange={(e) => setEditExerciseDuration(e.target.value)}
                                  placeholder="输入时长（分钟）"
                                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                />
                              ) : (
                                <input
                                  type="number"
                                  value={editExerciseDistance}
                                  onChange={(e) => setEditExerciseDistance(e.target.value)}
                                  placeholder="输入距离（公里）"
                                  step="0.1"
                                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                />
                              )}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              保存
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditMealType('breakfast');
                                setEditTimePoint(null);
                                setEditExercise('');
                                setEditExerciseDuration('');
                                setEditExerciseDistance('');
                                setEditExerciseType('time');
                              }}
                              className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-medium text-gray-800">
                                {getMealAndTimePointLabel(record.mealType, record.timePoint)}
                              </span>
                              <span className="text-sm text-gray-400">{record.time}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span
                                className="text-2xl font-bold"
                                style={{ color: getStatusColor(record.status) }}
                              >
                                {formatBloodSugar(record.value)}
                              </span>
                              <span className="text-xs text-gray-400">mmol/L</span>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ backgroundColor: getStatusColor(record.status), color: 'white' }}
                              >
                                {getStatusText(record.status)}
                              </span>
                            </div>
                            {record.food && (
                              <p className="text-sm text-gray-600 mt-1">🍽️ {record.food}</p>
                            )}
                            {record.exercise && (
                              <p className="text-sm text-gray-500 mt-0.5">🏃 {record.exercise}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(record)}
                              className="p-2 text-gray-400 hover:text-primary transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {records.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-400">暂无记录</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 sticky left-0 bg-gray-50">日期</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 min-w-[60px]">体重(kg)</th>
                    {mealTimePoints.map((mt) => (
                      <th key={mt.key} className="px-2 py-2 text-xs font-medium text-gray-500 min-w-[70px]">
                        {mt.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDates.map((date) => {
                    const dateRecords = groupedRecords[date];
                    const dateWeight = weightRecords.find(w => w.date === date);
                    return (
                      <tr key={date} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-sm font-medium text-gray-800 sticky left-0 bg-white">
                          {date.slice(5)}
                        </td>
                        <td className="px-2 py-2">
                          {dateWeight ? (
                            <span className="text-sm font-medium text-gray-700">{formatBloodSugar(dateWeight.weight)}</span>
                          ) : (
                            <span className="text-xs text-gray-200">-</span>
                          )}
                        </td>
                        {mealTimePoints.map((mt) => {
                          const record = dateRecords.find((r) => getCellKey(r) === mt.key);
                          return (
                            <td key={mt.key} className="px-2 py-2">
                              {record ? (
                                <div className="flex flex-col items-center">
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: getStatusColor(record.status) }}
                                  >
                                    {formatBloodSugar(record.value)}
                                  </span>
                                  <span className="text-xs text-gray-400">{record.time}</span>
                                  {record.food && (
                                    <span className="text-xs text-gray-600 truncate w-full text-center">🍽️{record.food}</span>
                                  )}
                                  {record.exercise && (
                                    <span className="text-xs text-gray-500 truncate w-full text-center">🏃{record.exercise}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-200">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {records.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-400">暂无记录</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
