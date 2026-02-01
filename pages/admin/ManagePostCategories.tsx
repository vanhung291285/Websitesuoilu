
import React, { useState, useEffect } from 'react';
import { PostCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Edit, Trash2, Save, Tag, RotateCcw } from 'lucide-react';

interface ManagePostCategoriesProps {
  refreshData?: () => void;
}

const COLORS = [
  { label: 'Xanh Dương', value: 'blue', class: 'bg-blue-600' },
  { label: 'Đỏ', value: 'red', class: 'bg-red-600' },
  { label: 'Xanh Lá', value: 'green', class: 'bg-green-600' },
  { label: 'Tím', value: 'indigo', class: 'bg-indigo-600' },
  { label: 'Cam', value: 'orange', class: 'bg-orange-600' },
  { label: 'Hồng', value: 'pink', class: 'bg-pink-600' },
  { label: 'Vàng Đậm', value: 'yellow', class: 'bg-yellow-600' },
  { label: 'Xám', value: 'gray', class: 'bg-gray-600' },
  { label: 'Đen', value: 'black', class: 'bg-black' },
];

export const ManagePostCategories: React.FC<ManagePostCategoriesProps> = ({ refreshData }) => {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PostCategory>>({
    name: '',
    slug: '',
    color: 'blue',
    order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await DatabaseService.getPostCategories();
    setCategories(data);
  };

  const handleEdit = (cat: PostCategory) => {
    setFormData(cat);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
        name: '',
        slug: '',
        color: 'blue',
        order: categories.length + 1
    });
    setIsEditing(false);
  };

  const generateSlug = () => {
     if (!formData.name) return;
     const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
     setFormData(prev => ({ ...prev, slug }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return alert("Vui lòng nhập tên và mã (slug)");
    
    try {
        await DatabaseService.savePostCategory({
            id: isEditing && formData.id ? formData.id : '',
            name: formData.name,
            slug: formData.slug,
            color: formData.color || 'blue',
            order: formData.order || categories.length + 1
        } as PostCategory);

        resetForm();
        await loadData();
        if (refreshData) refreshData();
    } catch (error: any) {
        console.error(error);
        alert("Lỗi khi lưu chuyên mục: " + error.message + "\n\nNguyên nhân có thể do lỗi CSDL hoặc quyền hạn (RLS). Vui lòng kiểm tra script SQL.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("CẢNH BÁO: Xóa chuyên mục này có thể ảnh hưởng đến các bài viết đang sử dụng nó. Bạn có chắc chắn?")) {
      try {
          await DatabaseService.deletePostCategory(id);
          await loadData();
          if (refreshData) refreshData();
      } catch (error: any) {
          alert("Lỗi khi xóa: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded text-sm text-indigo-900">
        <strong>Module Chuyên mục Bài viết:</strong> Quản lý danh sách các loại tin tức (VD: Tin tức, Thông báo, Hoạt động...).
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Form Section */}
         <div className="lg:col-span-1">
            <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4 transition ${isEditing ? 'border-yellow-400 ring-1 ring-yellow-400' : ''}`}>
               <h3 className={`font-bold text-gray-800 mb-4 flex items-center border-b pb-2 ${isEditing ? 'text-yellow-700' : ''}`}>
                  {isEditing ? <Edit size={20} className="mr-2"/> : <Plus size={20} className="mr-2 text-indigo-600"/>}
                  {isEditing ? 'Cập nhật Chuyên mục' : 'Thêm Chuyên mục mới'}
               </h3>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Tên chuyên mục <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none"
                       placeholder="VD: Tin hoạt động"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       onBlur={generateSlug}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Mã định danh (Slug) <span className="text-red-500">*</span></label>
                     <div className="flex gap-2">
                         <input 
                           type="text" 
                           className="w-full border rounded p-2 text-sm bg-gray-50 text-gray-600 focus:ring-2 focus:ring-indigo-200 outline-none font-mono"
                           value={formData.slug}
                           onChange={e => setFormData({...formData, slug: e.target.value})}
                         />
                         <button onClick={generateSlug} className="p-2 border rounded hover:bg-gray-100" title="Tự động tạo">
                             <RotateCcw size={16}/>
                         </button>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Màu nhãn hiển thị</label>
                     <div className="grid grid-cols-5 gap-2">
                        {COLORS.map(c => (
                            <div 
                                key={c.value}
                                onClick={() => setFormData({...formData, color: c.value})}
                                className={`h-8 rounded cursor-pointer border-2 transition ${c.class} ${formData.color === c.value ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                title={c.label}
                            />
                        ))}
                     </div>
                     <div className="mt-1 text-xs text-gray-500">Đang chọn: <span className="font-bold uppercase">{formData.color}</span></div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Thứ tự sắp xếp</label>
                     <input 
                       type="number" 
                       className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none"
                       value={formData.order}
                       onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
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
                        className={`flex-1 text-white font-bold py-2 rounded transition shadow flex items-center justify-center text-sm ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                     >
                        <Save size={16} className="mr-2"/> {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* List Section */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                  <span>Danh sách chuyên mục ({categories.length})</span>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                        <tr>
                           <th className="p-4 w-16 text-center">TT</th>
                           <th className="p-4">Tên chuyên mục</th>
                           <th className="p-4">Mã (Slug)</th>
                           <th className="p-4">Màu sắc</th>
                           <th className="p-4 text-right">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {categories.map(cat => (
                           <tr key={cat.id} className="hover:bg-indigo-50 transition group">
                              <td className="p-4 text-center font-bold text-gray-500">{cat.order}</td>
                              <td className="p-4 font-bold text-gray-800">{cat.name}</td>
                              <td className="p-4 font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">{cat.slug}</td>
                              <td className="p-4">
                                 <span className={`text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm bg-${cat.color}-600`}>
                                    {cat.color}
                                 </span>
                              </td>
                              <td className="p-4 text-right">
                                 <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                                    <button 
                                       onClick={() => handleEdit(cat)}
                                       className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                       title="Sửa"
                                    >
                                       <Edit size={16} />
                                    </button>
                                    <button 
                                       onClick={() => handleDelete(cat.id)}
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
            </div>
         </div>
      </div>
    </div>
  );
};
