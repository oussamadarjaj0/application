
import React from 'react';
import { 
  BarChart3, 
  PlusCircle, 
  Users, 
  History,
  LayoutDashboard,
  Bell
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard size={22} /> },
  { id: 'add_leave', label: 'طلب جديد', icon: <PlusCircle size={22} /> },
  { id: 'employees', label: 'الموظفون', icon: <Users size={22} /> },
  { id: 'leave_report', label: 'التقارير', icon: <History size={22} /> },
];

// Local Storage Helper
const getStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Mock Data - Now Empty as requested
const INITIAL_EMPLOYEES = [];

// Pending Requests - Now Empty as requested
export const ALL_PENDING_REQUESTS = [];

export const db = {
  getEmployees: async () => {
    let data = getStorage('hcm_employees');
    if (!data) {
      setStorage('hcm_employees', INITIAL_EMPLOYEES);
      data = INITIAL_EMPLOYEES;
    }
    return data;
  },
  saveEmployee: async (employee: any) => {
    const emps = await db.getEmployees();
    const index = emps.findIndex((e: any) => String(e.id) === String(employee.id));
    if (index > -1) {
      emps[index] = employee;
    } else {
      emps.push({ 
        ...employee, 
        id: employee.id || Date.now().toString(),
        annualBalance: employee.annualBalance ?? 30, // Default values for new entries
        exceptionalBalance: employee.exceptionalBalance ?? 10
      });
    }
    setStorage('hcm_employees', emps);
  },
  deleteEmployee: async (id: string) => {
    const emps = await db.getEmployees();
    const filtered = emps.filter((e: any) => String(e.id) !== String(id));
    setStorage('hcm_employees', filtered);
  },
  getLeaves: async () => {
    return getStorage('hcm_leaves') || [];
  },
  saveLeave: async (leave: any) => {
    const leaves = await db.getLeaves();
    const index = leaves.findIndex((l: any) => String(l.id) === String(leave.id));
    if (index > -1) {
      leaves[index] = leave;
    } else {
      leaves.push({ ...leave, id: leave.id || Date.now().toString() });
    }
    setStorage('hcm_leaves', leaves);
    window.dispatchEvent(new Event('db-update'));
  },
  deleteLeave: async (id: string) => {
    const leaves = await db.getLeaves();
    const filtered = leaves.filter((l: any) => String(l.id) !== String(id));
    setStorage('hcm_leaves', filtered);
    window.dispatchEvent(new Event('db-update'));
  },
  getHolidays: async () => {
    // Start with empty list instead of pre-filled holidays
    return getStorage('hcm_holidays') || [];
  },
  saveHoliday: async (holiday: any) => {
    const hols = await db.getHolidays();
    const index = hols.findIndex((h: any) => String(h.id) === String(holiday.id));
    if (index > -1) {
      hols[index] = holiday;
    } else {
      hols.push({ ...holiday, id: holiday.id || Date.now().toString() });
    }
    setStorage('hcm_holidays', hols);
  },
  deleteHoliday: async (id: string) => {
    const hols = await db.getHolidays();
    const filtered = hols.filter((h: any) => String(h.id) !== String(id));
    setStorage('hcm_holidays', filtered);
  }
};

export const MOCK_USER = {
  name: 'مجلس عمالة المضيق الفنيدق',
  employeeId: 'PREF-2025',
  role: 'الإدارة المركزية',
  avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Coat_of_arms_of_Morocco.svg/1200px-Coat_of_arms_of_Morocco.svg.png',
  email: 'contact@mdi-fni.gov.ma',
  phone: '+212 539 970 000',
  department: 'رئاسة المجلس',
  status: 'نشط',
  station: 'المضيق - المقر الإداري',
  group: 'قسم الموارد البشرية',
  reportsTo: 'السيد رئيس المجلس',
  joiningDate: '2020-01-01',
};
