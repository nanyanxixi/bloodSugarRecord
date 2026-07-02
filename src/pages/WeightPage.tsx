import { useState } from 'react';
import { useBloodSugarStore } from '@/hooks/useBloodSugarStore';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { formatBloodSugar } from '@/utils/bloodSugarUtils';
import { WeightEntry } from '@/types';
import { Scale, Trash2, Edit3, X, Check, Plus } from 'lucide-react';

export function WeightPage() {
  const weightRecords = useBloodSugarStore((state) => state.weightRecords);
  const addWeightRecord = useBloodSugarStore((state) => state.addWeightRecord);
  const updateWeightRecord = useBloodSugarStore((state) => state.updateWeightRecord);
  const deleteWeightRecord = useBloodSugarStore((state) => state.deleteWeightRecord);

  const now = new Date();
  const [date, setDate] = useState(formatDate(now));
  const [time, setTime] = useState(formatTime(now));
  const [weight, setWeight] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WeightEntry>>({});

  const handleSave = () => {
    if (!weight) {
      alert('请输入体重');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 300) {
      alert('请输入有效的体重值');
      return;
    }

    addWeightRecord({
      date,
      time,
      weight: parseFloat(weightValue.toFixed(2)),
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setWeight('');
    }, 2000);
  };

  const handleStartEdit = (record: WeightEntry) => {
    setEditingId(record.id);
    setEditData({ ...record });
  };

  const handleSaveEdit = () => {
    if (editingId && editData.weight !== undefined) {
      updateWeightRecord(editingId, editData as Partial<WeightEntry>);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteWeightRecord(id);
    }
  };

  const latestWeight = weightRecords.length > 0 ? weightRecords[0].weight : 0;
  const firstWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : 0;
  const weightChange = weightRecords.length > 1 ? latestWeight - firstWeight : 0;
  const weightChangePercent = weightRecords.length > 1 ? ((weightChange / firstWeight) * 100) : 0;

  const sortedDates = [...new Set(weightRecords.map(r => r.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="min-h-screen bg-primary-light pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center">体重记录</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{formatBloodSugar(latestWeight)}</p>
              <p className="text-xs text-gray-400">当前体重</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: weightChange >= 0 ? '#EF4444' : '#22C55E' }}>
                {weightChange >= 0 ? '+' : ''}{formatBloodSugar(weightChange)}
              </p>
              <p className="text-xs text-gray-400">体重变化</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: weightChangePercent >= 0 ? '#EF4444' : '#22C55E' }}>
                {weightChangePercent >= 0 ? '+' : ''}{weightChangePercent.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">变化率</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">记录体重</span>
          </div>
          <div className="flex gap-4 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium"
            />
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="输入体重 (kg)"
            step="0.1"
            className="w-full px-6 py-6 text-4xl font-bold text-center bg-gray-50 rounded-2xl border-2 border-gray-200 text-gray-800"
          />
          <button
            onClick={handleSave}
            disabled={!weight || parseFloat(weight) <= 0 || parseFloat(weight) > 300}
            className={`w-full mt-4 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              weight && parseFloat(weight) > 0 && parseFloat(weight) <= 300
                ? 'bg-primary hover:opacity-90 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            保存记录
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-primary-light border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">历史记录</span>
          </div>
          <div className="divide-y divide-gray-100">
            {sortedDates.map((date) => {
              const dayRecords = weightRecords.filter(r => r.date === date);
              return dayRecords.map((record) => (
                <div key={record.id} className="px-4 py-3">
                  {editingId === record.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{date}</span>
                        <input
                          type="time"
                          value={editData.time as string || record.time}
                          onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                          className="text-sm px-2 py-1 bg-gray-50 rounded border border-gray-200"
                        />
                      </div>
                      <input
                        type="number"
                        value={(editData.weight as number || record.weight).toFixed(2)}
                        onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) || 0 })}
                        step="0.01"
                        className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-lg font-bold"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-medium text-gray-800">{date}</span>
                          <span className="text-sm text-gray-400">{record.time}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-800">
                            {formatBloodSugar(record.weight)}
                          </span>
                          <span className="text-xs text-gray-400">kg</span>
                        </div>
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
              ));
            })}
          </div>
          {weightRecords.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400">暂无记录</p>
            </div>
          )}
        </div>

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
