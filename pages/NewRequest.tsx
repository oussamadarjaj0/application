
import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, CheckCircle, ChevronDown, Briefcase } from 'lucide-react';
import { db } from '../constants';

interface NewRequestProps {
  selectedYear: string;
}

const NewRequest: React.FC<NewRequestProps> = ({ selectedYear }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [formData, setFormData] = useState({ type: 'سنوية', start: '', end: '', reason: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setEmployees(db.getEmployees());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const emp = employees.find(e => e.id === Number(selectedEmpId));
    const newLeave = {
      id: Date.now(),
      empId: selectedEmpId,
      empName: emp.name,
      avatar: emp.avatar,
      type: formData.type,
      startDate: formData.start,
      endDate: formData.end,
      reason: formData.reason || 'إجازة ' + formData.type,
      days: 0 
    };

    const currentLeaves = db.getLeaves();
    db.saveLeaves([...currentLeaves, newLeave]);

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ type: 'سنوية', start: '', end: '', reason: '' });
      setSelectedEmpId('');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100">
          <CheckCircle size={40} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-slate-900">تم الحفظ بنجاح</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">تمت إضافة الإجازة إلى سجلات النظام</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 text-right" dir="rtl">
      {/* Quick Info Card */}
      <div className="bg-indigo-600 rounded-[2.2rem] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-black mb-1 text-right">تسجيل سريع</h2>
          <p className="text-[10px] opacity-80 font-bold text-right">أدخل تفاصيل الإجازة لسنة {selectedYear} ليقوم النظام باحتساب الرصيد تلقائياً.</p>
        </div>
        <Briefcase className="absolute -bottom-4 -left-4 w-24 h-24 opacity-10" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
        {/* Employee Selection */}
        <div className="space-y-2 text-right">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center justify-start gap-2 px-1">
            <User size={12} className="text-indigo-500" />
            الموظف المعني
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
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 top-5 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Leave Type */}
        <div className="space-y-2 text-right">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center justify-start gap-2 px-1">
            <FileText size={12} className="text-indigo-500" />
            نوع الإجازة
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['سنوية', 'استثنائية', 'مرضية', 'أمومة', 'أبوة'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, type})}
                className={`py-3 rounded-xl text-[10px] font-black transition-all ${
                  formData.type === type 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 text-right">
          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center justify-start gap-2 px-1">
            <Calendar size={12} className="text-indigo-500" />
            الفترة الزمنية
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-400 block mr-2">من تاريخ</span>
              <input 
                type="date" 
                required 
                value={formData.start}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 text-right" 
                onChange={e => setFormData({...formData, start: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-400 block mr-2">إلى تاريخ</span>
              <input 
                type="date" 
                required 
                value={formData.end}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 text-right" 
                onChange={e => setFormData({...formData, end: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Reason - Optional but simple */}
        <div className="space-y-2 text-right">
          <input 
            placeholder="ملاحظة سريعة (اختياري)..." 
            value={formData.reason}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 text-right" 
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedEmpId || !formData.start || !formData.end}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale mt-2"
        >
          حفظ الطلب فوراً
        </button>
      </form>

      <div className="p-4 text-center">
        <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
          * سيقوم النظام تلقائياً بتحديث سجل الموظف وتنبيه المسؤولين عن قرب انتهاء المدة.
        </p>
      </div>
    </div>
  );
};

export default NewRequest;
