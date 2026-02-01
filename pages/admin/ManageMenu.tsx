
import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { DatabaseService } from '../../services/database';
import { List, Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Loader2 } from 'lucide-react';

interface ManageMenuProps {
   refreshData: (showLoader?: boolean) => void;
}

export const ManageMenu: React.FC<ManageMenuProps> = ({ refreshData }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for new item
  const [newLabel, setNewLabel] = useState('');
  const [newPathType, setNewPathType] = useState<'internal' | 'external'>('internal');
  const [newPath, setNewPath] = useState('home');
  const [newExternalUrl, setNewExternalUrl] = useState('');

  useEffect(() => {
     loadMenu();
  }, []);

  const loadMenu = async () => {
      setIsLoading(true);
      try {
        const items = await DatabaseService.getMenu();
        setMenuItems(items.sort((a,b) => a.order - b.order));
      } catch (e) {
        console.error("Lỗi tải menu:", e);
      } finally {
        setIsLoading(false);
      }
  };

  const systemPaths = [
     { label: 'Trang chủ', path: 'home' },
     { label: 'Giới thiệu', path: 'intro' },
     { label: 'Đội ngũ Giáo viên', path: 'staff' }, 
     { label: 'Tin tức & Sự kiện', path: 'news' },
     { label: 'Văn bản - Hồ sơ', path: 'documents' },
     { label: 'Tài liệu học tập', path: 'resources' },
     { label: 'Thư viện ảnh', path: 'gallery' },
     { label: 'Liên hệ', path: 'contact' },
  ];

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
        await DatabaseService.saveMenu(menuItems);
        await loadMenu(); // Reload để lấy ID thật từ DB
        refreshData(false);
        alert("Đã lưu cấu hình Menu thành công!");
    } catch (e) {
        alert("Lỗi khi lưu menu. Vui lòng thử lại.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleAdd = async () => {
     if (!newLabel) return alert("Vui lòng nhập tên Menu");
     
     const path = newPathType === 'internal' ? newPath : newExternalUrl;
     if (!path) return alert("Vui lòng nhập/chọn đường dẫn");

     const maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.order)) : 0;
     const newItem: MenuItem = {
        id: `menu_${Date.now()}`, // ID tạm thời
        label: newLabel,
        path: path,
        order: maxOrder + 1
     };

     const updatedList = [...menuItems, newItem];
     setMenuItems(updatedList);
     
     setIsSaving(true);
     try {
         await DatabaseService.saveMenu(updatedList);
         await loadMenu(); // Tải lại để thay ID tạm thời bằng ID thật từ UUID
         refreshData(false);
         setNewLabel('');
         setNewExternalUrl('');
         alert("Đã thêm Menu mới!");
     } catch (e) {
         alert("Lỗi khi thêm menu.");
     } finally {
         setIsSaving(false);
     }
  };

  const handleDelete = async (id: string) => {
     if (confirm("Bạn có chắc chắn muốn xóa menu này?")) {
        try {
            await DatabaseService.deleteMenu(id);
            await loadMenu();
            refreshData(false);
        } catch (e) {
            alert("Lỗi khi xóa menu.");
        }
     }
  };

  const handleChange = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === menuItems.length - 1) return;

      const newItems = [...menuItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      
      const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      setMenuItems(reordered);
      
      await DatabaseService.saveMenu(reordered);
      refreshData(false);
  };

  return (
    <div className="space-y-6">
       <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded text-sm text-teal-800">
        <strong>Module Menu:</strong> Thêm, xóa, sắp xếp các mục hiển thị trên thanh điều hướng chính.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* LEFT COLUMN: ADD NEW */}
         <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <Plus size={20} className="mr-2 text-teal-600"/> Thêm Menu Mới
               </h3>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Tên hiển thị</label>
                     <input 
                       type="text" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                       placeholder="VD: Tuyển sinh"
                       value={newLabel}
                       onChange={e => setNewLabel(e.target.value)}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Loại liên kết</label>
                     <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                           <input 
                              type="radio" 
                              name="pathType" 
                              className="mr-2"
                              checked={newPathType === 'internal'}
                              onChange={() => setNewPathType('internal')}
                           />
                           <span className="text-sm">Trang trong hệ thống</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                           <input 
                              type="radio" 
                              name="pathType" 
                              className="mr-2"
                              checked={newPathType === 'external'}
                              onChange={() => setNewPathType('external')}
                           />
                           <span className="text-sm">Liên kết ngoài</span>
                        </label>
                     </div>
                  </div>

                  {newPathType === 'internal' ? (
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Chọn trang đích</label>
                        <select 
                           className="w-full border rounded p-2 text-sm bg-white"
                           value={newPath}
                           onChange={e => setNewPath(e.target.value)}
                        >
                           {systemPaths.map(p => (
                              <option key={p.path} value={p.path}>{p.label}</option>
                           ))}
                        </select>
                     </div>
                  ) : (
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Đường dẫn (URL)</label>
                        <input 
                           type="text" 
                           className="w-full border rounded p-2 text-sm bg-white"
                           placeholder="https://google.com..."
                           value={newExternalUrl}
                           onChange={e => setNewExternalUrl(e.target.value)}
                        />
                     </div>
                  )}

                  <button 
                     onClick={handleAdd}
                     disabled={isSaving}
                     className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-700 transition shadow disabled:opacity-50 flex items-center justify-center"
                  >
                     {isSaving ? <Loader2 className="animate-spin mr-2" size={16}/> : <Plus className="mr-2" size={16}/>}
                     Thêm và Lưu
                  </button>
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN: LIST & SORT */}
         <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-gray-800 flex items-center"><List size={20} className="mr-2 text-teal-600"/> Cấu trúc Menu hiện tại</h3>
                  <button 
                    onClick={handleSaveAll} 
                    disabled={isSaving}
                    className="bg-blue-700 text-white px-4 py-2 rounded font-bold flex items-center hover:bg-blue-800 text-sm shadow disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save size={16} className="mr-2" />} 
                     Cập nhật tên/link
                  </button>
               </div>

               {isLoading ? <div className="p-4 text-center"><Loader2 className="animate-spin inline"/> Đang tải...</div> : (
               <div className="space-y-2">
                  {menuItems.length === 0 && <p className="text-gray-500 italic text-center py-4">Chưa có menu nào.</p>}
                  
                  {menuItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 border rounded hover:bg-white hover:shadow transition group">
                       <div className="flex flex-col gap-1">
                          <button onClick={() => moveItem(index, 'up')} className="text-gray-400 hover:text-blue-600 p-0.5"><ArrowUp size={14}/></button>
                          <button onClick={() => moveItem(index, 'down')} className="text-gray-400 hover:text-blue-600 p-0.5"><ArrowDown size={14}/></button>
                       </div>
                       
                       <div className="w-8 h-8 flex items-center justify-center bg-teal-100 text-teal-800 rounded font-bold text-sm">
                          {index + 1}
                       </div>

                       <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                             <input 
                               type="text" 
                               value={item.label} 
                               onChange={e => handleChange(item.id, 'label', e.target.value)}
                               className="w-full border rounded p-1.5 text-sm font-bold text-gray-800 bg-white focus:ring-1 focus:ring-teal-500"
                             />
                          </div>
                          <div className="flex items-center gap-2">
                             <input 
                               type="text" 
                               value={item.path} 
                               onChange={e => handleChange(item.id, 'path', e.target.value)}
                               className="w-full border rounded p-1.5 text-xs bg-gray-100 text-gray-600 font-mono"
                               title="Đường dẫn đích"
                             />
                             {item.path.startsWith('http') && <ExternalLink size={14} className="text-gray-400"/>}
                          </div>
                       </div>

                       <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded">
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))}
               </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
