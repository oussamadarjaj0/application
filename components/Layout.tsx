
import React from 'react';
import { Bell, CalendarDays, ChevronDown } from 'lucide-react';
import { NAV_ITEMS, MOCK_CURRENT_LEAVES } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, title, selectedYear, setSelectedYear }) => {
  const hasUrgent = MOCK_CURRENT_LEAVES.some(l => l.remainingDays <= 2);
  
  // توليد السنوات ديناميكياً من 2024 وحتى السنة الحالية فقط
  const startYear = 2024;
  const currentYearNum = new Date().getFullYear();
  const years = Array.from(
    { length: Math.max(0, currentYearNum - startYear + 1) }, 
    (_, i) => (startYear + i).toString()
  );

  return (
    <div className="flex flex-col h-full w-full max-w-md bg-white overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] relative border-x border-slate-100 text-right animate-in fade-in duration-500" dir="rtl">
      {/* Header - Sticky */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-50 p-4 pt-6 flex flex-col gap-4 sticky top-0 z-[100] safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100 transform -rotate-3">
              <span className="font-black text-xl">إ</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-900 leading-none mb-0.5">{title}</h1>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">نظام الموظف الذكي</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Year Selector Pill */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-slate-200 transition-all active:scale-95 cursor-pointer">
                <CalendarDays size={12} className="text-indigo-400" />
                <span>سنة {selectedYear}</span>
                <ChevronDown size={10} className="text-slate-400" />
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2.5 transition-all rounded-2xl ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg rotate-12' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
            >
              <Bell size={18} />
              {hasUrgent && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-28 p-4 bg-slate-50/50 scroll-smooth">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-[100] max-w-md mx-auto pointer-events-none">
        <nav className="bg-slate-900/95 backdrop-blur-xl border border-white/10 flex justify-around items-center h-20 rounded-[2.5rem] shadow-2xl px-4 pointer-events-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                activeTab === item.id ? 'text-white scale-110' : 'text-slate-500'
              }`}
            >
              <div className={`p-2.5 rounded-2xl transition-all duration-500 ${activeTab === item.id ? 'bg-indigo-600 shadow-lg shadow-indigo-500/50 -translate-y-1' : 'bg-transparent'}`}>
                {/* Fixed TypeScript error by casting to React.ReactElement<any> */}
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: activeTab === item.id ? 20 : 22 })}
              </div>
              <span className={`text-[8px] font-black transition-all ${activeTab === item.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
