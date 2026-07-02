import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, List, BarChart3, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/', icon: PlusCircle, label: '记录' },
  { path: '/records', icon: List, label: '查看' },
  { path: '/statistics', icon: BarChart3, label: '统计' },
  { path: '/download', icon: MoreHorizontal, label: '更多' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
