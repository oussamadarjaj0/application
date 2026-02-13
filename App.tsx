
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import History from './pages/History';
import Profile from './pages/Profile';
import CurrentLeaves from './pages/CurrentLeaves';
import PublicHolidays from './pages/PublicHolidays';
import LeaveReport from './pages/LeaveReport';
import NewRequest from './pages/NewRequest';
import Notifications from './pages/Notifications';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // لضمان تحديث الواجهة عند تغيير السنة أو البيانات
  useEffect(() => {
    console.log(`تم تحديث السنة المختارة إلى: ${selectedYear}`);
  }, [selectedYear]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} selectedYear={selectedYear} />;
      case 'add_leave':
        return <NewRequest selectedYear={selectedYear} />;
      case 'employees':
        return <Employees selectedYear={selectedYear} />;
      case 'current_leaves':
        return <CurrentLeaves />;
      case 'holidays':
        return <PublicHolidays selectedYear={selectedYear} />;
      case 'leave_report':
        return <LeaveReport selectedYear={selectedYear} />;
      case 'history':
        return <History selectedYear={selectedYear} />;
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard onNavigate={setActiveTab} selectedYear={selectedYear} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'لوحة التحكم';
      case 'add_leave': return 'تسجيل إجازة موظف';
      case 'employees': return 'قاعدة بيانات الموظفين';
      case 'current_leaves': return 'سجل المجازين حالياً';
      case 'holidays': return 'جدولة العطل الرسمية';
      case 'leave_report': return 'تقارير الأرصدة والخصومات';
      case 'history': return 'سجل الإجازات الإداري';
      case 'profile': return 'حساب المسؤول';
      case 'notifications': return 'التنبيهات الإدارية';
      default: return 'نظام إدارة الإجازات';
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      title={getTitle()}
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
    >
      <div className="animate-in fade-in duration-300">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
