
import React from 'react';
import { Calendar, ChevronLeft, Mail, PlusSquare, CheckSquare } from 'lucide-react';

const Leave: React.FC = () => {
  const actions = [
    { title: 'تقديم طلب إجازة', icon: <Mail className="text-orange-400" size={18} /> },
    { title: 'طلب تعويض', icon: <PlusSquare className="text-blue-500" size={18} /> },
    { title: 'موافقة على الإجازات', icon: <CheckSquare className="text-emerald-500" size={18} /> },
  ];

  return (
    <div className="p-4 space-y-6 text-right">
      <div className="bg-white rounded-xl shadow-sm border p-8 flex flex-col items-center">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center relative">
           <Calendar size={64} className="text-indigo-800" />
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            className="w-full flex flex-row-reverse items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-row-reverse items-center gap-4">
               <div className="bg-gray-50 p-2 rounded-lg">{action.icon}</div>
               <span className="text-sm font-semibold text-gray-700">{action.title}</span>
            </div>
            <ChevronLeft size={16} className="text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Leave;
