import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { DatabaseService } from '../../services/database';
import { UserPlus, Trash2, Shield, Edit } from 'lucide-react';

interface ManageUsersProps {
  refreshData: () => void;
}

export const ManageUsers: React.FC<ManageUsersProps> = ({ refreshData }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.EDITOR });

  useEffect(() => {
    DatabaseService.getUsers().then(setUsers);
  }, []);

  const handleAdd = async () => {
    // Note: This only creates a user profile entry. Actual auth user creation is complex in client-side.
    if (!newUser.username || !newUser.fullName) return alert("Thiếu thông tin");
    
    await DatabaseService.saveUser({
      id: Date.now().toString(), // Placeholder ID
      username: newUser.username!,
      fullName: newUser.fullName!,
      role: newUser.role as UserRole,
      email: newUser.username + '@school.edu.vn'
    });

    setNewUser({ role: UserRole.EDITOR, username: '', fullName: '' });
    DatabaseService.getUsers().then(setUsers);
    refreshData(); 
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa người dùng này?")) {
      await DatabaseService.deleteUser(id);
      DatabaseService.getUsers().then(setUsers);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded text-sm text-orange-800">
        <strong>Module Người dùng:</strong> Quản lý danh sách nhân sự (Hồ sơ). Việc tạo tài khoản đăng nhập thực tế cần thực hiện trong Supabase Dashboard hoặc trang đăng ký riêng.
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center"><UserPlus size={20} className="mr-2"/> Tạo hồ sơ nhân sự mới</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Tên đăng nhập (VD: gv01)" 
              className="border rounded p-2"
              value={newUser.username || ''}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Họ và tên giáo viên" 
              className="border rounded p-2"
              value={newUser.fullName || ''}
              onChange={e => setNewUser({...newUser, fullName: e.target.value})}
            />
            <select 
              className="border rounded p-2"
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            >
              <option value={UserRole.EDITOR}>Biên tập viên (Chỉ đăng bài)</option>
              <option value={UserRole.ADMIN}>Quản trị viên (Toàn quyền)</option>
            </select>
            <button onClick={handleAdd} className="bg-orange-600 text-white font-bold py-2 rounded hover:bg-orange-700">
              Tạo hồ sơ
            </button>
         </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm font-bold uppercase">
             <tr>
               <th className="p-4">Họ tên</th>
               <th className="p-4">Tài khoản</th>
               <th className="p-4">Quyền hạn</th>
               <th className="p-4 text-right">Hành động</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {users.map(u => (
               <tr key={u.id} className="hover:bg-gray-50">
                 <td className="p-4 font-medium">{u.fullName}</td>
                 <td className="p-4 text-gray-500">{u.username}</td>
                 <td className="p-4">
                   {u.role === UserRole.ADMIN 
                     ? <span className="flex items-center text-red-600 font-bold text-xs"><Shield size={14} className="mr-1"/> QUẢN TRỊ</span>
                     : <span className="text-blue-600 font-bold text-xs bg-blue-100 px-2 py-1 rounded">BIÊN TẬP</span>
                   }
                 </td>
                 <td className="p-4 text-right">
                    {u.username !== 'admin' && (
                      <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    )}
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};