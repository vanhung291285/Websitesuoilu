import React from 'react';
import { StaffMember } from '../types';
import { Mail, Calendar, User, Users } from 'lucide-react';

interface StaffProps {
  staffList: StaffMember[];
}

export const Staff: React.FC<StaffProps> = ({ staffList }) => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
         <h1 className="text-3xl font-bold text-blue-900 uppercase mb-3 flex items-center justify-center">
            <Users className="mr-3" /> Đội ngũ Cán bộ - Giáo viên
         </h1>
         <p className="text-gray-600 max-w-2xl mx-auto">
            Tự hào với đội ngũ sư phạm tâm huyết, giàu kinh nghiệm và luôn đổi mới sáng tạo vì sự nghiệp trồng người.
         </p>
      </div>

      {staffList.length === 0 ? (
         <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 italic">Danh sách đang được cập nhật...</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {staffList.map((staff) => (
               <div key={staff.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-300 border border-gray-100 overflow-hidden group">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                     {staff.avatarUrl ? (
                        <img 
                           src={staff.avatarUrl} 
                           alt={staff.fullName} 
                           className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" 
                        />
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                           <User size={64} />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  </div>
                  
                  <div className="p-5 text-center relative">
                     <div className="-mt-10 mb-3 relative z-10">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                           {staff.position || 'Cán bộ'}
                        </span>
                     </div>
                     
                     <h3 className="text-lg font-bold text-gray-800 mb-1">{staff.fullName}</h3>
                     
                     <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                        {staff.email && (
                           <div className="flex items-center justify-center gap-2" title="Email liên hệ">
                              <Mail size={14} className="text-blue-500" />
                              <span className="truncate max-w-[180px]">{staff.email}</span>
                           </div>
                        )}
                        {staff.partyDate && (
                           <div className="flex items-center justify-center gap-2" title="Ngày vào Đảng">
                              <Calendar size={14} className="text-red-500" />
                              <span>Vào Đảng: {staff.partyDate}</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};