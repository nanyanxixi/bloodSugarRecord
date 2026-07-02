import { useState } from 'react';
import { useBloodSugarStore } from '@/hooks/useBloodSugarStore';
import { parseExcelFile } from '@/utils/excelUtils';
import { Upload, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const importRecords = useBloodSugarStore((state) => state.importRecords);
  const clearRecords = useBloodSugarStore((state) => state.clearRecords);
  const records = useBloodSugarStore((state) => state.records);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const entries = await parseExcelFile(file);
      importRecords(entries);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      alert('导入失败，请确保文件格式正确');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleClearData = () => {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    clearRecords();
    alert('数据已清空');
  };

  return (
    <div className="min-h-screen bg-primary-light pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/download')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">数据设置</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">导入数据</span>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary-light transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
            <Upload className={`w-10 h-10 ${loading ? 'text-gray-300' : 'text-gray-400'}`} />
            <p className={`mt-2 ${loading ? 'text-gray-300' : 'text-sm text-gray-500'}`}>
              {loading ? '正在导入...' : '点击上传Excel文件'}
            </p>
            <p className="text-xs text-gray-400 mt-1">支持 .xlsx 和 .xls 格式</p>
          </label>
          {importSuccess && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600">数据导入成功！</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">清空数据</span>
          </div>
          <button
            onClick={handleClearData}
            disabled={records.length === 0}
            className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              records.length > 0
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            清空所有记录
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">此操作不可恢复，请谨慎操作</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">数据说明</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>数据存储在浏览器本地（LocalStorage）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>清除浏览器数据会导致记录丢失</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>建议定期导出Excel或JSON进行备份</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>导入的数据会追加到现有数据中</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">血糖标准（妊娠期）</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-gray-500">时段</th>
                  <th className="px-3 py-2 text-center text-gray-500">正常范围</th>
                  <th className="px-3 py-2 text-center text-gray-500">超标</th>
                  <th className="px-3 py-2 text-center text-gray-500">低血糖</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">空腹</td>
                  <td className="px-3 py-2 text-center text-green-600">≤5.1</td>
                  <td className="px-3 py-2 text-center text-red-500">&gt;5.1</td>
                  <td className="px-3 py-2 text-center text-yellow-600">&lt;3.9</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">餐后1小时</td>
                  <td className="px-3 py-2 text-center text-green-600">≤10.0</td>
                  <td className="px-3 py-2 text-center text-red-500">&gt;10.0</td>
                  <td className="px-3 py-2 text-center text-yellow-600">&lt;3.9</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">餐后2小时</td>
                  <td className="px-3 py-2 text-center text-green-600">≤8.5</td>
                  <td className="px-3 py-2 text-center text-red-500">&gt;8.5</td>
                  <td className="px-3 py-2 text-center text-yellow-600">&lt;3.9</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">睡前</td>
                  <td className="px-3 py-2 text-center text-green-600">≤6.7</td>
                  <td className="px-3 py-2 text-center text-red-500">&gt;6.7</td>
                  <td className="px-3 py-2 text-center text-yellow-600">&lt;3.9</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
