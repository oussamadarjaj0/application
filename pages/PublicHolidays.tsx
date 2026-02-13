
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  PartyPopper, 
  Edit2, 
  Trash2, 
  CalendarDays
} from 'lucide-react';
import { db } from '../constants';

interface Holiday {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  duration?: string;
}

interface PublicHolidaysProps {
  selectedYear: string;
}

const PublicHolidays: React.FC<PublicHolidaysProps> = ({ selectedYear }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    setHolidays(db.getHolidays());
  }, []);

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? 'يوم واحد' : `${diffDays} أيام`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: '', startDate: '', endDate: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setFormData({
      title: holiday.title,
      startDate: holiday.startDate,
      endDate: holiday.endDate
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (formData.title && formData.startDate && formData.endDate) {
      const duration = calculateDuration(formData.startDate, formData.endDate);
      let updated;
      if (editingId) {
        updated = holidays.map(h => String(h.id) === String(editingId) ? { ...h, ...formData, duration } : h);
      } else {
        updated = [...holidays, { id: Date.now(), ...formData, duration }];
      }
      setHolidays(updated);
      db.saveHolidays(updated);
      setShowModal(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('⚠️ هل تريد حذف هذه العطلة من النظام؟')) {
      const updated = holidays.filter(x => String(x.id) !== String(id));
      setHolidays(updated);
      db.saveHolidays(updated);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 text-right" dir="rtl">
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10 text-right">
          <h3 className="text-xl font-bold">العطل الرسمية لعام {selectedYear}</h3>
          <p className="text-[10px] opacity-80 font-bold">تستبعد تلقائياً من خصم الأرصدة</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-white text-indigo-600 p-3 rounded-2xl shadow-lg relative z-10 active:scale-95 transition-all"><Plus size={24} /></button>
      </div>

      <div className="space-y-4">
        {holidays.filter(h => new Date(h.startDate).getFullYear().toString() === selectedYear).map((h) => (
          <div key={h.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 animate-in slide-in-from-bottom group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><PartyPopper size={24} /></div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 text-sm">{h.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold">{h.startDate} ← {h.endDate}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleOpenEdit(h)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(h.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {holidays.filter(h => new Date(h.startDate).getFullYear().toString() === selectedYear).length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
            <CalendarDays size={48} className="text-slate-400 mb-2" />
            <p className="text-sm font-black">لا توجد عطل رسمية مجدولة لسنة {selectedYear}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingId ? 'تعديل عطلة' : 'إضافة عطلة'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-7 space-y-4 text-right">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">اسم المناسبة</label>
                <input 
                  type="text" placeholder="مثلاً: عيد الفطر" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm text-slate-900 font-black outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-1 uppercase text-right block">تبدأ من</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-black outline-none text-right" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-1 uppercase text-right block">تنتهي في</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-black outline-none text-right" />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">حفظ التغييرات</button>
                {editingId && (
                  <button onClick={() => handleDelete(editingId)} className="w-full bg-rose-50 text-rose-600 font-black py-4 rounded-2xl border border-rose-100 flex items-center justify-center gap-2">
                    <Trash2 size={16} /> حذف العطلة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHolidays;
