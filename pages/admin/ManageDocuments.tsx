
import React, { useState, useEffect } from 'react';
import { SchoolDocument, DocumentCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Settings, List, FolderOpen, UploadCloud, FileText, CheckCircle, X, Edit, Save, ArrowUp, ArrowDown, RotateCcw, AlertCircle } from 'lucide-react';

interface ManageDocumentsProps {
  documents: SchoolDocument[];
  categories: DocumentCategory[];
  refreshData: () => void;
}

export const ManageDocuments: React.FC<ManageDocumentsProps> = ({ documents, categories, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'categories'>('docs');

  // Upload Mode State
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('link');
  
  // State for New Document
  const [newDoc, setNewDoc] = useState<Partial<SchoolDocument>>({ 
    date: new Date().toISOString().split('T')[0],
    downloadUrl: '',
    categoryId: ''
  });

  // State for Categories
  const [newCat, setNewCat] = useState<Partial<DocumentCategory>>({ name: '', slug: '', description: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  // Set default category for new doc when categories load
  useEffect(() => {
    if (categories.length > 0 && !newDoc.categoryId) {
        setNewDoc(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  // --- HELPER: Slug Generator ---
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleCatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setNewCat(prev => ({ 
          ...prev, 
          name, 
          slug: isAutoSlug ? generateSlug(name) : prev.slug 
      }));
  };

  // --- DOCUMENT HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Tăng giới hạn lên 500MB theo yêu cầu
        if (file.size > 500 * 1024 * 1024) {
            alert("File quá lớn! Vui lòng chọn file dưới 500MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (x) => {
            if (x.target?.result) {
                setNewDoc(prev => ({ 
                    ...prev, 
                    downloadUrl: x.target!.result as string,
                    title: prev.title || file.name.split('.')[0]
                }));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddDoc = async () => {
    if (!newDoc.title || !newDoc.number) {
      alert("Vui lòng nhập Số hiệu và Trích yếu.");
      return;
    }
    if (!newDoc.categoryId) {
        alert("Vui lòng chọn loại văn bản.");
        return;
    }
    if (!newDoc.downloadUrl) {
        alert("Vui lòng cung cấp đường dẫn tài liệu hoặc tải file lên.");
        return;
    }

    const doc: SchoolDocument = {
      id: '', 
      number: newDoc.number!,
      title: newDoc.title!,
      date: newDoc.date!,
      categoryId: newDoc.categoryId,
      downloadUrl: newDoc.downloadUrl
    };
    
    try {
        await DatabaseService.saveDocument(doc);
        setNewDoc({ 
            categoryId: categories[0]?.id || '', 
            date: new Date().toISOString().split('T')[0], 
            title: '', 
            number: '', 
            downloadUrl: '' 
        });
        refreshData();
        alert("Lưu văn bản thành công!");
    } catch (e: any) {
        console.error(e);
        alert("Lỗi khi lưu văn bản: " + (e.message || e));
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm("Xóa văn bản này?")) {
      await DatabaseService.deleteDocument(id);
      refreshData();
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCat = async () => {
    if (!newCat.name || !newCat.slug) return alert("Vui lòng nhập tên và mã định danh");
    
    try {
        const currentOrders = categories.map(c => c.order || 0);
        const maxOrder = currentOrders.length > 0 ? Math.max(...currentOrders) : 0;
        
        await DatabaseService.saveDocCategory({
            id: editingCatId ? editingCatId : '',
            name: newCat.name,
            slug: newCat.slug,
            description: newCat.description || '',
            order: editingCatId 
                ? (categories.find(c => c.id === editingCatId)?.order || 0) 
                : maxOrder + 1
        });

        setNewCat({ name: '', slug: '', description: '' });
        setEditingCatId(null);
        setIsAutoSlug(true);
        refreshData();
    } catch (error: any) {
        alert("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const handleEditCat = (cat: DocumentCategory) => {
    setNewCat({ name: cat.name, slug: cat.slug, description: cat.description });
    setEditingCatId(cat.id);
    setIsAutoSlug(false);
  };

  const handleCancelEditCat = () => {
    setNewCat({ name: '', slug: '', description: '' });
    setEditingCatId(null);
    setIsAutoSlug(true);
  };

  const handleDeleteCat = async (id: string) => {
      const hasDocs = documents.some(d => d.categoryId === id);
      if (hasDocs) return alert("Không thể xóa danh mục này vì đang chứa tài liệu.");
      
      if (confirm("Bạn chắc chắn muốn xóa?")) {
          await DatabaseService.deleteDocCategory(id);
          refreshData();
      }
  };

  const handleMoveCat = async (cat: DocumentCategory, direction: 'up' | 'down') => {
      const sortedCats = [...categories].sort((a,b) => (a.order || 0) - (b.order || 0));
      const index = sortedCats.findIndex(c => c.id === cat.id);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === sortedCats.length - 1) return;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = sortedCats[index];
      sortedCats[index] = sortedCats[targetIndex];
      sortedCats[targetIndex] = temp;
      const reorderedCats = sortedCats.map((c, idx) => ({ ...c, order: idx + 1 }));
      await DatabaseService.saveDocCategoriesOrder(reorderedCats);
      refreshData();
  };

  const displayCategories = [...categories].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded text-sm text-blue-900 flex justify-between items-center shadow-sm">
         <div>
            <strong>Module Văn bản & Tài liệu:</strong> Quản lý hồ sơ công khai trên cổng thông tin. (Hỗ trợ file lên tới 500MB)
         </div>
         <div className="flex space-x-2 bg-white p-1 rounded border border-blue-100">
            <button onClick={() => setActiveTab('docs')} className={`px-3 py-1.5 rounded text-xs font-bold flex items-center transition ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}><List size={14} className="mr-1"/> Danh sách</button>
            <button onClick={() => setActiveTab('categories')} className={`px-3 py-1.5 rounded text-xs font-bold flex items-center transition ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}><Settings size={14} className="mr-1"/> Danh mục</button>
         </div>
      </div>

      {activeTab === 'docs' && (
      <>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center border-b pb-2"><Plus size={20} className="mr-2 text-blue-600"/> Thêm văn bản mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Loại văn bản <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900" value={newDoc.categoryId} onChange={e => setNewDoc({...newDoc, categoryId: e.target.value})}>
                        <option value="">-- Chọn loại --</option>
                        {displayCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Số hiệu</label>
                    <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" placeholder="VD: 123/QĐ-BGH" value={newDoc.number || ''} onChange={e => setNewDoc({...newDoc, number: e.target.value})}/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Ngày ban hành</label>
                    <input type="date" className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" value={newDoc.date} onChange={e => setNewDoc({...newDoc, date: e.target.value})}/>
                </div>
                <div className="md:col-span-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-gray-900">Nguồn tài liệu</label>
                        <div className="flex text-xs border rounded overflow-hidden">
                            <button onClick={() => setUploadMode('link')} className={`px-3 py-1 ${uploadMode === 'link' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>Link</button>
                            <button onClick={() => setUploadMode('file')} className={`px-3 py-1 ${uploadMode === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>Tải file</button>
                        </div>
                    </div>
                    {uploadMode === 'link' ? (
                        <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" placeholder="https://..." value={newDoc.downloadUrl || ''} onChange={e => setNewDoc({...newDoc, downloadUrl: e.target.value})}/>
                    ) : (
                        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer ${newDoc.downloadUrl?.startsWith('data:') ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-blue-50'}`}>
                            {newDoc.downloadUrl?.startsWith('data:') ? <CheckCircle className="text-green-500"/> : <UploadCloud className="text-gray-400"/>}
                            <span className="text-xs mt-1">{newDoc.downloadUrl?.startsWith('data:') ? 'Đã chọn file' : 'Nhấn để chọn file (Max 500MB)'}</span>
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} />
                        </label>
                    )}
                </div>
                <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Trích yếu nội dung (Tiêu đề)</label>
                    <input type="text" className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white" placeholder="Nhập tên văn bản..." value={newDoc.title || ''} onChange={e => setNewDoc({...newDoc, title: e.target.value})}/>
                </div>
                <div className="md:col-span-4 flex justify-end">
                    <button onClick={handleAddDoc} className="bg-blue-700 text-white font-bold py-2.5 px-8 rounded hover:bg-blue-800 shadow flex items-center"><Save size={18} className="mr-2"/> Lưu văn bản</button>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-900 font-bold uppercase text-xs border-b">
                    <tr><th className="p-4">Loại</th><th className="p-4">Số hiệu</th><th className="p-4">Trích yếu</th><th className="p-4">Nguồn</th><th className="p-4 text-right">Xóa</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-blue-50">
                            <td className="p-4 text-xs font-bold text-gray-500 uppercase">{categories.find(c => c.id === doc.categoryId)?.name || 'Khác'}</td>
                            <td className="p-4 font-mono text-sm font-semibold">{doc.number}</td>
                            <td className="p-4 font-bold text-gray-800">{doc.title}</td>
                            <td className="p-4 text-center">
                                {doc.downloadUrl && doc.downloadUrl !== '#' && <a href={doc.downloadUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center justify-center"><ExternalLink size={14}/></a>}
                            </td>
                            <td className="p-4 text-right"><button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </>
      )}

      {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg shadow-sm border h-fit sticky top-4 ${editingCatId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
                  <h3 className="font-bold mb-4 border-b pb-2 flex items-center">{editingCatId ? <Edit size={18} className="mr-2"/> : <Plus size={18} className="mr-2"/>} {editingCatId ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                  <div className="space-y-4">
                      <div><label className="block text-sm font-bold text-gray-900 mb-1">Tên danh mục</label><input type="text" className="w-full border p-2 rounded text-sm bg-white" value={newCat.name} onChange={handleCatNameChange}/></div>
                      <div><label className="block text-sm font-bold text-gray-900 mb-1">Mã (Slug)</label><input type="text" className="w-full border p-2 rounded text-sm bg-white font-mono" value={newCat.slug} onChange={e => setNewCat({...newCat, slug: e.target.value})} readOnly={isAutoSlug}/></div>
                      <div className="flex gap-2 pt-2">
                          {editingCatId && <button onClick={handleCancelEditCat} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded">Hủy</button>}
                          <button onClick={handleSaveCat} className={`flex-1 text-white font-bold py-2 rounded flex items-center justify-center ${editingCatId ? 'bg-yellow-600' : 'bg-blue-600'}`}>{editingCatId ? 'Lưu' : 'Thêm'}</button>
                      </div>
                  </div>
              </div>
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b">
                          <tr><th className="p-3 w-12 text-center">STT</th><th className="p-3">Tên</th><th className="p-3 text-right">Thao tác</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {displayCategories.map((cat, index) => (
                              <tr key={cat.id} className="hover:bg-gray-50 transition">
                                  <td className="p-3 text-center text-xs font-bold text-gray-400">{index + 1}</td>
                                  <td className="p-3 font-bold text-blue-900">{cat.name}</td>
                                  <td className="p-3 text-right flex justify-end gap-2">
                                      <div className="flex flex-col border-r pr-2">
                                          <button onClick={() => handleMoveCat(cat, 'up')} disabled={index === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-20"><ArrowUp size={14}/></button>
                                          <button onClick={() => handleMoveCat(cat, 'down')} disabled={index === categories.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-20"><ArrowDown size={14}/></button>
                                      </div>
                                      <button onClick={() => handleEditCat(cat)} className="text-yellow-600"><Edit size={16} /></button>
                                      <button onClick={() => handleDeleteCat(cat.id)} className="text-red-500"><Trash2 size={16} /></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};
