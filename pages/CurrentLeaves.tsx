
import React, { useState, useEffect } from 'react';
import { db } from '../constants';
import { Calendar, ChevronRight, User, Clock, Info } from 'lucide-react';

const CurrentLeaves: React.FC = () => {
  const [activeLeaves, setActiveLeaves] = useState<any[]>([]);

  useEffect(() => {
    // Fix: db.getLeaves returns a Promise
    const fetchActiveLeaves = async () => {
      const leaves = await db.getLeaves();
      const today = new Date().toISOString().split('T')[0];
      
      // فلترة الإجازات النشطة اليوم
      const current = leaves.filter((l: any) => {
        return today >= l.startDate && today <= l.endDate;
      });
      
      setActiveLeaves(current);
    };
    fetchActiveLeaves();
  }, []);

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[2rem] flex items-center justify-between">
        <div>
          <h3 className="text-indigo-900 font-black text-sm mb-1">الموظفون خارج المكتب حالياً</h3>
          <p className="text-indigo-600 text-[10px] font-bold">يوجد {activeLeaves.length} موظفين في إجازة نشطة اليوم.</p>
        </div>
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
          <Clock size={20} />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">الموظف</th>
                <th className="px-5 py-4">النوع</th>
                <th className="px-5 py-4">تاريخ العودة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeLeaves.map((leaf) => {
                // حساب تاريخ العودة (اليوم التالي لتاريخ الانتهاء)
                const endDate = new Date(leaf.endDate);
                endDate.setDate(endDate.getDate() + 1);
                const returnDateStr = endDate.toISOString().split('T')[0];

                return (
                  <tr key={leaf.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <img src={leaf.avatar} className="w-9 h-9 rounded-xl border border-white shadow-sm object-cover" alt="" />
                        <div>
                          <p className="font-black text-slate-800">{leaf.empName}</p>
                          <p className="text-[9px] text-slate-400 font-bold">ID: {leaf.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${
                        leaf.type === 'مرضية' ? 'bg-rose-50 text-rose-600' : 
                        leaf.type === 'سنوية' ? 'bg-indigo-50 text-indigo-600' :
                        leaf.type === 'أمومة' ? 'bg-rose-50 text-rose-600' :
                        leaf.type === 'أبوة' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {leaf.type}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-slate-600 font-black">
                      <div className="flex flex-col">
                        <span>{returnDateStr}</span>
                        <span className="text-[8px] text-emerald-500">مباشرة العمل</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {activeLeaves.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
            <div className="bg-slate-100 p-6 rounded-full mb-3">
               <Info size={40} className="text-slate-400" />
            </div>
            <p className="text-sm font-black">لا يوجد موظفون في إجازة اليوم</p>
            <p className="text-[10px] font-bold">جميع الموظفين على رأس العمل</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentLeaves;
