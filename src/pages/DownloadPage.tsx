import { useBloodSugarStore } from '@/hooks/useBloodSugarStore';
import { exportToExcel, exportToJSON } from '@/utils/excelUtils';
import { Download, FileText, FileJson, Settings, Database, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DownloadPage() {
  const records = useBloodSugarStore((state) => state.records);
  const weightRecords = useBloodSugarStore((state) => state.weightRecords);
  const navigate = useNavigate();

  const handleExportExcel = () => {
    if (records.length === 0) {
      alert('暂无数据可导出');
      return;
    }
    exportToExcel(records);
  };

  const handleExportJSON = () => {
    if (records.length === 0) {
      alert('暂无数据可导出');
      return;
    }
    exportToJSON(records);
  };

  return (
    <div className="min-h-screen bg-primary-light pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center">更多功能</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">数据导出</span>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">导出Excel</p>
                <p className="text-sm text-gray-400">按照原表格格式导出</p>
              </div>
              <Download className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileJson className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">导出JSON</p>
                <p className="text-sm text-gray-400">备份数据为JSON格式</p>
              </div>
              <Download className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">数据管理</span>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/weight')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">体重记录</p>
                <p className="text-sm text-gray-400">记录和统计体重变化</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">数据设置</p>
                <p className="text-sm text-gray-400">导入数据、清空数据等</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">当前数据统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-light rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{records.length}</p>
              <p className="text-xs text-gray-400">记录总数</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {records.length > 0 ? new Date(records[0].date).toLocaleDateString() : '-'}
              </p>
              <p className="text-xs text-gray-400">最新记录</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>导出的Excel文件与原表格格式一致，便于继续使用Excel查看</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>JSON文件可用于数据备份和迁移</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>数据存储在本地浏览器，清除浏览器数据会导致记录丢失，请定期备份</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
