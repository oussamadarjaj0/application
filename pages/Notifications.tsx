
import React, { useState, useEffect } from 'react';
import { db } from '../constants';
import { 
  Bell, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Info,
  XCircle,
  Clock
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
}

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('hcm_dismissed_notifs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Fix: Handle asynchronous data fetching for leaves
    const fetchNotifications = async () => {
      const leaves = await db.getLeaves();
      const today = new Date();
      const generated: NotificationItem[] = [];

      leaves.forEach((l: any) => {
        const endDate = new Date(l.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          generated.push({
            id: `end-${l.id}`,
            type: 'urgent',
            title: 'انتهاء إجازة اليوم',
            message: `تنتهي إجازة الموظف ${l.empName} اليوم. يجب مباشرة العمل غداً.`,
            time: 'تحديث تلقائي'
          });
        } else if (diffDays > 0 && diffDays <= 2) {
          generated.push({
            id: `soon-${l.id}`,
            type: 'warning',
            title: 'اقتراب عودة موظف',
            message: `بقي ${diffDays} يوم على عودة ${l.empName} من إجازته (${l.type}).`,
            time: 'تحديث تلقائي'
          });
        }
      });

      // فلترة التنبيهات التي تم حذفها يدوياً
      const activeNotifs = generated.filter(n => !dismissedIds.includes(n.id));
      setNotifs(activeNotifs);
    };

    fetchNotifications();
  }, [dismissedIds]);

  const handleDelete = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('hcm_dismissed_notifs', JSON.stringify(newDismissed));
  };

  const handleClearAll = () => {
    if (notifs.length === 0) return;
    if (window.confirm('هل تريد مسح كافة التنبيهات الحالية؟')) {
      const allIds = notifs.map(n => n.id);
      const newDismissed = [...dismissedIds, ...allIds];
      setDismissedIds(newDismissed);
      localStorage.setItem('hcm_dismissed_notifs', JSON.stringify(newDismissed));
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-sm">مركز التنبيهات</h3>
            <p className="text-[10px] text-slate-400 font-bold">{notifs.length} تنبيه نشط</p>
          </div>
        </div>
        <button 
          onClick={handleClearAll}
          className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"
        >
          مسح الكل
        </button>
      </div>

      <div className="space-y-3">
        {notifs.map((notif) => (
          <div 
            key={notif.id} 
            className={`bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex gap-4 items-start animate-in slide-in-from-top duration-300`}
          >
            <div className={`shrink-0 p-3 rounded-2xl ${
              notif.type === 'urgent' ? 'bg-rose-50 text-rose-500' : 
              notif.type === 'warning' ? 'bg-amber-50 text-amber-500' : 
              'bg-indigo-50 text-indigo-500'
            }`}>
              {notif.type === 'urgent' ? <AlertTriangle size={20} /> : <Clock size={20} />}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-black text-slate-800">{notif.title}</h4>
                <button 
                  onClick={() => handleDelete(notif.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                {notif.message}
              </p>
              <div className="mt-2 text-[8px] text-slate-300 font-black uppercase tracking-wider">
                {notif.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifs.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center opacity-20">
          <div className="bg-slate-100 p-6 rounded-full mb-4 text-slate-400">
            <CheckCircle size={48} />
          </div>
          <p className="text-sm font-black">لا توجد تنبيهات إدارية حالياً</p>
          <p className="text-[10px] font-bold mt-1">النظام محدث بالكامل</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
