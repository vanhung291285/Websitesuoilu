
import React, { useState, useEffect } from 'react';
import { DisplayBlock, Post, SchoolDocument, PostCategory, Video, DocumentCategory } from '../types';
import { DatabaseService } from '../services/database';
import { 
  Zap, 
  Filter, 
  Calendar, 
  Menu as MenuIcon, 
  ChevronRight, 
  Youtube, 
  Play, 
  FolderOpen, 
  FileText,
  CircleArrowRight
} from 'lucide-react';

interface SidebarProps {
  blocks: DisplayBlock[];
  posts: Post[];
  postCategories: PostCategory[]; 
  docCategories: DocumentCategory[];
  documents: SchoolDocument[];
  onNavigate: (path: string, id?: string) => void;
  currentPage: string;
  videos?: Video[];
}

const StatsBlock: React.FC<{ block: DisplayBlock }> = ({ block }) => {
   const [stats, setStats] = useState({ total: 0, today: 0, month: 0, online: 1 });

   useEffect(() => {
      const fetchStats = async () => {
         const data = await DatabaseService.getVisitorStats();
         setStats(data);
      };
      
      // Gọi lần đầu
      fetchStats();
      
      // Tự động cập nhật mỗi 30 giây để số liệu trông "sống động"
      const statsTimer = setInterval(fetchStats, 30000); 
      return () => clearInterval(statsTimer);
   }, []);

   return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden mb-8">
         {/* HEADER MÀU XANH LÁ - THEO HÌNH GỐC */}
         <div className="bg-[#2e7d32] p-2.5 px-4 text-white flex items-center gap-2">
            <CircleArrowRight size={20} className="stroke-[3]" />
            <h3 className="font-bold uppercase text-[15px] tracking-tight">
               {block.name || 'THỐNG KÊ'}
            </h3>
         </div>
         
         <div className="p-0">
            <ul className="divide-y divide-gray-100">
               {/* 1. Đang truy cập */}
               <li className="flex justify-between items-center p-3.5 px-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 text-gray-800">
                     <Zap size={19} className="text-gray-700 fill-gray-700 stroke-[1.5]" />
                     <span className="text-[16px]">Đang truy cập</span>
                  </div>
                  <span className="font-medium text-gray-900 text-[16px]">
                     {stats.online.toLocaleString()}
                  </span>
               </li>

               {/* 2. Hôm nay */}
               <li className="flex justify-between items-center p-3.5 px-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 text-gray-800">
                     <Filter size={19} className="text-gray-700 fill-gray-700 stroke-[1.5]" />
                     <span className="text-[16px]">Hôm nay</span>
                  </div>
                  <span className="font-medium text-gray-900 text-[16px]">
                     {stats.today.toLocaleString()}
                  </span>
               </li>

               {/* 3. Tháng hiện tại */}
               <li className="flex justify-between items-center p-3.5 px-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 text-gray-800">
                     <Calendar size={19} className="text-gray-700 stroke-[2.5]" />
                     <span className="text-[16px]">Tháng hiện tại</span>
                  </div>
                  <span className="font-medium text-gray-900 text-[16px]">
                     {stats.month.toLocaleString()}
                  </span>
               </li>

               {/* 4. Tổng lượt truy cập */}
               <li className="flex justify-between items-center p-3.5 px-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 text-gray-800">
                     <MenuIcon size={19} className="text-gray-700 stroke-[3]" />
                     <span className="text-[16px]">Tổng lượt truy cập</span>
                  </div>
                  <span className="font-medium text-gray-900 text-[16px]">
                     {stats.total.toLocaleString()}
                  </span>
               </li>
            </ul>
         </div>
      </div>
   );
};

