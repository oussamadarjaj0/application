
import React from 'react';
import { Bell, CalendarDays, ChevronDown, UserCircle } from 'lucide-react';
import { NAV_ITEMS, MOCK_USER } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, title, selectedYear, setSelectedYear }) => {
  const startYear = 2024;
  const currentYearNum = new Date().getFullYear();
  const years = Array.from(
    { length: Math.max(0, currentYearNum - startYear + 2) }, 
    (_, i) => (startYear + i).toString()
  );

  return (
    <div className="flex flex-col h-full w-full max-w-md bg-[#F8FAFC] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.1)] relative border-x border-slate-200 text-right font-['Cairo']" dir="rtl">
      {/* Premium Sticky Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-5 pt-8 flex flex-col gap-4 sticky top-0 z-[100]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-indigo-50 active:scale-90 transition-transform shadow-sm bg-white p-1"
            >
              <img src={MOCK_USER.avatar} alt="Logo" className="w-full h-full object-contain" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">المملكة المغربية</span>
              <h1 className="text-sm font-black text-slate-900 leading-none">{MOCK_USER.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Elegant Year Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100/50">
                <CalendarDays size={12} />
                <span>سنة {selectedYear}</span>
                <ChevronDown size={10} />
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
              className={`p-2.5 transition-all rounded-xl relative ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto pb-28 px-5 pt-4 scroll-smooth">
        {children}
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-[100] max-w-md mx-auto pointer-events-none">
        <nav className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 flex justify-around items-center h-22 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-4 pointer-events-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group ${
                activeTab === item.id ? 'text-white' : 'text-slate-500'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-500 ${activeTab === item.id ? 'bg-indigo-600 shadow-xl shadow-indigo-600/40 -translate-y-2' : 'bg-transparent hover:bg-white/5'}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 22, strokeWidth: 2.5 })}
              </div>
              <span className={`text-[9px] font-black transition-all absolute -bottom-1 ${activeTab === item.id ? 'opacity-100' : 'opacity-0 scale-50'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
