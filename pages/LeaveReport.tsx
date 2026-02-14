
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Edit3, 
  FileText, 
  X, 
  Trash2,
  Info,
  Download,
  FileSpreadsheet,
  FileDown,
  CalendarDays,
  Sparkles,
  Palmtree,
  HeartPulse,
  UserCheck,
  Settings,
  Sliders,
  Save,
  CheckCircle,
  CalendarRange,
  Baby
} from 'lucide-react';
import { db } from '../constants';

interface LeaveRecord {
  // Unified ID type to handle both string and number inputs from DB
  id: string | number;
  empId: string;
  empName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  deductedDays: number;
  reason: string;
  avatar: string;
}

interface Employee {
  id: number;
  name: string;
  annualBalance?: number;
  exceptionalBalance?: number;
}

interface LeaveReportProps {
  selectedYear: string;
}

const LeaveReport: React.FC<LeaveReportProps> = ({ selectedYear }) => {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<LeaveRecord | null>(null);
  const [balanceEditorType, setBalanceEditorType] = useState<'annual' | 'exceptional' | null>(null);
  const [tempBalances, setTempBalances] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [exportYear, setExportYear] = useState(selectedYear);

  const loadData = async () => {
    // Fix: db methods return Promises
    const [lvs, emps, hols] = await Promise.all([
      db.getLeaves(),
      db.getEmployees(),
      db.getHolidays()
    ]);
    setRecords(lvs);
    setEmployees(emps);
    setHolidays(hols);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, []);

  useEffect(() => {
    setExportYear(selectedYear);
  }, [selectedYear]);

  const availableYears = useMemo(() => {
    const yearsInData = records.map(r => new Date(r.startDate).getFullYear().toString());
    const currentYear = new Date().getFullYear().toString();
    const allYears = Array.from(new Set([...yearsInData, currentYear]));
    return allYears.sort((a, b) => b.localeCompare(a));
  }, [records]);

  const calculateSmartDeduction = (startStr: string, endStr: string, type: string) => {
    if (!startStr || !endStr) return { total: 0, deducted: 0 };
    const start = new Date(startStr);
    const end = new Date(endStr);
    let totalDays = 0;
    let deductedDays = 0;

    const holidayDates = holidays.flatMap(h => {
      const dates = [];
      let curr = new Date(h.startDate);
      const stop = new Date(h.endDate);
      while (curr <= stop) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    });

    let current = new Date(start);
    while (current <= end) {
      totalDays++;
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      const isPublicHoliday = holidayDates.includes(dateStr);
      
      if (type === 'سنوية') {
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isPublicHoliday) {
          deductedDays++;
        }
      } else if (type === 'استثنائية') {
        if (!isPublicHoliday) {
          deductedDays++;
        }
      } else {
        deductedDays = 0;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return { total: totalDays, deducted: deductedDays };
  };

  const handleSaveBalances = async () => {
    // Fix: Use saveEmployee individually in a loop and handle async
    for (const emp of employees) {
      if (tempBalances[emp.id] !== undefined) {
        const updatedEmp = {
          ...emp,
          [balanceEditorType === 'annual' ? 'annualBalance' : 'exceptionalBalance']: tempBalances[emp.id]
        };
        await db.saveEmployee(updatedEmp);
      }
    }
    
    await loadData();
    setBalanceEditorType(null);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const openBalanceEditor = (type: 'annual' | 'exceptional') => {
    const initialBalances: Record<number, number> = {};
    employees.forEach(emp => {
      initialBalances[emp.id] = type === 'annual' 
        ? (emp.annualBalance ?? 30) 
        : (emp.exceptionalBalance ?? 10);
    });
    setTempBalances(initialBalances);
    setBalanceEditorType(type);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف هذا السجل نهائياً من النظام؟')) {
      // Fix: Use deleteLeave and handle async
      await db.deleteLeave(String(id));
      await loadData();
      setEditingRecord(null);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    }
  };

  // Fixed sorting logic to handle string IDs by converting them to Number
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => r.empName.toLowerCase().includes(searchTerm.toLowerCase()) || r.type.includes(searchTerm))
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [records, searchTerm]);

  const generateCSV = (data: LeaveRecord[], filename: string) => {
    if (data.length === 0) {
      alert(`لا توجد بيانات متوفرة لسنة ${exportYear}`);
      return;
    }
    const headers = ['معرف السجل', 'اسم الموظف', 'نوع الإجازة', 'تاريخ البدء', 'تاريخ الانتهاء', 'المدة الكلية', 'أيام الخصم', 'السبب'];
    const rows = data.map(r => {
      const { total, deducted } = calculateSmartDeduction(r.startDate, r.endDate, r.type);
      return [r.id, `"${r.empName}"`, r.type, r.startDate, r.endDate, total, deducted, `"${r.reason || ''}"`];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const typeConfig: Record<string, { bg: string, text: string, stripe: string, icon: any }> = {
    'مرضية': { bg: 'bg-rose-50', text: 'text-rose-600', stripe: 'bg-rose-500', icon: <HeartPulse size={18} /> },
    'سنوية': { bg: 'bg-indigo-50', text: 'text-indigo-600', stripe: 'bg-indigo-500', icon: <Palmtree size={18} /> },
    'استثنائية': { bg: 'bg-amber-50', text: 'text-amber-600', stripe: 'bg-amber-500', icon: <Sparkles size={18} /> },
    'أمومة': { bg: 'bg-pink-50', text: 'text-pink-600', stripe: 'bg-pink-500', icon: <Baby size={18} /> },
    'أبوة': { bg: 'bg-sky-50', text: 'text-sky-600', stripe: 'bg-sky-500', icon: <UserCheck size={18} /> }
  };

  const getTypeStyles = (type: string) => typeConfig[type] || { 
    bg: 'bg-slate-50', text: 'text-slate-600', stripe: 'bg-slate-500', icon: <FileText size={16} /> 
  };

  return (
    <div className="space-y-6 pb-28 text-right" dir="rtl">
      {/* Interactive Stats - Balance Editors */}
      <section className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => openBalanceEditor('annual')}
          className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all active:scale-95 hover:border-indigo-200 group"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Sliders size={20} />
          </div>
          <span className="text-sm font-black text-slate-900">رصيد السنوية</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">اضغط للتعديل</span>
        </button>
        <button 
          onClick={() => openBalanceEditor('exceptional')}
          className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all active:scale-95 hover:border-amber-200 group"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Settings size={20} />
          </div>
          <span className="text-sm font-black text-slate-900">رصيد الاستثنائية</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">اضغط للتعديل</span>
        </button>
      </section>

      {/* Quick Export Panel with Year Selection */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
            <FileDown size={16} className="text-indigo-600" />
            تصدير سريع حسب النوع
          </h3>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start">
            <CalendarRange size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400">سنة التقرير:</span>
            <select 
              value={exportYear} 
              onChange={(e) => setExportYear(e.target.value)}
              className="bg-transparent text-[11px] font-black text-indigo-600 outline-none cursor-pointer"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2">
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => {
                const typeYearRecords = records.filter(r => 
                  r.type === type && 
                  new Date(r.startDate).getFullYear().toString() === exportYear
                );
                generateCSV(typeYearRecords, `تقرير_إجازات_${type}_سنة_${exportYear}`);
              }}
              title={`تصدير إجازات ${type} لسنة ${exportYear}`}
              className={`flex-shrink-0 w-20 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-90 ${config.bg} ${config.text} border border-transparent hover:border-current hover:shadow-md`}
            >
              {config.icon}
              <span className="text-[8px] font-black uppercase whitespace-nowrap">{type}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const allYearRecords = records.filter(r => 
                new Date(r.startDate).getFullYear().toString() === exportYear
              );
              generateCSV(allYearRecords, `تقرير_شامل_الإجازات_سنة_${exportYear}`);
            }}
            title={`تصدير شامل لسنة ${exportYear}`}
            className="flex-shrink-0 w-20 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900 text-white shadow-lg active:scale-90 transition-all hover:bg-slate-800"
          >
            <FileSpreadsheet size={18} />
            <span className="text-[8px] font-black uppercase">الكل</span>
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="ابحث عن موظف أو كلمة مفتاحية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-slate-50 rounded-[1.8rem] py-4 pr-14 pl-4 text-xs font-black outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 shadow-sm transition-all text-right"
        />
      </div>

      {/* Records Feed */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const { total, deducted } = calculateSmartDeduction(record.startDate, record.endDate, record.type);
            const styles = getTypeStyles(record.type);
            
            return (
              <div key={record.id} className="relative bg-white rounded-[2.2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom-4">
                <div className={`absolute top-0 right-0 bottom-0 w-2 ${styles.stripe}`}></div>
                
                <div className="p-6 pr-8 text-right">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={record.avatar || 'https://via.placeholder.com/150'} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-50" alt="" />
                        <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-lg ${styles.bg} ${styles.text} flex items-center justify-center border-2 border-white`}>
                          {React.cloneElement(styles.icon as React.ReactElement<any>, { size: 12 })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm leading-none mb-2">{record.empName}</h4>
                        <div className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                          {React.cloneElement(styles.icon as React.ReactElement<any>, { size: 10 })}
                          إجازة {record.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setEditingRecord(record)} 
                        title="تعديل السجل"
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)} 
                        title="حذف السجل"
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-3xl p-4 flex items-center justify-between mb-5">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">من تاريخ</p>
                      <p className="text-xs font-black text-slate-900">{record.startDate}</p>
                    </div>
                    <div className="flex-1 px-4 flex items-center gap-2 opacity-20">
                      <div className="h-px bg-slate-400 flex-1"></div>
                      <Calendar size={12} className="text-slate-600" />
                      <div className="h-px bg-slate-400 flex-1"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">إلى تاريخ</p>
                      <p className="text-xs font-black text-slate-900">{record.endDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50/50 border border-indigo-100/50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-black text-indigo-400 uppercase mb-1">المدة الكلية</span>
                      <span className="text-sm font-black text-indigo-700">{total} <span className="text-[10px]">أيام</span></span>
                    </div>
                    <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center ${deducted > 0 ? 'bg-amber-50/50 border-amber-100/50' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
                      <span className={`text-[9px] font-black uppercase mb-1 ${deducted > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>خصم الرصيد</span>
                      <span className={`text-sm font-black ${deducted > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{deducted} <span className="text-[10px]">أيام</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 animate-pulse">
              <CalendarDays size={48} />
            </div>
            <h3 className="text-slate-900 font-black text-sm">لا توجد سجلات مطابقة لسنة {selectedYear}</h3>
          </div>
        )}
      </div>

      {/* Balance Editor Modal */}
      {balanceEditorType && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className={`p-8 text-white ${balanceEditorType === 'annual' ? 'bg-indigo-600' : 'bg-amber-600'}`}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-black">تعديل رصيد {balanceEditorType === 'annual' ? 'السنوية' : 'الاستثنائية'}</h3>
                <button onClick={() => setBalanceEditorType(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-800">{emp.name}</span>
                  <input 
                    type="number"
                    value={tempBalances[emp.id] ?? ''}
                    onChange={(e) => setTempBalances({...tempBalances, [emp.id]: parseInt(e.target.value) || 0})}
                    className="w-16 bg-white border-2 border-slate-100 rounded-xl p-2 text-center text-xs font-black outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={handleSaveBalances} 
                className={`w-full text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${balanceEditorType === 'annual' ? 'bg-indigo-600' : 'bg-amber-600'}`}
              >
                <Save size={18} />
                حفظ الأرصدة للجميع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-8 text-white">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-black">تعديل الإجازة</h3>
                <button onClick={() => setEditingRecord(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
              </div>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-4 text-right">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-1">تاريخ البدء</label>
                  <input 
                    type="date" 
                    value={editingRecord.startDate} 
                    onChange={e => setEditingRecord({...editingRecord, startDate: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 text-right" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-1">تاريخ الانتهاء</label>
                  <input 
                    type="date" 
                    value={editingRecord.endDate} 
                    onChange={e => setEditingRecord({...editingRecord, endDate: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 text-right" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={async () => {
                    const { total, deducted } = calculateSmartDeduction(editingRecord.startDate, editingRecord.endDate, editingRecord.type);
                    const updatedRecord = { ...editingRecord, days: total, deductedDays: deducted };
                    
                    // Use saveLeave to persist changes to the mock DB
                    await db.saveLeave(updatedRecord);
                    await loadData();
                    
                    setEditingRecord(null);
                    setIsSuccess(true);
                    setTimeout(() => setIsSuccess(false), 2000);
                  }} 
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  حفظ التغييرات
                </button>
                <button 
                  onClick={() => handleDelete(editingRecord.id)} 
                  className="w-full bg-rose-50 text-rose-600 font-black py-4 rounded-2xl border border-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف السجل نهائياً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {isSuccess && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom z-[150]">
          <CheckCircle size={16} />
          <span className="text-xs font-black">تمت العملية بنجاح</span>
        </div>
      )}
    </div>
  );
};

export default LeaveReport;
