
import React from 'react';
import { Post } from '../types';
import { Bell } from 'lucide-react';

interface NewsTickerProps {
  posts: Post[];
  onNavigate: (path: string, id?: string) => void;
  primaryColor?: string;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ posts, onNavigate, primaryColor = '#1e3a8a' }) => {
  const latestPosts = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (latestPosts.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm overflow-hidden h-10 flex items-center">
      {/* 
        Đã loại bỏ khối <div> chứa text "Tin mới" hoặc icon cố định bên trái 
        để tạo không gian thoáng đãng theo yêu cầu "bỏ từ".
      */}
      
      <div className="marquee-container flex-1 h-full flex items-center bg-blue-50/30">
        <div className="marquee-content flex items-center">
          {/* Lặp lại các bài viết để tạo vòng lặp mượt mà */}
          {latestPosts.map((post, idx) => (
            <button
              key={post.id}
              onClick={() => onNavigate('news-detail', post.id)}
              className="inline-flex items-center mx-10 text-[15px] font-bold text-[#1e3a8a] hover:text-red-700 transition-colors group"
            >
              <Bell size={14} className="mr-2 text-red-600 animate-pulse" />
              <span>{post.title}</span>
              <span className="ml-2 text-[11px] text-gray-500 font-normal italic">({post.date})</span>
              {idx < latestPosts.length - 1 && (
                <span className="ml-10 text-gray-300 font-light">|</span>
              )}
            </button>
          ))}
          
          {/* Bản sao để nối đuôi liền mạch */}
          {latestPosts.map((post) => (
            <button
              key={`${post.id}-clone`}
              onClick={() => onNavigate('news-detail', post.id)}
              className="inline-flex items-center mx-10 text-[15px] font-bold text-[#1e3a8a] hover:text-red-700 transition-colors group"
            >
              <Bell size={14} className="mr-2 text-red-600 animate-pulse" />
              <span>{post.title}</span>
              <span className="ml-2 text-[11px] text-gray-500 font-normal italic">({post.date})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
