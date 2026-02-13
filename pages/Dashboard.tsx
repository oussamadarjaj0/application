
import React, { useState, useEffect } from 'react';
import { getStats, db } from '../constants';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  History, 
  User, 
  PieChart,
  ChevronDown,
  Palmtree,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  selectedYear: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, selectedYear }) => {
  const [stats, setStats] = useState(getStats(selectedYear));
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [empBalance, setEmpBalance] = useState<{
    annual: { total: number, used: number },
    exceptional: { total: number, used: number }
  } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getStats(selectedYear));
      setEmployees(db.getEmployees());
    };
    handleUpdate();
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [selectedYear]);

  const handleSync = async () => {
    setIsSyncing(true);
    await db.syncData();
    setTimeout(() => {
      setIsSyncing(false);
      setStats(getStats(selectedYear));
    }, 1500);
  };

  useEffect(() => {
    if (selectedEmpId) {
      const emp = employees.find(e => String(e.id) === selectedEmpId);
      // فلترة الإجازات للسنة المختارة فقط
      const leaves = db.getLeaves().filter((l: any) => 
        String(l.empId) === selectedEmpId && 
        new Date(l.startDate).getFullYear().toString() === selectedYear
      );
      const holidays = db.getHolidays().filter((h: any) => 
        new Date(h.startDate).getFullYear().toString() === selectedYear
      );
      
      let annualUsed = 0;
      let exceptionalUsed = 0;

      const holidayDates = holidays.flatMap((h: any) => {
        const dates = [];
        let curr = new Date(h.startDate);
        const stop = new Date(h.endDate);
        while (curr <= stop) {
          dates.push(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
        }
        return dates;
      });

      leaves.forEach((l: any) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        
        let current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          const dayOfWeek = current.getDay();
          const isPublicHoliday = holidayDates.includes(dateStr);
          
          if (l.type === 'سنوية') {
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isPublicHoliday) {
              annualUsed++;
            }
          } else if (l.type === 'استثنائية') {
            if (!isPublicHoliday) {
              exceptionalUsed++;
            }
          }
          current.setDate(current.getDate() + 1);
        }
      });

      setEmpBalance({ 
        annual: { 
          total: emp?.annualBalance ?? 30, 
          used: annualUsed 
        },
        exceptional: { 
          total: emp?.exceptionalBalance ?? 10, 
          used: exceptionalUsed 
        }
      });
    } else {
      setEmpBalance(null);
    }
  }, [selectedEmpId, employees, selectedYear]);

  const getTargetTab = (id: string) => {
    switch (id) {
      case 'total_emp': return 'employees';
      case 'on_leave': return 'current_leaves';
      case 'holidays': return 'holidays';
      case 'leave_report': return 'leave_report';
      default: return 'dashboard';
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Welcome Header */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-7 text-black shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-indigo-600">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">إحصائيات سنة {selectedYear}</span>
            </div>
            <button 
              onClick={handleSync}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black transition-all ${isSyncing ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'جاري التحديث...' : 'تحديث البيانات'}
            </button>
          </div>
          <h2 className="text-2xl font-black mb-1 text-slate-900">نظرة عامة 📊</h2>
          <p className="text-slate-500 text-xs font-bold italic">أنت تستعرض بيانات عام {selectedYear}</p>
        </div>
      </div>

      {/* Balance Checker Tool */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <PieChart size={18} className="text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900">رصيد الموظف لعام {selectedYear}</h3>
        </div>
        
        <div className="relative">
          <select 
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pr-11 pl-4 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 appearance-none transition-all"
          >
            <option value="">اختر موظفاً للمعاينة...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <User className="absolute right-4 top-3.5 text-slate-400" size={16} />
          <ChevronDown className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={14} />
        </div>

        {empBalance && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100/30">
              <div className="flex items-center gap-2 mb-3">
                <Palmtree size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black text-indigo-700">الرصيد السنوي ({selectedYear})</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                  <p className="text-[7px] font-black text-slate-400 mb-0.5 uppercase">الإجمالي</p>
                  <p className="text-xs font-black text-indigo-600">{empBalance.annual.total}</p>
                </div>
                <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                  <p className="text-[7px] font-black text-slate-400 mb-0.5 uppercase">المستهلك</p>
                  <p className="text-xs font-black text-amber-600">{empBalance.annual.used}</p>
                </div>
                <div className="bg-indigo-600 p-2 rounded-xl text-center shadow-lg shadow-indigo-100">
                  <p className="text-[7px] font-black text-indigo-100 mb-0.5 uppercase">المتبقي</p>
                  <p className="text-xs font-black text-white">{empBalance.annual.total - empBalance.annual.used}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-700">الرصيد الاستثنائي ({selectedYear})</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                  <p className="text-[7px] font-black text-slate-400 mb-0.5 uppercase">الإجمالي</p>
                  <p className="text-xs font-black text-amber-600">{empBalance.exceptional.total}</p>
                </div>
                <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                  <p className="text-[7px] font-black text-slate-400 mb-0.5 uppercase">المستهلك</p>
                  <p className="text-xs font-black text-rose-600">{empBalance.exceptional.used}</p>
                </div>
                <div className="bg-amber-600 p-2 rounded-xl text-center shadow-lg shadow-amber-100">
                  <p className="text-[7px] font-black text-amber-100 mb-0.5 uppercase">المتبقي</p>
                  <p className="text-xs font-black text-white">{empBalance.exceptional.total - empBalance.exceptional.used}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <button 
            key={stat.id} 
            onClick={() => onNavigate(getTargetTab(stat.id))}
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-right active:scale-95 transition-all hover:border-indigo-400 group"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-slate-500 font-black uppercase">{stat.label}</p>
              <ChevronLeft size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
            <p className={`text-3xl font-black text-slate-900`}>{stat.value}</p>
            <p className="text-[9px] text-indigo-500 mt-2 font-black">{stat.trend}</p>
          </button>
        ))}
      </section>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        <button 
          onClick={() => onNavigate('add_leave')} 
          className="bg-slate-900 text-white p-6 rounded-[2.2rem] font-black text-xs flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <div className="bg-white/10 p-3 rounded-2xl">
            <CalendarIcon size={24} className="text-indigo-400" />
          </div>
          إجازة جديدة ({selectedYear})
        </button>
        <button 
          onClick={() => onNavigate('leave_report')} 
          className="bg-white text-slate-900 border-2 border-slate-100 p-6 rounded-[2.2rem] font-black text-xs flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all hover:border-indigo-200"
        >
          <div className="bg-indigo-50 p-3 rounded-2xl">
            <History size={24} className="text-indigo-600" />
          </div>
          سجلات {selectedYear}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
