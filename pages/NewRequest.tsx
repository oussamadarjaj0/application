
import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, CheckCircle, ChevronDown, Briefcase, Info, Loader2 } from 'lucide-react';
import { db } from '../constants';

interface NewRequestProps {
  selectedYear: string;
}

const NewRequest: React.FC<NewRequestProps> = ({ selectedYear }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [formData, setFormData] = useState({ type: 'سنوية', start: '', end: '', reason: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getEmployees().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (formData.start && formData.end) {
      const s = new Date(formData.start);
      const e = new Date(formData.end);
      const diff = Math.abs(e.getTime() - s.getTime());
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(days > 0 ? days : 0);
    } else {
      setCalculatedDays(0);
    }
  }, [formData.start, formData.end]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || calculatedDays <= 0) return;

    const emp = employees.find(e => String(e.id) === selectedEmpId);
    if (!emp) return;

    const newLeave = {
      id: Date.now().toString(),
      empId: selectedEmpId,
      empName: emp.name,
      avatar: emp.avatar,
      type: formData.type,
      startDate: formData.start,
      endDate: formData.end,
      reason: formData.reason || 'إجازة ' + formData.type,
      days: calculatedDays,
      deductedDays: formData.type === 'سنوية' ? calculatedDays : 0
    };

    await db.saveLeave(newLeave);

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ type: 'سنوية', start: '', end: '', reason: '' });
      setSelectedEmpId('');
    }, 2500);
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-xs font-black text-slate-400">تحميل قائمة الموظفين...</span>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 py-32 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200">
          <CheckCircle size={48} />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-900">تم تسجيل الإجازة</h3>
          <p className="text-sm text-slate-400 font-bold mt-2">تم تحديث سجل الموظف وتحديث الأرصدة</p>
        </div>
      </div>
    );
  }

  const leaveTypes = [
    { label: 'سنوية', icon: '🏖️' },
    { label: 'مرضية', icon: '🤒' },
    { label: 'استثنائية', icon: '✨' },
    { label: 'أمومة', icon: '👶' },
    { label: 'أبوة', icon: '👨‍👧' }
  ];

  return (
    <div className="space-y-6 pb-28 text-right animate-in fade-in" dir="rtl">
      {/* Header Info */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-1">تسجيل إجازة 📝</h2>
          <p className="text-[11px] text-indigo-100 opacity-80 font-bold">أدخل بيانات الإجازة لسنة {selectedYear} بدقة لضمان دقة التقارير.</p>
        </div>
        <Briefcase className="absolute -bottom-6 -left-6 w-32 h-32 text-white opacity-10 rotate-12" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        {/* Employee Selection */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 px-1">
            <User size={14} className="text-indigo-500" />
            الموظف المستفيد
          </label>
          <div className="relative">
            <select 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pr-11 pl-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none text-right"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
            >
              <option value="">اختر الموظف...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-5 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Leave Type Chips */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 px-1">
            <FileText size={14} className="text-indigo-500" />
            نوع الإجازة المطلوبة
          </label>
          <div className="flex flex-wrap gap-2">
            {leaveTypes.map((type) => (
              <button
                key={type.label}
                type="button"
                onClick={() => setFormData({...formData, type: type.label})}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all border ${
                  formData.type === type.label 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg -translate-y-1' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 px-1">
            <Calendar size={14} className="text-indigo-500" />
            فترة الإجازة
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 mr-2">من تاريخ</span>
              <input 
                type="date" 
                required 
                value={formData.start}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 text-right" 
                onChange={e => setFormData({...formData, start: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 mr-2">إلى تاريخ</span>
              <input 
                type="date" 
                required 
                value={formData.end}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 text-right" 
                onChange={e => setFormData({...formData, end: e.target.value})} 
              />
            </div>
          </div>
          
          {calculatedDays > 0 && (
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between animate-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                  <Info size={14} className="text-indigo-600" />
                  <span className="text-[11px] font-black text-indigo-700">المدة المحتسبة:</span>
               </div>
               <span className="text-sm font-black text-indigo-600">{calculatedDays} أيام</span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-3">
          <textarea 
            placeholder="سبب الإجازة أو ملاحظات إضافية..." 
            rows={2}
            value={formData.reason}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 text-right resize-none" 
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedEmpId || !formData.start || !formData.end || calculatedDays <= 0}
          className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale mt-4 text-sm"
        >
          اعتماد الطلب وحفظ البيانات
        </button>
      </form>

      <div className="px-6 py-4 bg-slate-100/50 rounded-3xl text-center">
        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
          * يتم استبعاد العطلات الرسمية المسجلة في النظام تلقائياً عند خصم الرصيد السنوي.
        </p>
      </div>
    </div>
  );
};

export default NewRequest;
