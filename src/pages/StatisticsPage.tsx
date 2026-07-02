import { useMemo } from 'react';
import { useBloodSugarStore } from '@/hooks/useBloodSugarStore';
import { Statistics } from '@/types';
import { BarChart3, TrendingUp, CheckCircle, AlertCircle, AlertTriangle, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Brush, Label, LabelList } from 'recharts';
import { formatBloodSugar } from '@/utils/bloodSugarUtils';

export function StatisticsPage() {
  const records = useBloodSugarStore((state) => state.records);
  const weightRecords = useBloodSugarStore((state) => state.weightRecords);

  const calculateStatistics = useMemo(() => (days: number): Statistics => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filtered = records.filter(r => new Date(r.date) >= cutoffDate);
    
    const counts = filtered.reduce((acc, r) => {
      acc.total++;
      if (r.status === 'normal') acc.normal++;
      else if (r.status === 'high') acc.high++;
      else acc.low++;
      return acc;
    }, { total: 0, normal: 0, high: 0, low: 0 });
    
    return {
      ...counts,
      normalRate: counts.total > 0 ? (counts.normal / counts.total) * 100 : 0,
      abnormalRate: counts.total > 0 ? ((counts.high + counts.low) / counts.total) * 100 : 0,
    };
  }, [records]);

  const todayStats = calculateStatistics(1);
  const halfMonthStats = calculateStatistics(15);
  const oneMonthStats = calculateStatistics(30);
  const twoMonthStats = calculateStatistics(60);

  const chartData = [
    { name: '今日', ...todayStats },
    { name: '近15天', ...halfMonthStats },
    { name: '近1个月', ...oneMonthStats },
    { name: '近2个月', ...twoMonthStats },
  ];

  const COLORS = {
    normal: '#22C55E',
    high: '#EF4444',
    low: '#EAB308',
  };

  return (
    <div className="min-h-screen bg-primary-light pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center">统计分析</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">今日统计</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{todayStats.total}</p>
              <p className="text-xs text-gray-400">测量次数</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blood-normal">{todayStats.normal}</p>
              <p className="text-xs text-gray-400">正常</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blood-high">{todayStats.high}</p>
              <p className="text-xs text-gray-400">偏高</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blood-low">{todayStats.low}</p>
              <p className="text-xs text-gray-400">偏低</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">正常率</span>
                <span className="font-medium text-blood-normal">{todayStats.normalRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blood-normal rounded-full transition-all duration-500"
                  style={{ width: `${todayStats.normalRate}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">异常率</span>
                <span className="font-medium text-blood-high">{todayStats.abnormalRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blood-high rounded-full transition-all duration-500"
                  style={{ width: `${todayStats.abnormalRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">趋势统计</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">近15天</p>
                  <p className="text-xs text-gray-400">异常率</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: halfMonthStats.abnormalRate > 30 ? '#EF4444' : '#22C55E' }}>
                  {halfMonthStats.abnormalRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">{halfMonthStats.total}次测量</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">近1个月</p>
                  <p className="text-xs text-gray-400">异常率</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: oneMonthStats.abnormalRate > 30 ? '#EF4444' : '#22C55E' }}>
                  {oneMonthStats.abnormalRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">{oneMonthStats.total}次测量</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">近2个月</p>
                  <p className="text-xs text-gray-400">异常率</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: twoMonthStats.abnormalRate > 30 ? '#EF4444' : '#22C55E' }}>
                  {twoMonthStats.abnormalRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">{twoMonthStats.total}次测量</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">对比图表</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="normalRate" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`normal-${index}`} fill="#22C55E" />
                  ))}
                  <LabelList dataKey="normalRate" position="right" formatter={(value: number) => `${value.toFixed(0)}%`} style={{ fill: '#22C55E', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="abnormalRate" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`abnormal-${index}`} fill="#EF4444" />
                  ))}
                  <LabelList dataKey="abnormalRate" position="right" formatter={(value: number) => `${value.toFixed(0)}%`} style={{ fill: '#EF4444', fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">正常率</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">异常率</span>
            </div>
          </div>
        </div>

        {weightRecords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">体重统计</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{formatBloodSugar(weightRecords[0].weight)}</p>
                <p className="text-xs text-gray-400">当前</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{formatBloodSugar(weightRecords[weightRecords.length - 1].weight)}</p>
                <p className="text-xs text-gray-400">初始</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color: (weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight) >= 0 ? '#EF4444' : '#22C55E' }}>
                  {(weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight) >= 0 ? '+' : ''}{formatBloodSugar(weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight)}
                </p>
                <p className="text-xs text-gray-400">变化</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color: ((weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight) / weightRecords[weightRecords.length - 1].weight * 100) >= 0 ? '#EF4444' : '#22C55E' }}>
                  {((weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight) / weightRecords[weightRecords.length - 1].weight * 100) >= 0 ? '+' : ''}{(((weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight) / weightRecords[weightRecords.length - 1].weight) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">变化率</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">记录次数</span>
                <span className="font-medium text-gray-800">{weightRecords.length}次</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">记录周期</span>
                <span className="font-medium text-gray-800">{weightRecords[weightRecords.length - 1].date} ~ {weightRecords[0].date}</span>
              </div>
            </div>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...weightRecords].reverse().map(r => ({
                  date: r.date.slice(5),
                  weight: r.weight,
                  fullDate: r.date,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10 }} hide />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value.toFixed(1)}kg`,
                      props.payload?.fullDate || '',
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                    label={{ 
                      position: 'top', 
                      formatter: (value: number) => value.toFixed(1),
                      style: { fill: '#3B82F6', fontSize: 10, fontWeight: 'bold' }
                    }}
                  />
                  <Brush dataKey="date" height={20} stroke="#9CA3AF" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {records.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-400">暂无记录</p>
          </div>
        )}
      </main>
    </div>
  );
}
