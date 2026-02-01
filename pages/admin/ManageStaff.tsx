
import React, { useState, useEffect, useRef } from 'react';
import { StaffMember } from '../../types';
import { DatabaseService } from '../../services/database';
import { UserPlus, Trash2, Edit, Save, Briefcase, Mail, Calendar, User, UploadCloud } from 'lucide-react';

interface ManageStaffProps {
   refreshData?: () => void;
}

export const ManageStaff: React.FC<ManageStaffProps> = ({ refreshData }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    fullName: '',
    position: '',
    email: '',
    partyDate: '',
    avatarUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await DatabaseService.getStaff();
    setStaffList(data);
  };

  const handleEdit = (staff: StaffMember) => {
    setFormData(staff);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
        fullName: '',
        position: '',
        email: '',
        partyDate: '',
        avatarUrl: ''
    });
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setFormData(prev => ({ ...prev, avatarUrl: x.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.fullName) return alert("Vui lòng nhập họ tên cán bộ");
    
    try {
        await DatabaseService.saveStaff({
            id: isEditing && formData.id ? formData.id : '',
            fullName: formData.fullName,
            position: formData.position || '',
            email: formData.email || '',
            partyDate: formData.partyDate || '',
            avatarUrl: formData.avatarUrl || '',
            order: formData.order || staffList.length + 1
        } as StaffMember);

        resetForm();
        await loadData();
        if (refreshData) refreshData();
    } catch (error: any) {
        console.error(error);
        alert("Lỗi khi lưu cán bộ: " + error.message + "\n\nNguyên nhân thường gặp: Bảng 'staff_members' chưa được cấp quyền ghi (RLS). Vui lòng chạy lại Script SQL.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa cán bộ này?")) {
      try {
          await DatabaseService.deleteStaff(id);
          await loadData();
          if (refreshData) refreshData();
      } catch (error: any) {
          alert("Lỗi khi xóa: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded text-sm text-cyan-900">
        <strong>Module Danh sách Cán bộ:</strong> Quản lý thông tin ban giám hiệu, giáo viên và nhân viên nhà trường.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Form Section */}
         <div className="lg:col-span-1">
            <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4 transition ${isEditing ? 'border-yellow-400 ring-1 ring-yellow-400' : ''}`}>
               <h3 className={`font-bold text-gray-800 mb-4 flex items-center border-b pb-2 ${isEditing ? 'text-yellow-700' : ''}`}>
                  {isEditing ? <Edit size={20} className="mr-2"/> : <UserPlus size={20} className="mr-2 text-cyan-600"/>}
                  {isEditing ? 'Cập nhật thông tin' : 'Thêm cán bộ mới'}
               </h3>
               
               <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                      <div 
                        className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-cyan-500 bg-gray-50 relative group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                         {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            <div className="text-center text-gray-400">
                               <User size={32} className="mx-auto mb-1"/>
                               <span className="text-[10px]">Ảnh đại diện</span>
                            </div>
                         )}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <UploadCloud className="text-white"/>
                         </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-cyan-200 outline-none"
                       placeholder="Nguyễn Văn A"
                       value={formData.fullName}
                       onChange={e => setFormData({...formData, fullName: e.target.value})}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Chức vụ</label>
                     <input 
                       type="text" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-cyan-200 outline-none"
                       placeholder="Hiệu trưởng / Giáo viên..."
                       value={formData.position}
                       onChange={e => setFormData({...formData, position: e.target.value})}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Email liên hệ</label>
                     <input 
                       type="email" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-cyan-200 outline-none"
                       placeholder="email@school.edu.vn"
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Ngày vào Đảng</label>
                     <input 
                       type="date" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-cyan-200 outline-none"
                       value={formData.partyDate}
                       onChange={e => setFormData({...formData, partyDate: e.target.value})}
                     />
                  </div>

                  <div className="flex gap-2 pt-2">
                     {isEditing && (
                        <button 
                           onClick={resetForm}
                           className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition text-sm"
                        >
                           Hủy
                        </button>
                     )}
                     <button 
                        onClick={handleSave}
                        className={`flex-1 text-white font-bold py-2 rounded transition shadow flex items-center justify-center text-sm ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                     >
                        <Save size={16} className="mr-2"/> {isEditing ? 'Lưu thay đổi' : 'Thêm cán bộ'}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* List Section */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                  <span>Danh sách cán bộ ({staffList.length})</span>
               </div>
               
               {staffList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 italic">Chưa có dữ liệu cán bộ.</div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                           <tr>
                              <th className="p-4 w-16">Ảnh</th>
                              <th className="p-4">Họ và tên</th>
                              <th className="p-4">Thông tin</th>
                              <th className="p-4 text-right">Thao tác</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {staffList.map(staff => (
                              <tr key={staff.id} className="hover:bg-cyan-50 transition group">
                                 <td className="p-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                                       {staff.avatarUrl ? (
                                          <img src={staff.avatarUrl} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20}/></div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="p-4">
                                    <div className="font-bold text-gray-800">{staff.fullName}</div>
                                    <div className="text-xs text-cyan-600 font-medium flex items-center mt-1">
                                       <Briefcase size={12} className="mr-1"/> {staff.position || 'Chưa cập nhật chức vụ'}
                                    </div>
                                 </td>
                                 <td className="p-4 text-sm text-gray-600 space-y-1">
                                    {staff.email && (
                                       <div className="flex items-center text-xs">
                                          <Mail size={12} className="mr-1.5 text-gray-400"/> {staff.email}
                                       </div>
                                    )}
                                    {staff.partyDate && (
                                       <div className="flex items-center text-xs">
                                          <Calendar size={12} className="mr-1.5 text-red-400"/> Đảng: {staff.partyDate}
                                       </div>
                                    )}
                                 </td>
                                 <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                                       <button 
                                          onClick={() => handleEdit(staff)}
                                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                          title="Sửa"
                                       >
                                          <Edit size={16} />
                                       </button>
                                       <button 
                                          onClick={() => handleDelete(staff.id)}
                                          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                                          title="Xóa"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
