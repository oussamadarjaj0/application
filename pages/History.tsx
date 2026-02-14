
import React, { useState, useEffect } from 'react';
import { db } from '../constants';
import { Calendar, User, Search, FileText, Hash } from 'lucide-react';

interface HistoryProps {
  selectedYear: string;
}

const History: React.FC<HistoryProps> = ({ selectedYear }) => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fix: db.getLeaves returns a Promise
    const fetchLeaves = async () => {
      const allLeaves = await db.getLeaves();
      const filteredByYear = allLeaves.filter((l: any) => 
        new Date(l.startDate).getFullYear().toString() === selectedYear
      );
      setLeaves(filteredByYear);
    };
    fetchLeaves();
  }, [selectedYear]);

  // Fixed sorting logic to handle string IDs (using Number conversion) for numeric-based IDs like timestamps
  const filteredLeaves = leaves.filter(l => 
    l.empName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.type.includes(searchTerm)
  ).sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <div className="space-y-6 pb-28 text-right" dir="rtl">
      {/* Search Bar */}
      <div className="bg-white p-2 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-center transition-all focus-within:border-indigo-100">
        <div className="p-3 bg-slate-900 rounded-2xl text-white ml-2">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder={`بحث في سجلات عام ${selectedYear}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent py-3 px-2 text-xs font-black text-slate-900 outline-none"
        />
      </div>

      {/* History Feed */}
      <div className="space-y-4">
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((leaf) => (
            <div key={leaf.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-100 animate-in slide-in-from-bottom-2">
              <div className="shrink-0 relative">
                <img src={leaf.avatar} className="w-14 h-14 rounded-[1.5rem] object-cover ring-4 ring-slate-50" alt="" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-0.5">{leaf.empName}</h4>
                    <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                      <Hash size={10} />
                      {leaf.id}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${
                    leaf.type === 'مرضية' ? 'bg-rose-50 text-rose-600' : 
                    leaf.type === 'سنوية' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {leaf.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={12} className="text-slate-300" />
                    <span className="text-[10px] font-bold">من: {leaf.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={12} className="text-slate-300" />
                    <span className="text-[10px] font-bold">إلى: {leaf.endDate}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-2xl border-r-4 border-slate-200 group-hover:bg-indigo-50/30 group-hover:border-indigo-300 transition-all">
                  <p className="text-[10px] text-slate-600 font-bold leading-relaxed line-clamp-2 italic pr-2">
                    "{leaf.reason}"
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
            <div className="bg-slate-100 p-8 rounded-full">
              <FileText size={48} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">سنة {selectedYear} فارغة</p>
              <p className="text-[10px] font-bold mt-1">لا توجد سجلات محفوظة لهذه السنة حتى الآن.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
