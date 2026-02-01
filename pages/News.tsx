
import React, { useEffect, useState, useMemo } from 'react';
import { Post, PostCategory, DisplayBlock, DocumentCategory, Video } from '../types';
import { Sidebar } from '../components/Sidebar';
import { Calendar, ChevronRight, Eye, Newspaper, ArrowDownCircle, Loader2 } from 'lucide-react';

interface NewsProps {
  posts: Post[];
  categories: PostCategory[];
  docCategories: DocumentCategory[];
  blocks: DisplayBlock[];
  videos: Video[];
  onNavigate: (path: string, id?: string) => void;
}

// Component bài viết riêng lẻ để tối ưu re-render
const PostItem = React.memo(({ post, categories, onClick }: { post: Post, categories: PostCategory[], onClick: (id: string) => void }) => {
  const cat = categories.find(c => c.slug === post.category);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      onClick={() => onClick(post.id)}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:translate-y-[-8px] animate-fade-in"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img 
          src={post.thumbnail || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400'} 
          className={`w-full h-full object-cover transition-all duration-1000 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          alt={post.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        {cat && (
          <div className={`absolute top-4 left-4 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg bg-${cat.color || 'blue'}-600 uppercase tracking-widest z-10`}>
            {cat.name}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-black text-slate-800 text-[17px] leading-tight mb-4 group-hover:text-blue-700 transition-colors line-clamp-3 uppercase tracking-tight">
          {post.title}
        </h3>
        <p className="text-[14px] text-slate-500 line-clamp-2 mb-6 leading-relaxed italic font-medium">
          {post.summary}
        </p>
        
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-blue-600"/> {post.date}</span>
            <span className="flex items-center gap-1.5"><Eye size={13} className="text-slate-400"/> {post.views}</span>
          </div>
          <span className="text-blue-600 group-hover:translate-x-2 transition-transform bg-blue-50 p-1.5 rounded-full">
            <ChevronRight size={18} />
          </span>
        </div>
      </div>
    </div>
  );
});

export const News: React.FC<NewsProps> = ({ posts, categories, docCategories, blocks, videos, onNavigate }) => {
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Tối ưu: Chỉ tính toán danh sách tin tức một lần duy nhất khi posts thay đổi
  const publishedPosts = useMemo(() => {
    return posts
      .filter(p => (p.status || 'published').toLowerCase() === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts]);

  const visiblePosts = publishedPosts.slice(0, displayLimit);
  const hasMore = displayLimit < publishedPosts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Giả lập độ trễ ngắn để tạo cảm giác mượt mà khi load
    setTimeout(() => {
      setDisplayLimit(prev => prev + 12);
      setIsLoadingMore(false);
    }, 400);
  };

  const sidebarBlocks = useMemo(() => blocks.filter(b => b.position === 'sidebar'), [blocks]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="container mx-auto px-4 pt-8 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {visiblePosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {visiblePosts.map((post) => (
                    <PostItem 
                      key={post.id} 
                      post={post} 
                      categories={categories} 
                      onClick={(id) => onNavigate('news-detail', id)}
                    />
                  ))}
                </div>

                {/* Nút Xem thêm - Tối ưu trải nghiệm */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <button 
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-blue-600 text-blue-600 font-black uppercase text-sm rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-blue-200 active:scale-95 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <ArrowDownCircle size={20} className="group-hover:translate-y-1 transition-transform" />
                      )}
                      {isLoadingMore ? 'Đang tải tin...' : 'Xem thêm bài viết'}
                    </button>
                    <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Đã hiển thị {visiblePosts.length} / {publishedPosts.length} bài viết
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-24 text-center rounded-3xl border-2 border-dashed border-slate-200">
                <Newspaper size={80} className="mx-auto mb-6 text-slate-200" />
                <p className="text-slate-400 font-black uppercase tracking-widest italic text-xl">
                  Hiện chưa có bài viết nào được đăng tải...
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <Sidebar 
              blocks={sidebarBlocks} 
              posts={posts} 
              postCategories={categories}
              docCategories={docCategories}
              documents={[]} 
              videos={videos}
              onNavigate={onNavigate} 
              currentPage="news" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
