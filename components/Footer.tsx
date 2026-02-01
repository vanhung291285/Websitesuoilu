
import React from 'react';
import { SchoolConfig } from '../types';
import { MapPin, Phone, Mail, Facebook, Youtube, Globe } from 'lucide-react';

interface FooterProps {
  config: SchoolConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const primaryBg = config.primaryColor || '#1e3a8a';

  return (
    <footer 
      className="text-white pt-12 pb-8 mt-auto relative overflow-hidden"
      style={{ backgroundColor: primaryBg }}
    >
      {/* LỚP HOA VĂN TRỐNG ĐỒNG CHÌM */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-soft-light"
        style={{ 
          backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Trong_dong_Ngoc_Lu.svg/1024px-Trong_dong_Ngoc_Lu.svg.png")',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '700px auto',
          filter: 'brightness(0) invert(1)' 
        }}
      ></div>

      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Cột 1: Thông tin liên hệ */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase border-b-2 border-yellow-500 pb-2 inline-block tracking-tight">
              Thông tin liên hệ
            </h3>
            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start space-x-3">
                    <MapPin size={20} className="mt-0.5 flex-shrink-0 text-yellow-400" />
                    <span className="font-medium">{config.address}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Phone size={20} className="text-yellow-400" />
                    <span className="font-medium">{config.phone} {config.hotline && `| ${config.hotline}`}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Mail size={20} className="text-yellow-400" />
                    <span className="font-medium italic">{config.email}</span>
                  </li>
                </ul>
            </div>
          </div>

          {/* Cột 2: LIÊN KẾT HỮU ÍCH - GIỐNG HÌNH MẪU */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase border-b-[3px] border-yellow-500 pb-1.5 inline-block tracking-tighter">
              LIÊN KẾT HỮU ÍCH
            </h3>
            <ul className="grid grid-cols-1 gap-3.5 text-[17px] font-bold mt-4">
              {(config.footerLinks && config.footerLinks.length > 0) ? (
                  config.footerLinks.map(link => (
                    <li key={link.id}>
                        <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center hover:text-yellow-400 transition-colors group"
                        >
                            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-3.5 shadow-sm group-hover:scale-125 transition-transform"></span>
                            {link.label}
                        </a>
                    </li>
                  ))
              ) : (
                <>
                  <li><a href="https://moet.gov.vn" target="_blank" rel="noreferrer" className="flex items-center hover:text-yellow-400 transition group"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-3.5 group-hover:scale-125 transition-transform"></span> Bộ Giáo dục & Đào tạo</a></li>
                  <li><a href="#" className="flex items-center hover:text-yellow-400 transition group"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-3.5 group-hover:scale-125 transition-transform"></span> Sở GD tỉnh Điện Biên</a></li>
                  <li><a href="#" className="flex items-center hover:text-yellow-400 transition group"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-3.5 group-hover:scale-125 transition-transform"></span> Phòng GD Điện Biên Đông</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 3: Mạng xã hội & Bản quyền */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase border-b-2 border-yellow-500 pb-2 inline-block tracking-tight">
              Kênh thông tin số
            </h3>
            <div className="flex space-x-3">
              {config.facebook && (
                <a href={config.facebook} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-blue-600 hover:-translate-y-1 transition-all border border-white/20 shadow-lg">
                  <Facebook size={24} />
                </a>
              )}
              {config.youtube && (
                <a href={config.youtube} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-red-600 hover:-translate-y-1 transition-all border border-white/20 shadow-lg">
                  <Youtube size={24} />
                </a>
              )}
              {config.website && (
                <a href={config.website} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-teal-600 hover:-translate-y-1 transition-all border border-white/20 shadow-lg">
                  <Globe size={24} />
                </a>
              )}
            </div>
            
            <div className="pt-6 border-t border-white/10">
                <p className="text-[13px] text-white/70 leading-relaxed">
                  © {new Date().getFullYear()} Bản quyền thuộc về <br/>
                  <span className="text-yellow-400 font-bold uppercase">{config.name}</span>
                </p>
                <p className="text-[11px] text-white/40 mt-2 font-mono uppercase tracking-widest">
                  Phát triển bởi Mr: Vũ Hùng
                </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
