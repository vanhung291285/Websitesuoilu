
import React, { useState, useEffect } from 'react';
import { DisplayBlock, PostCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, Eye, EyeOff, Layers, Hash, CheckCircle2, Palette } from 'lucide-react';

export const ManageBlocks: React.FC = () => {
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  
  const [newBlock, setNewBlock] = useState<Partial<DisplayBlock>>({
    type: 'grid',
    position: 'main',
    itemCount: 4,
    isVisible: true,
    targetPage: 'all',
    htmlContent: 'all',
    customColor: '#1e3a8a',
    customTextColor: '#1e3a8a'
  });
  
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState('');
  const [tempItemCount, setTempItemCount] = useState<number>(0);
  const [tempCustomColor, setTempCustomColor] = useState('#1e3a8a');
  const [tempTextColor, setTempTextColor] = useState('#1e3a8a');

  const getCategoryOptions = () => {
      const systemOptions = [
        { id: 'all', name: 'TẤT CẢ (MỚI NHẤT)' },
        { id: 'featured', name: '★ TIN NỔI BẬT (TIÊU ĐIỂM)' },
      ];
      const dynamicOptions = categories.map(c => ({ id: c.slug, name: c.name.toUpperCase() }));
      return [...systemOptions, ...dynamicOptions];
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      const [blks, cats] = await Promise.all([
          DatabaseService.getBlocks(),
          DatabaseService.getPostCategories()
      ]);
      setBlocks(blks.sort((a, b) => a.order - b.order));
      setCategories(cats);
  };

  const handleTypeChange = (type: string) => {
      let name = newBlock.name;
      let position = newBlock.position;
      if (type === 'video') {
          name = 'VIDEO HOẠT ĐỘNG';
          position = 'sidebar';
      }
      setNewBlock({ ...newBlock, type: type as any, name, position });
  };

  const handleAdd = async () => {
    if (!newBlock.name) return alert("Vui lòng nhập tên khối");
    const samePosBlocks = blocks.filter(b => b.position === newBlock.position);
    const maxOrder = samePosBlocks.length > 0 ? Math.max(...samePosBlocks.map(b => b.order)) : 0;

    const block: DisplayBlock = {
      id: `block_${Date.now()}`,
      name: newBlock.name!,
      position: newBlock.position as any,
      type: newBlock.type as any,
      order: maxOrder + 1,
      itemCount: newBlock.itemCount || 4,
      isVisible: true,
      targetPage: newBlock.targetPage as any || 'all',
      htmlContent: newBlock.type === 'html' ? '<p>Nội dung...</p>' : (newBlock.htmlContent || 'all'),
      customColor: newBlock.customColor || '#1e3a8a',
      customTextColor: newBlock.customTextColor || '#1e3a8a'
    };
    
    await DatabaseService.saveBlock(block);
    await loadData();
    setNewBlock({ type: 'grid', position: 'main', itemCount: 4, isVisible: true, name: '', targetPage: 'all', htmlContent: 'all', customColor: '#1e3a8a', customTextColor: '#1e3a8a' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa khối này?")) {
      await DatabaseService.deleteBlock(id);
      await loadData();
    }
  };

  const toggleVisibility = async (id: string) => {
    const updatedBlocks = blocks.map(b => 
      b.id === id ? { ...b, isVisible: !b.isVisible } : b
    );
    const blockToUpdate = updatedBlocks.find(b => b.id === id);
    if (blockToUpdate) await DatabaseService.saveBlock(blockToUpdate);
    setBlocks(updatedBlocks);
  };

  const handleMove = async (block: DisplayBlock, direction: 'up' | 'down') => {
    const samePosBlocks = blocks
        .filter(b => b.position === block.position)
        .sort((a, b) => a.order - b.order);

    const index = samePosBlocks.findIndex(b => b.id === block.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === samePosBlocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [samePosBlocks[index], samePosBlocks[targetIndex]] = [samePosBlocks[targetIndex], samePosBlocks[index]];
    samePosBlocks.forEach((b, idx) => { b.order = idx + 1; });

    const otherBlocks = blocks.filter(b => b.position !== block.position);
    setBlocks([...otherBlocks, ...samePosBlocks]);
    await DatabaseService.saveBlocksOrder(samePosBlocks);
  };

  const startEditContent = (block: DisplayBlock) => {
     setEditingContentId(block.id);
     setTempContent(block.htmlContent || 'all');
     setTempItemCount(block.itemCount || 5);
     setTempCustomColor(block.customColor || '#1e3a8a');
     setTempTextColor(block.customTextColor || '#1e3a8a');
  };

  const saveContent = async (block: DisplayBlock) => {
     const updatedBlock = { 
        ...block, 
        htmlContent: tempContent,
        itemCount: tempItemCount,
        customColor: tempCustomColor,
        customTextColor: tempTextColor
     };
     await DatabaseService.saveBlock(updatedBlock);
     await loadData();
     setEditingContentId(null);
  };

  const getCategoryName = (slug?: string) => {
      const options = getCategoryOptions();
      const cat = options.find(c => c.id === slug);
      return cat ? cat.name : 'TẤT CẢ';
  };

  const renderBlockList = (position: 'main' | 'sidebar', title: string) => {
      const filteredBlocks = blocks
        .filter(b => b.position === position)
        .sort((a, b) => a.order - b.order);

      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full font-sans">
            <h4 className="font-bold text-gray-700 mb-3 uppercase text-sm border-b pb-2 flex justify-between items-center tracking-tight">
                {title}
                <span className="text-[10px] font-normal text-gray-400 lowercase">{filteredBlocks.length} khối</span>
            </h4>
            <div className="space-y-4">
               {filteredBlocks.map((block, index) => (
                 <div key={block.id} className={`flex flex-col border rounded-xl transition-all duration-200 ${!block.isVisible ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between p-4 pb-2">
                       <div className="flex items-center space-x-3 overflow-hidden">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${block.isVisible ? 'bg-blue-100 text-blue-700' : 'bg-gray-300 text-gray-600'}`}>{index + 1}</span>
                          <div className="min-w-0">
                             <p className={`font-black text-sm uppercase tracking-tight ${!block.isVisible ? 'text-gray-400 line-through' : 'text-[#1e293b]'}`}>{block.name}</p>
                             <div className="text-[9px] font-black text-gray-400 flex flex-wrap gap-1.5 mt-1 uppercase">
                                <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-500">{block.type}</span>
                                <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                     {getCategoryName(block.htmlContent)}
                                </span>
                                <span className="flex items-center text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    # {block.itemCount}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: block.customColor }}></span>
                                    <span className="w-2 h-2 rounded-full border" style={{ backgroundColor: block.customTextColor }}></span>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center space-x-1 shrink-0">
                          <button onClick={() => toggleVisibility(block.id)} className={`p-1.5 rounded-full transition ${block.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>{block.isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                          <button onClick={() => handleMove(block, 'up')} disabled={index === 0} className="p-1.5 text-gray-300 hover:text-blue-600 disabled:opacity-30"><ArrowUp size={18}/></button>
                          <button onClick={() => handleMove(block, 'down')} disabled={index === filteredBlocks.length - 1} className="p-1.5 text-gray-300 hover:text-blue-600 disabled:opacity-30"><ArrowDown size={18}/></button>
                          <button onClick={() => handleDelete(block.id)} className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                       </div>
                    </div>

                    <div className="px-4 pb-4">
                      {editingContentId === block.id ? (
                        <div className="mt-2 bg-[#f4f7ff] p-5 rounded-xl border border-blue-100 animate-fade-in shadow-inner">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-[#1e40af] block mb-1 uppercase tracking-wider">NGUỒN TIN:</label>
                                        <select 
                                            className="w-full p-2.5 text-xs border border-blue-200 rounded-lg bg-white text-gray-800 outline-none font-bold"
                                            value={tempContent} 
                                            onChange={e => setTempContent(e.target.value)}
                                        >
                                            {getCategoryOptions().map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                         <label className="text-[10px] font-black text-[#1e40af] block mb-1 uppercase tracking-wider">SỐ LƯỢNG:</label>
                                         <input 
                                            type="number" 
                                            className="w-full p-2.5 text-xs border border-blue-200 rounded-lg bg-white text-gray-900 font-black outline-none"
                                            value={tempItemCount}
                                            onChange={e => setTempItemCount(parseInt(e.target.value))}
                                         />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3 border-blue-100">
                                    <div>
                                        <label className="text-[10px] font-black text-[#1e40af] block mb-1 uppercase tracking-wider">MÀU THANH DỌC & GẠCH CHÂN:</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={tempCustomColor} onChange={e => setTempCustomColor(e.target.value)} className="w-10 h-10 border-0 p-0 cursor-pointer rounded-lg bg-transparent"/>
                                            <input type="text" value={tempCustomColor} onChange={e => setTempCustomColor(e.target.value)} className="flex-1 p-2 text-xs border border-blue-100 rounded bg-white font-mono uppercase"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-[#1e40af] block mb-1 uppercase tracking-wider">MÀU CHỮ TIÊU ĐỀ KHỐI:</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={tempTextColor} onChange={e => setTempTextColor(e.target.value)} className="w-10 h-10 border-0 p-0 cursor-pointer rounded-lg bg-transparent"/>
                                            <input type="text" value={tempTextColor} onChange={e => setTempTextColor(e.target.value)} className="flex-1 p-2 text-xs border border-blue-100 rounded bg-white font-mono uppercase"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end items-center gap-6 pt-3 border-t border-blue-200/40 mt-3">
                                    <button onClick={() => setEditingContentId(null)} className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition">Hủy</button>
                                    <button onClick={() => saveContent(block)} className="bg-[#2563eb] text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase flex items-center hover:bg-blue-700 active:scale-95 transition-all">
                                        <Check size={14} className="mr-2 stroke-[3]"/> LƯU THAY ĐỔI
                                    </button>
                                </div>
                            </div>
                        </div>
                      ) : (
                        <button 
                            onClick={() => startEditContent(block)} 
                            className="flex items-center text-[10px] font-black text-gray-400 hover:text-blue-600 py-2 border-t border-gray-50 w-full mt-2 transition-colors uppercase tracking-widest"
                        >
                            <Palette size={12} className="mr-2"/> Hiệu chỉnh Nội dung & Màu sắc
                        </button>
                      )}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 font-sans">
       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl text-sm text-blue-800 shadow-sm flex items-center">
        <CheckCircle2 size={20} className="mr-3 shrink-0" />
        <div>
            <strong>Hướng dẫn:</strong> Bạn có thể tùy chỉnh màu sắc thanh dọc và màu chữ cho từng khối hiển thị giống hệt giao diện thực tế.
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
         <h3 className="font-black text-gray-800 mb-6 flex items-center text-lg uppercase tracking-tight">
            <Plus size={22} className="mr-2 text-blue-600"/> Tạo khối hiển thị mới
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
               <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Tên khối</label>
               <input type="text" value={newBlock.name || ''} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="VD: TIN TỨC-SỰ KIỆN"/>
            </div>
            <div>
               <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Vị trí</label>
               <select className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white outline-none font-bold" value={newBlock.position} onChange={e => setNewBlock({...newBlock, position: e.target.value as any})}>
                 <option value="main">Cột chính</option>
                 <option value="sidebar">Cột phải</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Kiểu mẫu</label>
               <select className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white outline-none font-bold" value={newBlock.type} onChange={e => handleTypeChange(e.target.value)}>
                 <option value="grid">Lưới tin</option>
                 <option value="hero">Slide lớn</option>
                 <option value="list">Danh sách</option>
                 <option value="highlight">Tiêu điểm</option>
                 <option value="video">Video</option>
                 <option value="docs">Văn bản</option>
                 <option value="stats">Thống kê</option>
               </select>
            </div>
            <div className="flex items-end">
               <button onClick={handleAdd} className="w-full bg-blue-700 text-white font-black py-3 rounded-xl hover:bg-blue-800 text-xs uppercase shadow-lg transition transform active:scale-95">Thêm khối</button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
         {renderBlockList('main', 'Cấu trúc cột Chính')}
         {renderBlockList('sidebar', 'Cấu trúc cột Phải')}
      </div>
    </div>
  );
};
