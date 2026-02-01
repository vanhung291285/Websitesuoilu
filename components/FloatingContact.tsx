
import React, { useState, useEffect } from 'react';
import { Phone, Facebook, MessageCircle, ChevronUp } from 'lucide-react';
import { SchoolConfig } from '../types';

interface FloatingContactProps {
  config: SchoolConfig;
}

export const FloatingContact: React.FC<FloatingContactProps> = ({ config }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-3">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-white text-blue-900 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:bg-blue-900 hover:text-white hover:-translate-y-1 animate-fade-in border border-gray-200 group"
          title="Cuộn lên trên"
        >
          <ChevronUp size={28} className="group-hover:animate-bounce" />
        </button>
      )}

      {/* Facebook Link */}
      {config.facebook && (
        <a
          href={config.facebook}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-blue-500/30"
          title="Facebook"
        >
          <Facebook size={24} />
        </a>
      )}

      {/* Zalo Link */}
      {config.zalo && (
        <a
          href={config.zalo.startsWith('http') ? config.zalo : `https://zalo.me/${config.zalo}`}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 bg-blue-400 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-rotate-6 font-bold shadow-blue-300/30 overflow-hidden"
          title="Liên hệ Zalo"
        >
          <div className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-black">ZALO</div>
        </a>
      )}

      {/* Phone Link */}
      <a
        href={`tel:${config.hotline || config.phone}`}
        className="w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative group shadow-red-500/40"
        title="Gọi ngay"
      >
        <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></span>
        <Phone size={28} className="relative z-10" />
      </a>
    </div>
  );
};
