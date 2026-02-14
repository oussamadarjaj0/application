
import React, { useState, useEffect } from 'react';
import { db, MOCK_USER } from '../constants';
import { 
  ShieldCheck, 
  RefreshCw, 
  Loader2,
  Users,
  CalendarDays,
  History,
  TrendingUp,
  User,
  ArrowUpRight,
  Plane
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  selectedYear: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, selectedYear }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeavesCount, setActiveLeavesCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const [emps, lvs, hols] = await Promise.all([
      db.getEmployees(),
      db.getLeaves(),
      db.getHolidays()
    ]);
    setEmployees(emps);
    setLeaves(lvs);
    setHolidays(hols);

    const today = new Date().toISOString().split('T')[0];
    const current = lvs.filter((l: any) => today >= l.startDate && today <= l.endDate);
    setActiveLeavesCount(current.length);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
        </div>
      </div>
      <p className="text-sm font-black text-slate-400">جاري تحميل البيانات الذكية...</p>
    </div>
  );

  const stats = [
    { id: 'total_emp', label: 'الموظفين', value: employees.length, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600', target: 'employees' },
    { id: 'active_leaves', label: 'في إجازة الآن', value: activeLeavesCount, icon: <Plane size={20} />, color: 'bg-orange-50 text-orange-600', target: 'current_leaves' },
    { id: 'holidays', label: 'عطلات رسمية', value: holidays.length, icon: <CalendarDays size={20} />, color: 'bg-purple-50 text-purple-600', target: 'holidays' },
    { id: 'history', label: 'سجلات الإجازات', value: leaves.length, icon: <History size={20} />, color: 'bg-emerald-50 text-emerald-600', target: 'leave_report' },
  ];

  return (
    <div className="space-y-6 text-right animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               <ShieldCheck size={14} className="text-indigo-200" />
               <span className="text-[10px] font-black uppercase tracking-widest">{MOCK_USER.name}</span>
            </div>
            <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-full transition-all active:rotate-180 duration-500">
              <RefreshCw size={16} />
            </button>
          </div>
          <h2 className="text-2xl font-black mb-1">مرحباً بك 👋</h2>
          <p className="text-xs text-indigo-100/70 font-bold">لديك {activeLeavesCount} موظفين خارج المكتب اليوم.</p>
          
          <button 
            onClick={() => onNavigate('add_leave')}
            className="mt-6 bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl shadow-indigo-950/20 active:scale-95 transition-all"
          >
            تسجيل إجازة جديدة
            <ArrowUpRight size={14} />
          </button>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <button 
            key={stat.id} 
            onClick={() => onNavigate(stat.target)}
            className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-slate-100 text-right active:scale-95 hover:shadow-md transition-all flex flex-col gap-3 group"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black mb-0.5 uppercase">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Action / Recent Updates */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">النشاط الأخير</h3>
          </div>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">تحديث حي</span>
        </div>
        
        {leaves.length > 0 ? (
          <div className="space-y-3">
            {leaves.slice(-2).reverse().map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                <img src={l.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-800">{l.empName}</p>
                  <p className="text-[9px] text-slate-400 font-bold">بدأ إجازة {l.type}</p>
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-black text-indigo-600">{l.startDate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-[10px] font-black text-slate-400 italic">لا توجد عمليات مسجلة حالياً</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
