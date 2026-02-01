
import React, { useState, useEffect, useRef } from 'react';
import { IntroductionArticle } from '../../types';
import { DatabaseService } from '../../services/database';
import { 
  Plus, Edit, Trash2, Save, Image, Bold, Italic, List, Type, 
  UploadCloud, ArrowUp, ArrowDown
} from 'lucide-react';

interface ManageIntroProps {
  refreshData?: () => void;
}

export const ManageIntro: React.FC<ManageIntroProps> = ({ refreshData }) => {
  const [intros, setIntros] = useState<IntroductionArticle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIntro, setCurrentIntro] = useState<Partial<IntroductionArticle>>({});
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await DatabaseService.getIntroductions();
    setIntros(data);
  };

  const handleCreate = () => {
    setCurrentIntro({
      title: '',
      slug: '',
      content: '',
      imageUrl: '',
      order: intros.length + 1,
      isVisible: true
    });
    setIsEditing(true);
  };

  const handleEdit = (item: IntroductionArticle) => {
    setCurrentIntro(item);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!currentIntro.title) return alert("Vui lòng nhập tiêu đề");
    
    // Better slug generation
    const slug = currentIntro.slug || currentIntro.title.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    try {
        await DatabaseService.saveIntroduction({
            id: currentIntro.id ? currentIntro.id : '', // DB handles new ID
            title: currentIntro.title,
            slug: slug,
            content: currentIntro.content || '',
            imageUrl: currentIntro.imageUrl || '',
            order: currentIntro.order || 1,
            isVisible: currentIntro.isVisible !== undefined ? currentIntro.isVisible : true
        });

        setIsEditing(false);
        loadData();
        if (refreshData) refreshData();
    } catch (error: any) {
        console.error("Save error:", error);
        let msg = error.message || error;
        if (typeof msg === 'string' && (msg.includes('order_index') || msg.includes('column'))) {
             msg = "Lỗi CSDL: Bảng 'school_introductions' thiếu cột 'order_index'. Vui lòng chạy lại script SQL mới nhất trên Supabase để sửa lỗi này.";
        }
        alert("Lỗi: " + msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa mục giới thiệu này?")) {
      await DatabaseService.deleteIntroduction(id);
      loadData();
      if (refreshData) refreshData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setCurrentIntro(prev => ({ ...prev, imageUrl: x.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- EDITOR FUNCTIONS (Simple) ---
  const insertTag = (startTag: string, endTag: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + startTag + selection + endTag + after;
    setCurrentIntro(prev => ({ ...prev, content: newText }));

    // Restore focus
    setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + startTag.length + selection.length + endTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertImageToContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (x) => {
      if (x.target?.result) {
        const imgTag = `<img src="${x.target.result}" style="width: 100%; border-radius: 8px; margin: 10px 0;" alt="Image"/>`;
        insertTag(imgTag);
      }
    };
    reader.readAsDataURL(file);
  };

  const EditorToolbar = () => (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b border-gray-300 sticky top-0 z-10 text-gray-700">
       <button onClick={() => insertTag('<b>', '</b>')} className="p-1.5 hover:bg-gray-200 rounded" title="In đậm"><Bold size={16}/></button>
       <button onClick={() => insertTag('<i>', '</i>')} className="p-1.5 hover:bg-gray-200 rounded" title="In nghiêng"><Italic size={16}/></button>
       <button onClick={() => insertTag('<h3>', '</h3>')} className="p-1.5 hover:bg-gray-200 rounded" title="Tiêu đề H3"><Type size={16}/></button>
       <button onClick={() => insertTag('<p>', '</p>')} className="p-1.5 hover:bg-gray-200 rounded" title="Đoạn văn">P</button>
       <button onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} className="p-1.5 hover:bg-gray-200 rounded" title="Danh sách"><List size={16}/></button>
       <label className="p-1.5 hover:bg-gray-200 rounded cursor-pointer" title="Chèn ảnh vào bài">
          <Image size={16}/>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                    insertImageToContent(e.target.files[0]);
                    e.target.value = ''; // Reset input
                }
            }} 
          />
       </label>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-gray-900">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded text-sm text-indigo-900 flex justify-between items-center">
            <div>
                <strong>Module Giới thiệu:</strong> Quản lý các bài viết trong trang "Giới thiệu" (Ví dụ: Tổng quan, Lịch sử, Thành tích...).
            </div>
            {!isEditing && (
                <button onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 flex items-center shadow-sm">
                    <Plus size={18} className="mr-2"/> Thêm mục mới
                </button>
            )}
        </div>

        {isEditing ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{currentIntro.id ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-600">Hủy</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center shadow-sm"><Save size={18} className="mr-2"/> Lưu lại</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-gray-900"
                                value={currentIntro.title} 
                                onChange={e => setCurrentIntro({...currentIntro, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung chi tiết</label>
                            <div className="border border-gray-300 rounded overflow-hidden">
                                <EditorToolbar />
                                <textarea 
                                    ref={editorRef} 
                                    rows={15} 
                                    className="w-full p-4 focus:outline-none bg-white text-gray-900 font-sans"
                                    value={currentIntro.content || ''}
                                    onChange={e => setCurrentIntro({...currentIntro, content: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Hình ảnh đại diện</label>
                            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:bg-gray-50 cursor-pointer relative bg-white" onClick={() => document.getElementById('intro-img')?.click()}>
                                {currentIntro.imageUrl ? (
                                    <img src={currentIntro.imageUrl} className="w-full h-auto rounded" alt="Preview"/>
                                ) : (
                                    <div className="py-8 text-gray-400">
                                        <UploadCloud size={32} className="mx-auto mb-2"/>
                                        <span className="text-sm">Tải ảnh lên</span>
                                    </div>
                                )}
                                <input id="intro-img" type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Thứ tự hiển thị</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900"
                                value={currentIntro.order || 0}
                                onChange={e => setCurrentIntro({...currentIntro, order: parseInt(e.target.value)})}
                            />
                         </div>
                         <div>
                             <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50 bg-white">
                                 <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-indigo-600"
                                    checked={currentIntro.isVisible}
                                    onChange={e => setCurrentIntro({...currentIntro, isVisible: e.target.checked})}
                                 />
                                 <span className="text-sm font-bold text-gray-700">Hiển thị bài viết này</span>
                             </label>
                         </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th className="p-4 w-16 text-center">STT</th>
                            <th className="p-4">Tiêu đề</th>
                            <th className="p-4 w-32 text-center">Hiển thị</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {intros.map((item) => (
                            <tr key={item.id} className="hover:bg-indigo-50 transition">
                                <td className="p-4 text-center font-bold text-indigo-600">{item.order}</td>
                                <td className="p-4 font-bold text-gray-800">{item.title}</td>
                                <td className="p-4 text-center">
                                    {item.isVisible ? (
                                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded border border-green-200">Hiện</span>
                                    ) : (
                                        <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded border border-gray-200">Ẩn</span>
                                    )}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Sửa"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded" title="Xóa"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                        {intros.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">Chưa có bài viết giới thiệu nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};
