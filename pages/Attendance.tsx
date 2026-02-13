
import React from 'react';
import { Calendar, ChevronLeft, Clock, ShieldCheck, Map, UserCheck } from 'lucide-react';

const Attendance: React.FC = () => {
  const actions = [
    { title: 'طلب حضور وانصراف', icon: <Clock className="text-orange-500" size={18} /> },
    { title: 'طلب إعفاء', icon: <ShieldCheck className="text-emerald-500" size={18} /> },
    { title: 'طلب وردية عمل', icon: <Clock className="text-indigo-500" size={18} /> },
    { title: 'طلب عمل عن بعد', icon: <Map className="text-blue-600" size={18} /> },
    { title: 'موافقة على الحضور', icon: <UserCheck className="text-purple-500" size={18} /> },
  ];

  return (
    <div className="p-4 space-y-6 text-right">
      <div className="bg-white rounded-xl shadow-sm border p-8 flex flex-col items-center">
        <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center relative mb-4">
           <Calendar size={64} className="text-yellow-500" />
           <div className="absolute bottom-0 left-0 bg-white p-2 rounded-full shadow-sm">
              <Clock size={24} className="text-yellow-600" />
           </div>
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

export default Attendance;
