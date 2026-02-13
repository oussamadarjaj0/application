
import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Edit2, Trash2, X, Save, User, Mail, MapPin, CheckCircle, Hash, FileDown, Camera, Upload } from 'lucide-react';
import { db } from '../constants';

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  dept: string;
  email: string;
  avatar: string;
}

interface EmployeesProps {
  selectedYear?: string;
}

const Employees: React.FC<EmployeesProps> = ({ selectedYear }) => {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStaff(db.getEmployees());
  }, []);

  const handleOpenAdd = () => {
    setEditingEmp({
      id: 0,
      name: '',
      employeeId: '',
      dept: '',
      email: '',
      avatar: ''
    });
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingEmp) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingEmp({ ...editingEmp, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    let updated;
    const finalAvatar = editingEmp.avatar || `https://i.pravatar.cc/150?u=${editingEmp.employeeId || Date.now()}`;
    
    if (isAdding) {
      const newEmp: Employee = {
        ...editingEmp,
        id: Date.now(),
        avatar: finalAvatar,
      };
      updated = [...staff, newEmp];
    } else {
      updated = staff.map(s => s.id === editingEmp.id ? { ...editingEmp, avatar: finalAvatar } : s);
    }

    setStaff(updated);
    db.saveEmployees(updated);
    setIsAdding(false);
    setEditingEmp(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleDeleteEmployee = (id: number) => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف الموظف نهائياً من النظام؟')) {
      const updated = staff.filter(s => s.id !== id);
      setStaff(updated);
      db.saveEmployees(updated);
      setEditingEmp(null);
    }
  };

  const exportEmployeeReport = (emp: Employee) => {
    const allLeaves = db.getLeaves();
    const empLeaves = allLeaves.filter((l: any) => String(l.empId) === String(emp.id));

    if (empLeaves.length === 0) {
      alert(`لا توجد سجلات إجازات مسجلة للموظف: ${emp.name}`);
      return;
    }

    const headers = ['معرف الإجازة', 'نوع الإجازة', 'تاريخ البدء', 'تاريخ الانتهاء', 'السبب'];
    const csvRows = empLeaves.map((l: any) => [
      l.id,
      l.type,
      l.startDate,
      l.endDate,
      l.reason
    ]);

    const csvContent = "\uFEFF" + [headers, ...csvRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_إجازات_${emp.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.employeeId.includes(searchTerm)
  );

  return (
    <div className="space-y-4 pb-24 text-right" dir="rtl">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن موظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pr-11 pl-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-right"
          />
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-4 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          <UserPlus size={18} />
        </button>
      </div>

      {/* Staff Grid */}
      <div className="space-y-4">
        {filteredStaff.map((emp) => (
          <div key={emp.id} className="bg-white rounded-[2.2rem] p-6 border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {emp.avatar ? (
                    <img src={emp.avatar} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-50" alt="" />
                  ) : (
                    <div className="bg-slate-100 p-3 rounded-2xl text-slate-400">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">{emp.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">ID: {emp.employeeId}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => exportEmployeeReport(emp)} 
                  title="تصدير تقرير الإجازات"
                  className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                >
                  <FileDown size={16} />
                </button>
                <button 
                  onClick={() => { setEditingEmp(emp); setIsAdding(false); }} 
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteEmployee(emp.id)} 
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 border-t border-slate-50 pt-4">
              <div className="flex items-center gap-3 px-1">
                <div className="bg-slate-50 p-2 rounded-lg"><Mail size={14} className="text-slate-400" /></div>
                <p className="text-xs font-black text-slate-900">{emp.email}</p>
              </div>
              <div className="flex items-center gap-3 px-1">
                <div className="bg-slate-50 p-2 rounded-lg"><MapPin size={14} className="text-slate-400" /></div>
                <p className="text-xs font-black text-slate-900">{emp.dept}</p>
              </div>
            </div>
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="py-20 text-center opacity-30 flex flex-col items-center gap-2">
            <User size={48} />
            <p className="text-sm font-bold">لا يوجد موظفون مسجلون حالياً</p>
          </div>
        )}
      </div>

      {editingEmp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 space-y-4 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-xl text-slate-900">{isAdding ? 'إضافة موظف جديد' : 'تعديل البيانات'}</h3>
              <button type="button" onClick={() => setEditingEmp(null)} className="text-slate-400 hover:text-rose-500"><X /></button>
            </div>

            {/* Profile Picture Upload Section */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400">
                  {editingEmp.avatar ? (
                    <img src={editingEmp.avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Camera size={24} />
                      <span className="text-[8px] font-black mt-1">اضغط للرفع</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -left-1 bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 border-2 border-white transform hover:scale-110 transition-transform">
                  <Upload size={14} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <p className="text-[10px] font-black text-slate-400 uppercase">صورة الموظف {selectedYear ? `(سنة ${selectedYear})` : ''}</p>
            </div>

            <div className="space-y-4 text-right">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1">الاسم الكامل</label>
                <input 
                  required
                  value={editingEmp.name} 
                  onChange={e => setEditingEmp({...editingEmp, name: e.target.value})}
                  placeholder="أدخل الاسم هنا..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 text-right" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1">الرقم الوظيفي</label>
                <input 
                  required
                  value={editingEmp.employeeId} 
                  onChange={e => setEditingEmp({...editingEmp, employeeId: e.target.value})}
                  placeholder="مثلاً: EMP-101"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 text-right" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1">القسم</label>
                <input 
                  required
                  value={editingEmp.dept} 
                  onChange={e => setEditingEmp({...editingEmp, dept: e.target.value})}
                  placeholder="القسم أو الإدارة"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 text-right" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1">البريد الإلكتروني</label>
                <input 
                  type="email" required
                  value={editingEmp.email} 
                  onChange={e => setEditingEmp({...editingEmp, email: e.target.value})}
                  placeholder="example@company.com"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 text-right" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">
                {isAdding ? 'حفظ الموظف الجديد' : 'تحديث البيانات'}
              </button>
              {!isAdding && editingEmp && (
                <button 
                  type="button" 
                  onClick={() => handleDeleteEmployee(editingEmp.id)}
                  className="w-full bg-rose-50 text-rose-600 font-black py-4 rounded-2xl border border-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف الموظف نهائياً
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom z-[70]">
          <CheckCircle size={16} />
          <span className="text-xs font-black">تمت العملية بنجاح</span>
        </div>
      )}
    </div>
  );
};

export default Employees;
