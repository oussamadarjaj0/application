
import React from 'react';
import { ALL_PENDING_REQUESTS } from '../constants';
import { Check, X, Calendar, User } from 'lucide-react';

const Approvals: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-4">
        <p className="text-xs text-amber-800 font-medium">
          ملاحظة: الموافقة على طلبات الإجازة السنوية الطويلة (أكثر من 7 أيام) تتطلب مراجعة رصيد الموظف المتبقي.
        </p>
      </div>

      <div className="space-y-4">
        {ALL_PENDING_REQUESTS.map((req) => (
          <div key={req.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <img src={req.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt={req.empName} />
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{req.empName}</h3>
                <p className="text-xs text-slate-400">قسم تكنولوجيا المعلومات</p>
              </div>
              <div className="bg-indigo-50 px-3 py-1 rounded-full">
                <span className="text-[10px] font-bold text-indigo-600">إجازة {req.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase">تاريخ البدء</span>
                  <span className="text-[11px] font-bold text-slate-700">{req.startDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-r border-slate-50 pr-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase">المدة</span>
                  <span className="text-[11px] font-bold text-slate-700">{req.days} أيام عمل</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                <Check size={16} />
                موافقة
              </button>
              <button className="flex-1 bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                <X size={16} />
                رفض
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Approvals;
