
import React from 'react';
import { Camera, Phone, Mail, User } from 'lucide-react';
import { MOCK_USER } from '../constants';

const Profile: React.FC = () => {
  return (
    <div className="flex flex-col h-full text-right">
      {/* Profile Header */}
      <div className="bg-[#1e467a] pt-8 pb-16 px-4 flex flex-col items-center text-white relative">
        <div className="relative mb-4">
           <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-gray-200">
             <img src={MOCK_USER.avatar} alt="Profile" className="w-full h-full object-cover" />
           </div>
           <button className="absolute bottom-0 left-0 bg-white p-1.5 rounded-full shadow-lg text-gray-600 border border-gray-100">
              <Camera size={16} />
           </button>
        </div>
        <h2 className="text-lg font-bold">{MOCK_USER.name} ({MOCK_USER.employeeId})</h2>
        <p className="text-sm opacity-90">{MOCK_USER.role}</p>
      </div>

      {/* Main Info Card */}
      <div className="px-4 -mt-8 space-y-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex p-4 flex-row-reverse divide-x divide-x-reverse divide-gray-100">
          <div className="flex-1 px-2 flex flex-col items-center">
            <span className="text-[10px] text-blue-600 font-bold uppercase mb-1">الهاتف</span>
            <span className="text-xs text-gray-700">{MOCK_USER.phone}</span>
          </div>
          <div className="flex-1 px-2 flex flex-col items-center">
            <span className="text-[10px] text-blue-600 font-bold uppercase mb-1">البريد الإلكتروني</span>
            <span className="text-xs text-gray-700 break-all text-center">{MOCK_USER.email}</span>
          </div>
        </div>

        {/* Detailed Stats Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-4">
          <InfoRow label="موقع العمل" value={MOCK_USER.station} />
          <InfoRow label="القسم" value={MOCK_USER.department} />
          <InfoRow label="المجموعة" value={MOCK_USER.group} />
          <InfoRow label="الحالة الوظيفية" value={MOCK_USER.status} />
          <InfoRow label="المدير المباشر" value={MOCK_USER.reportsTo} />
          <InfoRow label="تاريخ الانضمام" value={MOCK_USER.joiningDate} />
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-row-reverse justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
    <span className="text-blue-800 font-bold w-1/3 text-right">{label}</span>
    <span className="text-gray-600 w-2/3 text-right">{value}</span>
  </div>
);

export default Profile;