const VideoBlock: React.FC<{ block: DisplayBlock, videos: Video[] }> = ({ block, videos }) => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    const getYouTubeId = (input: string) => {
        if (!input) return null;
        const trimmed = input.trim();
        if (trimmed.includes('<iframe')) {
          const embedRegex = /src=["'](?:https?:)?\/\/www\.youtube\.com\/embed\/([^"&?\/\s]{11})["']/i;
          const embedMatch = trimmed.match(embedRegex);
          if (embedMatch) return embedMatch[1];
        }
        const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
        const urlMatch = trimmed.match(urlRegex);
        return urlMatch ? urlMatch[1] : null;
    };

    useEffect(() => {
        if (videos.length > 0 && !selectedVideoId) {
            const firstId = getYouTubeId(videos[0].youtubeUrl);
            if (firstId) setSelectedVideoId(firstId);
        }
    }, [videos, selectedVideoId]);

    if (videos.length === 0) return null;

    return (
        <div className="bg-white border-t-4 border-red-700 shadow-xl rounded-b-2xl overflow-hidden mb-10 border-x border-b border-gray-100">
            <div className="bg-[#8b0000] p-4 flex justify-between items-center shadow-inner">
                <h3 className="font-black text-white uppercase text-sm flex items-center tracking-widest">
                    <Youtube size={20} className="mr-3 text-red-400" /> {block.name}
                </h3>
            </div>
            <div className="p-4 bg-white">
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl bg-black mb-6 border-2 border-gray-100 ring-4 ring-gray-50">
                    {selectedVideoId ? (
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${selectedVideoId}?rel=0&modestbranding=1&autoplay=0`} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 italic text-xs font-bold gap-3">
                            <Youtube size={32} className="animate-pulse" />
                            Đang tải trình phát...
                        </div>
                    )}
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {videos.map((video, idx) => {
                        const vId = getYouTubeId(video.youtubeUrl);
                        const isActive = selectedVideoId === vId;
                        return (
                            <button 
                                key={video.id}
                                onClick={() => vId && setSelectedVideoId(vId)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group border ${isActive ? 'bg-red-50 border-red-200 shadow-md ring-1 ring-red-100' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
                            >
                                <div className="relative w-20 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-900 border border-gray-200">
                                    {vId ? (
                                        <img 
                                            src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`} 
                                            className={`w-full h-full object-cover transition duration-300 ${isActive ? 'opacity-50' : 'group-hover:scale-110 opacity-80'}`} 
                                            alt=""
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Play size={14} className="text-white"/></div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`p-1.5 rounded-full ${isActive ? 'bg-red-600' : 'bg-black/40 group-hover:bg-red-600'} transition-colors`}>
                                            <Play size={10} className="fill-white text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[12px] font-bold leading-snug line-clamp-2 ${isActive ? 'text-red-800' : 'text-gray-700 group-hover:text-red-700'}`}>
                                        {video.title}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ blocks, posts, postCategories, docCategories, documents, onNavigate, currentPage, videos = [] }) => {
  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    const source = block.htmlContent || 'all'; 

    if (source === 'featured') {
        filtered = filtered.filter(p => p.isFeatured);
    } else if (source !== 'all') {
        filtered = filtered.filter(p => p.category === source);
    }

    return filtered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, block.itemCount);
  };

  const renderBlock = (block: DisplayBlock) => {
    if (block.targetPage !== 'all') {
       if (block.targetPage === 'home' && currentPage !== 'home') return null;
       if (block.targetPage === 'detail' && currentPage !== 'news-detail') return null;
    }

    if (block.type === 'stats') {
       return <StatsBlock key={block.id} block={block} />;
    }

    if (block.type === 'video') {
        return <VideoBlock key={block.id} block={block} videos={videos} />;
    }

    const blockPosts = getPostsForBlock(block);
    if (blockPosts.length === 0) return null;

    return (
      <div key={block.id} className="bg-white border border-gray-200 shadow-lg mb-10 rounded-2xl overflow-hidden">
         <div className="bg-[#1e3a8a] p-4 flex items-center border-b-2 border-yellow-500">
            <h3 className="font-black text-white uppercase text-sm flex items-center tracking-widest">
               <ChevronRight size={18} className="mr-2 text-yellow-400" />
               {block.name}
            </h3>
         </div>
         <div className="p-0 bg-white">
            <ul className="divide-y divide-gray-100">
               {blockPosts.map(post => (
                  <li key={post.id} className="p-4 hover:bg-blue-50/50 transition-all duration-300">
                     <div 
                        onClick={() => onNavigate('news-detail', post.id)} 
                        className="flex gap-4 cursor-pointer group"
                     >
                        {post.thumbnail && (
                            <div className="w-20 h-14 shrink-0 overflow-hidden border border-gray-100 rounded-lg shadow-sm">
                                <img src={post.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] text-[#1e3a8a] font-black group-hover:text-red-700 leading-tight uppercase line-clamp-3">
                                {post.title}
                            </h4>
                            <div className="mt-1 text-[9px] text-gray-400 font-bold tracking-widest uppercase">{post.date}</div>
                        </div>
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      </div>
    );
  };

  return (
    <aside className="w-full">
        {currentPage === 'home' && docCategories.length > 0 && (
            <div className="bg-white border-t-4 border-indigo-900 shadow-lg rounded-b-2xl overflow-hidden mb-10">
                <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                    <h3 className="font-bold text-indigo-900 uppercase text-sm flex items-center tracking-widest">
                        <FolderOpen size={18} className="mr-3" /> VĂN BẢN - CÔNG KHAI
                    </h3>
                </div>
                <div className="p-2">
                    <div className="flex flex-col">
                        {docCategories.map((cat) => (
                            <button 
                                key={cat.id}
                                onClick={() => onNavigate('documents')}
                                className="flex items-center justify-between p-3.5 hover:bg-indigo-50 rounded-xl group transition-all text-left border-b border-dashed border-gray-100 last:border-0"
                            >
                                <div className="flex items-center">
                                    <ChevronRight size={14} className="text-indigo-400 mr-2 group-hover:translate-x-1 transition-transform" />
                                    <span className="text-[14px] font-bold text-gray-800 group-hover:text-indigo-800">{cat.name}</span>
                                </div>
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <FileText size={12} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {blocks.map(block => renderBlock(block))}
    </aside>
  );
};
