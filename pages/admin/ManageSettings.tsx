
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
            <div className="space-y-8">
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
                                  <span className="text-xs font-black uppercase">Tải logo từ máy</span>
                              </div>
                          </label>
                      </div>
                      {config.logoUrl && (
                        <div className="mt-2 bg-white p-3 border-2 border-gray-100 rounded-2xl inline-flex items-center justify-center min-w-[120px] h-[100px] shadow-inner">
                           <img src={config.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                   </div>
                </div>

                {/* BANNER UPLOAD SECTION */}
                <div className="border-t border-gray-100 pt-8 mt-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center">
                        <ImageIcon size={18} className="mr-2 text-blue-600" /> Banner nhà trường (Ảnh nền Header)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                                Banner sẽ hiển thị làm ảnh nền mờ phía sau logo và tên trường ở phần đầu trang. Nên chọn ảnh có kích thước rộng (1920x400px) và độ phân giải tốt.
                            </p>
                            <div className="flex flex-col gap-3">
                                <input 
                                    type="text" 
                                    className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50 focus:bg-white transition text-xs" 
                                    placeholder="Dán URL banner..." 
                                    value={config.bannerUrl} 
                                    onChange={e => setConfig({...config, bannerUrl: e.target.value})}
                                />
                                <label className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase cursor-pointer hover:bg-blue-700 flex items-center justify-center shadow-lg transition active:scale-95">
                                    <Upload size={16} className="mr-2"/> Tải Banner từ máy
                                    <input type="file" hidden accept="image/*" onChange={handleBannerUpload}/>
                                </label>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Xem trước Banner:</label>
                            <div className="w-full h-40 bg-slate-100 rounded-2xl overflow-hidden border-2 border-gray-200 relative group">
                                {config.bannerUrl ? (
                                    <>
                                        <img src={config.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <div className="text-white text-center drop-shadow-lg">
                                                <h4 className="text-lg font-black uppercase">{config.name}</h4>
                                                <p className="text-xs font-bold italic opacity-90">{config.slogan}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <ImageIcon size={32} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Chưa có banner</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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
          
          {activeTab === 'contact' && (
             <div className="space-y-6 max-w-3xl">
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Địa chỉ trụ sở</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.address} onChange={e => setConfig({...config, address: e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Điện thoại</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})}/></div>
                  <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Hotline</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.hotline || ''} onChange={e => setConfig({...config, hotline: e.target.value})}/></div>
                </div>
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Email trường</label><input type="email" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold bg-gray-50" value={config.email} onChange={e => setConfig({...config, email: e.target.value})}/></div>
             </div>
          )}

          {activeTab === 'display' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                    <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Màu chủ đạo (Menu/Header)</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={config.primaryColor || '#1e3a8a'} onChange={e => setConfig({...config, primaryColor: e.target.value})} className="h-12 w-12 cursor-pointer rounded-lg border-2 border-white shadow-sm p-0"/>
                        <input type="text" value={config.primaryColor || '#1e3a8a'} onChange={e => setConfig({...config, primaryColor: e.target.value})} className="flex-1 border border-gray-300 rounded-lg p-2 text-sm font-mono uppercase"/>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                    <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Màu chữ Tên trường</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={config.titleColor || '#fbbf24'} onChange={e => setConfig({...config, titleColor: e.target.value})} className="h-12 w-12 cursor-pointer rounded-lg border-2 border-white shadow-sm p-0"/>
                        <input type="text" value={config.titleColor || '#fbbf24'} onChange={e => setConfig({...config, titleColor: e.target.value})} className="flex-1 border border-gray-300 rounded-lg p-2 text-sm font-mono uppercase"/>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                    <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Màu bóng chữ (Shadow)</label>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input type="color" value={config.titleShadowColor?.startsWith('#') ? config.titleShadowColor : '#000000'} onChange={e => setConfig({...config, titleShadowColor: e.target.value})} className="h-12 w-12 cursor-pointer rounded-lg border-2 border-white shadow-sm p-0"/>
                        </div>
                        <input type="text" value={config.titleShadowColor || 'rgba(0,0,0,0.8)'} onChange={e => setConfig({...config, titleShadowColor: e.target.value})} className="flex-1 border border-gray-300 rounded-lg p-2 text-sm font-mono" placeholder="rgba(0,0,0,0.8)"/>
                    </div>
                </div>
                
                <div className="md:col-span-3 mt-4">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Xem trước hiển thị:</label>
                    <div 
                        className="w-full h-40 rounded-2xl overflow-hidden border-2 border-gray-200 relative flex items-center justify-center bg-gray-100"
                        style={{ 
                            backgroundImage: config.bannerUrl ? `url(${config.bannerUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {config.bannerUrl && <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>}
                        <h1 
                          className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight relative z-10 text-center px-4"
                          style={{ 
                            color: config.titleColor || '#fbbf24',
                            filter: `drop-shadow(0 2px 4px ${config.titleShadowColor || 'rgba(0,0,0,0.8)'})`
                          }}
                        >
                            {config.name}
                        </h1>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'social' && (
             <div className="space-y-4 max-w-2xl">
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Facebook Fanpage</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})}/></div>
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Youtube Channel</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.youtube} onChange={e => setConfig({...config, youtube: e.target.value})}/></div>
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Số điện thoại Zalo</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.zalo || ''} onChange={e => setConfig({...config, zalo: e.target.value})}/></div>
             </div>
          )}

          {activeTab === 'seo' && (
             <div className="space-y-4 max-w-2xl">
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Tiêu đề SEO (Hiển thị trên Google)</label><input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" value={config.metaTitle} onChange={e => setConfig({...config, metaTitle: e.target.value})}/></div>
                <div><label className="block text-xs font-black text-gray-400 mb-1 uppercase">Mô tả SEO (Mô tả trên Google)</label><textarea className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold" rows={4} value={config.metaDescription} onChange={e => setConfig({...config, metaDescription: e.target.value})}/></div>
             </div>
          )}
       </div>
    </div>
  );
};
