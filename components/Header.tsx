
import React, { useState } from 'react';
import { SchoolConfig, MenuItem } from '../types';
import { Menu, X, GraduationCap, Phone, Mail, Facebook, Youtube, LogIn, UserCircle } from 'lucide-react';

interface HeaderProps {
  config: SchoolConfig;
  menuItems: MenuItem[];
  onNavigate: (path: string) => void;
  activePath: string;
}

export const Header: React.FC<HeaderProps> = ({ config, menuItems, onNavigate, activePath }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    if (path.startsWith('http')) {
       window.open(path, '_blank');
    } else {
       onNavigate(path);
    }
    setIsMenuOpen(false);
  };

  const hasBanner = !!config.bannerUrl;
  const primaryBg = config.primaryColor || '#1e3a8a';

  return (
    <header className="flex flex-col shadow-md relative z-50">
      {/* 1. TOP BAR: Contact & Socials - Sử dụng màu chủ đạo */}
      <div 
        className="text-white py-1.5 px-4 text-xs border-b border-black/10"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-4 opacity-90">
             <span className="flex items-center gap-1"><Phone size={12} className="text-yellow-400"/> Hotline: <strong>{config.hotline || config.phone}</strong></span>
             <span className="hidden md:inline opacity-30">|</span>
             <span className="flex items-center gap-1"><Mail size={12} className="text-yellow-400"/> {config.email}</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:inline opacity-70 italic">Chào mừng đến với {config.name}</span>
             <div className="flex gap-2 ml-2 border-l border-white/20 pl-2">
                {config.facebook && <a href={config.facebook} target="_blank" rel="noreferrer" className="hover:text-yellow-300"><Facebook size={14}/></a>}
                {config.youtube && <a href={config.youtube} target="_blank" rel="noreferrer" className="hover:text-red-400"><Youtube size={14}/></a>}
             </div>
          </div>
        </div>
      </div>

      {/* 2. BRANDING AREA */}
      <div 
        className="bg-white relative transition-all duration-300 border-b border-gray-100 overflow-hidden"
        style={{ 
            backgroundImage: hasBanner ? `url(${config.bannerUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      >
         {hasBanner && <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>}
         {hasBanner && <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/10 to-transparent"></div>}
         
         <div className="container mx-auto px-4 py-5 md:py-8 relative z-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 md:gap-6 cursor-pointer group" onClick={() => handleNav('home')}>
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-xl border-2 border-yellow-400 p-1 shrink-0 overflow-hidden transform group-hover:scale-105 transition-transform">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <GraduationCap size={48} />
                    )}
                    </div>
                    <div className="flex flex-col">
                        <h1 
                          className="text-xl md:text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tight"
                          style={{ 
                            color: config.titleColor || '#fbbf24',
                            filter: `drop-shadow(0 2px 4px ${config.titleShadowColor || 'rgba(0,0,0,0.8)'})`
                          }}
                        >
                            {config.name}
                        </h1>
                        <div className="mt-1 flex items-center">
                            <p className="text-sm md:text-base font-black text-red-700 uppercase tracking-widest italic bg-white/95 px-3 py-0.5 rounded shadow-md border-l-4 border-red-700">
                                {config.slogan || 'Trách nhiệm - Yêu thương - Sáng tạo'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => handleNav('login')} 
                        className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/95 hover:bg-red-700 text-red-700 hover:text-white border-2 border-red-700 rounded-xl font-bold uppercase text-sm transition-all shadow-lg hover:shadow-red-200 active:scale-95"
                    >
                        <UserCircle size={18} />
                        <span>Đăng nhập</span>
                    </button>
                    <button 
                        className="lg:hidden p-2.5 rounded-xl text-blue-900 bg-white/95 hover:bg-blue-50 border-2 border-blue-200 shadow-md"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
         </div>
      </div>

      {/* 3. NAVIGATION BAR - Sử dụng màu chủ đạo cho Menu */}
      <div 
        className="shadow-xl border-t-4 border-yellow-500 sticky top-0 z-40"
        style={{ backgroundColor: primaryBg }}
      >
         <div className="container mx-auto px-4">
            <nav className="hidden lg:flex items-center">
               <div className="flex items-center">
                   {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={`px-5 py-3.5 text-[16px] font-bold uppercase transition-all duration-200 border-r border-white/10 hover:bg-white/10 tracking-tight ${
                          activePath === item.path || (activePath === 'news-detail' && item.path === 'news')
                            ? 'bg-black/20 text-yellow-400 border-b-4 border-yellow-400' 
                            : 'text-white border-b-4 border-transparent'
                        }`}
                      >
                        {item.label}
                      </button>
                   ))}
               </div>
            </nav>
         </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full top-full z-50 animate-fade-in">
          <div className="flex flex-col divide-y divide-gray-100">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`text-left font-bold p-4 uppercase text-base tracking-tight ${
                  activePath === item.path ? 'bg-blue-50 text-blue-800 border-l-8 border-blue-600' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => handleNav('login')} className="text-left font-bold p-4 text-red-700 bg-red-50 flex items-center gap-2 text-base tracking-tight">
               <LogIn size={22}/> ĐĂNG NHẬP HỆ THỐNG
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
