
import React, { useState, useEffect } from 'react';
import { SchoolConfig, FooterLink } from '../../types';
import { DatabaseService } from '../../services/database';
import { Settings, Globe, Phone, Share2, Search, Save, Layout, Upload, Link as LinkIcon, Image as ImageIcon, FolderOpen, Palette, MessageCircle, List, Plus, Trash2, AlertCircle, RotateCcw } from 'lucide-react';

export const ManageSettings: React.FC = () => {
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'contact' | 'social' | 'display' | 'seo' | 'footer'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Footer management temp state
  const [newFooterLabel, setNewFooterLabel] = useState('');
  const [newFooterUrl, setNewFooterUrl] = useState('');

  useEffect(() => {
    DatabaseService.getConfig().then(setConfig);
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setErrorStatus(null);
    
    try {
        await DatabaseService.saveConfig(config);
        alert("Cấu hình đã được lưu thành công! Website sẽ cập nhật ngay lập tức.");
        window.location.reload(); 
    } catch (e: any) {
        console.error(e);
        const errorMsg = e.message || JSON.stringify(e);
        if (errorMsg.includes('column "footer_links" of relation "school_config" does not exist')) {
            setErrorStatus("MISSING_COLUMN");
        } else {
            alert("Lỗi khi lưu: " + errorMsg);
        }
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddFooterLink = () => {
      if (!newFooterLabel || !newFooterUrl || !config) return;
      const newLinks = [...(config.footerLinks || []), { id: Date.now().toString(), label: newFooterLabel, url: newFooterUrl }];
      setConfig({ ...config, footerLinks: newLinks });
      setNewFooterLabel('');
      setNewFooterUrl('');
  };

  const removeFooterLink = (id: string) => {
      if (!config) return;
      const newLinks = (config.footerLinks || []).filter(l => l.id !== id);
      setConfig({ ...config, footerLinks: newLinks });
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && config) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setConfig({ ...config, bannerUrl: x.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && config) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setConfig({ ...config, logoUrl: x.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && config) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setConfig({ ...config, faviconUrl: x.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!config) return <div className="p-10 text-center">Đang tải cấu hình...</div>;

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Settings },
    { id: 'home', label: 'Trang chủ', icon: Layout },
    { id: 'contact', label: 'Liên hệ', icon: Phone },
    { id: 'display', label: 'Giao diện', icon: Palette },
    { id: 'footer', label: 'Cấu hình chân trang', icon: List },
    { id: 'social', label: 'Mạng xã hội', icon: Share2 },
    { id: 'seo', label: 'Cấu hình SEO', icon: Search },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
       {/* Error Help Notification */}
       {errorStatus === 'MISSING_COLUMN' && (
         <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 text-red-700 mb-4">
               <AlertCircle size={32} />
               <h3 className="text-xl font-black uppercase">Lỗi Cơ sở dữ liệu</h3>
            </div>
            <p className="text-sm text-red-900 mb-4 leading-relaxed font-bold">
              Hệ thống chưa tìm thấy cột "footer_links" trong bảng school_config. Bạn cần vào Supabase SQL Editor và chạy đoạn mã sau để sửa lỗi:
            </p>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto relative group mb-4">
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText("ALTER TABLE school_config ADD COLUMN IF NOT EXISTS footer_links JSONB DEFAULT '[]';");
                   alert("Đã sao chép mã SQL!");
                 }}
                 className="absolute right-2 top-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold"
               >Copy</button>
               <code>
                 ALTER TABLE school_config <br/>
                 ADD COLUMN IF NOT EXISTS footer_links JSONB DEFAULT '[]';
               </code>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 shadow-md transition"
            >
              <RotateCcw size={18}/> Đã chạy xong SQL, Tải lại trang
            </button>
         </div>
       )}

       <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center mb-1">
              <Settings className="mr-3" /> Cấu hình Website
            </h2>
            <p className="text-slate-300 text-sm">Thay đổi thông tin toàn trang: Logo, Banner, Liên hệ, SEO...</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center transition transform hover:scale-105 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : <><Save className="mr-2" /> Lưu Cấu Hình</>}
          </button>
       </div>

       {/* Tabs Navigation */}
       <div className="flex overflow-x-auto bg-white rounded-t-lg border-b border-gray-200 custom-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 font-black text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
       </div>

       {/* Tab Content */}
       <div className="bg-white p-8 rounded-b-lg shadow-sm border border-t-0 border-gray-200">
          
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tên trường (Tiêu đề chính)</label>
                     <input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition" value={config.name} onChange={e => setConfig({...config, name: e.target.value})}/>
                  </div>
                  <div>
                     <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Khẩu hiệu (Slogan)</label>
                     <input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition" value={config.slogan} onChange={e => setConfig({...config, slogan: e.target.value})}/>
                  </div>
                  <div>
                     <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Hiệu trưởng / Người đại diện</label>
                     <input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition" value={config.principalName} onChange={e => setConfig({...config, principalName: e.target.value})}/>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Favicon của trang</label>
                      <div className="flex gap-3">
                         <input type="text" value={config.faviconUrl || ''} readOnly placeholder="/uploads/favicon..." className="flex-1 border-2 border-gray-100 p-2.5 rounded-xl font-mono text-xs bg-gray-50 outline-none"/>
                         <label className="bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-black cursor-pointer hover:bg-gray-50 flex items-center shadow-sm uppercase tracking-tighter">
                            <FolderOpen size={16} className="mr-2 text-yellow-600"/> Chọn file
                            <input type="file" hidden accept="image/*,.ico" onChange={handleFaviconUpload}/>
                         </label>
                      </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Logo nhà trường</label>
                  <div className="flex flex-col gap-3">
                      <input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition text-xs" placeholder="Dán URL logo..." value={config.logoUrl} onChange={e => setConfig({...config, logoUrl: e.target.value})}/>
                      <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 hover:bg-blue-50 transition cursor-pointer text-center group">
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden"/>
                          <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-600">
                              <Upload size={24} />
                              <span className="text-xs font-black uppercase">Tải ảnh từ máy</span>
                          </div>
                      </label>
                  </div>
                  {config.logoUrl && (
                    <div className="mt-2 bg-white p-3 border-2 border-gray-100 rounded-2xl inline-flex items-center justify-center min-w-[120px] h-[100px] shadow-inner">
                       <img src={config.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6 max-w-4xl">
               <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-xl text-sm text-green-800 flex items-center gap-3">
                  <MessageCircle size={20} />
                  <strong>LIÊN KẾT HỮU ÍCH:</strong> Quản lý danh sách các liên kết hiển thị ở chân trang.
               </div>

               <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-inner">
                  <h4 className="font-black text-gray-800 mb-4 flex items-center uppercase text-sm tracking-widest"><Plus size={18} className="mr-2 text-green-600"/> Thêm liên kết mới</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Tên hiển thị</label>
                        <input type="text" className="w-full border-2 border-white rounded-xl p-3 text-sm font-bold bg-white shadow-sm focus:border-green-500 outline-none" placeholder="VD: Sở GD tỉnh Điện Biên" value={newFooterLabel} onChange={e => setNewFooterLabel(e.target.value)}/>
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Đường dẫn (URL)</label>
                        <input type="text" className="w-full border-2 border-white rounded-xl p-3 text-sm font-bold bg-white shadow-sm focus:border-green-500 outline-none font-mono" placeholder="https://..." value={newFooterUrl} onChange={e => setNewFooterUrl(e.target.value)}/>
                     </div>
                     <div className="flex items-end">
                        <button onClick={handleAddFooterLink} className="w-full bg-green-600 text-white font-black py-3 rounded-xl hover:bg-green-700 transition shadow-lg uppercase text-xs active:scale-95">Thêm</button>
                     </div>
                  </div>
               </div>

               <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                        <tr>
                           <th className="p-4">Tên liên kết</th>
                           <th className="p-4">Đường dẫn</th>
                           <th className="p-4 text-right">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {(config.footerLinks || []).map(link => (
                           <tr key={link.id} className="hover:bg-slate-50/50 group">
                              <td className="p-4 font-black text-gray-700">{link.label}</td>
                              <td className="p-4 text-xs text-blue-600 font-mono truncate max-w-xs">{link.url}</td>
                              <td className="p-4 text-right">
                                 <button onClick={() => removeFooterLink(link.id)} className="text-gray-300 hover:text-red-600 p-2 rounded-full hover:bg-white shadow-sm transition-all"><Trash2 size={16}/></button>
                              </td>
                           </tr>
                        ))}
                        {(config.footerLinks || []).length === 0 && (
                           <tr><td colSpan={3} className="p-12 text-center text-gray-400 italic font-medium uppercase tracking-widest text-xs">Chưa có liên kết nào được cấu hình.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* Các tab khác giữ nguyên như cũ... */}
          {activeTab === 'home' && (
             <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between p-5 border-2 border-gray-50 rounded-2xl bg-white hover:bg-gray-50 transition">
                   <div>
                      <label className="block font-black text-gray-800 uppercase text-sm tracking-tight">Hiển thị Banner Slide (Tin nổi bật)</label>
                      <p className="text-xs text-gray-500 font-medium italic mt-1">Bật/tắt khối hình ảnh lớn (Hero Slider) ở đầu trang chủ.</p>
                   </div>
                   <input type="checkbox" checked={config.showWelcomeBanner} onChange={e => setConfig({...config, showWelcomeBanner: e.target.checked})} className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500"/>
                </div>
                <div className="flex items-center justify-between p-5 border-2 border-gray-50 rounded-2xl bg-white hover:bg-gray-50 transition">
                   <label className="block font-black text-gray-800 uppercase text-sm tracking-tight">Số lượng tin hiển thị (Khối Tin mới)</label>
                   <input type="number" className="w-24 border-2 border-gray-100 p-2.5 rounded-xl text-center font-black bg-gray-50 focus:bg-white outline-none focus:border-blue-500" value={config.homeNewsCount} onChange={e => setConfig({...config, homeNewsCount: parseInt(e.target.value) || 6})}/>
                </div>
             </div>
          )}
          
          {/* (Các phần còn lại của ManageSettings.tsx như cũ) */}
          {activeTab === 'contact' && (
             <div className="space-y-6 max-w-3xl">
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Địa chỉ trụ sở</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.address} onChange={e => setConfig({...config, address: e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Điện thoại</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})}/></div>
                  <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Hotline</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.hotline || ''} onChange={e => setConfig({...config, hotline: e.target.value})}/></div>
                </div>
             </div>
          )}

          {activeTab === 'display' && (
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                    <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Màu chủ đạo (Menu/Header)</label>
                    <input type="color" value={config.primaryColor || '#1e3a8a'} onChange={e => setConfig({...config, primaryColor: e.target.value})} className="h-14 w-full cursor-pointer rounded-xl border-4 border-white shadow-sm"/>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                    <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Màu chữ Tiêu đề Trường</label>
                    <input type="color" value={config.titleColor || '#fbbf24'} onChange={e => setConfig({...config, titleColor: e.target.value})} className="h-14 w-full cursor-pointer rounded-xl border-4 border-white shadow-sm"/>
                </div>
             </div>
          )}

          {activeTab === 'social' && (
             <div className="space-y-4 max-w-2xl">
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Facebook Fanpage</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})}/></div>
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Youtube Channel</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.youtube} onChange={e => setConfig({...config, youtube: e.target.value})}/></div>
             </div>
          )}

          {activeTab === 'seo' && (
             <div className="space-y-4 max-w-2xl">
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Tiêu đề SEO</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.metaTitle} onChange={e => setConfig({...config, metaTitle: e.target.value})}/></div>
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Mô tả SEO</label><textarea className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" rows={4} value={config.metaDescription} onChange={e => setConfig({...config, metaDescription: e.target.value})}/></div>
             </div>
          )}
       </div>
    </div>
  );
};
