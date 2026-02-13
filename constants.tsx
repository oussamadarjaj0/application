
import React from 'react';
import { 
  BarChart3, 
  PlusCircle, 
  Users, 
  History, 
  CloudSync,
  Database
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'الرئيسية', icon: <BarChart3 size={22} /> },
  { id: 'add_leave', label: 'تسجيل إجازة', icon: <PlusCircle size={22} /> },
  { id: 'employees', label: 'الموظفون', icon: <Users size={22} /> },
  { id: 'leave_report', label: 'السجلات', icon: <History size={22} /> },
];

const EMP_KEY = 'hcm_employees_v1';
const LEAVE_KEY = 'hcm_leaves_v1';
const HOLIDAY_KEY = 'hcm_holidays_v1';

export const db = {
  getEmployees: () => {
    const data = localStorage.getItem(EMP_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveEmployees: (employees: any[]) => {
    localStorage.setItem(EMP_KEY, JSON.stringify(employees));
    window.dispatchEvent(new Event('db-update'));
  },
  getLeaves: () => {
    const data = localStorage.getItem(LEAVE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveLeaves: (leaves: any[]) => {
    localStorage.setItem(LEAVE_KEY, JSON.stringify(leaves));
    window.dispatchEvent(new Event('db-update'));
  },
  getHolidays: () => {
    const data = localStorage.getItem(HOLIDAY_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveHolidays: (holidays: any[]) => {
    localStorage.setItem(HOLIDAY_KEY, JSON.stringify(holidays));
    window.dispatchEvent(new Event('db-update'));
  },
  syncData: async () => {
    console.log("جارِ المزامنة مع السحابة...");
    return true;
  }
};

export const getStats = (year?: string) => {
  const employees = db.getEmployees();
  const allLeaves = db.getLeaves();
  const holidays = db.getHolidays();
  const today = new Date().toISOString().split('T')[0];
  
  const leaves = year 
    ? allLeaves.filter((l: any) => new Date(l.startDate).getFullYear().toString() === year)
    : allLeaves;

  const activeLeavesToday = allLeaves.filter((l: any) => today >= l.startDate && today <= l.endDate).length;

  return [
    { id: 'total_emp', label: 'إجمالي الموظفين', value: employees.length, trend: 'قاعدة البيانات', color: 'text-slate-900' },
    { id: 'on_leave', label: 'في إجازة اليوم', value: activeLeavesToday, trend: 'حسب التاريخ', color: 'text-slate-900' },
    { id: 'holidays', label: `عطلات عام ${year || ''}`, value: holidays.filter((h: any) => new Date(h.startDate).getFullYear().toString() === year).length, trend: 'المجدولة', color: 'text-slate-900' },
    { id: 'leave_report', label: `سجلات عام ${year || ''}`, value: leaves.length, trend: 'سجل إداري', color: 'text-slate-900' },
  ];
};

export const MOCK_USER = {
  name: 'مسؤول النظام',
  employeeId: 'ADMIN-01',
  role: 'مدير الموارد البشرية',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=250&h=250&auto=format&fit=crop',
  email: 'admin@company.com',
  phone: '+966 50 123 4567',
  department: 'الموارد البشرية',
  status: 'نشط',
  station: 'المقر الرئيسي',
  group: 'الإدارة العليا',
  reportsTo: 'المدير التنفيذي',
  joiningDate: '2020-01-01',
};

export const MOCK_CURRENT_LEAVES = [];
export const MOCK_USER_BALANCES = { annual: 22, exceptional: 10 };
export const ALL_PENDING_REQUESTS = [];
